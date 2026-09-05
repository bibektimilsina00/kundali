import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY environment variable is not configured" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get("file") as File;
    const language = (formData.get("language") as string) || "";

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const whisperFormData = new FormData();
    whisperFormData.append("file", audioFile, "speech.webm");
    whisperFormData.append("model", "whisper-1");
    if (language) {
      whisperFormData.append("language", language);
    }

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: whisperFormData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI Whisper Transcription Error:", errText);
      return NextResponse.json({ error: errText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text });
  } catch (err: any) {
    console.error("Transcribe API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
