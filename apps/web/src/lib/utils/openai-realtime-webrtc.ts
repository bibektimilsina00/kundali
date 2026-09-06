import { authHeaders } from "@/features/auth/store/auth-store";
import type { Chart, BirthDetailsIn } from "@/features/kundali/types";

export type RealtimeWebRTCCallbacks = {
  onStateChange?: (state: "connecting" | "connected" | "speaking" | "listening" | "disconnected") => void;
  onTranscriptDelta?: (delta: string) => void;
  onTranscriptComplete?: (text: string) => void;
  onUserTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  onDebugLog?: (event: string, detail: string) => void;
};

export class OpenAIRealtimeWebRTCClient {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private mediaStream: MediaStream | null = null;
  private remoteAudioEl: HTMLAudioElement | null = null;
  private callbacks: RealtimeWebRTCCallbacks;
  private isConnected: boolean = false;
  private currentAssistantTranscript: string = "";
  private currentUserTranscript: string = "";

  constructor(callbacks: RealtimeWebRTCCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public async connect(chart: Chart, birth: BirthDetailsIn, language: "en" | "ne" | "hi" = "en", voice: string = "ash"): Promise<boolean> {
    try {
      this.callbacks.onStateChange?.("connecting");
      this.callbacks.onDebugLog?.("WEBRTC_INIT", `Requesting ephemeral session key from /api/v1/realtime-session (${language.toUpperCase()}, voice: ${voice})`);

      // 1. Fetch Ephemeral Session Token from Next.js server
      const tokenRes = await fetch("/api/v1/realtime-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ chart, birth, language, voice }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.client_secret) {
        this.callbacks.onDebugLog?.("WEBRTC_UNAVAILABLE", tokenData.error || tokenData.detail || "Realtime ephemeral key not available");
        return false;
      }

      const clientSecret = tokenData.client_secret;
      const model = tokenData.model || "gpt-4o-realtime-preview-2024-12-17";
      this.callbacks.onDebugLog?.("WEBRTC_KEY_GRANTED", `Received OpenAI Realtime ephemeral client token for ${model}`);

      // 2. Setup RTCPeerConnection
      const pc = new RTCPeerConnection();
      this.pc = pc;

      // 3. Audio Player for Remote Astrologer Voice
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      this.remoteAudioEl = audioEl;

      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
        this.callbacks.onDebugLog?.("WEBRTC_REMOTE_TRACK", "Received OpenAI native WebRTC audio stream track");
      };

      // 4. Capture Local Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaStream = stream;
      pc.addTrack(stream.getTracks()[0]);
      this.callbacks.onDebugLog?.("WEBRTC_LOCAL_MIC", "Added local microphone track to PeerConnection");

      // 5. Setup Data Channel for Event Telemetry
      const dc = pc.createDataChannel("oai-events");
      this.dc = dc;

      dc.addEventListener("open", () => {
        this.callbacks.onDebugLog?.("WEBRTC_DATACHANNEL_OPEN", "OpenAI Realtime DataChannel established");
      });

      dc.addEventListener("message", (e) => {
        try {
          const event = JSON.parse(e.data);
          this.handleRealtimeEvent(event);
        } catch (err) {}
      });

      // 6. Create WebRTC Offer SDP
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";

      this.callbacks.onDebugLog?.("WEBRTC_SDP_OFFER", `Exchanging SDP offer with OpenAI WebRTC gateway (${model})`);

      const sdpRes = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${clientSecret}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpRes.ok) {
        const sdpErr = await sdpRes.text();
        this.callbacks.onDebugLog?.("WEBRTC_SDP_FAIL", `OpenAI Realtime SDP Exchange failed: ${sdpErr}`);
        return false;
      }

      const sdpAnswerText = await sdpRes.text();
      const answer: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: sdpAnswerText,
      };

      await pc.setRemoteDescription(answer);
      this.isConnected = true;
      this.callbacks.onStateChange?.("connected");
      this.callbacks.onDebugLog?.("WEBRTC_CONNECTED", "WebRTC PeerConnection Connected to OpenAI Realtime Gateway");
      return true;
    } catch (err: any) {
      this.callbacks.onDebugLog?.("WEBRTC_ERROR", err?.message || String(err));
      this.callbacks.onError?.(err?.message || "WebRTC connection failed");
      this.disconnect();
      return false;
    }
  }

  private handleRealtimeEvent(event: any) {
    if (!event || !event.type) return;

    // Handle Assistant Speech Transcript Deltas
    if (event.type === "response.audio_transcript.delta") {
      this.callbacks.onStateChange?.("speaking");
      this.currentAssistantTranscript += event.delta || "";
      this.callbacks.onTranscriptDelta?.(event.delta);
    } else if (event.type === "response.audio_transcript.done") {
      this.callbacks.onTranscriptComplete?.(this.currentAssistantTranscript);
      this.callbacks.onDebugLog?.("WEBRTC_AI_SPEECH_DONE", `Completed turn: "${this.currentAssistantTranscript}"`);
      this.currentAssistantTranscript = "";
      this.callbacks.onStateChange?.("listening");
    }

    // Handle User Speech Transcript
    if (event.type === "conversation.item.input_audio_transcription.completed") {
      const userText = event.transcript || "";
      this.currentUserTranscript = userText;
      this.callbacks.onUserTranscript?.(userText);
      this.callbacks.onDebugLog?.("WEBRTC_USER_SPEECH_DONE", `User spoke: "${userText}"`);
    }

    if (event.type === "input_audio_buffer.speech_started") {
      this.callbacks.onStateChange?.("listening");
      this.callbacks.onDebugLog?.("WEBRTC_VAD_SPEECH_START", "OpenAI Server VAD detected user speech start");
    }
  }

  public sendTextMessage(text: string) {
    if (!this.dc || this.dc.readyState !== "open") return;
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }],
      },
    };
    this.dc.send(JSON.stringify(event));
    this.dc.send(JSON.stringify({ type: "response.create" }));
  }

  public disconnect() {
    this.isConnected = false;
    if (this.dc) {
      try { this.dc.close(); } catch (e) {}
      this.dc = null;
    }
    if (this.pc) {
      try { this.pc.close(); } catch (e) {}
      this.pc = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.remoteAudioEl) {
      this.remoteAudioEl.pause();
      this.remoteAudioEl.srcObject = null;
      this.remoteAudioEl = null;
    }
    this.callbacks.onStateChange?.("disconnected");
    this.callbacks.onDebugLog?.("WEBRTC_DISCONNECTED", "OpenAI Realtime WebRTC Session Closed");
  }
}
