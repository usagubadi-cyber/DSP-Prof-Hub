"use client";

import { useActionState, useEffect } from "react";

import {
  createAccountAndSignupAction,
  type SignupState,
} from "@/app/actions/signups";
import { formatEventDate, formatEventTime } from "@/lib/dates";
import type { PublicEvent } from "@/lib/types";

interface AccountModalProps {
  event: PublicEvent;
  onClose: () => void;
}

const initialState: SignupState = { status: "idle" };

export function AccountModal({ event, onClose }: AccountModalProps) {
  const boundAction = createAccountAndSignupAction.bind(null, event.id);
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState
  );

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Create an account and sign up for ${event.name}`}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {state.status === "success" ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
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
            </div>
            <h2 className="text-lg font-semibold text-navy-900">
              You&rsquo;re all set!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your account is ready and you&rsquo;re confirmed for{" "}
              <strong>{event.name}</strong> on{" "}
              {formatEventDate(new Date(event.date))} at{" "}
              {formatEventTime(event.time)}.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              You can now sign up for other events with a single click.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-md bg-navy-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700"
            >
              Close
            </button>
          </div>
        ) : (
          <form action={formAction}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-navy-900">
                  Create Your Account
                </h2>
                <p className="text-sm text-gray-600">
                  Sign up for {event.name}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-gray-400 transition hover:text-gray-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {state.error && (
              <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {state.error}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  autoComplete="name"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
                />
                {state.fieldErrors?.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {state.fieldErrors.name[0]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
                />
                {state.fieldErrors?.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {state.fieldErrors.email[0]}
                  </p>
                )}
              </div>

              <p className="text-xs text-gray-500">
                This creates your account — you&rsquo;ll only need to do this
                once. After this, you can sign up for any event with one
                click.
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-6 w-full rounded-md bg-navy-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Signing up..." : "Create Account & Sign Up"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
