import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const runtime = "nodejs";

const CACHE_DIR = path.join(process.cwd(), "public", "audio-cache");

function getCacheFileName(voice: string, lang: string, text: string): string {
  const hash = crypto
    .createHash("sha256")
    .update(`${voice}_${lang}_${text.trim()}`)
    .digest("hex")
    .slice(0, 20);
  const safeVoice = voice.replace(/[^a-zA-Z0-9]/g, "");
  const safeLang = lang.replace(/[^a-zA-Z0-9]/g, "");
  return `${safeVoice}_${safeLang}_${hash}.mp3`;
}

function splitTextIntoSentences(text: string, maxLen = 180): string[] {
  const clean = text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/([0-9]+)°([0-9]*)/g, "$1 degrees $2 minutes")
    .replace(/°/g, " degrees ")
    .replace(/%/g, " percent ")
    .replace(/[\r\n]+/g, " ")
    .trim();

  if (clean.length <= maxLen) return [clean];

  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).length > maxLen) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current += " " + sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks;
}

async function fetchAudioBuffer(chunk: string, lang = "en-US"): Promise<Buffer> {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
    chunk
  )}&tl=${lang}&client=tw-ob`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch audio chunk HTTP ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(req: Request) {
  try {
    const { text, lang, language, voice }: { text: string; lang?: string; language?: string; voice?: string } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Missing text string for audio synthesis" }, { status: 400 });
    }

    const targetLangCode =
      lang || (language === "ne" ? "ne-NP" : language === "hi" ? "hi-IN" : "en-US");

    const selectedVoice = voice && ["onyx", "ash", "sage", "coral", "echo", "alloy", "shimmer", "ballad", "verse"].includes(voice) ? voice : "onyx";

    let spokenText = text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/([0-9]+)°([0-9]*)/g, "$1 degrees $2 minutes")
      .replace(/°/g, " degrees ")
      .trim();

    // Check disk cache first to avoid re-generating audio and save cost
    const fileName = getCacheFileName(selectedVoice, targetLangCode, spokenText);
    const filePath = path.join(CACHE_DIR, fileName);
    const publicAudioUrl = `/audio-cache/${fileName}`;

    if (fs.existsSync(filePath)) {
      return NextResponse.json({
        audioUrl: publicAudioUrl,
        spokenText,
        status: "cached",
        source: `disk_cache_${selectedVoice}`,
      });
    }

    // Ensure audio cache directory exists
    if (!fs.existsSync(CACHE_DIR)) {
      try {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
      } catch (err) {
        console.warn("Could not create audio cache directory:", err);
      }
    }

    let combinedBuffer: Buffer | null = null;
    let audioSource = `openai_tts_${selectedVoice}`;

    // Use OpenAI Audio Speech API if OPENAI_API_KEY is available for hyper-realistic human voice
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (openaiApiKey) {
      try {
        const speechRes = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "tts-1",
            input: spokenText.slice(0, 4000),
            voice: selectedVoice,
            speed: 1.0,
          }),
        });

        if (speechRes.ok) {
          const arrayBuffer = await speechRes.arrayBuffer();
          combinedBuffer = Buffer.from(arrayBuffer);
        }
      } catch (e) {
        console.warn("OpenAI TTS speech synthesis error, using fallback engine:", e);
      }
    }

    // If OpenAI API didn't produce a buffer (or no key), use fallback engine
    if (!combinedBuffer) {
      audioSource = "google_tts_fallback";
      const chunks = splitTextIntoSentences(spokenText, 170);
      const buffers = await Promise.all(
        chunks.map((chunk) => fetchAudioBuffer(chunk, targetLangCode))
      );
      combinedBuffer = Buffer.concat(buffers);
    }

    // Save audio buffer to disk cache for all future requests
    if (combinedBuffer && fs.existsSync(CACHE_DIR)) {
      try {
        fs.writeFileSync(filePath, combinedBuffer);
        return NextResponse.json({
          audioUrl: publicAudioUrl,
          spokenText,
          status: "ready",
          source: audioSource,
        });
      } catch (err) {
        console.warn("Could not write audio to disk cache:", err);
      }
    }

    // Fallback data URL response if disk writing was unavailable
    const base64Audio = combinedBuffer ? combinedBuffer.toString("base64") : "";
    const dataUrl = `data:audio/mp3;base64,${base64Audio}`;

    return NextResponse.json({
      audioUrl: dataUrl,
      spokenText,
      status: "ready",
      source: audioSource,
    });

  } catch (err: any) {
    console.error("API /api/v1/tts error:", err);
    return NextResponse.json({ error: "TTS audio synthesis failed", details: err?.message }, { status: 500 });
  }
}
