import posthog from "posthog-js";

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST
  ) {
    posthog.capture(eventName, properties);
  }
}

export function trackKundaliGenerated(details: {
  language: string;
  timeAccuracy: "exact" | "approximate" | "unknown";
}) {
  trackEvent("kundali_generated", {
    language: details.language,
    time_accuracy: details.timeAccuracy,
  });
}

export function trackAudioPlayed(voice: string, language: string) {
  trackEvent("audio_played", {
    voice,
    language,
  });
}

export function trackAudioDownloaded(voice: string, language: string) {
  trackEvent("audio_downloaded", {
    voice,
    language,
  });
}

export function trackPdfDownloaded(language: string) {
  trackEvent("pdf_downloaded", {
    language,
  });
}

export function trackShareClicked(type: "page" | "audio") {
  trackEvent("share_clicked", {
    type,
  });
}

export function trackLiveVoiceStarted() {
  trackEvent("live_voice_started");
}

export function trackAiChatMessageSent(
  language: string,
  interactionMode: "text" | "live_voice",
) {
  trackEvent("ai_chat_message_sent", {
    language,
    interaction_mode: interactionMode,
  });
}
