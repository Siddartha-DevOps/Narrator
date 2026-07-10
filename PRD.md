# Narrator — Product Requirements Document

## 1. Summary

Narrator is a SaaS product for generating AI avatar narration videos from text scripts —
positioned as a faster, simpler, more affordable alternative to HeyGen, Pictory, and Synthesia,
with native support for Hindi, Telugu, and Tamil voices. Users write or paste a script, choose
an avatar and voice, and receive a rendered MP4 they can download or embed.

## 2. Problem

Existing avatar-video tools (HeyGen, Synthesia, Pictory) are powerful but heavy: complex editors,
steep USD pricing, English-first voice libraries, and workflows built for video teams rather than
solo creators, marketers, and small businesses who just want "text in, video out" — often in a
regional Indian language. Narrator's wedge is a radically simpler flow (a single text box and a
render button), transparent credit-based pricing in INR, and Hindi/Telugu/Tamil voices as a
first-class feature rather than an afterthought.

## 3. Target users

- **Solo creators / course authors** turning written content into narrated video quickly.
- **Marketers** producing short product-explainer or social clips without a video team.
- **Small businesses** needing localized, repeatable talking-head videos (announcements,
  training) in Hindi, Telugu, or Tamil as well as English.
- **Growing teams** (agencies, larger businesses) that need multiple people generating videos
  under one subscription and one brand.

## 4. Product scope

### 4.1 In scope

1. **Marketing site**
   - Landing page (value proposition, feature highlights, comparison table, CTA).
   - Pricing page with plan comparison and self-serve checkout for paid tiers.
2. **Account & auth**
   - Email/password signup and login (JWT-based).
   - "Continue with Google" (OAuth 2.0), linked to the same user record by email.
   - Session persistence in the frontend; protected app routes.
3. **Text-to-video generation**
   - Script input (up to 5,000 characters).
   - Avatar selection (small fixed set of stock avatars for MVP).
   - Voice selection across English (US/UK), Hindi, Telugu, and Tamil — regional voices gated to
     paid plans.
   - Resolution choice (720p / 1080p / 4K, capped by plan tier).
   - Pre-render content-policy check (script moderation) before a job is queued or charged.
   - Job queueing with visible status: queued → processing → completed/failed.
4. **Video job management**
   - List of a user's past video jobs with status.
   - Preview/playback of completed videos.
   - Signed, expiring download links (videos stored in S3).
5. **Credit-based usage tracking**
   - Every plan grants a monthly credit allotment; free accounts get a one-time/recurring small
     allotment with no card required.
   - Rendering debits credits up front, estimated from script length and resolution; failed jobs
     are automatically refunded.
   - Full transaction ledger (grants, debits, refunds) visible to the user.
6. **Billing**
   - Stripe Checkout for subscribing to Starter (₹500/mo) or Pro (₹1,500/mo).
   - Enterprise is sales-assisted (contact form), not self-serve Checkout — provisioned manually
     with a custom credit pool and seat count.
   - Stripe Billing Portal for managing payment method/invoices/cancellation.
   - Webhook-driven plan + credit sync (checkout completed, invoice paid/renewed, subscription
     updated/cancelled).
7. **Team accounts (Pro & Enterprise)**
   - Plan owner can create a team and invite teammates (by email, existing accounts only for
     MVP) up to the plan's seat limit.
   - Team owner can remove members.
8. **Compliance safeguards**
   - Visible watermark burned into Free-tier output.
   - Script content-policy check blocking clearly disallowed requests before render.
   - AI-generated-content disclosure notice available via the API for downstream display.
9. **Admin operations**
   - Role-gated admin API: list/suspend users, override plan tier, view subscription and
     platform-wide stats (MRR, active subscriptions by tier, job status breakdown).
10. **Rendering pipeline**
    - Queue-backed (BullMQ/Redis) so rendering never blocks the API.
    - Pluggable TTS and lip-sync provider wrappers, callable independently, with local stub
      fallbacks for development.
    - FFmpeg composites avatar clip + narration audio (+ watermark when required) into an MP4.

### 4.2 Explicitly out of scope for this release

- Custom/cloned avatars or voices (user-uploaded).
- Multi-scene / timeline video editor.
- Pending email invites (team invites currently require the invitee to already have an account).
- Real-time collaborative editing.
- Multi-language *script translation* (voice selection covers narration language; translating a
  single script into multiple output languages is a Phase roadmap item).
- Kubernetes/autoscaling infrastructure — runs as a monolith (API + one worker service) on
  Render + Vercel.

## 5. User flows

### 5.1 Sign up → first video

1. User lands on the marketing site, clicks "Get started free."
2. User signs up with email/password or Google → redirected to `/dashboard` with 20 free
   credits.
3. User opens the video editor, writes a script, picks an avatar + voice (regional voices greyed
   out on Free), picks a resolution, clicks "Generate video."
4. Script passes the content-policy check; credits are debited; job appears as "Queued," then
   "Processing."
5. Dashboard polls job status; when "Completed," the preview pane loads the video (watermarked
   on Free).
6. User downloads the video or copies the signed URL.

### 5.2 Upgrade plan

1. Free-tier user runs low on credits or wants 1080p/regional voices (both blocked with a clear
   upgrade prompt).
2. User goes to Pricing or Billing, picks Starter or Pro, is redirected to Stripe Checkout.
3. On successful payment, Stripe's `checkout.session.completed` webhook activates the
   subscription, updates `planTier`, and grants the plan's credit allotment.
4. User is redirected back to the dashboard with the new tier active, watermark removed, and
   regional voices unlocked.
5. On each renewal, Stripe's `invoice.paid` webhook re-grants the monthly credit allotment.

### 5.3 Manage subscription

1. User goes to Billing → "Manage billing / invoices."
2. Redirected to the Stripe Billing Portal to update payment method, view invoices, or cancel.
3. On cancellation, a webhook downgrades the user back to the Free tier (and Free-tier credit/
   resolution/watermark limits) at period end.

### 5.4 Failed render

1. Worker encounters an error (provider timeout, FFmpeg failure).
2. Job status flips to "Failed" with an error message; BullMQ retries the job up to 3 times with
   exponential backoff before it's marked permanently failed.
3. The credits debited for the job are automatically refunded to the user's balance.
4. User sees "Failed" in the job list and can resubmit.

### 5.5 Team setup (Pro/Enterprise)

1. Plan owner goes to Profile → Team, creates a team (name only).
2. Owner invites a teammate by email. If that email doesn't have a Narrator account yet, the
   invite is rejected with a clear message to ask them to sign up first (no pending-invite email
   flow in this release).
3. Invited teammate appears in the member list; owner can remove non-owner members at any time.
4. Seat count is enforced against the plan's `teamSeats` limit.

## 6. Plan tiers

| Tier | Price | Credits/mo | Max resolution | Seats | Regional voices | Watermark |
|---|---|---|---|---|---|---|
| Free | ₹0 | 20 | 720p | 1 | No | Yes |
| Starter | ₹500/mo | 150 | 1080p | 1 | Yes | No |
| Pro | ₹1,500/mo | 600 | 1080p | 5 | Yes | No |
| Enterprise | Custom (sales-assisted) | 5,000+ (custom) | 4K | 50+ | Yes | No |

1 credit ≈ 10 seconds of rendered 720p video; higher resolutions cost proportionally more
credits per second (see `CREDIT_COST_PER_SECOND` in `backend/src/config/plans.config.ts`).
Credits do not roll over between billing cycles.

## 7. Success metrics

- **Activation**: % of signups who generate at least one completed video within 24 hours.
- **Conversion**: % of free-tier users who upgrade to a paid plan within 30 days.
- **Render reliability**: % of jobs that reach "Completed" without manual retry.
- **Time-to-video**: median wall-clock time from job creation to "Completed."
- **Regional voice adoption**: % of paid renders using a Hindi/Telugu/Tamil voice — validates the
  core differentiation bet against HeyGen/Synthesia.
- **Team expansion**: % of Pro/Enterprise accounts that invite at least one teammate.

## 8. Roadmap (post-MVP)

### Phase 2 — Quality & control
- Custom avatar upload (photo/video → avatar).
- Voice cloning.
- Caption styling and burned-in subtitle customization.
- Background/scene selection (green-screen compositing).
- Pending-invite emails for teammates without an existing account.

### Phase 3 — Collaboration & governance
- Role-based team access beyond owner/member (editor/viewer).
- Comment/approval workflow on generated videos.
- Shared brand asset libraries (logo, colors, intro/outro templates) per team.
- Admin-side content moderation queue (flagged scripts for manual review, not just auto-block).

### Phase 4 — Scale & platform
- Multi-language script translation + dubbing (one script → multiple output languages).
- API access for programmatic video generation (developer tier, API keys, usage-based billing).
- Template library (social ad formats, course intros, product explainers).
- Usage-based credit top-ups / overage billing on top of subscription tiers.
- Move the render worker to an autoscaled fleet (e.g. Kubernetes or ECS) once volume outgrows a
  single Render worker service — see `ARCHITECTURE.md` for why the module boundaries already
  support this split.

## 9. Risks & open questions

- **Avatar/TTS/lip-sync vendor choice**: ships with pluggable provider wrappers and local stub
  fallbacks; a real vendor integration (or in-house model) — ideally one with strong Hindi/
  Telugu/Tamil voice quality — must be selected before public launch.
- **Render cost at scale**: FFmpeg + provider costs per credit need to be modeled against INR
  plan pricing to ensure margin, especially at 4K on Enterprise.
- **Content moderation depth**: the MVP check is a keyword/pattern block list, not a hosted
  classifier — sufficient to stop obvious abuse, but should be upgraded before wide release.
- **Team invite UX**: requiring the invitee to already have an account is a deliberate MVP
  simplification; validate whether this friction meaningfully hurts team-plan adoption before
  investing in a full pending-invite email flow.
- **Regional voice quality**: differentiation depends on Hindi/Telugu/Tamil voices actually
  sounding natural — this should be validated with target users before leaning on it in
  marketing claims.
