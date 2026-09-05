import { NextResponse } from "next/server";
import type { Chart, BirthDetailsIn } from "@/features/kundali/types";
import { generateDynamicAstrologyReport } from "@/features/kundali/api/report-generator";
import { formatCompleteChartForAI } from "@/features/kundali/api/chart-ai-context";

export async function POST(req: Request) {
  try {
    const { chart, birth, language = "en" }: { chart: Chart; birth: BirthDetailsIn; language?: "en" | "ne" | "hi" } = await req.json();

    if (!chart || !birth) {
      return NextResponse.json({ error: "Missing chart or birth details" }, { status: 400 });
    }

    const apiKey = process.env.AGENT_ROUTER_API_KEY;
    const baseUrl = process.env.AGENT_ROUTER_BASE_URL || "https://agentrouter.org/v1";
    const model = process.env.AGENT_ROUTER_MODEL || "gpt-4o-mini";

    // If API key is available, attempt AgentRouter AI Generation
    if (apiKey) {
      try {
        const fullChartContext = formatCompleteChartForAI(chart, birth);

        const langInstructions: Record<string, string> = {
          en: "Generate the entire report in clear, elegant English.",
          ne: "Generate the entire report in natural, authentic Nepali language (in Devanagari script / नेपाली भाषा). All section titles, subtitles, summaries, paragraphs, and explanations MUST be in authentic Nepali.",
          hi: "Generate the entire report in natural, authentic Hindi language (in Devanagari script / हिन्दी भाषा). All section titles, subtitles, summaries, paragraphs, and explanations MUST be in authentic Hindi."
        };
        const langInstruction = langInstructions[language] || langInstructions.en;

        const systemPrompt = `You are a master Vedic Astrologer (Jyotish Acharya). You analyze astronomical charts (Lagna, Rashi, Nakshatra, House Placements, 16 Vargas, Dashas, Avakhada, Panchang) and generate structured, deeply insightful, high-precision personal astrology reports in JSON format. ${langInstruction}`;

        const userPrompt = `Generate a complete 7-section personalized Vedic Astrology report in JSON format using the complete verified sidereal astronomical birth chart payload below.

Language Requirement: ${langInstruction}

Chart Data:
${fullChartContext}

Respond ONLY with a valid JSON array of 7 ReportSection objects with this exact structure:
[
  {
    "id": "personality",
    "icon": "🌟",
    "title": "Personality & Intellect",
    "subtitle": "Core identity, mindset, and behavioral tendencies",
    "summary": "...",
    "content": ["paragraph 1...", "paragraph 2...", "paragraph 3..."],
    "reasoning": [{"placement": "...", "explanation": "..."}]
  },
  ... (id values: "personality", "strengths-weaknesses", "career-finance", "love-marriage", "travel-spirituality", "current-dasha", "remedies")
]`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const aiResponse = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 2500,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (aiResponse.ok) {
          const resData = await aiResponse.json();
          const rawText = resData.choices?.[0]?.message?.content || "";
          
          // Parse JSON array from response
          const jsonMatch = rawText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsedReport = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsedReport) && parsedReport.length >= 5) {
              return NextResponse.json({ report: parsedReport, source: "agent_router_ai" });
            }
          }
        }
      } catch (aiErr) {
        console.warn("AgentRouter AI endpoint timeout/fallback:", aiErr);
      }
    }

    // Dynamic Astronomical Fallback Synthesizer
    const dynamicReport = generateDynamicAstrologyReport(chart, birth, language);
    return NextResponse.json({ report: dynamicReport, source: "dynamic_astronomy_engine" });

  } catch (err: any) {
    console.error("API /api/v1/report error:", err);
    return NextResponse.json({ error: "Failed to generate report", details: err?.message }, { status: 500 });
  }
}
