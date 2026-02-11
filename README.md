# Ballast

Financing & subscriptions management platform (monorepo).

Ballast supports multiple payment processors via adapter interfaces. **Stored payment credentials are processor-specific** (Stripe payment methods, Braintree tokens, etc.). If we ever want “route across processors without re-collecting credentials”, we’ll need a separate orchestration/vault layer.

Current integrations in this repo include **Stripe** (API + web), and client integrations for **Braintree** and **Square** (webapp).

## Repository layout

### Applications (`apps/`)

- **`apps/webapp`** (Next.js, port `3001`): payment forms + demo cart/checkout flows.
- **`apps/admin`** (Next.js, port `3002`): admin dashboard for users, plans, subscriptions, refunds, catalog, jobs.
- **`apps/api`** (Express, port `3000`): REST API, auth, webhooks, email sending, internal job endpoints.
- **`apps/jobs`** (Node): “job runner” code meant for AWS Batch/EventBridge; can also be run locally.

### Shared package (`packages/shared`)

**`@ballast/shared` is for sharing code, not dependencies.** It includes:

- **Database**: Prisma schema + Prisma client (`packages/shared/src/db/client.js`)
- **Money utilities**: integer cents + basis points helpers (`packages/shared/src/money.js`)
- **Env helpers**: dotenv loading + one-time warnings (`packages/shared/src/config/env*.js`)
- **Misc**: shared styles, fonts, auth utils

If an app imports a dependency directly, **that app must list it in its own `package.json`** (even if `@ballast/shared` also uses it).

## Quickstart (local development)

### Prerequisites

- **Node**: `>= 20`
- **pnpm**: `>= 8` (repo pins `pnpm@8.15.0`)
- **Postgres**: available locally (Prisma uses `DATABASE_URL`)

### Install

```bash
pnpm install
```

### Configure env

Each app typically uses an `.env.local` file in its own directory.

- **API**: `apps/api/.env.local`
  - `DATABASE_URL` (Postgres connection string)
  - `JWT_SECRET`
  - `WEBAPP_URL` (default `http://localhost:3001`)
  - `ADMIN_URL` (should be `http://localhost:3002` for local dev; required for CORS)
  - `STRIPE_SECRET_KEY` (required for Stripe flows)
  - `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (required to send emails)
  - `JOBS_INTERNAL_API_TOKEN` (required if running Jobs -> API notifications)
- **Jobs**: `apps/jobs/.env.local`
  - `JOBS_INTERNAL_API_TOKEN` (must match API)
  - `API_INTERNAL_URL` (optional; defaults to `API_URL` then `http://localhost:3000`)

### Run the stack

```bash
# API (auto-runs Prisma db sync, then starts in watch mode)
pnpm --filter @ballast/api dev
```

```bash
# Admin dashboard (http://localhost:3002)
pnpm --filter @ballast/admin dev
```

```bash
# Webapp payment forms (http://localhost:3001)
pnpm --filter @ballast/webapp dev
```

**Admin access**: the admin UI requires the user record to have `isAdmin: true`.

## Database (Prisma)

Prisma lives in `packages/shared/prisma/`. For dev, the API’s `pnpm --filter @ballast/api dev` runs a sync step (push + generate) before starting.

### Useful commands (run from `packages/shared/`)

```bash
cd packages/shared
```

- **Dev sync**: `pnpm db:sync`
- **Generate client**: `pnpm db:generate`
- **Create migration**: `pnpm db:migrate`
- **Apply committed migrations**: `pnpm db:deploy`
- **Studio**: `pnpm db:studio`
- **Reset** (destructive): `pnpm db:reset`
- **Seed (optional)**: `pnpm db:seed:catalog`, `pnpm db:seed:events`

## Jobs (charging + reminders)

Jobs are in `apps/jobs/lib/jobs/` and are runnable locally via scripts:

```bash
pnpm --filter @ballast/jobs runChargeFinancing
pnpm --filter @ballast/jobs runChargeSubscriptions
pnpm --filter @ballast/jobs runSendUpcomingChargeReminders
```

### Jobs → API internal calls (automated notifications)

Some jobs request the API to send emails via **internal endpoints** protected by a shared secret.

- **Auth**: Jobs send `Authorization: Bearer <JOBS_INTERNAL_API_TOKEN>`. API validates this via `requireInternalJobsAuth`.
- **Base URL**: Jobs use `API_INTERNAL_URL` (fallback `API_URL`, then `http://localhost:3000`).
- **Reminder lead time**: `PAYMENT_REMINDER_DAYS_BEFORE` controls how many days before a scheduled charge we send reminders (default: `3`).
- **Routes** (API): mounted at `POST /internal/notifications/*` and include:
  - `/subscriptions/upcoming-charge`
  - `/subscriptions/charge-failed`
  - `/subscriptions/defaulted`
  - `/financing/upcoming-charge`
  - `/financing/charge-failed`
  - `/financing/defaulted`

## Engineering conventions (high-signal)

- **Money**: store and compute money as **integer cents** only; percentages use **basis points**. Use `@ballast/shared/src/money.js`.
- **Dates/time in logic**: tests should not call `new Date()` directly inside domain logic; inject a clock (`clock.now()`).
- **Env access**: each app centralizes `process.env` reads in its `constants.js` and warns once when defaults are used.
- **Network requests (webapp/admin)**: components don’t call `fetch()`; use the gateway pattern (`component -> store/context -> gateway -> api route -> api gateway`).
- **Route protection (webapp/admin)**: `AuthGuard` is used **at the page level only**.
- **Import aliases**: apps use `@/` for app-local imports and `@shared/` for shared code. The API uses an ESM loader (`apps/api/src/register.mjs`, `apps/api/src/loader.mjs`) to make this work at runtime.

## Testing

- **Jobs**: `pnpm --filter @ballast/jobs test` (uses Node’s built-in test runner)

## Tooling

- **Lint**: `pnpm lint`
- **Format**: `pnpm format`
- **Docs**: `pnpm docs` (JSDoc)

## Deployment (current)

- **Admin** (Next.js) → Vercel
- **Webapp** (Next.js) → Vercel
- **API** (Express) → Vercel (exports the Express app; in local dev it listens on `PORT` when not in Vercel runtime)
- **Jobs** → AWS Batch (containerized) + EventBridge scheduling + Parameter Store

## Account banning (admin)

Ballast supports an admin-driven **ban/unban** system enforced at the API auth/account level.

- **Immediate logout from all devices**: existing JWT sessions are invalidated by rejecting tokens issued before a server-stored timestamp (see `tokensInvalidBefore` behavior in API auth). When a ban/unban occurs, that timestamp is advanced so existing sessions fail on next request.
- **Known limitation**: this is not designed to prevent banned users from creating new burner accounts (IP-only blocking is noisy and bypassable).

## Production URLs

- **Webapp**: `https://ballast.systems`
- **Admin**: `https://admin.ballast.systems`
- **API**: `https://api.ballast.systems`
- **Mail**: `https://mail.ballast.systems`
