# Chapter Events Hub

A full-stack event signup and management app for the Delta Sigma Pi chapter,
built with Next.js (App Router), TypeScript, Tailwind CSS, and Prisma with a
SQLite database. It ships as a single deployable app — no separate backend
service required.

- **Public site (`/`)** — members browse upcoming events grouped by category,
  see spots remaining, and sign up with just a name plus an email or phone
  number.
- **Admin dashboard (`/admin`)** — password-protected. Create/edit/delete
  events, view stats, see who signed up for each event, and export signups
  as CSV.

## Tech stack

- Next.js 16 (App Router, TypeScript, Server Actions)
- Tailwind CSS 4
- Prisma 7 + SQLite (via the `better-sqlite3` driver adapter)
- `jose` for signing the admin session cookie (JWT, HS256)
- `zod` for form validation

## Getting started

```bash
npm install
cp .env.example .env   # then edit the values — see below
npm run db:migrate     # creates prisma/dev.db and applies the schema
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site and
[http://localhost:3000/admin](http://localhost:3000/admin) for the admin
dashboard.

## Environment variables

Set these in `.env` (see `.env.example`):

| Variable          | Description                                                                 |
| ----------------- | ---------------------------------------------------------------------------- |
| `DATABASE_URL`    | SQLite connection string. Defaults to `file:./prisma/dev.db`.                 |
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

This app uses **SQLite via Prisma** rather than Supabase, so it has zero
external accounts to set up — the database is just a file
(`prisma/dev.db`) created automatically by the migration command.

Schema (`prisma/schema.prisma`):

```prisma
model Event {
  id          String   @id @default(cuid())
  name        String
  date        DateTime
  time        String
  location    String
  description String
  category    String
  capacity    Int?
  createdAt   DateTime @default(now())
  signups     Signup[]
}

model Signup {
  id        String   @id @default(cuid())
  eventId   String
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  name      String
  email     String?
  phone     String?
  createdAt DateTime @default(now())
}
```

At least one of `email`/`phone` is required on every signup — this is
enforced both in the signup form validation and with a `CHECK` constraint
at the database level (see `prisma/migrations/20260903175200_signup_contact_check`).

Useful commands:

```bash
npm run db:migrate   # create a new migration / apply pending ones locally
npm run db:studio    # open Prisma Studio to browse/edit data visually
```

### ⚠️ Deployment note: SQLite needs a persistent disk

SQLite is a great fit for running this app on a normal server, a VPS, or a
container/host with persistent disk (Railway, Render, Fly.io, a Docker
container with a volume, etc.) — `npm run build && npm run start` is all
you need, and your data lives safely in `prisma/dev.db`.

**Avoid deploying this as-is to a purely serverless platform like Vercel or
Netlify.** Serverless functions there don't share a persistent filesystem
between invocations (or across multiple instances), so a SQLite file will
not reliably persist signups. If you need serverless hosting, swap the
Prisma datasource for a hosted Postgres database (e.g. Supabase, Neon, or
Vercel Postgres) — the schema and Prisma query code would not need to
change, only the datasource/adapter setup in `prisma/schema.prisma` and
`src/lib/prisma.ts`.

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
- **Events are grouped by category** on the public homepage (Career Trek,
  Grainger Event, Social, Professional Development, Philanthropy, Chapter
  Business, Other — see `src/lib/categories.ts` to adjust the list).

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
environment variables on whatever host you deploy to, and that the
directory holding the SQLite file persists across deploys/restarts.
