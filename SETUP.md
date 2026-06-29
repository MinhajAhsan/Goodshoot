# GoodShoot — Local Setup

A Next.js 14 + Prisma + Supabase booking platform.

## Prerequisites

- Node.js 20+ (this project was built with v24 via `nvm`).
- A Supabase project.

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment

Copy `.env.example` to `.env` and fill in the values (the `.env` file is gitignored):

```bash
cp .env.example .env
```

### Where to find each value (Supabase dashboard)

| Variable | Location |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → Project API keys → `anon`/publishable |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` (secret — keep server-side) |
| `DATABASE_URL` / `DIRECT_URL` | Project Settings → Database → Connection string → **ORM / Prisma** tab |
| `INNOVATOR_EMAIL` | The email that should have admin access |

> `DATABASE_URL` is the **pooled** connection (port 6543, `?pgbouncer=true`).
> `DIRECT_URL` is the **direct** connection (port 5432) used for migrations.
> Both need your database password.

## 3. Configure Supabase Auth (for local testing)

For frictionless local testing, in **Authentication → Providers → Email**, turn **OFF**
"Confirm email" so signups create a session immediately. (Re-enable + configure SMTP
before production.)

## 4. Create the database schema and seed it

```bash
npm run db:migrate     # creates tables on Supabase (uses DIRECT_URL)
npm run db:seed        # seeds cities (Karachi/Lahore/Islamabad), template, admin settings
```

## 5. Run the app

```bash
npm run dev            # http://localhost:3000
```

## Useful commands

```bash
npm run test           # quote-engine unit tests
npm run db:studio      # browse the database in Prisma Studio
npm run build          # production build
```

## What's built (Phase 1)

- Public flow: landing → questionnaire → instant quote (with email/phone lead-capture gate)
  → consultation booking → success.
- Auth (Supabase email/password) + protected client dashboard (bookings list, detail, profile).
- Quote engine, booking state machine, audit-log + email helpers (email is a console stub in Phase 1).

## Not yet built (later phases)

- Phase 2: Innovator/admin dashboard (status management, specialists, leads, payments, settings).
- Phase 3: 48h abandonment automation.
- Phase 4: Real Resend emails + real Calendly embed/webhook.
