import { authHeaders } from "@/features/auth/store/auth-store";

export type SpeechOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceName?: string;
  voice?: string;
  language?: string; // "en" | "ne" | "hi"
  onEnd?: () => void;
  onStart?: () => void;
  onSpokenText?: (spokenText: string, source: string) => void;
  onTimeUpdate?: (percent: number, currentTime: number, duration: number) => void;
};

let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

export async function speakText(text: string, options: SpeechOptions = {}) {
  if (typeof window === "undefined") return;

  // Stop any active audio playback
  stopSpeech();

  try {
    options.onStart?.();

    // Call server HD MP3 Audio Synthesis Route
    const res = await fetch("/api/v1/tts", {
      method: "POST",
      // Synthesis costs money per call, so the endpoint is authenticated.
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({
        text,
        language: options.language || "en",
        voice: options.voice || options.voiceName || "onyx",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.spoken_text) {
        options.onSpokenText?.(data.spoken_text, data.source || "hd_mp3_audio_engine");
      }
      if (data?.audio_url) {
        // The API returns its own path; the browser reaches it through the proxy.
        const audio = new Audio(`/api${data.audio_url}`);
        audio.playbackRate = options.rate ?? 1.0;
        audio.volume = options.volume ?? 1.0;

        audio.ontimeupdate = () => {
          if (audio.duration && !isNaN(audio.duration)) {
            const pct = (audio.currentTime / audio.duration) * 100;
            options.onTimeUpdate?.(pct, audio.currentTime, audio.duration);
          }
        };

        audio.onended = () => {
          currentAudio = null;
          options.onTimeUpdate?.(100, audio.duration || 0, audio.duration || 0);
          options.onEnd?.();
        };

        audio.onerror = (err) => {
          console.warn("HD Audio playback error, trying fallback:", err);
          currentAudio = null;
          fallbackWebSpeech(data.spoken_text || text, options);
        };

        currentAudio = audio;
        await audio.play();
        return;
      }
    }

    // Fallback if network or server audio route fails
    fallbackWebSpeech(text, options);

  } catch (err) {
    console.error("Failed to play HD audio:", err);
    fallbackWebSpeech(text, options);
  }
}

/**
 * Secondary Web Speech API fallback for offline mode
 */
function fallbackWebSpeech(text: string, options: SpeechOptions) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options.onEnd?.();
    return;
  }

  // Cancel any existing queued speech to unfreeze Chrome/macOS SpeechSynthesis engine
  window.speechSynthesis.cancel();

  const clean = text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#/g, "")
    .replace(/([0-9]+)°([0-9]*)/g, "$1 degrees $2 minutes");

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = options.rate ?? 0.98;
  utterance.pitch = options.pitch ?? 1.0;
  utterance.volume = options.volume ?? 1.0;

  const targetLocale = options.language === "ne" ? "ne-NP" : options.language === "hi" ? "hi-IN" : "en-US";
  utterance.lang = targetLocale;

  const voices = window.speechSynthesis.getVoices();
  const langVoice = voices.find((v) => v.lang.startsWith(options.language || "en"));
  if (langVoice) {
    utterance.voice = langVoice;
  }

  utterance.onboundary = (event) => {
    if (clean.length > 0) {
      const pct = Math.min(100, (event.charIndex / clean.length) * 100);
      options.onTimeUpdate?.(pct, (event.elapsedTime || 0) / 1000, 0);
    }
  };

  let ended = false;
  const done = () => {
    if (ended) return;
    ended = true;
    currentUtterance = null;
    options.onTimeUpdate?.(100, 0, 0);
    options.onEnd?.();
  };

  utterance.onend = done;
  utterance.onerror = (e) => {
    console.warn("WebSpeech engine note:", e);
    done();
  };

  currentUtterance = utterance;
  try {
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    done();
  }
}

export function stopSpeech() {
  if (typeof window === "undefined") return;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function pauseSpeech() {
  if (typeof window === "undefined") return;

  if (currentAudio) {
    currentAudio.pause();
  } else if ("speechSynthesis" in window) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeech() {
  if (typeof window === "undefined") return;

  if (currentAudio) {
    currentAudio.play();
  } else if ("speechSynthesis" in window) {
    window.speechSynthesis.resume();
  }
}

export function seekAudioBy(secondsDelta: number) {
  if (typeof window === "undefined") return;

  if (currentAudio) {
    const duration = currentAudio.duration || 0;
    const newTime = Math.max(0, Math.min(currentAudio.currentTime + secondsDelta, duration));
    currentAudio.currentTime = newTime;
  }
}

export function seekAudioToPercent(percent: number) {
  if (typeof window === "undefined") return;

  if (currentAudio && currentAudio.duration) {
    const newTime = Math.max(0, Math.min((percent / 100) * currentAudio.duration, currentAudio.duration));
    currentAudio.currentTime = newTime;
  }
}

export function setPlaybackRate(rate: number) {
  if (typeof window === "undefined") return;

  if (currentAudio) {
    currentAudio.playbackRate = rate;
  }
}

export function isSpeaking(): boolean {
  if (typeof window === "undefined") return false;

  if (currentAudio) {
    return !currentAudio.paused && !currentAudio.ended;
  }

  if ("speechSynthesis" in window) {
    return window.speechSynthesis.speaking;
  }

  return false;
}

/**
 * True when audio is loaded but paused — i.e. there is something to resume.
 *
 * Distinct from `isSpeaking()`, which is false both when paused and when
 * nothing is loaded at all. The play button needs to tell those apart, or it
 * restarts a ten-minute reading instead of continuing it.
 */
export function isPaused(): boolean {
  if (typeof window === "undefined") return false;
  return currentAudio !== null && currentAudio.paused && !currentAudio.ended;
}
