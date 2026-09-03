import { PublicEventsView } from "@/components/PublicEventsView";
import { SiteHeader } from "@/components/SiteHeader";
import { prisma } from "@/lib/prisma";
import type { PublicEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await prisma.event.findMany({
    include: { _count: { select: { signups: true } } },
    orderBy: { date: "asc" },
  });

  const publicEvents: PublicEvent[] = events.map((event) => ({
    id: event.id,
    name: event.name,
    date: event.date.toISOString(),
    time: event.time,
    location: event.location,
    description: event.description,
    category: event.category,
    capacity: event.capacity,
    signupCount: event._count.signups,
  }));

  return (
    <>
      <SiteHeader />
      <PublicEventsView events={publicEvents} />
      <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-400">
        Delta Sigma Pi &middot; Chapter Events Hub
      </footer>
    </>
  );
}
