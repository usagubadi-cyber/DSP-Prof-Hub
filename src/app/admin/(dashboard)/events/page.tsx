import Link from "next/link";

import { DeleteEventButton } from "@/components/admin/DeleteEventButton";
import { formatEventDate, formatEventTime } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    include: { _count: { select: { signups: true } } },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Events</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage chapter events.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="rounded-md bg-navy-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700"
        >
          + Add Event
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {events.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-500">
            No events yet. Click &ldquo;Add Event&rdquo; to create the first
            one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-navy-50 text-left text-xs font-semibold tracking-wide text-navy-700 uppercase">
                <tr>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Date &amp; Time</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Major</th>
                  <th className="px-4 py-3">Signups</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-4 py-3 font-medium text-navy-900">
                      {event.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {formatEventDate(event.date)} &middot;{" "}
                      {formatEventTime(event.time)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {event.location}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {event.major ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/events/${event.id}/signups`}
                        className="font-medium text-navy-700 underline decoration-gold-500 underline-offset-2 hover:text-gold-600"
                      >
                        {event._count.signups}
                        {event.capacity != null ? ` / ${event.capacity}` : ""}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-4">
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="text-sm font-medium text-navy-700 hover:text-gold-600"
                        >
                          Edit
                        </Link>
                        <DeleteEventButton
                          eventId={event.id}
                          eventName={event.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
