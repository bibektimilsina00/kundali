import { NextResponse } from "next/server";
import { buildAstrologerRealtimePrompt } from "@/features/kundali/api/astrologer-prompt";
import type { Chart, BirthDetailsIn } from "@/features/kundali/types";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY environment variable is not configured" },
        { status: 500 }
      );
    }

    let bodyData: { chart?: Chart; birth?: BirthDetailsIn; language?: "en" | "ne" | "hi"; voice?: string } = {};
    try {
      bodyData = await req.json();
    } catch (e) {}

    const { chart, birth, language = "en", voice = "ash" } = bodyData;
    const selectedVoice = voice && ["onyx", "ash", "sage", "coral", "echo", "alloy", "shimmer", "ballad", "verse"].includes(voice) ? voice : "ash";
    const systemPrompt = buildAstrologerRealtimePrompt(chart as any, birth as any, language);

    const candidateModels = [
      "gpt-4o-mini-realtime-preview-2024-12-17",
      "gpt-4o-realtime-preview-2024-12-17",
      "gpt-4o-realtime-preview",
      "gpt-4o-mini-realtime-preview",
    ];

    let lastErrorDetail = "";

    // Try candidate models in order
    for (const model of candidateModels) {
      try {
        const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "realtime=v1",
          },
          body: JSON.stringify({
            model,
            voice: selectedVoice,
            instructions: systemPrompt,
            input_audio_transcription: {
              model: "whisper-1",
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 600,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            client_secret: data.client_secret?.value,
            model,
            session: data,
            instructions: systemPrompt,
          });
        }

        // Try minimal payload for this candidate model
        const retryResponse = await fetch("https://api.openai.com/v1/realtime/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "realtime=v1",
          },
          body: JSON.stringify({
            model,
            voice: selectedVoice,
            instructions: systemPrompt,
          }),
        });

        if (retryResponse.ok) {
          const data = await retryResponse.json();
          return NextResponse.json({
            client_secret: data.client_secret?.value,
            model,
            session: data,
            instructions: systemPrompt,
          });
        }

        lastErrorDetail = await retryResponse.text();
      } catch (err: any) {
        lastErrorDetail = err?.message || String(err);
      }
    }

    console.warn("OpenAI Realtime Sessions unavailable on candidate models:", lastErrorDetail);

    // Return a clean fallback response so the client gracefully uses Whisper + MediaRecorder
    return NextResponse.json(
      {
        error: "OpenAI Realtime API unavailable on this API key tier",
        detail: lastErrorDetail,
        fallback: "media_recorder_whisper",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Realtime session route error:", err);
    return NextResponse.json({ error: err.message, fallback: "media_recorder_whisper" }, { status: 200 });
  }
}
