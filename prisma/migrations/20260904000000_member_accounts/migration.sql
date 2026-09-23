-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- AlterTable: add memberId as NULLABLE first so this works on a table
-- that already has rows (a NOT NULL column with no default cannot be
-- added to a non-empty table). It is tightened to NOT NULL in a later
-- step once every existing row has been backfilled.
ALTER TABLE "Signup" ADD COLUMN "memberId" TEXT;

-- Backfill one Member per distinct identity found in any pre-existing
-- Signup rows (a fresh database has none, so this is a no-op there).
-- Identity is keyed by email when present; legacy signups that only had
-- a phone number (no email) get a deterministic placeholder email
-- synthesized from that phone number so they still resolve to one
-- Member instead of losing the signup. The rare row with neither a
-- usable email nor phone falls back to a key derived from its own id,
-- which is always unique.
WITH identities AS (
  SELECT
    "id",
    "name",
    "createdAt",
    COALESCE(
      NULLIF(lower(trim("email")), ''),
      CASE
        WHEN NULLIF(regexp_replace(COALESCE("phone", ''), '[^0-9+]', '', 'g'), '') IS NOT NULL
          THEN 'phone+' || regexp_replace("phone", '[^0-9+]', '', 'g') || '@no-email.invalid'
      END,
      'signup+' || "id" || '@no-email.invalid'
    ) AS identity_email
  FROM "Signup"
),
ranked AS (
  SELECT
    identity_email,
    "name",
    ROW_NUMBER() OVER (
      PARTITION BY identity_email ORDER BY "createdAt" DESC
    ) AS rn
  FROM identities
)
INSERT INTO "Member" ("id", "name", "email", "createdAt")
SELECT md5(random()::text || clock_timestamp()::text || identity_email), "name", identity_email, now()
FROM ranked
WHERE rn = 1;

-- Point every existing Signup row at its backfilled Member using the
-- same identity key computed above.
UPDATE "Signup" s
SET "memberId" = m."id"
FROM "Member" m
WHERE m."email" = COALESCE(
  NULLIF(lower(trim(s."email")), ''),
  CASE
    WHEN NULLIF(regexp_replace(COALESCE(s."phone", ''), '[^0-9+]', '', 'g'), '') IS NOT NULL
      THEN 'phone+' || regexp_replace(s."phone", '[^0-9+]', '', 'g') || '@no-email.invalid'
  END,
  'signup+' || s."id" || '@no-email.invalid'
);

-- If historical data ever had two signups for the same event that now
-- resolve to the same member (e.g. mismatched email casing), keep only
-- the earliest one so the new unique(eventId, memberId) index below can
-- be created.
DELETE FROM "Signup" a
USING "Signup" b
WHERE a."eventId" = b."eventId"
  AND a."memberId" = b."memberId"
  AND (a."createdAt", a."id") > (b."createdAt", b."id");

-- Every remaining Signup row now has a memberId — enforce NOT NULL and
-- drop the old per-signup contact columns (this also drops the old
-- "Signup_contact_required" CHECK constraint, which referenced them).
ALTER TABLE "Signup" ALTER COLUMN "memberId" SET NOT NULL;
ALTER TABLE "Signup" DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "phone";

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Signup_memberId_idx" ON "Signup"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Signup_eventId_memberId_key" ON "Signup"("eventId", "memberId");

-- AddForeignKey
ALTER TABLE "Signup" ADD CONSTRAINT "Signup_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
