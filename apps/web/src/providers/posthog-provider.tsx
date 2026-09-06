"use client";

import posthog from "posthog-js";

export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST
  ) {
    posthog.capture(eventName, properties);
  }
};

export const identifyUser = (userId: string, traits?: Record<string, unknown>) => {
  if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST
  ) {
    posthog.identify(userId, traits);
  }
};

export const resetUser = () => {
  if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST
  ) {
    posthog.reset();
  }
};
