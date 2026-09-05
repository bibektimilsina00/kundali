"use client";

import { useState } from "react";

import { DatePicker } from "@/features/kundali/components/inputs/date-picker";
import { PlaceCombobox } from "@/features/kundali/components/inputs/place-combobox";
import { TimePicker } from "@/features/kundali/components/inputs/time-picker";
import {
  birthDetailsSchema,
  type BirthDetailsForm as FormValues,
} from "@/features/kundali/schema/birth-details";
import type { Place } from "@/features/kundali/types";

type Props = {
  onSubmit: (values: FormValues, place: Place) => void;
  pending: boolean;
  /** Field errors returned by the API's 422, merged with local zod errors. */
  serverFieldErrors?: Record<string, string>;
};

/** API field name -> form field name, so a 422 lands on the right input. */
const FIELD_MAP: Record<string, string> = {
  tz_name: "place",
  place_label: "place",
  latitude: "place",
  longitude: "place",
  date: "date",
  time: "time",
  name: "name",
};

export function BirthDetailsForm({ onSubmit, pending, serverFieldErrors }: Props) {
  const [values, setValues] = useState<FormValues>({
    name: "",
    date: "",
    time: "",
    timeAccuracy: "exact",
  });
  const [place, setPlace] = useState<Place | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mappedServerErrors = Object.entries(serverFieldErrors ?? {}).reduce<
    Record<string, string>
  >((acc, [field, message]) => {
    acc[FIELD_MAP[field] ?? field] = message;
    return acc;
  }, {});
  const shown = { ...mappedServerErrors, ...errors };

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = birthDetailsSchema.safeParse(values);
    const next: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
    }
    if (!place) next.place = "Search and pick your birthplace";
    setErrors(next);
    if (parsed.success && place) onSubmit(parsed.data, place);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-lg space-y-6 rounded-[8px] border border-white/10 bg-[#161B2B] p-7 sm:p-9 text-[#94A3B8]"
    >
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#F8FAFC]">Your birth details</h2>
        <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">
          Birth time sets the ascendant, and the ascendant sets every house in your Kundali.
        </p>
      </div>

      <Field label="Name" error={shown.name}>
        <input
          className={`w-full rounded-[8px] border bg-[#090A10] px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/40 outline-none transition ${
            shown.name ? "border-rose-500" : "border-white/10 focus:border-[#E5A93C]"
          }`}
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          placeholder="Enter your full name"
        />
      </Field>

      <Field label="Date of birth (AD / BS)" error={shown.date}>
        <DatePicker
          value={values.date}
          onChange={(date) => setValues({ ...values, date })}
          error={shown.date}
        />
      </Field>

      <Field label="Time of birth" error={shown.time}>
        <TimePicker
          value={values.time}
          onChange={(time) => setValues({ ...values, time })}
          error={shown.time}
        />
      </Field>

      <Field label="Place of birth" error={shown.place}>
        <PlaceCombobox value={place} onChange={setPlace} error={shown.place} />
      </Field>

      <Field label="How accurate is the time?">
        <div className="flex gap-2">
          {(["exact", "approximate", "unknown"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setValues({ ...values, timeAccuracy: value })}
              className={`flex-1 rounded-[8px] border px-3 py-2 text-xs capitalize font-bold transition ${
                values.timeAccuracy === value
                  ? "border-[#E5A93C] bg-[#E5A93C] text-[#090A10]"
                  : "border-white/10 bg-[#090A10] text-[#94A3B8] hover:text-[#F8FAFC]"
              }`}
            >
              {value === "unknown" ? "Not sure" : value}
            </button>
          ))}
        </div>
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-[8px] bg-[#E5A93C] hover:bg-[#F3C766] px-4 py-3.5 text-sm font-bold text-[#090A10] transition disabled:opacity-50"
      >
        {pending ? "Calculating your birth chart…" : "Create my Kundali"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
        {label}
      </span>
      {children}
      {error && <p className="mt-1 text-[11px] font-medium text-rose-400">{error}</p>}
    </div>
  );
}
