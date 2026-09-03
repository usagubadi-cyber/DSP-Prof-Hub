"use server";

import { revalidatePath } from "next/cache";

import { isEventPast } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { signupFormSchema } from "@/lib/validators";

export type SignupState = {
  status: "idle" | "success" | "error";
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function normalizeEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  return trimmed || null;
}

function normalizePhone(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/[^0-9+]/g, "");
  return digits || null;
}

export async function createSignupAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const parsed = signupFormSchema.safeParse({
    eventId: String(formData.get("eventId") ?? ""),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { eventId, name, email, phone } = parsed.data;
  const normalizedEmail = normalizeEmail(email ?? "");
  const normalizedPhone = normalizePhone(phone ?? "");

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return { status: "error", error: "This event could not be found." };
  }
  if (isEventPast(event.date, event.time)) {
    return {
      status: "error",
      error: "This event has already happened and is no longer accepting signups.",
    };
  }

  const contactClauses: Array<{ email: string } | { phone: string }> = [];
  if (normalizedEmail) contactClauses.push({ email: normalizedEmail });
  if (normalizedPhone) contactClauses.push({ phone: normalizedPhone });

  const existing = await prisma.signup.findFirst({
    where: { eventId, OR: contactClauses },
  });

  if (existing) {
    return {
      status: "error",
      error:
        "You're already signed up for this event with that email or phone number.",
    };
  }

  await prisma.signup.create({
    data: { eventId, name, email: normalizedEmail, phone: normalizedPhone },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/admin/events/${eventId}/signups`);

  return { status: "success" };
}
