// Event dates are stored as UTC-midnight "calendar dates" (no real timezone
// meaning) with the wall-clock time kept separately as an "HH:MM" string.
// Both formatting and past/upcoming comparisons treat the components as UTC
// so a date picked in the form always displays as the date that was picked.

export function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hours || 0,
      minutes || 0
    )
  );
}

export function isEventPast(date: Date, time: string): boolean {
  return combineDateAndTime(date, time).getTime() < Date.now();
}

export function formatEventDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatEventTime(time: string): string {
  const [hoursStr, minutesStr] = time.split(":");
  const hours = Number(hoursStr);
  if (Number.isNaN(hours)) return time;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${(minutesStr ?? "00").padStart(2, "0")} ${period}`;
}

export function toDateInputValue(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
