-- AlterTable
ALTER TABLE "Signup" DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "phone",
ADD COLUMN     "memberId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Signup_memberId_idx" ON "Signup"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Signup_eventId_memberId_key" ON "Signup"("eventId", "memberId");

-- AddForeignKey
ALTER TABLE "Signup" ADD CONSTRAINT "Signup_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
