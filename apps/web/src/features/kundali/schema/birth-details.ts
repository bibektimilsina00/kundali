/**
 * Form validation. Zod at a real trust boundary — user input — rather than
 * re-validating API responses, which are already typed and whose schema the
 * server owns (docs/architecture.md §8).
 *
 * The preset place list is gone: places now come from `/v1/places`, which
 * searches 786,650 populated places and resolves the IANA zone server-side.
 * The client never guesses a timezone.
 */

import { z } from "zod";

export const birthDetailsSchema = z.object({
  name: z.string().trim().min(1, "Required").max(100),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Not a real date")
    .refine((v) => new Date(v) <= new Date(), "Birth date cannot be in the future"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Pick a time"),
  timeAccuracy: z.enum(["exact", "approximate", "unknown"]),
});

export type BirthDetailsForm = z.infer<typeof birthDetailsSchema>;
