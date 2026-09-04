"use server";

import { revalidatePath } from "next/cache";

import { isEventPast } from "@/lib/dates";
import {
  clearMemberSession,
  getCurrentMemberId,
  setMemberSession,
} from "@/lib/memberAuth";
import { prisma } from "@/lib/prisma";
import { accountFormSchema } from "@/lib/validators";

export type SignupState = {
  status: "idle" | "success" | "error";
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function ensureEventIsSignupable(
  eventId: string
): Promise<string | null> {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return "This event could not be found.";
  if (isEventPast(event.date, event.time)) {
    return "This event has already happened and is no longer accepting signups.";
  }
  return null;
}

function revalidateSignupPaths(eventId: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/admin/events/${eventId}/signups`);
}

export async function createAccountAndSignupAction(
  eventId: string,
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const parsed = accountFormSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const eventError = await ensureEventIsSignupable(eventId);
  if (eventError) {
    return { status: "error", error: eventError };
  }

  const { name, email } = parsed.data;

  const member = await prisma.member.upsert({
    where: { email },
    create: { name, email },
    update: { name },
  });

  await setMemberSession(member.id);

  await prisma.signup.upsert({
    where: { eventId_memberId: { eventId, memberId: member.id } },
    create: { eventId, memberId: member.id },
    update: {},
  });

  revalidateSignupPaths(eventId);

  return { status: "success" };
}

export async function signupForEventAction(
  eventId: string,
  // useActionState requires this action signature, but a repeat one-click
  // signup needs neither the previous state nor any form fields.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: SignupState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData
): Promise<SignupState> {
  const memberId = await getCurrentMemberId();
  if (!memberId) {
    return {
      status: "error",
      error: "Your session expired — please create an account again.",
    };
  }

  const eventError = await ensureEventIsSignupable(eventId);
  if (eventError) {
    return { status: "error", error: eventError };
  }

  await prisma.signup.upsert({
    where: { eventId_memberId: { eventId, memberId } },
    create: { eventId, memberId },
    update: {},
  });

  revalidateSignupPaths(eventId);

  return { status: "success" };
}

export async function logoutMemberAction(): Promise<void> {
  await clearMemberSession();
  revalidatePath("/");
}
