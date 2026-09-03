export const EVENT_CATEGORIES = [
  "Professional Development",
  "Career Trek",
  "Grainger Event",
  "Philanthropy",
  "Social",
  "Chapter Business",
  "Other",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const DEFAULT_CATEGORY: EventCategory = "Other";

export function isKnownCategory(value: string): value is EventCategory {
  return (EVENT_CATEGORIES as readonly string[]).includes(value);
}
