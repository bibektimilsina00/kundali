import { NextResponse } from "next/server";

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

    let spokenText = text;

    // Use OpenAI Audio Speech API if OPENAI_API_KEY is available for hyper-realistic human voice
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (openaiApiKey) {
      try {
        const cleanForSpeech = text
          .replace(/\*\*/g, "")
          .replace(/\*/g, "")
          .replace(/#/g, "")
          .replace(/```[\s\S]*?```/g, "")
          .replace(/([0-9]+)°([0-9]*)/g, "$1 degrees $2 minutes")
          .replace(/°/g, " degrees ")
          .trim();

        const selectedVoice = voice && ["onyx", "ash", "sage", "coral", "echo", "alloy", "shimmer", "ballad", "verse"].includes(voice) ? voice : "onyx";

        const speechRes = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "tts-1",
            input: cleanForSpeech.slice(0, 4000),
            voice: selectedVoice,
            speed: 1.0,
          }),
        });

        if (speechRes.ok) {
          const arrayBuffer = await speechRes.arrayBuffer();
          const combinedBuffer = Buffer.from(arrayBuffer);
          const base64Audio = combinedBuffer.toString("base64");
          const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

          return NextResponse.json({
            audioUrl,
            spokenText: cleanForSpeech,
            status: "ready",
            source: `openai_tts_${selectedVoice}`,
          });
        }
      } catch (e) {
        console.warn("OpenAI TTS speech synthesis error, using fallback engine:", e);
      }
    }

    // Split spoken text into audio chunks for fallback engine
    const chunks = splitTextIntoSentences(spokenText, 170);

    // Fetch MP3 audio buffers in parallel
    const buffers = await Promise.all(
      chunks.map((chunk) => fetchAudioBuffer(chunk, targetLangCode))
    );

    // Combine audio buffers into a single MP3 stream
    const combinedBuffer = Buffer.concat(buffers);
    const base64Audio = combinedBuffer.toString("base64");
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

    return NextResponse.json({
      audioUrl,
      spokenText,
      status: "ready",
      source: "google_tts_fallback",
    });

  } catch (err: any) {
    console.error("API /api/v1/tts error:", err);
    return NextResponse.json({ error: "TTS audio synthesis failed", details: err?.message }, { status: 500 });
  }
}
