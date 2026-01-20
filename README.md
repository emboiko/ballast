# Ballast 💸

Financing & Subscriptions Management Platform

## Overview

Ballast supports multiple payment processors via adapter interfaces. Stored credentials are provider-specific by default (Stripe payment methods, Braintree tokens, etc.), because processors do not share a universal token. To enable routing across processors without re-collecting credentials, a separate orchestration/vault layer (e.g., an agnostic vault) would be required.

## Project Structure

The monorepo contains 4 main applications:

### Admin Dashboard (Next.js)

Financing Plans & Service Subscriptions management:

- Create, view, edit, and archive subscriptions/plans
- View all subscriptions/plans for users
- Handle cancellations (distinct from delete/archive operations)
- View defaulted plans, process refunds, manual charges
- Generate and view contracts

**Setup:** The admin panel requires users to have `isAdmin: true` in the database. The API must have `ADMIN_URL` set in `.env.local` (e.g., `ADMIN_URL=http://localhost:3002`) for CORS.

### Payment Forms Webapp (Next.js)

A simple demo app with fake cart/items/services for payment collection. This serves as a stand-in for integration with external websites and demonstrates the payment flow.

### Main API (Express)

Backend services including:

- Routes and endpoints
- Database hooks
- Email services
- Webhook handlers

### Job Server (AWS Batch + Event Bridge + Parameter Store)

Scheduled and on-demand jobs:

- Financing charge job
- Subscriptions charge job
- Discord/Slack notifications
- Deploy and scheduling scripts

## Development

### Package Management with pnpm

This project uses [pnpm](https://pnpm.io/) instead of npm for package management. pnpm provides faster, more efficient installations and better workspace support for monorepos.

#### Basic Commands

- Install all dependencies: `pnpm install`
- Add a dependency to a specific package: `pnpm --filter @ballast/api add express`
- Add a dev dependency to root (shared tools): `pnpm add -Dw prettier eslint`
- Remove a dependency: `pnpm --filter @ballast/api remove express`
- List dependencies: `pnpm list` (or `pnpm ls`)

#### Working with Workspaces

**Adding dependencies to a specific app:**
(Add express to the API)

```bash
pnpm --filter @ballast/api add express
```

(Add zod to the shared package)

```bash
pnpm --filter @ballast/shared add zod
```

**Using the shared package in other packages:**
(API uses shared package)

```bash
pnpm --filter @ballast/api add @ballast/shared@workspace:*
```

(Admin dashboard also uses shared package)

```bash
pnpm --filter @ballast/admin add @ballast/shared@workspace:*
```

#### Key differences from npm:

- Uses `--filter` to target specific workspace packages
- `-Dw` flag adds dev dependencies to the root (workspace root)
- `-r` flag runs commands recursively across all packages
- Workspace protocol (`workspace:*`) links packages within the monorepo

For more information, see the [pnpm documentation](https://pnpm.io/docs).

### Database (Prisma)

The database is managed via Prisma from the shared package. In development, the API dev server automatically keeps the database schema and Prisma client in sync.

#### Dev Workflow (automatic)

- Start the API dev server as usual; it runs `db push` + `generate` for you.
- You only need to restart the API server after schema changes.
- Migrations are ignored during development to keep iteration fast; create a baseline migration when preparing for production.

#### Prisma Commands (shared package)

All commands are run from `packages/shared/`:

```bash
cd packages/shared
```

| Command        | Script             | Description                                                                |
| -------------- | ------------------ | -------------------------------------------------------------------------- |
| **Sync (dev)** | `pnpm db:sync`     | Pushes schema + regenerates Prisma client (used automatically by API dev). |
| **Generate**   | `pnpm db:generate` | Regenerates the Prisma client after schema changes.                        |
| **Migrate**    | `pnpm db:migrate`  | Creates and applies a new migration (for production-ready changes).        |
| **Deploy**     | `pnpm db:deploy`   | Applies committed migrations (run in CI/CD before production deploy).      |
| **Push**       | `pnpm db:push`     | Pushes schema changes directly without creating a migration file (manual). |
| **Studio**     | `pnpm db:studio`   | Opens Prisma Studio GUI to browse/edit data.                               |
| **Reset**      | `pnpm db:reset`    | Resets the database (drops all data and re-applies migrations).            |

#### Common Workflows

**Add a new field (dev):**

```bash
# 1. Edit packages/shared/prisma/schema.prisma
# 2. Restart the API dev server (it auto-runs db:sync)
```

**Prepare a production migration:**

```bash
# 1. Edit packages/shared/prisma/schema.prisma
# 2. Create a migration
pnpm db:migrate
# 3. Commit the migration and rely on db:deploy in CI/CD
```

If this is the first production release, use `pnpm db:migrate --name baseline` to capture the current schema before deployment.

**Viewing/editing data:**

```bash
pnpm db:studio
# Opens http://localhost:5555 with a GUI to browse tables
```

#### Troubleshooting

**"Field does not exist" errors after schema changes:**

- Restart the API dev server to re-run db sync
- Or run `pnpm db:sync` manually from `packages/shared`

**Schema out of sync with database:**

- Run `pnpm db:sync` or restart the API dev server

**Need to start fresh:**

- Run `pnpm db:reset` (WARNING: deletes all data)

### Shared Package (`packages/shared`)

**The shared package is for sharing CODE, not dependencies.**

The `@ballast/shared` package exports reusable utilities that multiple apps need:

| Export                                   | Description                               |
| ---------------------------------------- | ----------------------------------------- |
| `@ballast/shared/src/db/client.js`       | Prisma client singleton                   |
| `@ballast/shared/src/money.js`           | Money formatting and arithmetic utilities |
| `@ballast/shared/src/fonts`              | Next.js font configurations               |
| `@ballast/shared/src/styles/globals.css` | CSS custom properties (theme variables)   |
| `@ballast/shared/src/config/env.js`      | Environment variable utilities            |

**Important: Dependencies are NOT shared through workspace packages.**

Each app that directly imports a package must have it in its own `package.json`:

```
# Example: webapp directly imports styled-components
apps/webapp/package.json → "styled-components": "^6.3.5"

# Example: shared uses next/font/google internally
packages/shared/package.json → "next": "^16.1.1"

# Webapp also needs next for build scripts
apps/webapp/package.json → "next": "^16.1.1"
```

pnpm automatically deduplicates - having the same dependency in multiple `package.json` files doesn't mean multiple installs. It links to one copy in the pnpm store.

**When to add to shared vs app:**

- **Shared**: Code that multiple apps import (utilities, types, configs)
- **App**: Dependencies the app imports directly (even if shared also uses them)

### Import Aliases

All applications (webapp, admin, and API) use import aliases for cleaner, more maintainable imports:

- **`@/`** - Maps to the application source directory
  - **Webapp/Admin**: Maps to `app/` directory
    - Example: `import Header from "@/components/ui/Header"` instead of `import Header from "../../components/ui/Header"`
  - **API**: Maps to `src/` directory
    - Example: `import { requireAuth } from "@/middleware/auth.js"` instead of `import { requireAuth } from "../middleware/auth.js"`
- **`@shared/`** - Maps to `packages/shared/src/`
  - Example: `import { formatMoney } from "@shared/money"` instead of `import { formatMoney } from "../../../packages/shared/src/money"`

**Configuration:**

- **Next.js apps (webapp/admin)**:
  - `next.config.js` - Webpack aliases for build-time resolution
  - `jsconfig.json` - IDE support for autocomplete and path resolution
- **API (Node.js ESM)**:
  - ESM loader registered via `register()` API (`src/register.mjs` + `src/loader.mjs`) - Runtime alias resolution
  - `jsconfig.json` - IDE support for autocomplete and path resolution
- Each application maintains its own `jsconfig.json` for flexibility and customization

#### Why the API needs a custom loader

Unlike Next.js applications which use Webpack for module resolution, the API runs as a pure Node.js ESM application. Node.js doesn't natively support import aliases like `@/` or `@shared/` - it only understands relative paths (`../`) and package names.

To enable alias imports in the API, we use Node.js's ESM loader hooks:

- **`src/loader.mjs`**: Implements the `resolve` hook that intercepts import statements and maps aliases (`@/` and `@shared/`) to actual file paths before Node.js tries to resolve them.
- **`src/register.mjs`**: Registers the loader using the `register()` API from `node:module`. This is the recommended approach in Node.js 20.6+ (replacing the deprecated `--loader` flag).

The loader is registered via `--import ./src/register.mjs` in the package.json scripts, which runs the register hook before the main application starts.

**References:**

- [Node.js ESM Loaders Documentation](https://nodejs.org/api/esm.html#loaders)
- [Node.js `register()` API](https://nodejs.org/api/module.html#moduleregisterspecifier-parenturl)

**Best Practices:**

- Always use `@/` for imports from within the application directory
- Always use `@shared/` for imports from the shared package
- Avoid relative paths (`../`, `../../`) - use aliases instead
- Same-directory imports (`./`) are acceptable for files in the same directory

### Images in Next.js Applications

Always use Next.js `Image` component (`next/image`) instead of native `<img>` elements. The `Image` component provides automatic optimization, lazy loading, responsive images, and prevents layout shift.

**Usage:**

```javascript
import Image from "next/image"

// For images that fill a container (aspect-ratio based)
// style prop is used directly here only for demonstration purposes. Avoid inline styles whenever possible.
<Container style={{ position: "relative" }}>
  <Image
    src={imageUrl}
    alt="Description"
    fill
    style={{ objectFit: "cover" }}
  />
</Container>

// For fixed-size images
<Image
  src={imageUrl}
  alt="Description"
  width={500}
  height={300}
/>
```

**Important Notes:**

- When using the `fill` prop, the parent container **must** have `position: relative`
- The `style={{ objectFit: "cover" }}` prop is required when using `fill` to control how the image fills the container
- Always provide descriptive `alt` text for accessibility
- For external images, configure `next.config.js` with the `images.remotePatterns` or `images.domains` option

**References:**

- [Next.js Image Optimization](https://nextjs.org/docs/pages/api-reference/components/image)
- [Next.js Image Component Documentation](https://nextjs.org/docs/app/api-reference/components/image)

### Authentication & Route Protection

The `AuthGuard` component is used to protect routes that require authentication. **AuthGuard must always be used at the page level**, never at the component level. This ensures consistent authentication behavior and makes it clear which routes require authentication.

**Usage:**

```javascript
// ✅ Correct: Use AuthGuard at the page level
// app/checkout/page.jsx
import PageLayout from "@/components/ui/PageLayout"
import AuthGuard from "@/components/auth/AuthGuard"
import Checkout from "@/components/payment/Checkout"

export default function CheckoutPage() {
  return (
    <PageLayout>
      <AuthGuard>
        <Checkout />
      </AuthGuard>
    </PageLayout>
  )
}

// ❌ Incorrect: Do not use AuthGuard inside components
// This makes it unclear which routes require authentication
export default function Checkout() {
  return (
    <AuthGuard>
      <CheckoutFlow />
    </AuthGuard>
  )
}
```

**Rules:**

- Always wrap page content with `AuthGuard` in page files (e.g., `app/cart/page.jsx`, `app/checkout/page.jsx`)
- Never use `AuthGuard` inside reusable components
- This pattern applies to both the webapp and admin panel

### Suspense & useSearchParams

Components that use Next.js's `useSearchParams()` hook must be wrapped in a `<Suspense>` boundary. This is a Next.js requirement because search params aren't known at build time during static generation.

**Pattern:**

```javascript
// Inner component uses useSearchParams
function MyContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  // ...
}

// Outer component wraps in Suspense
export default function MyComponent() {
  return (
    <Suspense fallback={<Container>Loading...</Container>}>
      <MyContent />
    </Suspense>
  )
}
```

Without the Suspense boundary, Next.js would bail out of static rendering or you may encounter hydration errors.

**References:**

- [Next.js useSearchParams Documentation](https://nextjs.org/docs/app/api-reference/functions/use-search-params)

### Network Requests & API Communication

All network requests must follow the gateway pattern to ensure proper separation of concerns and maintainability. **Components must never call `fetch()` or gateways directly.**

**Pattern:** `component -> store/context -> gateway -> api route -> api gateway`

**Client-side (webapp/admin):**

- Gateway files are located in `app/gateways/` (e.g., `authGateway.js`, `ordersGateway.js`, `paymentsGateway.js`)
- Components call context/store functions, which in turn call gateway functions
- **Components must never import or call gateway functions directly** - always go through contexts/stores
- Gateway functions are simple wrappers around `fetch()` that handle configuration, headers, credentials, and response parsing

**Server-side (API):**

- Gateway files are located in `src/gateways/` for external service integrations (e.g., `stripeGateway.js`, `emailGateway.js`, `turnstileGateway.js`)
- Route handlers call gateway functions to interact with external services
- Gateway functions encapsulate external API calls (Stripe, Resend, Cloudflare Turnstile, etc.)

**Example:**

```javascript
// ✅ Correct: Component uses context, context uses gateway
// Component
const { login } = useAuth()
await login(email, password)

// Context (AuthContext.jsx)
import { login as loginGateway } from "@/gateways/authGateway"
const login = useCallback(async (email, password) => {
  const result = await loginGateway(email, password)
  // ... handle result
}, [])

// Gateway (authGateway.js)
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })
  // ... handle response
}

// ❌ Incorrect: Calling fetch directly
// Component.jsx
const response = await fetch(`${API_URL}/auth/login`, { ... })

// ❌ Incorrect: Calling gateway directly
// Component.jsx
import { login } from "@/gateways/authGateway"
await login(email, password)
```

**Rules:**

- Never call `fetch()` in components - always go through contexts/stores
- Never call gateway functions directly from components - always go through contexts/stores
- Use "gateway" terminology, not "service" (services are customer-facing subscriptions)
- Gateway functions should be simple wrappers - keep business logic in contexts/stores
- Use named imports for gateway functions (e.g., `import { fetchUser, login } from "@/gateways/authGateway"`)

### Money & Numeric Precision

All money values are stored and computed as integers (cents) to avoid floating-point arithmetic errors. Use the shared money utilities:

```javascript
import {
  toCents,
  formatMoney,
  formatMoneyValue,
  addMoney,
  multiplyMoney,
  percentOfMoney,
  BasisPoints,
} from "@ballast/shared/src/money.js"

// Convert user input to cents immediately (only at input boundaries)
const priceInCents = toCents(93.29) // 9329

// Compute in cents using integer arithmetic
const itemTotal = multiplyMoney(itemCents, quantity) // Integer math, no floating-point errors
const cartTotal = cartItems.reduce(
  (sum, item) => addMoney(sum, multiplyMoney(item.priceCents, item.quantity)),
  0
)

// Format for display only
formatMoney(9329) // "$93.29"
formatMoneyValue(9329) // "93.29"

// For percentages, use basis points (1% = 100 basis points)
const percentPaid = BasisPoints.fromPercent(56.67) // 5667
BasisPoints.format(5667) // "56.67%"
```

**Rules:**

- **API Communication**: Always send/receive money as integers (cents). Never convert between dollars and cents at API boundaries.
  - ✅ Webapp → API: Send `amountCents` (integer)
  - ✅ API → Gateway: Send `amountCents` (integer)
  - ❌ Never: Convert to dollars just to convert back to cents
- **Conversion Boundaries**:
  - Convert dollars → cents only when receiving user input (e.g., admin forms where user types "$93.29")
  - Convert cents → dollars only for display (using `formatMoney()` or `formatMoneyValue()`)
- **Storage**: Store cents (INTEGER) in database, never DECIMAL or FLOAT
- **Computation**: Use integer arithmetic only. Use `multiplyMoney()`, `addMoney()`, `percentOfMoney()` utilities when needed.
- **Validation**: When accepting money in API routes/lib functions, validate it's an integer (`Number.isInteger()`) and positive.

### Code Quality

ESLint and Prettier are configured project-wide at the root level. All packages share the same linting and formatting rules.

- **Lint**: `pnpm lint` - Check for linting errors across all packages
- **Lint & Fix**: `pnpm lint:fix` - Automatically fix linting errors
- **Format**: `pnpm format` - Format all code files
- **Format Check**: `pnpm format:check` - Check if files are formatted correctly
- **Comment Style**: Prefer single-line comments (`//`) for general code comments. Use multi-line comments (`/** */`) for JSDoc type annotations and function documentation. Avoid superfluous file header comments - code should be self-documenting.

## Deployment

Applications are deployed separately from the monorepo:

- **Admin Dashboard** (Next.js) → Vercel
- **Payment Forms Webapp** (Next.js) → Vercel
- **API** (Express via serverless functions) → Vercel
- **Job Server** (AWS Batch) → Dockerized deployment on AWS

## Blocked Users

Ballast supports an admin-driven **ban/unban** system. Bans are enforced at the API auth/account level and are intended to be explicit to the user (e.g., a banned user will see a “This account has been banned” message on login).

### Current behavior

- **Ban flag**: users can be banned via admin (stored on the user record).
- **Immediate logout from all devices**: we invalidate existing JWT sessions by rejecting any token issued before a server-stored timestamp (`tokensInvalidBefore`). When a ban/unban occurs, that timestamp is advanced, forcing all existing sessions to fail on the next authenticated request (and the auth cookie is cleared).

### Limitations (intentional, for now)

The current system is **not** designed to robustly prevent a banned user from creating new accounts with burner emails. In particular, **IP-only blocking is noisy** (shared IPs, mobile carriers, CGNAT, dynamic IPs) and is easy to circumvent for motivated users (VPNs, proxies).

### Possible future improvements

If abuse becomes a real issue, typical next steps include:

- **Track IP usage** for signup/login (audit trail), then add a `blocked_ips` list for simple blocking.
- **Device identifiers** (a long-lived device cookie) and the ability to block devices in addition to accounts.
- **Rate limiting** and velocity rules (e.g., accounts created per IP/day, failed logins per IP/hour).
- **Tunable bot protection** (Turnstile difficulty increases for risky traffic) rather than only hard-blocking.
- Higher-assurance options (trade-offs): **phone verification**, requiring a **payment method**, etc.

## Environment Variables & Constants

- Each app owns its `constants.js` and keeps all `process.env` access there.
- When a default value is used because an env var is missing, the app logs a one-time `console.warn` message on startup.

## Todo

Various post-deployment todos:

- Support bt, square, and authorize
- admin: edit user-info section on user-details page
- Fill the database with actual data for encabulators and ancabulator accessories
- webapp mobile styles + (page backgrounds? Had a hard time with this one already.)
- webapp featured items from the catalog (shown at the top when not filtering to a given category)
- ensure emails/phone numbers are updated in PPs when user updates in DB. We should always keep these in sync. Unsure what the best approach is for pre/post save hooks and what we should and should not try to be using those for. We'll need placeholders for non-stripe PP's if we implement this right away, as we haven't started integrating bt, square or authorize yet- but we'll want to keep that in mind for the future as well.

- Subscriptions:
- Subscription emails
- Subscription job
- webapp + admin integrations
- re-use a lot of saved-payment method logic (and other logic in general) implemented from financing where possible

- Financing plans:
- Financing emails
- Financing job
- Webapp + Admin integrations
- saved payment methods + default payment method functionality (alongside stripe-link, etc)
- Financing principal payment via webapp & admin panel
- Financing and subscription contracts should be generated per-plan and stored in a way that's easily exported to PDF or something that can be handed to a CX-team member or non-developer.

- Ensure we're using zod and JSdoc correctly and everywhere.
- clean up select objects with some constants? (user selects at least? these are repetitive)
- setup debuggers for all 4 apps (webapp, admin panel, API, job server (jobs hasnt began development))
- Check for DOM warnings everywhere (note: recharts order and user growth are throwing known warnings for width and height)
- revisit logging -> shared logger service? -> repo-wide logging assessment for robustness and usefulness for debugging via papertrail later on
- Full manual test of everything post 0.1.0 release
- Integration tests for webapps, automated tests for jobs, etc.
- single letter variables and descriptive variable names everywhere
- revisit shared constants for vars that do not require process.env access
- revisit/consider shared components library for webapp and admin panel (later on when things are more built out)
- staging branch / staging env
- Architecture diagram(s) in readme + revamp all documentation
- Reverify all dependencies up-to-date with 0 vulnerabilities, etc
- support other currencies
- admin leads section -> stale carts that we have a phone number / email for -> requires a more robust implementation for shopping carts overall
- Special services that we reach out to users for - special pricing, etc.
- Admin preview product/service detail page (via shared components)
- Admin link to product/service detail page (if isActive)
- webapp: corral the user towards their cart more after they add something
- webapp: Intelligent search -> Searches with zero results (instant product opportunity list)
- query params + links for contact submissions and refunds for given user from user-detail page (We have a really nice pattern already set up for this with `/orders`)
- Pending and Failed orders (We currently have no paths that set these, only succeeded)
- long-term todo for order pipelines and handling shipping/delivery/tracking/etc.
- webapp log out of all devices?
- support intl phone numbers
- webapp receipts/invoices download functionality for order
- webapp settings page download my data functionality.
- Better loading states for webapp and admin panel?
- webapp 2FA support via SMS/email.
- admin panel user detail page is still set up well for use with editUser (whatever fields we want to edit) but we only really use it for admin status toggle for now.
- SMS comms support in general (optional, not required)
- 3DS toggle where available (not all processors support it)
- Credits system for webapp users, managed via admin panel, used by api, jobs, etc.
- Add catalog prodcuts and services to main admin search (catalog and services preview page via shared components from webapp)
- git submodules
- search functionality for products catalog on webapp (can go where the huge Products header is)
- admin 2FA via authenticator app or otherwise
- admin dashboard: service statuses/health (resend, twilio, google auth, etc?)
- admin dashboard: Add some kind of "action inbox" for items on the dashboard like pending refunds, etc.
- admin dashboard: Network traffic visualization/monitoring,
- admin Add unverified count to users dashboard
- admin communications email search functionality?
- admin panel consent history for ToS/privacy policy acceptance + system to flag updates to these documents & require re-consent (for admin panel users) -> flag resets if we modify ToS -> admin users must ack/sign the modal every time this happens.
- add optional history tracking to DB (seems to totally suck to do with prisma) -> this was the idea behind the timeline section on the admin panel's user-detail view (WIP).
