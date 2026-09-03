"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { eventFormSchema } from "@/lib/validators";

export type EventFormState = {
  formError?: string;
  fieldErrors?: Record<string, string[]>;
};

function parseEventForm(formData: FormData) {
  return eventFormSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    date: String(formData.get("date") ?? ""),
    time: String(formData.get("time") ?? ""),
    location: String(formData.get("location") ?? ""),
    description: String(formData.get("description") ?? ""),
    major: String(formData.get("major") ?? ""),
    capacity: String(formData.get("capacity") ?? ""),
  });
}

function toEventData(parsed: ReturnType<typeof parseEventForm>) {
  if (!parsed.success) throw new Error("invalid event data");
  const { name, date, time, location, description, major, capacity } =
    parsed.data;
  return {
    name,
    date: new Date(`${date}T00:00:00.000Z`),
    time,
    location,
    description,
    major: major ? major : null,
    capacity: capacity === "" || capacity === undefined ? null : capacity,
  };
}

export async function createEventAction(
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  await requireAdmin();

  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.event.create({ data: toEventData(parsed) });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function updateEventAction(
  eventId: string,
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  await requireAdmin();

  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.event.update({
    where: { id: eventId },
    data: toEventData(parsed),
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function deleteEventAction(eventId: string): Promise<void> {
  await requireAdmin();
  await prisma.event.delete({ where: { id: eventId } });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/events");
}
