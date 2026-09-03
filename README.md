# Chapter Events Hub

A full-stack event signup and management app for the Delta Sigma Pi chapter,
built with Next.js (App Router), TypeScript, Tailwind CSS, and Prisma with a
PostgreSQL database. It ships as a single deployable app — no separate
backend service required.

- **Public site (`/`)** — members browse upcoming events (with the relevant
  major shown when an admin sets one), see spots remaining, and sign up with
  just a name plus an email or phone number.
- **Admin dashboard (`/admin`)** — password-protected. Create/edit/delete
  events, view stats, see who signed up for each event, and export signups
  as CSV.

## Tech stack

- Next.js 16 (App Router, TypeScript, Server Actions)
- Tailwind CSS 4
- Prisma 7 + PostgreSQL (via the `@prisma/adapter-pg` driver adapter)
- `jose` for signing the admin session cookie (JWT, HS256)
- `zod` for form validation

## Getting started

1. Get a Postgres database — see [Database](#database) below for options.
2. Copy the env template and fill in your own values:

   ```bash
   npm install
   cp .env.example .env   # then edit DATABASE_URL, ADMIN_PASSWORD, SESSION_SECRET
   ```
3. Apply the schema and start the app:

   ```bash
   npm run db:migrate     # creates the tables in your Postgres database
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) for the public site and
[http://localhost:3000/admin](http://localhost:3000/admin) for the admin
dashboard.

## Environment variables

Set these in `.env` (see `.env.example`):

| Variable          | Description                                                                 |
| ----------------- | ---------------------------------------------------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string. See [Database](#database) below.               |
| `ADMIN_PASSWORD`  | The single shared password for the `/admin` dashboard.                       |
| `SESSION_SECRET`  | Random secret used to sign the admin session cookie.                         |

**Change these before deploying anywhere real:**

```bash
# Generate a strong random session secret:
openssl rand -base64 32
```

Pick your own `ADMIN_PASSWORD` and share it with chapter officers directly
(e.g. in person or over a secure channel) — it is not tied to individual
accounts, so anyone with the password can manage events and see signup
lists.

A placeholder password (`DSP-Delta-2026!`) is set in `.env` for local
development only — **change it** before sharing a deployed link with anyone.

## Database

This app uses **PostgreSQL via Prisma**, which works on any host with a
persistent filesystem *and* on purely serverless platforms (Vercel,
Netlify, etc.) — the database lives outside your app's filesystem, so
there's no ephemeral-disk problem to work around.

### Getting a Postgres database and setting `DATABASE_URL`

Pick any hosted Postgres provider (this app doesn't require anything
Postgres-specific beyond what Prisma supports). A few common ones and the
`DATABASE_URL` format each expects:

**Supabase** — create a project at [supabase.com](https://supabase.com),
then go to Project Settings → Database → Connection string → URI. Use the
**"Transaction pooler"** connection string if your host is serverless
(port `6543`), or the direct connection (port `5432`) otherwise:

```
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@[host]:6543/postgres?pgbouncer=true"
```

**Neon** — create a project at [neon.tech](https://neon.tech), then copy
the connection string from the dashboard:

```
DATABASE_URL="postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require"
```

**Railway / Render** — provision a Postgres plugin/service; each gives you
a ready-made connection string in this same format:

```
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[dbname]"
```

**Self-hosted / plain Postgres** (a VPS, Docker container, etc.):

```
DATABASE_URL="postgresql://[user]:[password]@[host]:5432/[dbname]"
```

Whichever provider you choose, put the resulting connection string in
`.env` as `DATABASE_URL`, then run:

```bash
npm run db:migrate   # or: npx prisma migrate deploy
```

This creates the tables for you — you do not need to write any SQL by
hand. For reference, this is what it creates (see `prisma/schema.prisma`
and the generated SQL in `prisma/migrations/`):

```sql
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "major" TEXT,
    "capacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Signup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL REFERENCES "Event"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Signup_contact_required" CHECK ("email" IS NOT NULL OR "phone" IS NOT NULL)
);

CREATE INDEX "Signup_eventId_idx" ON "Signup"("eventId");
```

At least one of `email`/`phone` is required on every signup — this is
enforced both in the signup form validation and with that `CHECK`
constraint at the database level.

Useful commands:

```bash
npm run db:migrate   # create a new migration / apply pending ones locally
npm run db:studio    # open Prisma Studio to browse/edit data visually
```

## How key decisions were made

A few product questions were resolved as follows (see conversation for
context):

- **Capacity is informational only.** "Spots remaining" is shown on each
  event card, but signups are never blocked once an event is "full" — there
  is no waitlist to manage.
- **Confirmation is on-screen only.** No email/SMS is sent after signup;
  the modal shows a clear confirmation message instead. Wiring up an email
  provider (e.g. Resend) later would only require adding a call inside
  `src/app/actions/signups.ts`.
- **Events have an optional, free-text "Major" field** instead of a fixed
  category. Admins type in whichever major(s) an event is relevant to (e.g.
  "Finance, Marketing, Accounting") — there's no dropdown or preset list, so
  it can be anything. Leave it blank for events open to all majors. It's
  shown on the event card when set.

## Project structure

```
prisma/schema.prisma              Database schema
src/lib/                          Shared server-side helpers (auth, dates, csv, validators)
src/app/actions/                  Server Actions (auth, events, signups)
src/app/page.tsx                  Public homepage
src/app/admin/login/              Admin login page
src/app/admin/(dashboard)/        Authenticated admin dashboard (stats, events, signups)
src/components/                   Public-facing UI components
src/components/admin/             Admin-only UI components
src/proxy.ts                      Route protection for /admin/* (Next.js 16's "proxy", formerly middleware)
```

## Deploying

```bash
npm run build   # runs `prisma generate && prisma migrate deploy && next build`
npm run start
```

Make sure `DATABASE_URL`, `ADMIN_PASSWORD`, and `SESSION_SECRET` are set as
environment variables on whatever host you deploy to. Since the database
is Postgres (not a local file), this works on serverless platforms
(Vercel, Netlify) as well as traditional servers/containers — there's no
persistent-disk requirement for the app itself, only for your Postgres
provider (which handles that for you).
