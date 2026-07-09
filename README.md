# Narrator

Narrator is an AI avatar video generation SaaS — an alternative to HeyGen, Pictory, and
Synthesia. Users type a script, pick an avatar and voice, and Narrator renders a talking-head
video that's stored in S3 and streamed back to the dashboard.

This repository is an MVP scaffold: a simple monolith (frontend + backend + one render worker),
deliberately without Kubernetes, designed to run on Vercel (frontend) + Render (backend).

## Architecture

```
frontend/   React + Vite dashboard (login, script input, video preview, billing)
backend/    NestJS REST API: auth, video job queue, Stripe billing
            ├── src/auth       JWT auth (register/login)
            ├── src/users      User entity + service
            ├── src/videos     Video job entity, controller, BullMQ producer + worker
            ├── src/billing    Stripe checkout, billing portal, webhook handling
            ├── src/storage    S3 upload / signed URLs
            └── src/render     FFmpeg rendering pipeline
```

Job flow: dashboard submits a script → API creates a `VideoJob` row and enqueues a BullMQ job →
a standalone worker process fetches the avatar clip + generates narration audio (pluggable
provider) → FFmpeg composites the final MP4 → worker uploads to S3 → job status flips to
`completed` with a signed URL the frontend polls for and plays.

## Prerequisites

- Node.js 20+
- PostgreSQL 16 (or Docker)
- Redis 7 (or Docker) — powers the BullMQ video render queue
- FFmpeg installed locally if you want to run the worker outside Docker
- A Stripe account (test mode is fine) and an AWS S3 bucket

The fastest way to get Postgres + Redis running locally is Docker Compose (see below).

## Local setup

### 1. Clone and install

```bash
git clone <this-repo>
cd Narrator
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Fill in `backend/.env` with your Stripe test keys, AWS credentials, and an S3 bucket name.

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

## Running everything with Docker Compose

```bash
docker compose up --build
```

This starts Postgres, Redis, the API, and the render worker as four containers. Run the frontend
separately with `npm run dev` (or deploy it to Vercel — see below).

## Deployment

### Backend → Render

`render.yaml` defines a Render Blueprint with:
- a managed Postgres database
- a managed Redis instance
- a `web` service running the API (`backend/Dockerfile`, health check on `/health`)
- a `worker` service running the same image with `node dist/videos/videos.worker.js`

```bash
./scripts/deploy-render.sh
```

Or connect the repo in the Render dashboard and click **New Blueprint Instance**, pointing it at
`render.yaml`. Set the `sync: false` env vars (Stripe keys, AWS credentials, `FRONTEND_URL`) in
the Render dashboard after the first deploy.

### Frontend → Vercel

`frontend/vercel.json` configures the Vite build. Set `VITE_API_BASE_URL` to your deployed Render
API URL (e.g. `https://narrator-api.onrender.com/api`) in the Vercel project's environment
variables.

```bash
./scripts/deploy-vercel.sh
```

Or connect the repo in the Vercel dashboard with **Root Directory** set to `frontend`.

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full list. Key ones:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `REDIS_URL` | Redis connection string for the BullMQ queue |
| `JWT_SECRET` | Signs auth tokens |
| `AWS_S3_BUCKET` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Video storage |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Billing |
| `STRIPE_PRICE_STARTER` / `_PRO` / `_BUSINESS` | Stripe Price IDs per plan tier |
| `AVATAR_PROVIDER_API_KEY` / `AVATAR_PROVIDER_BASE_URL` | Pluggable avatar/TTS provider — swap `backend/src/videos/avatar-provider.stub.ts` for a real integration |

## Swapping in a real avatar/TTS provider

`backend/src/videos/avatar-provider.stub.ts` exposes two functions —  `fetchAvatarClip` and
`renderNarrationAudio` — that the worker calls before invoking FFmpeg. Replace the stub bodies
with calls to whichever avatar/TTS API you integrate (an internal model, or a third-party
provider), keeping the same signatures so the render pipeline and queue plumbing don't change.

## Tech stack

- **Frontend**: React 18, Vite, React Router, Axios
- **Backend**: NestJS, TypeORM (Postgres), BullMQ (Redis), Passport JWT, Stripe SDK, AWS SDK v3, fluent-ffmpeg
- **Infra**: Docker, Render (API + worker + Postgres + Redis), Vercel (frontend)
