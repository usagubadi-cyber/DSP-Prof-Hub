"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import type { EventFormState } from "@/app/actions/events";

interface EventFormDefaults {
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  major: string | null;
  capacity: number | null;
}

interface EventFormProps {
  action: (
    prevState: EventFormState,
    formData: FormData
  ) => Promise<EventFormState>;
  submitLabel: string;
  defaultValues?: EventFormDefaults;
}

const initialState: EventFormState = {};

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500";

export function EventForm({
  action,
  submitLabel,
  defaultValues,
}: EventFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialState
  );

  return (
    <form
      action={formAction}
      className="max-w-xl space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      {state.formError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.formError}
        </p>
      )}

      <Field label="Event Name" name="name" error={state.fieldErrors?.name}>
        <input
          id="name"
          name="name"
          defaultValue={defaultValues?.name}
          required
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Date" name="date" error={state.fieldErrors?.date}>
          <input
            id="date"
            type="date"
            name="date"
            defaultValue={defaultValues?.date}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Time" name="time" error={state.fieldErrors?.time}>
          <input
            id="time"
            type="time"
            name="time"
            defaultValue={defaultValues?.time}
            required
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Location"
        name="location"
        error={state.fieldErrors?.location}
      >
        <input
          id="location"
          name="location"
          defaultValue={defaultValues?.location}
          required
          className={inputClass}
        />
      </Field>

      <Field
        label="Major (optional)"
        name="major"
        error={state.fieldErrors?.major}
        hint="e.g. Finance, Marketing, Accounting — leave blank if open to all majors"
      >
        <input
          id="major"
          name="major"
          defaultValue={defaultValues?.major ?? ""}
          placeholder="Finance, Marketing, Accounting"
          className={inputClass}
        />
      </Field>

      <Field
        label="Description"
        name="description"
        error={state.fieldErrors?.description}
      >
        <textarea
          id="description"
          name="description"
          defaultValue={defaultValues?.description}
          required
          rows={4}
          className={inputClass}
        />
      </Field>

      <Field
        label="Capacity (optional)"
        name="capacity"
        error={state.fieldErrors?.capacity}
        hint="Leave blank for unlimited spots"
      >
        <input
          id="capacity"
          type="number"
          min={1}
          name="capacity"
          defaultValue={defaultValues?.capacity ?? ""}
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-navy-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string[];
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error[0]}</p>}
    </div>
  );
}
