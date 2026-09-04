import { formatEventDate, formatEventTime } from "@/lib/dates";
import type { CurrentMember, PublicEvent } from "@/lib/types";

import { SignupButton } from "./SignupButton";

interface EventCardProps {
  event: PublicEvent;
  isPast: boolean;
  currentMember: CurrentMember | null;
  onRequestAccount?: (event: PublicEvent) => void;
}

export function EventCard({
  event,
  isPast,
  currentMember,
  onRequestAccount,
}: EventCardProps) {
  const spotsRemaining =
    event.capacity != null ? event.capacity - event.signupCount : null;

  return (
    <div
      className={`flex h-full flex-col rounded-lg border bg-white p-5 shadow-sm transition ${
        isPast
          ? "border-gray-200 opacity-75"
          : "border-gray-200 hover:border-gold-500 hover:shadow-md"
      }`}
    >
      {!isPast && spotsRemaining != null && (
        <div className="mb-2 flex items-start justify-end">
          <span
            className={`shrink-0 text-xs font-semibold ${
              spotsRemaining <= 0 ? "text-gold-600" : "text-navy-600"
            }`}
          >
            {spotsRemaining > 0
              ? `${spotsRemaining} spot${spotsRemaining === 1 ? "" : "s"} remaining`
              : "Full"}
          </span>
        </div>
      )}

      <h3 className="text-lg font-semibold text-navy-900">{event.name}</h3>

      <div className="mt-2 space-y-1 text-sm text-gray-600">
        <p>
          {formatEventDate(new Date(event.date))} &middot;{" "}
          {formatEventTime(event.time)}
        </p>
        <p>{event.location}</p>
        {event.major && (
          <p className="text-navy-700">
            <span className="font-medium">Major:</span> {event.major}
          </p>
        )}
      </div>

      <p className="mt-3 flex-1 text-sm text-gray-700">{event.description}</p>

      <div className="mt-4">
        {isPast ? (
          <span className="text-sm font-medium text-gray-400">
            This event has ended
          </span>
        ) : event.isRegistered ? (
          <div className="flex items-center justify-center gap-1.5 rounded-md bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
            You&rsquo;re signed up
          </div>
        ) : currentMember ? (
          <SignupButton eventId={event.id} />
        ) : (
          <button
            type="button"
            onClick={() => onRequestAccount?.(event)}
            className="w-full rounded-md bg-navy-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2"
          >
            Sign Up
          </button>
        )}
      </div>
    </div>
  );
}
