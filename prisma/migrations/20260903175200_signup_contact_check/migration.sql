-- Enforce at least one contact method (email or phone) at the database level.
-- SQLite requires rebuilding the table to add a CHECK constraint.
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Signup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Signup_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Signup_contact_required" CHECK ("email" IS NOT NULL OR "phone" IS NOT NULL)
);

INSERT INTO "new_Signup" ("id", "eventId", "name", "email", "phone", "createdAt")
SELECT "id", "eventId", "name", "email", "phone", "createdAt" FROM "Signup";

DROP TABLE "Signup";
ALTER TABLE "new_Signup" RENAME TO "Signup";

CREATE INDEX "Signup_eventId_idx" ON "Signup"("eventId");

PRAGMA foreign_keys=ON;
