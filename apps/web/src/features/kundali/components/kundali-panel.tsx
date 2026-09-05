"use client";

import { useCreateKundali } from "@/features/kundali/hooks/use-create-kundali";
import { toRequestBody } from "@/features/kundali/api/kundali.api";
import { BirthDetailsForm } from "@/features/kundali/components/birth-details-form";
import { ChartView } from "@/features/kundali/components/chart-view";
import { ApiError, NetworkError } from "@/lib/api/errors";

/**
 * The feature's composition point. `app/` only routes and lays out; it does not
 * know this exists beyond rendering it (docs/architecture.md §8).
 */
export function KundaliPanel() {
  const mutation = useCreateKundali();

  if (mutation.isSuccess && mutation.variables) {
    return (
      <ChartView
        chart={mutation.data}
        birth={mutation.variables}
        onReset={mutation.reset}
      />
    );
  }

  // A 422 is per-field and belongs on the inputs; anything else is a banner.
  const error = mutation.error;
  const fieldErrors = error instanceof ApiError ? error.fieldErrors : undefined;
  const banner = bannerFor(error);

  return (
    <div className="space-y-4">
      {banner && (
        <div className="mx-auto max-w-lg rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {banner}
        </div>
      )}
      <BirthDetailsForm
        pending={mutation.isPending}
        serverFieldErrors={fieldErrors}
        onSubmit={(values, place) => mutation.mutate(toRequestBody(values, place))}
      />
    </div>
  );
}

function bannerFor(error: unknown): string | null {
  if (error instanceof NetworkError) {
    return `${error.message} Is the API running on port 8000?`;
  }
  if (error instanceof ApiError) {
    // Field-level messages are shown on the inputs; only surface a banner when
    // there is nothing to attach them to.
    return Object.keys(error.fieldErrors).length > 0 ? null : error.message;
  }
  return error ? "Something went wrong." : null;
}
