"use client";

import { useActionState } from "react";

import { signupForEventAction, type SignupState } from "@/app/actions/signups";

interface SignupButtonProps {
  eventId: string;
}

const initialState: SignupState = { status: "idle" };

export function SignupButton({ eventId }: SignupButtonProps) {
  const boundAction = signupForEventAction.bind(null, eventId);
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState
  );

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-navy-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Signing up..." : "Sign Up"}
      </button>
      {state.status === "error" && state.error && (
        <p className="mt-2 text-xs text-red-600">{state.error}</p>
      )}
    </form>
  );
}
