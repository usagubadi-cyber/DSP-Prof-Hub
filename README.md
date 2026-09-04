# Chapter Events Hub

A full-stack event signup and management app for the Delta Sigma Pi chapter,
built with Next.js (App Router), TypeScript, Tailwind CSS, and Prisma with a
PostgreSQL database. It ships as a single deployable app — no separate
backend service required.

- **Public site (`/`)** — members browse upcoming events (with the relevant
  major shown when an admin sets one) and see spots remaining. The first
  time someone signs up, they create a lightweight account with just their
  name and email; after that, a session cookie remembers them so they can
  sign up for any other event with a single click — no password, no
  re-entering their info.
- **Admin dashboard (`/admin`)** — password-protected. Create/edit/delete
  events, view stats, see who signed up for each event, and export signups
  as CSV.

## Tech stack

- Next.js 16 (App Router, TypeScript, Server Actions)
- Tailwind CSS 4
- Prisma 7 + PostgreSQL (via the `@prisma/adapter-pg` driver adapter)
- `jose` for signing the admin and member session cookies (JWT, HS256)
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
| `SESSION_SECRET`  | Random secret used to sign the admin and member session cookies.             |

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

CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Signup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL REFERENCES "Event"("id") ON DELETE CASCADE,
    "memberId" TEXT NOT NULL REFERENCES "Member"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("eventId", "memberId")
);

CREATE INDEX "Signup_eventId_idx" ON "Signup"("eventId");
CREATE INDEX "Signup_memberId_idx" ON "Signup"("memberId");
```

A `Signup` links an `Event` to a `Member` — the unique constraint on
`(eventId, memberId)` is what prevents someone from signing up for the
same event twice; the app relies on this rather than checking manually,
so it also holds up under concurrent requests.

Useful commands:

```bash
npm run db:migrate   # create a new migration / apply pending ones locally
npm run db:studio    # open Prisma Studio to browse/edit data visually
```

## Member accounts (how signup works)

There are no passwords for members — the bar is intentionally low, since
this just needs to identify who's signing up, not gate access to anything
sensitive:

1. The first time someone clicks "Sign Up," a modal asks for their **name
   and email only**. Submitting it creates a `Member` row (or reuses an
   existing one if that email has signed up before — the name is updated
   to whatever they just typed, in case of a typo).
2. A signed, `httpOnly` cookie (`dsp_member_session`, 180-day expiry) then
   remembers them. From then on, clicking "Sign Up" on any other event is a
   single click — no form, no modal — because the server already knows who
   they are.
3. A small banner at the top of the page shows who's signed in, with a
   "Not you? Switch account" link that clears the cookie (useful on a
   shared computer).

Because there's no password, anyone who knows a member's email could
technically sign up "as" them — an acceptable tradeoff for a low-stakes
internal signup sheet, but worth knowing if requirements change later.

## How key decisions were made

A few product questions were resolved as follows (see conversation for
context):

- **Capacity is informational only.** "Spots remaining" is shown on each
  event card, but signups are never blocked once an event is "full" — there
  is no waitlist to manage.
- **Confirmation is on-screen only.** No email/SMS is sent after account
  creation or signup; the modal shows a clear confirmation message
  instead. Wiring up an email provider (e.g. Resend) later would only
  require adding a call inside `src/app/actions/signups.ts`.
- **Events have an optional, free-text "Major" field** instead of a fixed
  category. Admins type in whichever major(s) an event is relevant to (e.g.
  "Finance, Marketing, Accounting") — there's no dropdown or preset list, so
  it can be anything. Leave it blank for events open to all majors. It's
  shown on the event card when set.
- **Signups are tied to a lightweight member account** (name + email, no
  password) instead of asking for contact info on every single signup —
  the tradeoff being no phone-number option anymore, since the account is
  keyed by email.

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
