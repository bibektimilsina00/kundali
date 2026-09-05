import { NextResponse } from "next/server";
import type { Chart, BirthDetailsIn } from "@/features/kundali/types";
import { formatCompleteChartForAI } from "@/features/kundali/api/chart-ai-context";

export async function POST(req: Request) {
  try {
    const {
      query,
      messages = [],
      chart,
      birth,
      language = "en",
    }: {
      query: string;
      messages: any[];
      chart: Chart;
      birth: BirthDetailsIn;
      language?: "en" | "ne" | "hi";
    } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.AGENT_ROUTER_API_KEY;
    const baseUrl = process.env.OPENAI_API_KEY
      ? "https://api.openai.com/v1"
      : process.env.AGENT_ROUTER_BASE_URL || "https://agentrouter.org/v1";
    const model = process.env.OPENAI_API_KEY ? "gpt-4o-mini" : process.env.AGENT_ROUTER_MODEL || "gpt-4o-mini";

    // Complete Sidereal Astronomical Chart Context Payload
    const fullChartContext = formatCompleteChartForAI(chart, birth);
    const lagnaSign = chart?.lagna_sign || "Cancer";
    const lagnaDegree = chart?.lagna_degree?.toFixed(2) || "0.00";

    const langInstructions: Record<string, string> = {
      en: "Respond ENTIRELY in English.",
      ne: "Respond ENTIRELY in fluent, authentic Nepali (नेपाली भाषा) using standard Devanagari script (देवनागरी लिपि). Use polite, respectful Nepali terms appropriate for a Master Astrologer (e.g., tapai/tapaiko).",
      hi: "Respond ENTIRELY in fluent, authentic Hindi (हिन्दी भाषा) using standard Devanagari script (देवनागरी लिपि). Use respectful Hindi terms appropriate for a Master Astrologer (e.g., aap/aapki kundali).",
    };

    const targetLangInstruction = langInstructions[language] || langInstructions.en;

    const systemPrompt = `You are KUNDALI.AI's Master Astrologer (Jyotish Acharya), conducting a live 1-on-1 consultation with ${birth?.name || "the seeker"}.

You have complete access to the seeker's entire verified sidereal astronomical birth chart and divisional calculations below:

${fullChartContext}

Guidelines:
1. Speak naturally as a wise, grounded, authentic Vedic Astrologer (Jyotish Acharya).
2. NEVER say you are an "AI text assistant" or "large language model".
3. LANGUAGE INSTRUCTION (CRITICAL): ${targetLangInstruction}
4. ADAPT YOUR RESPONSE LENGTH DYNAMICALLY BASED ON USER INTENT:
   - If the user asks for "detail", "in detail", "thorough analysis", "explain deeply", "comprehensive", or asks a multi-faceted question, provide a detailed, multi-paragraph astrological reading analyzing house placements, planetary lords, dasha timelines, and Vedic remedies.
   - For short or simple questions, provide a clear, warm 2-4 sentence explanation.
5. Ground your insights directly in their real chart placements, planets, houses, and dashas.
6. Include an "astrologicalBasis" tag string (e.g., "10th House Virgo · Exalted Mercury in D1 & D9").
7. Specify a "highlightHouse" number (1-12) if your answer references a specific house in their chart.

Respond ONLY in valid JSON format:
{
  "text": "Your answer string here...",
  "astrologicalBasis": "10th House Virgo · Exalted Mercury",
  "highlightHouse": 10
}`;

    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const formattedMessages = [
          { role: "system", content: systemPrompt },
          ...messages.slice(-6).map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
          { role: "user", content: query },
        ];

        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          },
          body: JSON.stringify({
            model: model,
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 1000,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const resData = await response.json();
          const rawContent = resData.choices?.[0]?.message?.content || "";
          const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return NextResponse.json({
              text: parsed.text,
              astrologicalBasis: parsed.astrologicalBasis || `${lagnaSign} Ascendant · Active Transits`,
              highlightHouse: parsed.highlightHouse || null,
            });
          }
        }
      } catch (aiErr) {
        console.warn("AgentRouter Chat AI fallback:", aiErr);
      }
    }

    // Dynamic Rule Fallback if AI endpoint is offline
    const defaultText = `Based on your ${lagnaSign} Ascendant (${lagnaDegree}°), your chart establishes strong analytical strength. Under your active transits, key opportunities align with purposeful strategic execution.`;
    return NextResponse.json({
      text: defaultText,
      astrologicalBasis: `${lagnaSign} Ascendant (${lagnaDegree}°)`,
      highlightHouse: 10,
    });

  } catch (err: any) {
    console.error("API /api/v1/chat error:", err);
    return NextResponse.json({ error: "Failed to process astrologer chat", details: err?.message }, { status: 500 });
  }
}
