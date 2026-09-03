import Link from "next/link";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [totalEvents, totalSignups, events] = await Promise.all([
    prisma.event.count(),
    prisma.signup.count(),
    prisma.event.findMany({
      include: { _count: { select: { signups: true } } },
      orderBy: { date: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of chapter events and signups.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Events" value={totalEvents} />
        <StatCard label="Total Signups" value={totalSignups} />
        <StatCard
          label="Avg Signups / Event"
          value={totalEvents === 0 ? 0 : Math.round(totalSignups / totalEvents)}
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-navy-900">
            Signups per Event
          </h2>
          <Link
            href="/admin/events"
            className="text-sm font-medium text-navy-700 hover:text-gold-600"
          >
            Manage events &rarr;
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-500">
            No events yet. Create your first event to see stats here.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <Link
                    href={`/admin/events/${event.id}/signups`}
                    className="text-sm font-medium text-navy-900 hover:text-gold-600"
                  >
                    {event.name}
                  </Link>
                  {event.major && (
                    <p className="text-xs text-gray-500">{event.major}</p>
                  )}
                </div>
                <span className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-700">
                  {event._count.signups} signup
                  {event._count.signups === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-navy-900">{value}</p>
    </div>
  );
}
