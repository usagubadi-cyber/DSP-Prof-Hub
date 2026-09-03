import { notFound } from "next/navigation";

import { updateEventAction } from "@/app/actions/events";
import { EventForm } from "@/components/admin/EventForm";
import { toDateInputValue } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  const boundUpdateAction = updateEventAction.bind(null, event.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Edit Event</h1>
        <p className="mt-1 text-sm text-gray-600">{event.name}</p>
      </div>
      <EventForm
        action={boundUpdateAction}
        submitLabel="Save Changes"
        defaultValues={{
          name: event.name,
          date: toDateInputValue(event.date),
          time: event.time,
          location: event.location,
          description: event.description,
          major: event.major,
          capacity: event.capacity,
        }}
      />
    </div>
  );
}
