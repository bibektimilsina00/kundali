"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { NorthIndianChart } from "@/features/kundali/components/north-indian-chart";
import { loadKundaliFromStorage } from "@/features/kundali/store/kundali-store";
import type { Chart, BirthDetailsIn } from "@/features/kundali/types";
import type { ChatMessage } from "../types";
import { speakText, stopSpeech } from "@/lib/utils/audio-speaker";
import { OpenAIRealtimeWebRTCClient } from "@/lib/utils/openai-realtime-webrtc";
import { ASTROLOGER_VOICES } from "@/lib/constants/voices";
import { CustomVoiceSelector } from "./custom-voice-selector";
import { CustomLanguageSelector } from "@/components/ui/custom-language-selector";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { ChatMessageBubble } from "./chat-message-bubble";

import { useTranslation } from "@/lib/i18n/language-context";
import { trackLiveVoiceStarted } from "@/lib/utils/analytics";
import {
  ArrowLeft,
  Sparkles,
  Mic,
  MicOff,
  Zap,
  FileText,
  Map,
  Bug,
  Monitor,
  Radio,
  LogOut,
} from "lucide-react";

export function LiveModeWorkspace() {
  const router = useRouter();
  const { language: globalLang, setLanguage: setGlobalLang, t } = useTranslation();
  const [viewMode, setViewMode] = useState<"desk" | "live_voice">("desk");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [highlightedHouse, setHighlightedHouse] = useState<number | null>(null);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of chat feed on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isThinking]);

  // Live Voice Mode State Machine
  const [voiceState, setVoiceState] = useState<"listening" | "thinking" | "speaking" | "paused">("paused");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [teleprompterText, setTeleprompterText] = useState("");
  const [teleprompterBasis, setTeleprompterBasis] = useState("");
  const [showChartDrawer, setShowChartDrawer] = useState(false);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [isWebRTCActive, setIsWebRTCActive] = useState<boolean>(false);
  const [isRecordingMedia, setIsRecordingMedia] = useState<boolean>(false);
  
  // Realtime Audio & Debug Telemetry
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [silenceCounterMs, setSilenceCounterMs] = useState<number>(0);
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState<string>("");
  const [debugLogs, setDebugLogs] = useState<Array<{ time: string; event: string; detail: string }>>([
    {
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      event: "SYSTEM_READY",
      detail: "Live Astrologer Desk Initialized (Realtime Voice & Audio Engine)",
    },
  ]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const webrtcClientRef = useRef<OpenAIRealtimeWebRTCClient | null>(null);
  const activeSessionRef = useRef<boolean>(false);
  const accumulatedTranscriptRef = useRef<string>("");
  const lastSpeakingTimestampRef = useRef<number>(0);
  const isSubmittingRef = useRef<boolean>(false);
  const userSpokeRef = useRef<boolean>(false);

  // Stale-closure-free refs for audio & VAD loop
  const voiceStateRef = useRef<"listening" | "thinking" | "speaking" | "paused">("paused");
  const isWebRTCActiveRef = useRef<boolean>(false);
  const shouldTranscribeRef = useRef<boolean>(false);

  const updateVoiceState = (state: "listening" | "thinking" | "speaking" | "paused") => {
    voiceStateRef.current = state;
    setVoiceState(state);
  };

  const updateWebRTCActive = (active: boolean) => {
    isWebRTCActiveRef.current = active;
    setIsWebRTCActive(active);
  };

  const [activeBirth, setActiveBirth] = useState<BirthDetailsIn>({
    name: "Bibek Timilsina",
    date: "2002-01-11" as any,
    time: "19:30",
    tz_name: "Asia/Kathmandu",
    latitude: 27.55,
    longitude: 83.05,
    place_label: "Kapilbastu, Nepal",
    time_accuracy: "exact",
  });

  const [activeChart, setActiveChart] = useState<Chart | null>(null);

  // Add log to debug console
  const addDebugLog = (event: string, detail: string) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setDebugLogs((prev) => [{ time, event, detail }, ...prev.slice(0, 49)]);
  };

  // Load active chart
  useEffect(() => {
    const stored = loadKundaliFromStorage();
    if (stored) {
      setActiveBirth(stored.birth);
      setActiveChart(stored.chart);
    } else {
      fetch("/api/v1/kundali", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeBirth),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) setActiveChart(data);
        })
        .catch(console.error);
    }
  }, []);

  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ne" | "hi">(globalLang);
  const selectedLanguageRef = useRef<"en" | "ne" | "hi">(globalLang);

  const [selectedVoice, setSelectedVoice] = useState<string>("onyx");
  const selectedVoiceRef = useRef<string>("onyx");

  const handleVoiceChange = (newVoice: string) => {
    setSelectedVoice(newVoice);
    selectedVoiceRef.current = newVoice;
    addDebugLog("VOICE_CHANGED", `Switched astrologer voice to ${newVoice}`);
    if (activeSessionRef.current && isWebRTCActiveRef.current) {
      if (webrtcClientRef.current) {
        webrtcClientRef.current.disconnect();
      }
      startOpenAIRealtimeWebRTC();
    }
  };

  useEffect(() => {
    setSelectedLanguage(globalLang);
    selectedLanguageRef.current = globalLang;
  }, [globalLang]);

  // Transcribe recorded MediaRecorder audio blob using OpenAI Whisper API
  const transcribeAudioBlob = async (audioBlob: Blob) => {
    if (!audioBlob || audioBlob.size < 400) {
      addDebugLog("WHISPER_SKIP", "Audio buffer too small for transcription");
      if (activeSessionRef.current) {
        updateVoiceState("listening");
        startMediaRecorder();
      }
      return;
    }

    addDebugLog("WHISPER_TRANSCRIBE_START", `Sending ${Math.round(audioBlob.size / 1024)}KB audio to OpenAI Whisper (${selectedLanguageRef.current})...`);
    setIsThinking(true);
    updateVoiceState("thinking");

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "speech.webm");
      formData.append("language", selectedLanguageRef.current);

      const res = await fetch("/api/v1/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setIsThinking(false);

      if (data.text && data.text.trim()) {
        addDebugLog("WHISPER_TRANSCRIBE_SUCCESS", `Transcribed: "${data.text}"`);
        setInterimTranscript(data.text);
        handleSend(data.text);
      } else {
        addDebugLog("WHISPER_NO_SPEECH", "No speech recognized in audio buffer");
        if (activeSessionRef.current) {
          updateVoiceState("listening");
          startMediaRecorder();
        }
      }
    } catch (err: any) {
      console.error("Whisper transcription error:", err);
      addDebugLog("WHISPER_ERROR", err?.message || "Whisper API request failed");
      setIsThinking(false);
      if (activeSessionRef.current) {
        updateVoiceState("listening");
        startMediaRecorder();
      }
    }
  };

  const lastLoggedSilenceMsRef = useRef<number>(0);
  const speechDetectedLoggedRef = useRef<boolean>(false);

  // Setup Web Audio API Mic Analyzer & Native MediaRecorder Audio Capture
  const setupMicAnalyzer = async () => {
    try {
      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
      
      if (mediaStreamRef.current && mediaStreamRef.current.active) {
        addDebugLog("MIC_STREAM_ACTIVE", "Microphone stream active");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      addDebugLog("MIC_HARDWARE_CONNECTED", "Hardware Mic Connected & Web Audio Analyser Active");

      // Setup MediaRecorder for native audio capture
      startMediaRecorder();

      const updateLevel = () => {
        if (!mediaStreamRef.current || !mediaStreamRef.current.active) return;
        
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const level = Math.min(100, Math.round(average));
        setAudioLevel(level);

        const now = Date.now();
        const SPEECH_THRESHOLD = 14;

        if (level > SPEECH_THRESHOLD) {
          lastSpeakingTimestampRef.current = now;
          if (!speechDetectedLoggedRef.current) {
            speechDetectedLoggedRef.current = true;
            addDebugLog(
              "SPEECH_DETECTED",
              `Voice activity detected! Mic Level: ${level}% (Threshold: >${SPEECH_THRESHOLD}%)`
            );
          }
          userSpokeRef.current = true;
          setSilenceCounterMs(0);
          lastLoggedSilenceMsRef.current = 0;
        } else if (userSpokeRef.current && lastSpeakingTimestampRef.current > 0) {
          const silentMs = now - lastSpeakingTimestampRef.current;
          setSilenceCounterMs(silentMs);

          // Log silence counting progress every 250ms
          if (silentMs - lastLoggedSilenceMsRef.current >= 250 && silentMs < 800) {
            lastLoggedSilenceMsRef.current = silentMs;
            addDebugLog(
              "VAD_SILENCE_COUNTING",
              `Silence timer: ${Math.round(silentMs)}ms / 800ms (Audio level: ${level}%)`
            );
          }

          const currentVoiceState = voiceStateRef.current;
          const currentWebRTC = isWebRTCActiveRef.current;

          // 800ms Hardware Silence VAD Trigger
          if (
            silentMs >= 800 &&
            !isSubmittingRef.current &&
            !currentWebRTC &&
            (currentVoiceState === "listening" || currentVoiceState === "paused")
          ) {
            isSubmittingRef.current = true;
            userSpokeRef.current = false;
            lastSpeakingTimestampRef.current = 0;
            shouldTranscribeRef.current = true;

            addDebugLog(
              "VAD_HARDWARE_SILENCE_TRIGGER",
              "800ms silence threshold reached. Stopping MediaRecorder to transcribe speech with Whisper AI..."
            );

            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              try { mediaRecorderRef.current.stop(); } catch (e) {}
            } else if (accumulatedTranscriptRef.current.trim()) {
              handleSend(accumulatedTranscriptRef.current.trim());
            }
          }
        }

        requestAnimationFrame(updateLevel);
      };
      updateLevel();
      setMicPermissionError(null);
    } catch (err: any) {
      console.warn("Microphone stream request error:", err);
      addDebugLog("MIC_ERROR", err?.message || "Failed to access microphone hardware");
      setMicPermissionError("Microphone access required. Please allow mic permissions in your browser URL bar.");
    }
  };

  // Start native MediaRecorder chunk collection
  const startMediaRecorder = () => {
    if (!mediaStreamRef.current || !mediaStreamRef.current.active) return;
    if (typeof MediaRecorder === "undefined") return;

    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }

      audioChunksRef.current = [];
      shouldTranscribeRef.current = false;

      const options = MediaRecorder.isTypeSupported("audio/webm")
        ? { mimeType: "audio/webm" }
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? { mimeType: "audio/mp4" }
        : undefined;

      const recorder = new MediaRecorder(mediaStreamRef.current, options);
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        setIsRecordingMedia(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: options?.mimeType || "audio/webm" });
        audioChunksRef.current = [];

        if (shouldTranscribeRef.current) {
          shouldTranscribeRef.current = false;
          transcribeAudioBlob(audioBlob);
        } else {
          addDebugLog("MEDIA_RECORDER_RESET", "MediaRecorder buffer cleared for new session");
        }
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecordingMedia(true);
      isSubmittingRef.current = false;
      if (activeSessionRef.current && !isThinking) {
        updateVoiceState("listening");
      }
      addDebugLog("MEDIA_RECORDER_START", "Native MediaRecorder active & collecting audio chunks");
    } catch (err: any) {
      console.warn("MediaRecorder start error:", err);
      addDebugLog("MEDIA_RECORDER_ERROR", err?.message || "MediaRecorder failed to start");
    }
  };

  // Toggle debug panel
  const handleToggleDebugPanel = () => {
    const nextState = !showDebugPanel;
    setShowDebugPanel(nextState);
    if (nextState) {
      addDebugLog("DEBUG_PANEL_OPENED", "Opened Audio Telemetry Console");
      setupMicAnalyzer();
    }
  };

  // Initialize initial greeting dynamically
  useEffect(() => {
    if (activeChart && messages.length === 0) {
      const mahaLord = activeChart.dasha?.periods?.[0]?.lord ?? "Main";
      const antarLord = activeChart.dasha?.periods?.[1]?.lord ?? "Sub";
      const dashaText = `${mahaLord}-${antarLord} Dasha`;

      const greeting =
        selectedLanguage === "ne"
          ? `नमस्ते ${activeBirth.name}! मैले तपाईंको कुण्डलीको विस्तृत विश्लेषण गरेको छु। तपाईंको ${activeChart.lagna_sign} लग्न${activeChart.panchang?.moon_sign ? ` र ${activeChart.panchang.moon_sign} चन्द्रमा` : ""} तथा वर्तमान ${mahaLord}-${antarLord} दशाले तपाईंको जीवनमा नयाँ अवसर सङ्केत गर्दछ। आज तपाईं के सोध्न चाहनुहुन्छ?`
          : selectedLanguage === "hi"
          ? `नमस्ते ${activeBirth.name}! मैंने आपकी कुंडली का विस्तृत विश्लेषण किया है। आपका ${activeChart.lagna_sign} लग्न${activeChart.panchang?.moon_sign ? ` एवं ${activeChart.panchang.moon_sign} चंद्रमा` : ""} तथा वर्तमान ${mahaLord}-${antarLord} दशा आपके जीवन में महत्वपूर्ण समय का संकेत देती है। आज आप क्या पूछना चाहते हैं?`
          : `Namaste ${activeBirth.name}! I have thoroughly analyzed your Kundali. Your ${activeChart.lagna_sign} Ascendant${activeChart.panchang?.moon_sign ? ` with ${activeChart.panchang.moon_sign} Moon` : ""} under current ${dashaText} make this a significant phase for your personal growth. What specific questions do you have today?`;

      setMessages([
        {
          id: "msg-init",
          sender: "astrologer",
          text: greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          astrologicalBasis: `Chart initialized: ${activeChart.lagna_sign} Ascendant · ${dashaText}`,
        },
      ]);
      setTeleprompterText(greeting);
      setTeleprompterBasis(`${activeChart.lagna_sign} Ascendant · ${dashaText}`);
      addDebugLog("SESSION_INIT", `Dynamic greeting built for ${activeBirth.name} (${activeChart.lagna_sign} Ascendant)`);
    }
  }, [activeChart, activeBirth, messages.length, selectedLanguage]);

  // Send message query function
  const handleSend = async (textToSend?: string) => {
    const query = textToSend || accumulatedTranscriptRef.current || inputQuery;
    if (!query.trim() || isThinking) return;

    accumulatedTranscriptRef.current = "";
    setInterimTranscript("");
    setLastSubmittedQuery(query);

    // If WebRTC is active, send text via WebRTC DataChannel
    if (isWebRTCActiveRef.current && webrtcClientRef.current) {
      addDebugLog("WEBRTC_SEND_TEXT", `Sending text over OpenAI Realtime WebRTC: "${query}"`);
      webrtcClientRef.current.sendTextMessage(query);
      
      const userMsg: ChatMessage = {
        id: `usr-${Date.now()}`,
        sender: "user",
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, userMsg]);
      if (!textToSend) setInputQuery("");
      return;
    }

    addDebugLog("QUERY_SENT", `Submitting query to AI: "${query}"`);

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery("");
    setIsThinking(true);
    if (viewMode === "live_voice") {
      updateVoiceState("thinking");
    }

    try {
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          messages,
          chart: activeChart,
          birth: activeBirth,
          language: selectedLanguageRef.current,
        }),
      });

      const data = await res.json();
      setIsThinking(false);

      if (data.text) {
        addDebugLog("AI_RESPONSE_RECEIVED", `Response: "${data.text.slice(0, 50)}..."`);

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "astrologer",
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          astrologicalBasis: data.astrologicalBasis,
        };

        setMessages((prev) => [...prev, aiMsg]);
        setTeleprompterText(data.text);
        setTeleprompterBasis(data.astrologicalBasis || "");

        if (data.highlightHouse) {
          setHighlightedHouse(data.highlightHouse);
        }

        // Voice playback handling in Live Voice Mode
        if (activeSessionRef.current && !isWebRTCActiveRef.current) {
          updateVoiceState("speaking");
          addDebugLog("TTS_START", `Playing audio response via speaker engine (${selectedLanguageRef.current})...`);
          
          let hasEnded = false;
          const finishPlayback = () => {
            if (hasEnded) return;
            hasEnded = true;
            addDebugLog("TTS_END", `Playback complete. Resuming mic listening loop.`);
            if (activeSessionRef.current && !isMicMuted) {
              updateVoiceState("listening");
              startMediaRecorder();
            } else {
              updateVoiceState("paused");
            }
          };

          // Failsafe timer (max 25s or 120ms per character) to ensure voice state NEVER stalls
          const maxDurationMs = Math.max(4000, Math.min(25000, data.text.length * 120));
          const failsafeTimer = setTimeout(() => {
            addDebugLog("TTS_TIMEOUT_FAILSAFE", "Playback safety timeout reached. Resuming mic loop.");
            finishPlayback();
          }, maxDurationMs);

          speakText(data.text, {
            language: selectedLanguageRef.current,
            voice: selectedVoiceRef.current,
            onStart: () => updateVoiceState("speaking"),
            onEnd: () => {
              clearTimeout(failsafeTimer);
              finishPlayback();
            },
          });
        } else if (activeSessionRef.current) {
          updateVoiceState("listening");
          startMediaRecorder();
        }
      } else {
        addDebugLog("EMPTY_AI_RESPONSE", "No response text received from AI engine");
        if (activeSessionRef.current) {
          updateVoiceState("listening");
          startMediaRecorder();
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch AI Astrologer response", err);
      addDebugLog("API_ERROR", err?.message || "Chat completion failed");
      setIsThinking(false);
      if (activeSessionRef.current) {
        updateVoiceState("listening");
        startMediaRecorder();
      }
    }
  };

  // Start OpenAI Realtime WebRTC Session
  const startOpenAIRealtimeWebRTC = async () => {
    if (!activeChart || !activeBirth) return;
    
    addDebugLog("WEBRTC_CONNECTING", "Initializing OpenAI Realtime WebRTC native audio stream...");

    const client = new OpenAIRealtimeWebRTCClient({
      onStateChange: (state) => {
        addDebugLog("WEBRTC_STATE", `State: ${state}`);
        if (state === "speaking") updateVoiceState("speaking");
        else if (state === "listening") updateVoiceState("listening");
        else if (state === "connecting") updateVoiceState("thinking");
      },
      onTranscriptDelta: (delta) => {
        setTeleprompterText((prev) => (prev.length > 200 ? delta : prev + delta));
      },
      onTranscriptComplete: (text) => {
        if (text) {
          setTeleprompterText(text);
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-webrtc-${Date.now()}`,
              sender: "astrologer",
              text,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              astrologicalBasis: `${activeChart.lagna_sign} Ascendant · OpenAI Realtime`,
            },
          ]);
        }
      },
      onUserTranscript: (userText) => {
        if (userText) {
          setInterimTranscript(userText);
          setMessages((prev) => [
            ...prev,
            {
              id: `usr-webrtc-${Date.now()}`,
              sender: "user",
              text: userText,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
        }
      },
      onDebugLog: (event, detail) => {
        addDebugLog(event, detail);
      },
      onError: (err) => {
        addDebugLog("WEBRTC_ERROR", err);
        updateWebRTCActive(false);
        updateVoiceState("listening");
        // Fallback to MediaRecorder + OpenAI Whisper API
        startMediaRecorder();
      },
    });

    webrtcClientRef.current = client;
    const success = await client.connect(activeChart, activeBirth, selectedLanguageRef.current, selectedVoiceRef.current);
    if (success) {
      updateWebRTCActive(true);
      updateVoiceState("listening");
      addDebugLog("WEBRTC_LIVE", `Realtime Voice Session Active in ${selectedLanguageRef.current.toUpperCase()}`);
    } else {
      updateWebRTCActive(false);
      updateVoiceState("listening");
      addDebugLog("WEBRTC_FALLBACK", "Using Native Voice Engine");
      startMediaRecorder();
    }
  };

  // Toggle Live Voice Mode Session
  const toggleLiveVoiceMode = (enable: boolean) => {
    if (enable) {
      setViewMode("live_voice");
      activeSessionRef.current = true;
      updateVoiceState("listening");
      setupMicAnalyzer();

      // Try OpenAI Realtime WebRTC first!
      startOpenAIRealtimeWebRTC();
      addDebugLog("MODE_SWITCH", "Entered Live Voice Mode");
      trackLiveVoiceStarted();
    } else {
      activeSessionRef.current = false;
      stopSpeech();
      if (webrtcClientRef.current) {
        webrtcClientRef.current.disconnect();
        webrtcClientRef.current = null;
      }
      updateWebRTCActive(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      updateVoiceState("paused");
      setViewMode("desk");
      addDebugLog("MODE_SWITCH", "Exited to Desk View");
    }
  };

  // Interrupt AI speaking
  const handleInterrupt = () => {
    addDebugLog("USER_INTERRUPT", "User interrupted active AI speech output");
    stopSpeech();
    if (isWebRTCActiveRef.current && webrtcClientRef.current) {
      webrtcClientRef.current.sendTextMessage("Hello");
    } else {
      activeSessionRef.current = true;
      updateVoiceState("listening");
      startMediaRecorder();
    }
  };

  if (!activeChart) {
    return (
      <div className="min-h-dvh bg-[#090A10] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="size-12 animate-spin rounded-full border-4 border-[#E5A93C] border-t-transparent" />
        <p className="font-serif text-sm font-bold text-[#F8FAFC]">{t.connectingToDesk}</p>
        <p className="text-xs text-[#94A3B8]">{t.calculatingEphemeris}</p>
      </div>
    );
  }

  const mahaLord = activeChart.dasha?.periods?.[0]?.lord ?? "Main";
  const antarLord = activeChart.dasha?.periods?.[1]?.lord ?? "Sub";

  return (
    <div className="h-dvh max-h-dvh overflow-hidden bg-[#090A10] text-[#94A3B8] flex flex-col font-sans selection:bg-[#E5A93C]/30 selection:text-[#F3C766]">
      {/* Top Header Bar */}
      <header className="border-b border-white/10 bg-[#090A10]/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              toggleLiveVoiceMode(false);
              router.push("/reading");
            }}
            className="flex items-center gap-2 rounded-[8px] border border-white/10 bg-[#161B2B] px-3 py-1.5 text-xs font-semibold text-[#F8FAFC] hover:border-[#E5A93C]/40 hover:bg-[#1E2538] transition cursor-pointer active:scale-95"
          >
            <ArrowLeft className="size-3.5 text-[#E5A93C]" />
            <span className="hidden sm:inline">{t.backToReport}</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-[6px] bg-[#E5A93C] text-[#090A10] font-bold">
              <Sparkles className="size-4 text-[#090A10]" />
            </div>
            <span className="font-serif text-sm font-bold text-[#F8FAFC]">
              {t.brandName} Live AI
            </span>
          </div>
        </div>

        {/* Right ONLY: Reusable Custom Language Selector */}
        <CustomLanguageSelector
          value={selectedLanguage}
          onChange={(lang) => {
            setSelectedLanguage(lang);
            selectedLanguageRef.current = lang;
            setGlobalLang(lang);
            addDebugLog("LANGUAGE_CHANGED", `Astrologer language switched to ${lang.toUpperCase()}`);
            if (isWebRTCActiveRef.current && webrtcClientRef.current) {
              webrtcClientRef.current.disconnect();
              startOpenAIRealtimeWebRTC();
            }
          }}
        />
      </header>

      {/* =================================================================== */}
      {/* REAL-TIME AUDIO TELEMETRY & RECORDING DEBUG PANEL                  */}
      {/* =================================================================== */}
      {showDebugPanel && (
        <div className="border-b border-amber-500/30 bg-[#0D0F19] p-5 z-40 text-xs font-mono space-y-4 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold text-sm">🐛 Live Audio Recording &amp; Voice Telemetry Console</span>
              <span className={`rounded-[8px] border px-2 py-0.5 text-[10px] font-bold ${isWebRTCActive ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"}`}>
                {isWebRTCActive ? "Realtime WebRTC Active" : "Voice AI Active"}
              </span>
            </div>
            <button
              onClick={() => setShowDebugPanel(false)}
              className="text-xs text-[#94A3B8] hover:text-white"
            >
              ✕ Close Panel
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-5 text-[11px]">
            {/* Box 1: Hardware Mic State */}
            <div className="rounded-[8px] border border-white/10 bg-[#161B2B] p-3 space-y-1.5">
              <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">🎙️ Mic Hardware Status</span>
              <p className="font-bold text-[#F8FAFC] flex items-center gap-2">
                <span className={`size-2 rounded-full ${mediaStreamRef.current?.active ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                {mediaStreamRef.current?.active ? "MediaStream Connected" : "Mic Stream Inactive"}
              </p>
              <button
                onClick={() => {
                  setupMicAnalyzer();
                  startMediaRecorder();
                }}
                className="mt-1 rounded-[8px] bg-[#E5A93C]/20 border border-[#E5A93C]/40 text-[#F3C766] px-2 py-0.5 text-[10px] font-bold hover:bg-[#E5A93C]/30 transition"
              >
                ▶️ Start Mic Hardware
              </button>
            </div>

            {/* Box 2: Audio Level & VU Meter */}
            <div className="rounded-[8px] border border-white/10 bg-[#161B2B] p-3 space-y-1.5">
              <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">🔊 Audio Level (VU Meter)</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#F3C766]">{audioLevel}%</span>
                <div className="flex-1 bg-[#090A10] h-2 rounded-[8px] overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-[#E5A93C]"
                    style={{ width: `${Math.max(5, audioLevel)}%` }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-[#94A3B8]">Speech Threshold: &gt; 14%</span>
            </div>

            {/* Box 3: Silence Counter VAD */}
            <div className="rounded-[8px] border border-white/10 bg-[#161B2B] p-3 space-y-1.5">
              <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">⏱️ VAD Silence Timer</span>
              <p className="font-bold text-[#F8FAFC]">
                {silenceCounterMs}ms / 800ms
              </p>
              <div className="w-full bg-[#090A10] h-1.5 rounded-[8px] overflow-hidden border border-white/10">
                <div
                  className="h-full bg-amber-400 transition-all duration-75"
                  style={{ width: `${Math.min(100, (silenceCounterMs / 800) * 100)}%` }}
                />
              </div>
            </div>

            {/* Box 4: Live Speech Listener State */}
            <div className="rounded-[8px] border border-white/10 bg-[#161B2B] p-3 space-y-1.5">
              <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">🗣️ Live Voice Listener</span>
              <p className="font-bold text-xs truncate">
                {audioLevel > 14 ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 animate-pulse">
                    <span className="size-2 rounded-full bg-emerald-400" />
                    Voice Detected ({audioLevel}%)
                  </span>
                ) : silenceCounterMs > 0 ? (
                  <span className="text-amber-300">
                    ⏱️ Counting Silence ({silenceCounterMs}ms)
                  </span>
                ) : voiceState === "thinking" ? (
                  <span className="text-[#F3C766]">🧠 Analyzing Speech...</span>
                ) : voiceState === "speaking" ? (
                  <span className="text-amber-400">🔊 Astrologer Speaking</span>
                ) : (
                  <span className="text-[#94A3B8]">👂 Listening for speech...</span>
                )}
              </p>
              <span className="text-[10px] text-[#94A3B8]">Auto-transcribe after 800ms</span>
            </div>

            {/* Box 5: Native MediaRecorder Status */}
            <div className="rounded-[8px] border border-white/10 bg-[#161B2B] p-3 space-y-1.5">
              <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">📼 MediaRecorder Buffer</span>
              <p className="font-bold text-cyan-300 flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${isRecordingMedia ? "bg-red-500 animate-ping" : "bg-slate-600"}`} />
                {isRecordingMedia ? "Capturing Audio Chunks..." : "Buffer Ready"}
              </p>
              <span className="text-[10px] text-[#94A3B8]">Voice Audio Buffer</span>
            </div>
          </div>

          {/* Test Action & Last Query Bar */}
          <div className="flex items-center justify-between bg-[#161B2B] border border-white/10 rounded-[8px] p-3">
            <div className="flex items-center gap-2">
              <span className="text-[#E5A93C] font-bold text-[11px]">Last Transmitted Query:</span>
              <span className="text-[#F8FAFC] font-semibold">{lastSubmittedQuery || "None yet"}</span>
            </div>
            <button
              onClick={() => {
                const sample = "When is the strongest period for my career growth?";
                setInterimTranscript(sample);
                accumulatedTranscriptRef.current = sample;
                addDebugLog("SIMULATED_TEST_QUERY", `Injected test query: "${sample}"`);
                handleSend(sample);
              }}
              className="rounded-[8px] bg-[#E5A93C] hover:bg-[#F3C766] px-3 py-1 text-xs font-bold text-[#090A10] transition"
            >
              🧪 Test Trigger Career Query
            </button>
          </div>

          {/* Event Stream Console Logs */}
          <div className="space-y-1 bg-[#090A10] border border-white/10 rounded-[8px] p-3 max-h-48 overflow-y-auto">
            <span className="text-[10px] text-[#94A3B8] block uppercase font-bold mb-1">Live Event Telemetry Log ({debugLogs.length} events)</span>
            {debugLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] font-mono leading-tight py-0.5 border-b border-white/5">
                <span className="text-[#94A3B8] text-[10px] shrink-0">[{log.time}]</span>
                <span className="text-[#E5A93C] font-bold shrink-0">{log.event}:</span>
                <span className="text-[#F8FAFC] truncate">{log.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODE 1: ULTRA-PREMIUM FULLSCREEN LIVE VOICE EXPERIENCE             */}
      {/* =================================================================== */}
      {viewMode === "live_voice" ? (
        <div className="relative flex-1 min-h-0 h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1E1B4B]/40 via-[#090A10] to-[#090A10] flex flex-col items-start justify-start p-4 sm:p-5 overflow-hidden">
          
          {/* Top Status & Mode Control Bar inside Live Room */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-[#161B2B]/90 border border-white/10 rounded-[8px] p-2.5 shadow-xl mb-3 shrink-0">
            {/* Realtime Status Badge & Mic VU Meter */}
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1 text-xs font-bold border transition-all ${
                  voiceState === "listening"
                    ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                    : voiceState === "thinking"
                    ? "bg-[#E5A93C]/10 border-[#E5A93C]/50 text-[#F3C766] shadow-[0_0_15px_rgba(229,169,60,0.25)]"
                    : voiceState === "speaking"
                    ? "bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-[0_0_20px_rgba(243,199,102,0.35)]"
                    : "bg-slate-800/80 border-slate-700 text-slate-300"
                }`}
              >
                {voiceState === "listening" && (
                  <>
                    <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
                    {t.realtimeListening}
                  </>
                )}
                {voiceState === "thinking" && (
                  <>
                    <span className="size-2 rounded-full bg-[#E5A93C] animate-spin" />
                    {t.analyzingSpeech}
                  </>
                )}
                {voiceState === "speaking" && (
                  <>
                    <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                    {t.astrologerSpeaking}
                  </>
                )}
                {voiceState === "paused" && <>{t.voiceReadyPaused}</>}
              </span>

              {/* Hardware Mic Level Indicator (VU Meter) */}
              <div className="hidden sm:flex items-center gap-2 bg-[#090A10] border border-white/10 rounded-[6px] px-2.5 py-1 text-[10px] text-[#94A3B8]">
                <span className="font-medium">{t.micVu}:</span>
                <div className="w-12 bg-[#161B2B] h-2 rounded-[4px] overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-[#E5A93C] transition-all duration-75"
                    style={{ width: `${Math.max(5, audioLevel)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* View Mode & Debug Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleDebugPanel}
                className={`rounded-[6px] border px-2.5 py-1 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  showDebugPanel
                    ? "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    : "bg-[#090A10] border-white/10 text-[#94A3B8] hover:text-[#F8FAFC]"
                }`}
              >
                <Bug className="size-3.5 text-[#E5A93C]" />
                <span className="hidden sm:inline">{t.debugLabel}</span>
              </button>

              <div className="flex items-center rounded-[6px] bg-[#090A10] border border-white/10 p-0.5 text-xs">
                <button
                  onClick={() => toggleLiveVoiceMode(false)}
                  className={`flex items-center gap-1.5 rounded-[4px] px-2.5 py-0.5 text-[11px] font-semibold transition ${
                    (viewMode as string) === "desk"
                      ? "bg-[#E5A93C] text-[#090A10]"
                      : "text-[#94A3B8] hover:text-[#F8FAFC]"
                  }`}
                >
                  <Monitor className="size-3" />
                  <span>{t.deskView}</span>
                </button>
                <button
                  onClick={() => toggleLiveVoiceMode(true)}
                  className={`flex items-center gap-1.5 rounded-[4px] px-2.5 py-0.5 text-[11px] font-semibold transition ${
                    viewMode === "live_voice"
                      ? "bg-[#E5A93C] text-[#090A10]"
                      : "text-[#F3C766] hover:text-[#F8FAFC]"
                  }`}
                >
                  <Radio className="size-3 text-[#090A10] animate-pulse" />
                  <span>{t.voiceView}</span>
                </button>
              </div>
            </div>
          </div>
          <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-0">
            
            {/* LEFT COLUMN (4 COLS): SEEKER NAME CARD + REALTIME RESPONSE CARD - DYNAMICALLY FIT TO SCREEN */}
            <div className="lg:col-span-4 flex flex-col space-y-3 h-full justify-between min-h-0">
              
              {/* Seeker Profile / Name Card - PERFECTLY ALIGNED AT TOP LEFT */}
              <div className="w-full bg-[#161B2B]/90 backdrop-blur-xl border border-white/10 rounded-[8px] p-4 shadow-xl flex items-center gap-3 shrink-0">
                <div className="size-10 rounded-full bg-gradient-to-br from-[#E5A93C] to-[#F3C766] text-[#090A10] flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                  {activeBirth.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-bold text-[#F8FAFC] block truncate leading-tight">{activeBirth.name}</span>
                  <span className="text-[11px] text-[#94A3B8] block truncate">{activeChart.lagna_sign} {t.ascendantLabel} · {mahaLord}-{antarLord} {selectedLanguage === "ne" ? "दशा" : selectedLanguage === "hi" ? "दशा" : "Dasha"}</span>
                </div>
              </div>

              {/* Realtime Astrologer Response Card - EXPANDS DYNAMICALLY TO FILL FULL SCREEN HEIGHT */}
              <div className="w-full flex-1 rounded-[8px] border border-[#E5A93C]/30 bg-gradient-to-b from-[#161B2B]/95 via-[#121625]/95 to-[#0D0F19]/95 backdrop-blur-2xl p-5 space-y-4 z-10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] animate-fade-in flex flex-col justify-between min-h-0">
                
                {/* Response Section Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
                  <span className="text-xs font-serif font-bold text-[#E5A93C] flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#E5A93C] animate-pulse" />
                    📜 {t.realtimeResponse}
                  </span>
                  {teleprompterBasis && (
                    <button
                      onClick={() => {
                        setShowChartDrawer(true);
                        setHighlightedHouse(teleprompterText.includes("7th") ? 7 : 10);
                      }}
                      className="rounded-[8px] bg-[#090A10] border border-[#E5A93C]/40 px-2.5 py-1 text-[10px] font-semibold text-[#F3C766] hover:bg-[#E5A93C]/10 transition shadow-sm truncate max-w-[140px]"
                    >
                      📍 {teleprompterBasis}
                    </button>
                  )}
                </div>

                {/* Response Text Content Body - STRETCHES FULL HEIGHT */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[260px] max-h-[calc(100vh-280px)]">
                  {teleprompterText ? (
                    <MarkdownRenderer content={teleprompterText} />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-[#94A3B8]/60">
                      <span className="text-3xl">🪔</span>
                      <p className="text-xs font-serif font-semibold text-[#F8FAFC]">{t.listeningToVoice}</p>
                      <p className="text-[10px]">{t.askAnyQuestionOrb}</p>
                    </div>
                  )}
                </div>

                {/* Session Summary & Transcript Button Footer */}
                <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[10px] text-[#94A3B8] shrink-0">
                  <span>{t.messagesCount}: <strong className="text-[#F8FAFC]">{messages.length}</strong></span>
                  <button
                    onClick={() => setShowTranscriptDrawer(true)}
                    className="text-[#E5A93C] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>📜</span> {t.viewTranscript}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (8 COLS): Cosmic Visualizer Orb + Controls */}
            <div className="lg:col-span-8 flex flex-col items-center justify-between h-full space-y-3 min-h-0">
              
              {/* VERTICALLY CENTERED ORB VISUALIZER SECTION */}
              <div className="flex-1 flex flex-col items-center justify-center my-auto w-full space-y-4">
                {/* Central Animated Cosmic Mandala Orb */}
                <div className="relative flex items-center justify-center size-72 md:size-80 shrink-0">
                  {/* Ambient Backlight Glow Aura */}
                  <div className={`absolute inset-0 m-auto size-72 md:size-80 rounded-full transition-all duration-700 pointer-events-none ${
                    voiceState === "listening"
                      ? "bg-cyan-500/20 blur-3xl scale-125"
                      : voiceState === "thinking"
                      ? "bg-[#E5A93C]/25 blur-3xl scale-110"
                      : voiceState === "speaking"
                      ? "bg-gradient-to-tr from-[#E5A93C]/20 via-[#F3C766]/30 to-amber-500/20 blur-3xl scale-150 animate-pulse-glow"
                      : "bg-transparent"
                  }`} />

                  {/* Pulsing Radar Wave on Listening */}
                  {voiceState === "listening" && (
                    <div className="absolute inset-0 m-auto size-72 md:size-80 rounded-full border border-cyan-500/30 animate-pulse-radar pointer-events-none" />
                  )}

                  {/* Rotating Dasha Wheel on Thinking */}
                  {voiceState === "thinking" && (
                    <div className="absolute inset-0 m-auto size-72 md:size-80 rounded-full border-2 border-dashed border-[#E5A93C]/50 animate-rotate-slow pointer-events-none" />
                  )}

                  {/* Dynamic Equalizer Waves when AI is Speaking */}
                  {voiceState === "speaking" && (
                    <div className="absolute -top-14 flex items-end gap-1.5 h-10 z-10 pointer-events-none">
                      <span className="w-1.5 bg-[#E5A93C] rounded-[4px] animate-equalizer-1" />
                      <span className="w-1.5 bg-[#F3C766] rounded-[4px] animate-equalizer-2" />
                      <span className="w-1.5 bg-[#E5A93C] rounded-[4px] animate-equalizer-3" />
                      <span className="w-1.5 bg-[#F3C766] rounded-[4px] animate-equalizer-4" />
                      <span className="w-1.5 bg-[#E5A93C] rounded-[4px] animate-equalizer-5" />
                    </div>
                  )}

                  {/* Core 3D Spherical Cosmic Mandala Orb */}
                  <button
                    onClick={() => {
                      if (voiceState === "speaking") {
                        handleInterrupt();
                      } else if (interimTranscript.trim()) {
                        handleSend(interimTranscript);
                      } else {
                        activeSessionRef.current = true;
                        updateVoiceState("listening");
                        startOpenAIRealtimeWebRTC();
                      }
                    }}
                    className={`group relative size-56 md:size-64 rounded-full flex items-center justify-center transition-all duration-700 cursor-pointer overflow-hidden backdrop-blur-xl ${
                      voiceState === "listening"
                        ? "bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-950 via-[#161B2B] to-[#090A10] border-2 border-cyan-400/70 shadow-[0_0_90px_rgba(6,182,212,0.45)] scale-105"
                        : voiceState === "thinking"
                        ? "bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#2A1F0D] via-[#161B2B] to-[#090A10] border-2 border-[#E5A93C] shadow-[0_0_90px_rgba(229,169,60,0.45)] scale-100"
                        : voiceState === "speaking"
                        ? "bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#38260B] via-[#1E1B4B] to-[#090A10] border-2 border-[#F3C766] shadow-[0_0_110px_rgba(243,199,102,0.6)] scale-110 animate-pulse-glow"
                        : "bg-[#161B2B] border border-white/10 opacity-70"
                    }`}
                  >
                    {/* Sacred Geometric SVG Ring */}
                    <svg className="absolute inset-0 size-full p-2 text-white/15 animate-rotate-slow pointer-events-none" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 2" />
                      <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 2" />
                      <polygon points="50,6 88.1,72 11.9,72" fill="none" stroke="currentColor" strokeWidth="0.4" />
                      <polygon points="50,94 88.1,28 11.9,28" fill="none" stroke="currentColor" strokeWidth="0.4" />
                    </svg>
                    
                    <div className="text-center z-10 p-5 space-y-1">
                      <span className="block text-4xl md:text-5xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">🕉️</span>
                      <span className="block font-serif text-xs font-bold tracking-wide text-[#F8FAFC] leading-snug">
                        {voiceState === "listening"
                          ? t.listeningState
                          : voiceState === "thinking"
                          ? t.thinkingState
                          : voiceState === "speaking"
                          ? t.tapToInterrupt
                          : t.tapToStartVoice}
                      </span>
                      <span className="text-[10px] text-[#F3C766]/80 block font-medium">
                        {isWebRTCActive ? t.realtimeAudioEngine : t.vedicVoiceEngine}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Live User Speech Teleprompter */}
                {interimTranscript && (
                  <div className="flex items-center gap-2 w-full max-w-xl animate-fade-in z-20 shrink-0">
                    <div className="rounded-[8px] border border-cyan-500/40 bg-cyan-950/80 backdrop-blur-xl px-4 py-2 text-center text-xs font-semibold text-cyan-200 shadow-2xl flex-1 truncate">
                      🗣️ &quot;{interimTranscript}&quot;
                    </div>
                    <button
                      onClick={() => handleSend(interimTranscript)}
                      className="rounded-[8px] bg-gradient-to-r from-[#E5A93C] to-[#F3C766] hover:from-[#F3C766] hover:to-[#E5A93C] px-4 py-2 text-xs font-bold text-[#090A10] transition shrink-0 shadow-lg"
                    >
                      {t.sendNow}
                    </button>
                  </div>
                )}

                {micPermissionError && (
                  <div className="w-full max-w-md rounded-[8px] border border-red-500/30 bg-red-950/50 backdrop-blur-md px-4 py-2 text-center text-[11px] text-red-300 shadow-lg shrink-0">
                    ⚠️ {micPermissionError}
                  </div>
                )}
              </div>

              {/* TIGHT BOTTOM STACK: PROMPT PILLS, CONTROL DOCK & INPUT BAR */}
              <div className="w-full flex flex-col items-center gap-2.5 shrink-0 z-20">
                {/* Dynamic Quick Prompt Pills */}
                <div className="w-full max-w-xl flex gap-2 overflow-x-auto justify-center z-10 shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {(selectedLanguage === "ne"
                    ? [
                        { label: "✨ करियरको योग?", query: "मेरो करियर र नोकरीमा कहिले राम्रो समय आउँछ?" },
                        { label: "❤️ विवाह र ७औं भाव?", query: "मेरो विवाह र दाम्पत्य जीवनको विश्लेषण गर्नुहोस्।" },
                        { label: `🪔 ${mahaLord} दशा उपाय?`, query: `मेरो ${mahaLord} महादशाको लागि के शान्ति उपायहरू छन्?` },
                      ]
                    : selectedLanguage === "hi"
                    ? [
                        { label: "✨ करियर का समय?", query: "मेरे करियर और पदोन्नति का सबसे अच्छा समय कब है?" },
                        { label: "❤️ विवाह और 7वां भाव?", query: "मेरे विवाह और 7वें भाव का विस्तृत विश्लेषण करें।" },
                        { label: `🪔 ${mahaLord} दशा उपाय?`, query: `मेरी ${mahaLord} महादशा के लिए कौन से उपाय करने चाहिए?` },
                      ]
                    : [
                        { label: "✨ Career shift timing?", query: "When is the strongest period for my career growth?" },
                        { label: "❤️ Marriage & relationship?", query: "Analyze my 7th house for marriage & relationship." },
                        { label: `🪔 ${mahaLord} Remedies?`, query: `What remedies help my ${mahaLord} Dasha period?` },
                      ]
                  ).map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => handleSend(chip.query)}
                      className="shrink-0 rounded-[8px] border border-white/10 bg-[#161B2B]/80 backdrop-blur-md px-3.5 py-1.5 text-xs text-[#F8FAFC] hover:border-[#E5A93C] hover:text-[#F3C766] hover:shadow-[0_0_15px_rgba(229,169,60,0.2)] transition-all shadow-md"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* CONTROL DOCK (Voice, Mute, Kundali, Interrupt, Transcript, Exit) */}
                <div className="w-full max-w-2xl rounded-[8px] border border-white/10 bg-[#161B2B]/95 backdrop-blur-2xl p-2 flex flex-wrap items-center justify-between gap-1.5 z-20 shadow-2xl shrink-0">
                  {/* Custom Voice Selector with Sound Preview */}
                  <CustomVoiceSelector
                    selectedVoice={selectedVoice}
                    onSelectVoice={(vId) => handleVoiceChange(vId)}
                    language={selectedLanguage}
                  />

                  {/* Mute / Unmute Button */}
                  <button
                    type="button"
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition cursor-pointer ${
                      isMicMuted ? "bg-red-500/20 text-red-400 border border-red-500/40" : "text-[#F8FAFC] hover:bg-white/5 border border-white/10"
                    }`}
                  >
                    {isMicMuted ? <MicOff className="size-3.5 text-red-400" /> : <Mic className="size-3.5 text-[#E5A93C]" />}
                    <span className="text-[11px]">{isMicMuted ? t.unmute : t.mute}</span>
                  </button>

                  {/* Kundali Chart Drawer Button */}
                  <button
                    type="button"
                    onClick={() => setShowChartDrawer(!showChartDrawer)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition cursor-pointer ${
                      showChartDrawer ? "bg-[#E5A93C]/20 text-[#F3C766] border border-[#E5A93C]/40" : "text-[#F8FAFC] hover:bg-white/5 border border-white/10"
                    }`}
                  >
                    <Map className="size-3.5 text-[#E5A93C]" />
                    <span className="text-[11px]">{t.kundaliChart}</span>
                  </button>

                  {/* Interrupt Button */}
                  <button
                    type="button"
                    onClick={handleInterrupt}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] bg-gradient-to-r from-[#E5A93C] to-[#F3C766] text-[#090A10] font-bold text-xs hover:shadow-[0_0_20px_rgba(229,169,60,0.4)] transition shadow-lg scale-105 cursor-pointer active:scale-95"
                  >
                    <Zap className="size-3.5 fill-current" />
                    <span className="text-[11px]">{t.interrupt}</span>
                  </button>

                  {/* Transcript Drawer Button */}
                  <button
                    type="button"
                    onClick={() => setShowTranscriptDrawer(!showTranscriptDrawer)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition cursor-pointer ${
                      showTranscriptDrawer ? "bg-[#E5A93C]/20 text-[#F3C766] border border-[#E5A93C]/40" : "text-[#F8FAFC] hover:bg-white/5 border border-white/10"
                    }`}
                  >
                    <FileText className="size-3.5 text-[#E5A93C]" />
                    <span className="text-[11px]">{t.transcript}</span>
                  </button>

                  {/* Exit Consultation Button */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleLiveVoiceMode(false);
                      router.push("/reading");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/20 transition cursor-pointer"
                  >
                    <LogOut className="size-3.5 text-red-400" />
                    <span className="text-[11px]">{t.exitVoice}</span>
                  </button>
                </div>

                {/* DIRECT TEXT INPUT BAR - ALIGNED FLUSH AT BOTTOM */}
                <div className="w-full max-w-2xl z-20 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex items-center gap-3"
                  >
                    <input
                      type="text"
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      placeholder={t.askPlaceholder}
                      className="flex-1 rounded-[8px] border border-white/20 bg-[#161B2B]/95 backdrop-blur-2xl px-5 py-3.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:border-[#E5A93C] focus:ring-2 focus:ring-[#E5A93C]/40 focus:outline-none transition shadow-2xl"
                    />
                    <button
                      type="submit"
                      disabled={!inputQuery.trim() || isThinking}
                      className="rounded-[8px] bg-gradient-to-r from-[#E5A93C] to-[#F3C766] hover:from-[#F3C766] hover:to-[#E5A93C] px-6 py-3.5 text-xs sm:text-sm font-bold text-[#090A10] transition shrink-0 disabled:opacity-40 shadow-xl active:scale-95"
                    >
                      {isThinking ? "..." : t.sendQuery}
                    </button>
                  </form>
                </div>
              </div>
            </div>

          </div>

          {/* Collapsible Floating Kundali Chart Drawer */}
          {showChartDrawer && (
            <div className="absolute top-16 right-6 w-80 rounded-[8px] border border-white/10 bg-[#161B2B]/95 backdrop-blur-2xl p-4 shadow-2xl z-30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h4 className="font-serif text-xs font-bold text-[#F8FAFC]">
                  {activeBirth.name}&apos;s D1 Kundali
                </h4>
                <button
                  onClick={() => setShowChartDrawer(false)}
                  className="text-xs text-[#94A3B8] hover:text-[#F8FAFC]"
                >
                  ✕ {t.closeChartDrawer}
                </button>
              </div>
              <div className="bg-[#090A10] rounded-[8px] border border-[#E5A93C]/30 p-2">
                <NorthIndianChart
                  chart={activeChart}
                  selectedHouse={highlightedHouse}
                  onSelectHouse={(h) => setHighlightedHouse((prev) => (prev === h ? null : h))}
                />
              </div>
              <p className="text-[10px] text-center text-[#94A3B8]">
                {activeChart.lagna_sign} {t.ascendantLabel} ({activeChart.lagna_degree.toFixed(2)}°)
              </p>
            </div>
          )}

          {/* Collapsible Chat Transcript Drawer */}
          {showTranscriptDrawer && (
            <div className="absolute inset-x-6 top-16 bottom-24 rounded-[8px] border border-white/10 bg-[#161B2B]/95 backdrop-blur-2xl p-6 shadow-2xl z-30 flex flex-col animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <h4 className="font-serif text-xs font-bold text-[#F8FAFC]">
                  Live Consultation History ({messages.length} messages)
                </h4>
                <button
                  onClick={() => setShowTranscriptDrawer(false)}
                  className="text-xs font-semibold text-[#E5A93C] hover:underline"
                >
                  ✕ {t.closeTranscriptDrawer}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-[12px] text-xs ${
                      m.sender === "user"
                        ? "bg-gradient-to-r from-[#E5A93C] to-[#F3C766] text-[#090A10] font-semibold ml-auto max-w-[80%]"
                        : "bg-[#090A10] text-[#F8FAFC] border border-white/10 max-w-[85%]"
                    }`}
                  >
                    <MarkdownRenderer content={m.text} isUser={m.sender === "user"} />
                    <span className="block mt-1 text-[9px] opacity-70">{m.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* =================================================================== */
        /* MODE 2: INTERACTIVE ASTROLOGER DESK VIEW (SPLIT SCREEN VIEW)        */
        /* =================================================================== */
        <div className="flex-1 min-h-0 h-full grid gap-0 lg:grid-cols-[38%_62%] overflow-hidden">
          
          {/* LEFT COLUMN (38% width) - Interactive Kundali Reference & Seeker Context */}
          <aside className="border-r border-white/10 bg-[#0D0F19] p-6 space-y-5 overflow-y-auto h-full min-h-0">
            
            {/* Seeker Profile & D1 Chart Reference Card */}
            <div className="rounded-[8px] border border-white/10 bg-gradient-to-b from-[#161B2B] via-[#121625] to-[#0D0F19] p-5 space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-gradient-to-br from-[#E5A93C] to-[#F3C766] text-[#090A10] flex items-center justify-center font-bold text-xs shadow-md">
                    {activeBirth.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-serif text-sm font-bold text-[#F8FAFC] tracking-wide leading-tight">
                      {activeBirth.name}&apos;s Kundali
                    </h2>
                    <span className="text-[10px] text-[#94A3B8] block">{t.d1SiderealBirthChart}</span>
                  </div>
                </div>
                <span className="rounded-[8px] bg-[#E5A93C]/10 border border-[#E5A93C]/30 text-[#F3C766] px-2.5 py-0.5 text-[10px] font-bold">
                  {activeChart.lagna_sign} {t.ascendantLabel}
                </span>
              </div>
              
              {/* Illuminated North Indian Chart Container */}
              <div className="relative mx-auto w-full max-w-[290px] rounded-[8px] bg-[#090A10] border border-[#E5A93C]/30 p-2.5 shadow-[0_0_25px_rgba(229,169,60,0.08)]">
                <NorthIndianChart
                  chart={activeChart}
                  selectedHouse={highlightedHouse}
                  onSelectHouse={(h) => setHighlightedHouse((prev) => (prev === h ? null : h))}
                />
              </div>
              <p className="text-center text-[10px] text-[#94A3B8]/80 leading-tight">
                {t.tapHouseHelper}
              </p>
            </div>

            {/* Quick Dasha & Active Time Lords Widget */}
            <div className="rounded-[8px] border border-white/10 bg-gradient-to-b from-[#161B2B] to-[#121625] p-4 space-y-3 text-xs shadow-lg">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="font-serif text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                  <span>🪔</span> {t.activeTimeLords}
                </h3>
                <span className="text-[10px] text-[#E5A93C] font-mono font-bold">Vimshottari</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-[8px] bg-[#090A10]/70 border border-white/5 p-2.5 space-y-0.5">
                  <span className="text-[10px] text-[#94A3B8] block uppercase font-medium">{t.mahadashaLabel}</span>
                  <span className="font-serif font-bold text-[#F3C766] text-xs">{mahaLord}</span>
                </div>
                <div className="rounded-[8px] bg-[#090A10]/70 border border-white/5 p-2.5 space-y-0.5">
                  <span className="text-[10px] text-[#94A3B8] block uppercase font-medium">{t.antardashaLabel}</span>
                  <span className="font-serif font-bold text-amber-300 text-xs">{antarLord}</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span>{t.ascendantPlacementLabel}</span>
                <span className="font-mono text-[#F8FAFC] font-semibold">{activeChart.lagna_sign} ({activeChart.lagna_degree.toFixed(2)}°)</span>
              </div>
            </div>

            {/* Suggested Consultations */}
            <div className="space-y-2.5">
              <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <span>💡</span> {t.consultSuggestedTopics}
              </h3>
              <div className="space-y-2">
                {(selectedLanguage === "ne"
                  ? [
                      { icon: "✨", query: "मेरो करियर र नोकरीमा कहिले राम्रो समय आउँछ?" },
                      { icon: "❤️", query: "मेरो विवाह र दाम्पत्य जीवनको विश्लेषण गर्नुहोस्।" },
                      { icon: "🪔", query: `मेरो ${mahaLord} महादशाको लागि के शान्ति उपायहरू छन्?` }
                    ]
                  : selectedLanguage === "hi"
                  ? [
                      { icon: "✨", query: "मेरे करियर और पदोन्नति का सबसे अच्छा समय कब है?" },
                      { icon: "❤️", query: "मेरे विवाह और 7वें भाव का विस्तृत विश्लेषण करें।" },
                      { icon: "🪔", query: `मेरी ${mahaLord} महादशा के लिए कौन से उपाय करने चाहिए?` }
                    ]
                  : [
                      { icon: "✨", query: "When is the strongest period for my career growth?" },
                      { icon: "❤️", query: "Analyze my 7th house for marriage & relationship." },
                      { icon: "🪔", query: `What remedies help my ${mahaLord} Dasha period?` }
                    ]
                ).map((q) => (
                  <button
                    key={q.query}
                    onClick={() => handleSend(q.query)}
                    className="w-full rounded-[8px] border border-white/10 bg-gradient-to-r from-[#161B2B] to-[#121625] p-3 text-left text-xs font-medium text-[#F8FAFC] hover:border-[#E5A93C]/60 hover:text-[#F3C766] hover:shadow-[0_0_15px_rgba(229,169,60,0.15)] transition-all group flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <span className="text-sm">{q.icon}</span>
                      <span className="truncate">{q.query}</span>
                    </span>
                    <span className="text-[#94A3B8] group-hover:text-[#E5A93C] group-hover:translate-x-0.5 transition-transform text-xs shrink-0 ml-2">→</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN (62% width) - Interactive Live Chat Desk */}
          <main className="flex flex-col flex-1 min-h-0 h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#131728] via-[#090A10] to-[#090A10] overflow-hidden">
            
            {/* Streamed Chat Feed */}
            <div ref={chatScrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5 scroll-smooth">
              {messages.map((msg) => (
                <ChatMessageBubble
                  key={msg.id}
                  message={msg}
                  masterAstrologerLabel={t.masterAstrologer}
                  groundedInChartLabel={t.groundedInChart}
                  language={selectedLanguage}
                  onHighlightHouse={(h) => {
                    setHighlightedHouse(h);
                    setShowChartDrawer(true);
                  }}
                />
              ))}

              {/* Thinking / Analyzing Indicator */}
              {isThinking && (
                <div className="flex items-center gap-3 p-4 rounded-[14px] border border-white/10 bg-[#161B2B]/90 backdrop-blur-md max-w-xs animate-pulse">
                  <div className="size-6 rounded-full bg-gradient-to-br from-[#E5A93C] to-[#F3C766] text-[#090A10] flex items-center justify-center font-bold text-xs">
                    <span>🕉️</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#F3C766] font-medium">
                    <span className="size-2 rounded-full bg-[#E5A93C] animate-bounce" />
                    <span className="size-2 rounded-full bg-[#F3C766] animate-bounce delay-150" />
                    <span className="size-2 rounded-full bg-[#E5A93C] animate-bounce delay-300" />
                    <span className="ml-2">{t.analyzingSpeech}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Contextual Smart Follow-Up Chips */}
            <div className="border-t border-[#E5A93C]/20 bg-gradient-to-r from-[#161B2B]/90 via-[#121625]/90 to-[#161B2B]/90 backdrop-blur-xl px-6 py-3 shadow-md relative">
              <div className="flex gap-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden items-center">
                <div className="flex items-center gap-2 shrink-0 pr-1">
                  <span className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#E5A93C]/15 border border-[#E5A93C]/40 px-3 py-1 text-[10px] font-bold text-[#F3C766] shadow-sm uppercase tracking-wider">
                    <span className="size-1.5 rounded-full bg-[#E5A93C] animate-pulse" />
                    {t.suggestedFollowups}
                  </span>
                </div>

                {(selectedLanguage === "ne"
                  ? [
                      { icon: "✨", title: "विदेश यात्रा योग?", query: `के मेरो ${mahaLord} महादशामा विदेश यात्रा वा बसाइँसराइको योग छ?` },
                      { icon: "💎", title: `${activeChart.lagna_sign} को लागि भाग्यशाली रत्न`, query: `मेरो ${activeChart.lagna_sign} लग्नको लागि कुन रत्न उत्तम हुन्छ?` },
                      { icon: "🪔", title: `${mahaLord} दशा शान्ति उपाय`, query: `मेरो ${mahaLord} महादशा सन्तुलन गर्न के उपाय गर्नुपर्छ?` },
                      { icon: "❤️", title: "विवाह र सम्बन्ध योग", query: "मेरो विवाह र दाम्पत्य जीवनको ७औं भाव विश्लेषण गर्नुहोस्।" },
                      { icon: "📈", title: "करियर र धन वृद्धि", query: "मेरो करियरमा कहिले राम्रो सफलता प्राप्त हुन्छ?" },
                    ]
                  : selectedLanguage === "hi"
                  ? [
                      { icon: "✨", title: "विदेश यात्रा का योग?", query: `क्या मेरी ${mahaLord} महादशा में विदेश यात्रा या बसने का योग है?` },
                      { icon: "💎", title: `${activeChart.lagna_sign} के लिए रत्न`, query: `मेरे ${activeChart.lagna_sign} लग्न के लिए कौन सा रत्न शुभ है?` },
                      { icon: "🪔", title: `${mahaLord} दशा के उपाय`, query: `मेरी ${mahaLord} महादशा को संतुलित करने के उपाय बताएं।` },
                      { icon: "❤️", title: "विवाह और वैवाहिक जीवन", query: "मेरे विवाह और 7वें भाव का विस्तृत विश्लेषण करें।" },
                      { icon: "📈", title: "करियर में वृद्धि", query: "मेरे करियर में सबसे अच्छा समय कब आएगा?" },
                    ]
                  : [
                      { icon: "✨", title: "Foreign relocation timing?", query: `Will I travel or relocate abroad during my ${mahaLord} dasha?` },
                      { icon: "💎", title: `Gemstone for ${activeChart.lagna_sign}`, query: `What gemstone is recommended for my ${activeChart.lagna_sign} Ascendant?` },
                      { icon: "🪔", title: `${mahaLord} Dasha remedies`, query: `What remedies help balance my ${mahaLord} period?` },
                      { icon: "❤️", title: "Marriage & compatibility", query: "Analyze my 7th house for marriage & relationship timing." },
                      { icon: "📈", title: "Peak career growth window", query: "When is the strongest period for my career growth?" },
                    ]
                ).map((chip) => (
                  <button
                    key={chip.title}
                    onClick={() => handleSend(chip.query)}
                    className="group shrink-0 flex items-center gap-2 rounded-[8px] border border-white/10 bg-gradient-to-r from-[#090A10]/90 via-[#161B2B]/90 to-[#090A10]/90 px-4 py-1.5 text-xs text-[#F8FAFC] hover:border-[#E5A93C]/80 hover:text-[#F3C766] hover:shadow-[0_0_20px_rgba(229,169,60,0.25)] hover:scale-[1.02] transition-all shadow-md active:scale-95"
                  >
                    <span>{chip.icon}</span>
                    <span className="font-medium">{chip.title}</span>
                    <span className="text-[#94A3B8] group-hover:text-[#E5A93C] group-hover:translate-x-1 transition-transform text-xs ml-0.5">→</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Mic & Message Input Dock */}
            <footer className="border-t border-white/10 bg-[#161B2B]/90 backdrop-blur-xl p-4 shadow-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-3 max-w-4xl mx-auto"
              >
                <button
                  type="button"
                  onClick={() => toggleLiveVoiceMode(true)}
                  className="grid size-11 shrink-0 place-items-center rounded-[8px] border border-[#E5A93C]/50 bg-gradient-to-br from-[#161B2B] to-[#2A1F0D] text-[#F3C766] hover:border-[#E5A93C] hover:shadow-[0_0_20px_rgba(229,169,60,0.3)] transition group"
                  title="Switch to OpenAI Realtime Voice Mode"
                >
                  <svg className="size-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={t.askPlaceholder}
                  className="flex-1 rounded-[8px] border border-white/10 bg-[#090A10] px-4 py-3 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/40 focus:border-[#E5A93C] focus:ring-1 focus:ring-[#E5A93C]/40 focus:outline-none transition"
                />

                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isThinking}
                  className="rounded-[8px] bg-gradient-to-r from-[#E5A93C] to-[#F3C766] hover:from-[#F3C766] hover:to-[#E5A93C] px-6 py-3 text-xs font-bold text-[#090A10] transition shadow-lg disabled:opacity-40"
                >
                  {isThinking ? "..." : t.sendQuery}
                </button>
              </form>
            </footer>
          </main>
        </div>
      )}
    </div>
  );
}
