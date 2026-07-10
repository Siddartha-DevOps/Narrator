# Narrator — Architecture

## Overview

Narrator is a monolith-per-tier deployment: one frontend static site, one backend API process,
and one backend worker process, sharing a single Postgres database and a single Redis instance.
There is no microservice split and no Kubernetes — the render worker is a separate *process*
(for isolation and independent scaling), not a separate *system*.

```
                        ┌─────────────────────┐
                        │   React + Vite SPA   │   Vercel (static hosting)
                        │  (frontend/)         │
                        └──────────┬───────────┘
                                   │ HTTPS (JSON over REST)
                                   ▼
                        ┌─────────────────────┐
                        │   NestJS API         │   Render (web service)
                        │  (backend/, HTTP)    │
                        └───┬─────────┬────────┘
                            │         │
                 ┌──────────┘         └───────────┐
                 ▼                                 ▼
        ┌────────────────┐               ┌──────────────────┐
        │   PostgreSQL    │               │      Redis        │
        │ (users, jobs,   │               │  (BullMQ queue)   │
        │  credits, teams,│               └─────────┬────────┘
        │  subscriptions) │                         │
        └────────────────┘                          ▼
                 ▲                        ┌─────────────────────┐
                 │ reads/writes           │  Render Worker        │  Render (background worker)
                 └─────────────────────── │ (backend/, videos.worker.ts) │
                                           └─────────┬────────────┘
                                                      │
                                    ┌─────────────────┼─────────────────┐
                                    ▼                 ▼                 ▼
                            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                            │ TTS provider │  │ Lip-sync      │  │  FFmpeg       │
                            │ (pluggable)  │  │ provider      │  │  (local proc) │
                            └──────────────┘  │ (pluggable)   │  └──────┬───────┘
                                               └──────────────┘         │
                                                                        ▼
                                                                ┌───────────────┐
                                                                │    AWS S3      │
                                                                │ (video output) │
                                                                └───────────────┘
                                                                        │
                                            signed URL served back through the API ◄┘
```

Stripe sits alongside the API: Checkout/Billing Portal sessions are created by the API on
request, and Stripe calls back into the API's webhook endpoint asynchronously.

## Backend module map

```
backend/src/
├── app.module.ts          # wires every feature module + TypeORM + rate limiting
├── auth/                  # JWT + Google OAuth, issues the bearer token everything else trusts
├── users/                 # User entity + repository access (no HTTP surface of its own)
├── videos/                # Video job entity, REST controller, BullMQ producer + worker entrypoint
├── ai/                    # TTS + lip-sync provider wrappers, voice/avatar catalogs
├── render/                # FFmpeg compositing (avatar clip + narration audio → MP4, watermark overlay)
├── storage/                # S3 upload / signed download URLs
├── credits/                # Credit ledger (grants, debits, refunds) + balance
├── billing/                # Stripe Checkout, Billing Portal, webhook handling
├── teams/                  # Team + TeamMember entities, invite/remove, seat limits by plan
├── moderation/              # Pre-render script content policy check
├── admin/                   # Role-gated user management + subscription/platform stats
├── common/                  # Shared guards (JwtAuthGuard, AdminGuard) and decorators
├── config/                  # Plan tier definitions, credit-cost formula, TypeORM CLI datasource
└── health/                  # Unauthenticated liveness endpoint for Render's health check
```

Each feature module owns its entities, service, and controller, and exports only its service(s)
for other modules to inject — controllers are never imported across modules.

## Data flow: generating a video

1. **Frontend** (`VideoEditor.tsx`) collects script, avatar, voice, resolution and calls
   `POST /videos`.
2. **VideosController → VideosService**:
   - `ModerationService.assertScriptAllowed()` — rejects disallowed content before anything is
     charged or queued.
   - `resolutionExceedsPlan()` — rejects if the resolution is above the caller's plan cap.
   - `estimateScriptDurationSeconds()` + `estimateCreditCost()` — derives a credit cost from
     word count and resolution.
   - `CreditsService.debit()` — atomically decrements the user's balance and writes a
     `CreditTransaction` row; throws (and the job row is rolled back) if the balance is
     insufficient.
   - A `VideoJob` row is persisted with `status: "queued"`, and a BullMQ job
     `{ videoJobId }` is enqueued on the `video-render` queue in Redis.
3. **Render worker** (`videos.worker.ts`, a separate Node process) picks the job off the queue:
   - `TtsService.synthesize(script, voiceId)` → narration audio file.
   - `LipSyncService.generate(avatarId, audioPath)` → talking-head video clip.
   - `FfmpegService.renderVideo(...)` composites clip + audio (+ watermark if the plan requires
     it) into an MP4 on local disk.
   - `S3Service.uploadFile(...)` uploads the MP4 and the job is marked `completed` with
     `outputUrl` set.
   - On any failure, the job is marked `failed` and `CreditsService.refund()` returns the
     debited credits.
4. **Frontend** polls `GET /videos` (or `/videos/:id`) every few seconds while a job is
   `queued`/`processing`, and renders the `<video>` player once `completed`.

The TTS and lip-sync steps are provider-agnostic: `AiModule`'s `TtsService`/`LipSyncService` call
out to `AVATAR_PROVIDER_BASE_URL` when configured, and fall back to bundled local stub assets
otherwise — so the whole pipeline is exercisable in development without a live vendor contract,
and swapping in a real vendor (HeyGen-style avatar API, ElevenLabs, Azure Speech, etc.) touches
only those two files.

## Data flow: billing

1. Frontend requests `POST /billing/checkout-session` with a self-serve tier (`starter` | `pro`).
2. `BillingService` creates (or reuses) a Stripe Customer and a Checkout Session, embedding
   `{ userId, planTier }` in session metadata, and returns the Checkout URL for a client-side
   redirect.
3. Stripe redirects the user through hosted Checkout, then calls back to
   `POST /billing/webhook`:
   - `checkout.session.completed` → `BillingService.upsertSubscription()` persists a
     `Subscription` row, sets `user.planTier`, and grants the first credit allotment.
   - `invoice.paid` (recurring renewals) → re-grants the plan's `monthlyCredits`, resetting the
     balance for the new cycle.
   - `customer.subscription.updated` / `.deleted` → syncs `Subscription.status`; a cancellation
     downgrades the user back to `free`.
4. `POST /billing/portal-session` hands the user to the Stripe-hosted Billing Portal for
   self-serve plan changes, payment method updates, and cancellation — Narrator doesn't build
   its own billing UI beyond the pricing/checkout entry point.

Enterprise is intentionally **not** wired through Stripe Checkout: it's sales-assisted (a mailto
link on the pricing page), and the plan/seat count/credit pool are set manually by an admin via
`PATCH /admin/users/:id`.

## Data model (key entities)

| Entity | Purpose | Key relationships |
|---|---|---|
| `User` | Account, plan tier, credit balance, role | 1:N `VideoJob`, 1:1 `Subscription` |
| `VideoJob` | One render request/result | N:1 `User` |
| `CreditTransaction` | Immutable ledger row (grant/debit/refund) | N:1 `User`, optional `VideoJob` |
| `Subscription` | Mirrors the Stripe subscription | N:1 `User` |
| `Team` / `TeamMember` | Enterprise seat sharing | `TeamMember` joins `Team` ↔ `User` |

`User.creditBalance` is a denormalized running total for fast reads (dashboard, job creation);
`CreditTransaction` is the source of truth and audit trail if the two ever need to be
reconciled.

## Why a monolith (for now)

- One Postgres, one Redis, two deployable units (API + worker) keeps operational surface small
  for an MVP-stage product.
- The render worker is already a separate process so CPU-heavy FFmpeg work can't starve the
  HTTP API, and it scales independently (Render lets you scale the worker service's instance
  count without touching the API).
- Nothing in the module boundaries (`ai`, `render`, `storage`, `billing`, `credits`, `teams`)
  assumes an in-process call — each is a normal NestJS provider reached through Nest's DI, so
  splitting any of them into its own service later is a matter of moving the module and adding
  an HTTP/queue boundary, not a rewrite. See `PRD.md`'s roadmap for when that split is expected
  to matter (Phase 4 — scale & platform).
