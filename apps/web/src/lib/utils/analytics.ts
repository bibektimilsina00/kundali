import posthog from "posthog-js";

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    try {
      posthog.capture(eventName, properties);
    } catch (e) {
      console.warn("Analytics capture error:", e);
    }
  }
}

export function trackKundaliGenerated(details: { name: string; place: string; language: string }) {
  trackEvent("kundali_generated", {
    seeker_name: details.name,
    place: details.place,
    language: details.language,
  });
}

export function trackAudioPlayed(voice: string, language: string) {
  trackEvent("audio_played", {
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
