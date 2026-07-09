# Narrator — Product Requirements Document

## 1. Summary

Narrator is a SaaS product for generating AI avatar narration videos from text scripts —
positioned as a faster, simpler, more affordable alternative to HeyGen, Pictory, and Synthesia.
Users write or paste a script, choose an avatar and voice, and receive a rendered MP4 they can
download or embed.

## 2. Problem

Existing avatar-video tools (HeyGen, Synthesia, Pictory) are powerful but heavy: complex editors,
steep pricing tiers, and workflows built for video teams rather than solo creators, marketers, and
small businesses who just want "text in, video out." Narrator's wedge is a radically simpler
flow — a single text box and a render button — with transparent, usage-based pricing.

## 3. Target users

- **Solo creators / course authors** turning written content into narrated video quickly.
- **Marketers** producing short product-explainer or social clips without a video team.
- **Small businesses** needing localized, repeatable talking-head videos (announcements, training).

## 4. MVP scope

### 4.1 In scope

1. **Account & auth**
   - Email/password signup and login (JWT-based).
   - Session persistence in the frontend; protected dashboard routes.
2. **Text-to-video generation**
   - Script input (up to 5,000 characters).
   - Avatar selection (small fixed set of stock avatars for MVP).
   - Voice selection (small fixed set of stock voices).
   - Resolution choice (720p / 1080p / 4K, gated by plan tier).
   - Job queueing with visible status: queued → processing → completed/failed.
3. **Video job management**
   - List of a user's past video jobs with status.
   - Preview/playback of completed videos.
   - Signed, expiring download links (videos stored in S3).
4. **Billing**
   - Stripe Checkout for subscribing to Starter / Pro / Business tiers.
   - Stripe Billing Portal for managing/cancelling a subscription.
   - Webhook-driven plan sync (checkout completed, subscription updated/cancelled).
   - Free tier with a small monthly render-minute allowance (no card required).
5. **Rendering pipeline**
   - Queue-backed (BullMQ/Redis) so rendering never blocks the API.
   - FFmpeg composites avatar clip + generated narration audio (+ optional captions) into an MP4.
   - Pluggable avatar/TTS provider interface so a real vendor (or in-house model) can be swapped
     in without touching queue/storage code.

### 4.2 Explicitly out of scope for MVP

- Custom/cloned avatars or voices (user-uploaded).
- Multi-scene / timeline video editor.
- Team workspaces, roles, and shared asset libraries.
- Real-time collaborative editing.
- Multi-language script translation.
- Kubernetes/autoscaling infrastructure — MVP runs as a monolith on Render + Vercel.

## 5. User flows

### 5.1 Sign up → first video

1. User lands on marketing site, clicks "Get started."
2. User signs up with email/password → redirected to dashboard.
3. User types a script, picks an avatar + voice, clicks "Generate video."
4. Job appears in the job list as "Queued," then "Processing."
5. Dashboard polls job status; when "Completed," the preview pane loads the video.
6. User downloads or copies a share link.

### 5.2 Upgrade plan

1. Free-tier user exhausts their monthly render minutes (job creation blocked with an upgrade
   prompt).
2. User goes to Billing, picks a paid tier, is redirected to Stripe Checkout.
3. On successful payment, Stripe webhook updates the user's `planTier` in the database.
4. User is redirected back to the dashboard with the new tier active and job creation unblocked.

### 5.3 Manage subscription

1. User goes to Billing → "Manage billing / invoices."
2. Redirected to the Stripe Billing Portal to update payment method, view invoices, or cancel.
3. On cancellation, a webhook downgrades the user back to the Free tier at period end.

### 5.4 Failed render

1. Worker encounters an error (bad script encoding, provider timeout, FFmpeg failure).
2. Job status flips to "Failed" with an error message; job is retried up to 3 times with backoff
   before being marked permanently failed.
3. User sees "Failed" in the job list and can resubmit.

## 6. Plan tiers (MVP pricing)

| Tier | Price | Render minutes/mo | Max resolution |
|---|---|---|---|
| Free | $0 | 3 | 720p |
| Starter | $29/mo | 30 | 1080p |
| Pro | $99/mo | 120 | 1080p |
| Business | $299/mo | 600 | 4K |

Render-minute enforcement (blocking job creation once a user's monthly allowance is exhausted) is
a fast-follow, not required for the very first MVP cut, but the `renderMinutesUsedThisCycle`
field is scaffolded on the `User` entity for it.

## 7. Success metrics

- **Activation**: % of signups who generate at least one completed video within 24 hours.
- **Conversion**: % of free-tier users who upgrade to a paid plan within 30 days.
- **Render reliability**: % of jobs that reach "Completed" without manual retry.
- **Time-to-video**: median wall-clock time from job creation to "Completed."

## 8. Roadmap (post-MVP)

### Phase 2 — Quality & control
- Custom avatar upload (photo/video → avatar).
- Voice cloning.
- Caption styling and burned-in subtitle customization.
- Background/scene selection (green-screen compositing).

### Phase 3 — Collaboration
- Team workspaces with shared brand assets and seats.
- Role-based access (owner/editor/viewer).
- Comment/approval workflow on generated videos.

### Phase 4 — Scale & platform
- Multi-language script translation + dubbing.
- API access for programmatic video generation (developer tier).
- Template library (social ad formats, course intros, product explainers).
- Usage-based overage billing on top of subscription tiers.
- Move render workers to an autoscaled worker fleet (e.g. Kubernetes or ECS) once volume outgrows
  a single Render worker service.

## 9. Risks & open questions

- **Avatar/TTS vendor choice**: MVP ships with a pluggable stub; a real vendor integration
  (or in-house model) must be selected before public launch.
- **Render cost at scale**: FFmpeg + provider costs per minute need to be modeled against plan
  pricing to ensure margin.
- **Content moderation**: scripts and generated videos need basic abuse/moderation checks before
  wide release (not in MVP scope, flagged for Phase 2).
