-- Enforce at least one contact method (email or phone) at the database level.
ALTER TABLE "Signup" ADD CONSTRAINT "Signup_contact_required" CHECK ("email" IS NOT NULL OR "phone" IS NOT NULL);
