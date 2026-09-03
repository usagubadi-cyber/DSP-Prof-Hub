import { formatEventDate, formatEventTime } from "@/lib/dates";
import type { PublicEvent } from "@/lib/types";

interface EventCardProps {
  event: PublicEvent;
  isPast: boolean;
  onSignUp?: (event: PublicEvent) => void;
}

export function EventCard({ event, isPast, onSignUp }: EventCardProps) {
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
      <div className="mb-2 flex items-start justify-between gap-3">
        <span className="inline-block rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-medium text-navy-700">
          {event.category}
        </span>
        {!isPast && spotsRemaining != null && (
          <span
            className={`shrink-0 text-xs font-semibold ${
              spotsRemaining <= 0 ? "text-gold-600" : "text-navy-600"
            }`}
          >
            {spotsRemaining > 0
              ? `${spotsRemaining} spot${spotsRemaining === 1 ? "" : "s"} remaining`
              : "Full"}
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-navy-900">{event.name}</h3>

      <div className="mt-2 space-y-1 text-sm text-gray-600">
        <p>
          {formatEventDate(new Date(event.date))} &middot;{" "}
          {formatEventTime(event.time)}
        </p>
        <p>{event.location}</p>
      </div>

      <p className="mt-3 flex-1 text-sm text-gray-700">{event.description}</p>

      <div className="mt-4">
        {isPast ? (
          <span className="text-sm font-medium text-gray-400">
            This event has ended
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onSignUp?.(event)}
            className="w-full rounded-md bg-navy-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2"
          >
            Sign Up
          </button>
        )}
      </div>
    </div>
  );
}
