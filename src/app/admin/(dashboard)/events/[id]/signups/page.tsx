import Link from "next/link";
import { notFound } from "next/navigation";

import { formatEventDate, formatEventTime } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface SignupsPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventSignupsPage({ params }: SignupsPageProps) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      signups: { orderBy: { createdAt: "asc" }, include: { member: true } },
    },
  });
  if (!event) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/events"
          className="text-sm text-navy-600 hover:text-gold-600"
        >
          &larr; Back to events
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">
              {event.name}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {formatEventDate(event.date)} &middot;{" "}
              {formatEventTime(event.time)} &middot; {event.location}
            </p>
          </div>
          {event.signups.length > 0 && (
            <a
              href={`/admin/events/${event.id}/export`}
              className="rounded-md border border-navy-700 px-4 py-2 text-sm font-semibold text-navy-800 transition hover:bg-navy-800 hover:text-white"
            >
              Export CSV
            </a>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-navy-900">
            {event.signups.length} Signup
            {event.signups.length === 1 ? "" : "s"}
            {event.capacity != null ? ` (capacity: ${event.capacity})` : ""}
          </h2>
        </div>

        {event.signups.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-500">
            No signups yet for this event.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-navy-50 text-left text-xs font-semibold tracking-wide text-navy-700 uppercase">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Signed Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {event.signups.map((signup) => (
                  <tr key={signup.id}>
                    <td className="px-4 py-3 font-medium text-navy-900">
                      {signup.member.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {signup.member.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(signup.createdAt)}
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
