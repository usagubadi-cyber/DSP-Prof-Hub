import { createEventAction } from "@/app/actions/events";
import { EventForm } from "@/components/admin/EventForm";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Add Event</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create a new chapter event for members to sign up for.
        </p>
      </div>
      <EventForm action={createEventAction} submitLabel="Create Event" />
    </div>
  );
}
