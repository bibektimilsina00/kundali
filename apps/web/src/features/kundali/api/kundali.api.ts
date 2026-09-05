import type { BirthDetailsForm } from "@/features/kundali/schema/birth-details";
import type { BirthDetailsIn, Chart, Place } from "@/features/kundali/types";

export function toRequestBody(form: BirthDetailsForm, place: Place): BirthDetailsIn {
  return {
    name: form.name.trim(),
    date: form.date,
    time: form.time,
    tz_name: place.tz_name,
    latitude: place.latitude,
    longitude: place.longitude,
    place_label: place.label,
    time_accuracy: form.timeAccuracy,
  };
}

export async function createKundali(body: BirthDetailsIn): Promise<Chart> {
  const res = await fetch("/api/v1/kundali", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to calculate astronomical chart");
  }

  return await res.json();
}
