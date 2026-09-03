"use client";

import { useMemo, useState } from "react";

import { isEventPast } from "@/lib/dates";
import type { PublicEvent } from "@/lib/types";

import { EventCard } from "./EventCard";
import { SignupModal } from "./SignupModal";

interface PublicEventsViewProps {
  events: PublicEvent[];
}

export function PublicEventsView({ events }: PublicEventsViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(
    null
  );
  const [showPast, setShowPast] = useState(false);

  const { upcoming, past } = useMemo(() => {
    const upcoming: PublicEvent[] = [];
    const past: PublicEvent[] = [];
    for (const event of events) {
      if (isEventPast(new Date(event.date), event.time)) {
        past.push(event);
      } else {
        upcoming.push(event);
      }
    }
    upcoming.sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
    );
    past.sort(
      (a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)
    );
    return { upcoming, past };
  }, [events]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900 sm:text-3xl">
          Upcoming Events
        </h1>
        <p className="mt-1 text-gray-600">
          Sign up below for upcoming Delta Sigma Pi chapter events.
        </p>
      </div>

      {upcoming.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          No upcoming events right now &mdash; check back soon!
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isPast={false}
              onSignUp={setSelectedEvent}
            />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="mt-14">
          <button
            type="button"
            onClick={() => setShowPast((v) => !v)}
            className="text-sm font-semibold text-navy-700 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-navy-900"
          >
            {showPast ? "Hide" : "Show"} past events ({past.length})
          </button>
          {showPast && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((event) => (
                <EventCard key={event.id} event={event} isPast />
              ))}
            </div>
          )}
        </div>
      )}

      {selectedEvent && (
        <SignupModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </main>
  );
}
