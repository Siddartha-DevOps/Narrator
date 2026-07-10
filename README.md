# Narrator

Narrator is an AI avatar video generation SaaS — an alternative to HeyGen, Pictory, and
Synthesia, with first-class support for Hindi, Telugu, and Tamil voices. Users type a script,
pick an avatar and voice, and Narrator renders a lip-synced talking-head video that's stored in
S3 and streamed back to the dashboard.

This repository is a complete MVP product: marketing site (landing + pricing), auth (email/
password + Google OAuth), a credit-based video generation flow, Stripe subscription billing,
team accounts, and an admin API — built as a simple monolith (frontend + backend + one render
worker), deliberately without Kubernetes, designed to run on Vercel (frontend) + Render
(backend).

**Further reading:** [`PRD.md`](./PRD.md) (product scope, user flows, roadmap) ·
[`ARCHITECTURE.md`](./ARCHITECTURE.md) (system design, data flow) ·
[`API.md`](./API.md) (endpoint reference) · [`DEPLOYMENT.md`](./DEPLOYMENT.md) (Vercel + Render
deploy steps).

## What's included

- **Marketing**: Landing page, Pricing page (₹500 Starter / ₹1,500 Pro / Enterprise)
- **Auth**: email/password (JWT) and "Continue with Google" (OAuth)
- **Video generation**: script → avatar + voice (English, Hindi, Telugu, Tamil) → resolution →
  queued render with a live status/preview dashboard
- **Credits**: every plan grants a monthly credit allotment; renders debit credits by estimated
  duration × resolution, with automatic refunds on failed renders
- **Billing**: Stripe Checkout + Billing Portal, webhook-driven plan/credit sync
- **Teams**: Pro/Enterprise accounts can create a team and invite seats
- **Compliance**: watermarked output on the Free tier, a pre-render content-policy check, and an
  AI-generated-content disclosure notice
- **Admin API**: user list/suspend/plan-override, subscription and platform stats

## Architecture

```
frontend/   React + Vite + TailwindCSS
            ├── pages: Landing, Pricing, Login, Signup, AuthCallback, Dashboard,
            │          VideoEditor, Billing, Profile
            └── components: Navbar, Footer, PlanCard, AvatarSelector, VoiceSelector,
                             TextInput, VideoPreview, JobList

backend/    NestJS REST API
            ├── src/auth        JWT + Google OAuth
            ├── src/users       User entity + service
            ├── src/videos      Video job entity, controller, BullMQ producer + worker
            ├── src/ai          TTS + lip-sync provider wrappers, voice/avatar catalogs
            ├── src/render      FFmpeg rendering pipeline (+ watermark overlay)
            ├── src/storage     S3 upload / signed URLs
            ├── src/credits     Credit ledger (grants/debits/refunds) + balance
            ├── src/billing     Stripe checkout, billing portal, webhook handling
            ├── src/teams       Team accounts (Pro/Enterprise), invites, seat limits
            ├── src/moderation  Pre-render script content-policy check
            └── src/admin       Role-gated user management + platform stats
```

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full request/data-flow diagrams.

## Prerequisites

- Node.js 20+
- PostgreSQL 16 (or Docker)
- Redis 7 (or Docker) — powers the BullMQ video render queue
- FFmpeg installed locally if you want to run the worker outside Docker
- A Stripe account (test mode is fine) and an AWS S3 bucket
- (Optional) A Google OAuth client, and TTS/lip-sync provider credentials — everything works
  with local fallbacks if you skip these for now

The fastest way to get Postgres + Redis running locally is Docker Compose (see below).

## Local setup

### 1. Clone and install

```bash
git clone <this-repo>
cd Narrator
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Fill in `backend/.env` with your Stripe test keys, AWS credentials, and an S3 bucket name. Google
OAuth and the avatar/TTS provider can stay blank for local development — see below.

### 2. Start Postgres + Redis

```bash
docker compose up -d postgres redis
```

### 3. Install dependencies and run the backend

```bash
cd backend
npm install
npm run start:dev        # HTTP API on http://localhost:4000
```

In a second terminal, start the render worker (separate process so long-running FFmpeg jobs
never block API requests):

```bash
cd backend
npm run worker
```

`synchronize: true` is enabled outside production, so TypeORM creates tables automatically on
first boot. For production, generate and run migrations instead:

```bash
npm run migration:generate -- src/migrations/Init
npm run migration:run
```

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

### 5. Stripe webhooks locally

```bash
stripe listen --forward-to localhost:4000/api/billing/webhook
```

Copy the printed webhook signing secret into `backend/.env` as `STRIPE_WEBHOOK_SECRET`.

### 6. Try it out

1. Sign up at `/signup` — you start with 20 free credits.
2. Go to `/editor`, write a script, pick an avatar + voice (Hindi/Telugu/Tamil are gated to paid
   plans), and generate. Without TTS/lip-sync provider credentials configured, the worker falls
   back to bundled local stub assets so the pipeline still runs end-to-end.
3. Watch the job move `queued → processing → completed` on `/dashboard`.
4. Visit `/pricing` to test a Stripe Checkout upgrade (test card `4242 4242 4242 4242`).
5. On a Pro/Enterprise-tier account, use `/profile` to create a team and invite another
   (already-registered) account.

## Running everything with Docker Compose

```bash
docker compose up --build
```

This starts Postgres, Redis, the API, and the render worker as four containers. Run the frontend
separately with `npm run dev` (or deploy it to Vercel — see below).

## Deployment

Full walkthrough (secrets, webhooks, OAuth redirect URIs, migrations, admin promotion, smoke
test) is in [`DEPLOYMENT.md`](./DEPLOYMENT.md). Short version:

### Backend → Render

`render.yaml` defines a Blueprint: managed Postgres + Redis, a `web` service running the API
(health check on `/health`), and a `worker` service running `node dist/videos/videos.worker.js`.

```bash
./scripts/deploy-render.sh
```

### Frontend → Vercel

`frontend/vercel.json` configures the Vite build. Set `VITE_API_BASE_URL` to your deployed Render
API URL (e.g. `https://narrator-api.onrender.com/api`).

```bash
./scripts/deploy-vercel.sh
```

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full list. Key ones:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `REDIS_URL` | Redis connection string for the BullMQ queue |
| `JWT_SECRET` | Signs auth tokens |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | "Continue with Google" — leave blank to disable |
| `AWS_S3_BUCKET` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Video storage |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Billing |
| `STRIPE_PRICE_STARTER` / `_PRO` | Stripe Price IDs (₹500 / ₹1,500 tiers; Enterprise is sales-assisted) |
| `AVATAR_PROVIDER_API_KEY` / `AVATAR_PROVIDER_BASE_URL` | Pluggable TTS + lip-sync provider — swap `backend/src/ai/tts.service.ts` and `lipsync.service.ts` for a real integration |

## Swapping in a real avatar/TTS provider

`backend/src/ai/tts.service.ts` and `backend/src/ai/lipsync.service.ts` each expose one method
(`synthesize()` / `generate()`) that the render worker calls. Both fall back to bundled local
stub assets when `AVATAR_PROVIDER_BASE_URL`/`AVATAR_PROVIDER_API_KEY` aren't set. Point those env
vars at a real vendor (an ElevenLabs/Azure-style TTS API plus a HeyGen/D-ID-style lip-sync API,
or an in-house model) and implement the `callProvider()` bodies — the render pipeline and queue
plumbing don't need to change.

## Tech stack

- **Frontend**: React 18, Vite, TailwindCSS, React Router, Axios
- **Backend**: NestJS, TypeORM (Postgres), BullMQ (Redis), Passport (JWT + Google OAuth), Stripe
  SDK, AWS SDK v3, fluent-ffmpeg
- **Infra**: Docker, Render (API + worker + Postgres + Redis), Vercel (frontend)
