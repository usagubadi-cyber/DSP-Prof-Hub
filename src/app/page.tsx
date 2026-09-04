import { MemberBanner } from "@/components/MemberBanner";
import { PublicEventsView } from "@/components/PublicEventsView";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentMember } from "@/lib/memberAuth";
import { prisma } from "@/lib/prisma";
import type { CurrentMember, PublicEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const member = await getCurrentMember();

  const [events, memberSignups] = await Promise.all([
    prisma.event.findMany({
      include: { _count: { select: { signups: true } } },
      orderBy: { date: "asc" },
    }),
    member
      ? prisma.signup.findMany({
          where: { memberId: member.id },
          select: { eventId: true },
        })
      : Promise.resolve([]),
  ]);

  const registeredEventIds = new Set(memberSignups.map((s) => s.eventId));

  const publicEvents: PublicEvent[] = events.map((event) => ({
    id: event.id,
    name: event.name,
    date: event.date.toISOString(),
    time: event.time,
    location: event.location,
    description: event.description,
    major: event.major,
    capacity: event.capacity,
    signupCount: event._count.signups,
    isRegistered: registeredEventIds.has(event.id),
  }));

  const currentMember: CurrentMember | null = member
    ? { name: member.name, email: member.email }
    : null;

  return (
    <>
      <SiteHeader />
      <MemberBanner member={currentMember} />
      <PublicEventsView events={publicEvents} currentMember={currentMember} />
      <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-400">
        Delta Sigma Pi &middot; Chapter Events Hub
      </footer>
    </>
  );
}
