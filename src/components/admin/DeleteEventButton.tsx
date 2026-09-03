"use client";

import { useTransition } from "react";

import { deleteEventAction } from "@/app/actions/events";

interface DeleteEventButtonProps {
  eventId: string;
  eventName: string;
}

export function DeleteEventButton({
  eventId,
  eventName,
}: DeleteEventButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      `Delete "${eventName}"? This will also delete all of its signups. This cannot be undone.`
    );
    if (!confirmed) return;
    startTransition(() => {
      void deleteEventAction(eventId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-sm font-medium text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
