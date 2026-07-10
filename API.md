# Narrator API Reference

Base URL: `http://localhost:4000/api` (local) or `https://<your-render-service>.onrender.com/api`
(production). The health check at `/health` is the one route **not** under the `/api` prefix.

All authenticated routes expect `Authorization: Bearer <accessToken>`, where `accessToken` is the
JWT returned by `/auth/login`, `/auth/register`, or the Google OAuth callback.

## Auth

### `POST /auth/register`
Create an account with email/password. Grants 20 free credits.

```json
// Request
{ "email": "jane@example.com", "password": "at-least-8-chars", "fullName": "Jane Doe" }

// Response 201
{ "accessToken": "eyJhbGciOi..." }
```

### `POST /auth/login`
```json
// Request
{ "email": "jane@example.com", "password": "at-least-8-chars" }

// Response 200
{ "accessToken": "eyJhbGciOi..." }
```

### `GET /auth/me` 🔒
Returns the current user (password hash omitted).

```json
{
  "id": "uuid",
  "email": "jane@example.com",
  "fullName": "Jane Doe",
  "planTier": "starter",
  "role": "user",
  "creditBalance": 142,
  "isSuspended": false,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

### `GET /auth/google`
Redirects to the Google consent screen. Not callable via fetch/XHR — use as a plain link
(`<a href="/api/auth/google">`).

### `GET /auth/google/callback`
Google redirects here after consent. On success, Narrator redirects the browser to
`${FRONTEND_URL}/auth/callback?token=<accessToken>` for the frontend to pick up.

---

## Videos

### `POST /videos` 🔒
Queues a new render job. Validates the script against the content-moderation policy, checks the
requested resolution against the caller's plan, estimates a credit cost from script length, and
debits the user's credit balance before enqueueing.

```json
// Request
{
  "script": "Hi, welcome to our product demo...",
  "avatarId": "default",
  "voiceId": "hi-IN-female-1",
  "resolution": "1920x1080"
}

// Response 201
{
  "id": "uuid",
  "status": "queued",
  "creditCost": 4,
  "watermarked": false,
  "resolution": "1920x1080",
  "progress": 0,
  "createdAt": "..."
}
```

Errors: `400` insufficient credits or resolution exceeds plan, `422` script fails moderation.

### `GET /videos` 🔒
Lists the caller's video jobs, newest first.

### `GET /videos/:id` 🔒
Fetches a single job (404 if it doesn't belong to the caller). Poll this (or the list endpoint)
to track `status`: `queued → processing → completed | failed`. `outputUrl` is populated once
`completed`.

---

## AI catalog (public)

### `GET /ai/voices`
Returns the voice catalog, including regional voices.

```json
[
  { "id": "en-US-female-1", "label": "Ava", "languageCode": "en-US", "languageName": "English (US)", "gender": "female", "regional": false },
  { "id": "hi-IN-female-1", "label": "Ananya", "languageCode": "hi-IN", "languageName": "Hindi", "gender": "female", "regional": true },
  { "id": "te-IN-male-1", "label": "Karthik", "languageCode": "te-IN", "languageName": "Telugu", "gender": "male", "regional": true },
  { "id": "ta-IN-female-1", "label": "Meera", "languageCode": "ta-IN", "languageName": "Tamil", "gender": "female", "regional": true }
]
```

`regional: true` voices are rejected server-side for accounts on the Free plan (`regionalVoices:
false` in `plans.config.ts`) — the frontend also greys these out client-side.

### `GET /ai/avatars`
Returns the avatar catalog (`id`, `name`, `thumbnailUrl`, `style`).

---

## Credits

### `GET /credits/balance` 🔒
```json
{ "balance": 142 }
```

### `GET /credits/history` 🔒
Last 100 ledger entries (grants, debits, refunds), newest first.

```json
[
  { "id": "uuid", "type": "debit", "amount": -4, "videoJobId": "uuid", "reason": "Video render (1080p, ~20s)", "createdAt": "..." },
  { "id": "uuid", "type": "grant", "amount": 150, "reason": "Monthly allotment for starter plan", "createdAt": "..." }
]
```

---

## Billing (Stripe)

### `POST /billing/checkout-session` 🔒
Starts a Stripe Checkout session for a self-serve tier. Enterprise is sales-assisted, not
available here.

```json
// Request
{ "planTier": "starter" }  // "starter" | "pro"

// Response
{ "url": "https://checkout.stripe.com/c/pay/..." }
```

### `POST /billing/portal-session` 🔒
Opens the Stripe Billing Portal for the caller's existing subscription.

```json
{ "url": "https://billing.stripe.com/p/session/..." }
```

### `POST /billing/webhook`
Stripe webhook receiver. Verifies the `Stripe-Signature` header against `STRIPE_WEBHOOK_SECRET`.
Handles `checkout.session.completed` (activates the subscription + grants first credit
allotment), `customer.subscription.updated` / `.deleted` (status sync, downgrade to Free on
cancellation), and `invoice.paid` (renews the credit allotment each billing cycle). Configure
this URL in the Stripe dashboard as `<API base>/billing/webhook`.

---

## Teams (Pro / Enterprise)

### `POST /teams` 🔒
Creates a team for the caller (must be on a plan with `teamSeats > 1`). The caller becomes the
`owner`.

```json
{ "name": "Marketing Team" }
```

### `GET /teams/mine` 🔒
Returns `{ team, members } | null`.

### `POST /teams/:teamId/members` 🔒 (owner only)
Invites an **existing** Narrator user by email. The invitee must already have an account (there's
no pending-invite email flow in the MVP — ask them to sign up first).

```json
{ "email": "teammate@company.com" }
```

Errors: `403` non-owner, `400` seat limit reached, `404` no account for that email,
`409` already a member.

### `DELETE /teams/:teamId/members/:userId` 🔒 (owner only)
Removes a member. Owners cannot remove themselves.

---

## Admin (role: `admin` only)

All routes require `Authorization: Bearer <token>` for a user with `role: "admin"` (set directly
in the database — there's no self-serve way to become an admin).

### `GET /admin/users?page=1&pageSize=25`
Paginated user list (password hashes omitted).

### `PATCH /admin/users/:id`
```json
{ "planTier": "pro", "isSuspended": false }
```
Both fields optional; only provided fields are updated.

### `GET /admin/subscriptions/stats`
```json
{ "activeSubscriptions": 42, "byTier": { "starter": 30, "pro": 12 }, "monthlyRecurringRevenueInr": 33000 }
```

### `GET /admin/stats`
Combines `subscriptions/stats` with platform totals:
```json
{
  "totalUsers": 210,
  "jobsByStatus": { "completed": 180, "processing": 3, "failed": 5, "queued": 1 },
  "activeSubscriptions": 42,
  "byTier": { "starter": 30, "pro": 12 },
  "monthlyRecurringRevenueInr": 33000
}
```

---

## Health

### `GET /health`
Unauthenticated, not under `/api`. Used as the Render health-check path.
```json
{ "status": "ok", "timestamp": "..." }
```
