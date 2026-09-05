import { NextResponse } from "next/server";
import type { Chart, BirthDetailsIn } from "@/features/kundali/types";
import { buildAstrologerSystemPrompt } from "@/features/kundali/api/astrologer-prompt";

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

    const lagnaSign = chart?.lagna_sign || "Cancer";
    const lagnaDegree = chart?.lagna_degree?.toFixed(2) || "0.00";

    const systemPrompt = buildAstrologerSystemPrompt(chart, birth, language);

    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

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
            max_tokens: 1800,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const resData = await response.json();
          const rawContent = resData.choices?.[0]?.message?.content || "";
          
          try {
            const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              return NextResponse.json({
                text: parsed.text,
                astrologicalBasis: parsed.astrologicalBasis || `${lagnaSign} Ascendant · Active Transits`,
                highlightHouse: parsed.highlightHouse || null,
              });
            }
          } catch (pErr) {
            // Fallback if JSON parse fails due to markdown quotes
            return NextResponse.json({
              text: rawContent,
              astrologicalBasis: `${lagnaSign} Ascendant · Vedic Reading`,
              highlightHouse: 10,
            });
          }

          if (rawContent.trim()) {
            return NextResponse.json({
              text: rawContent,
              astrologicalBasis: `${lagnaSign} Ascendant · Vedic Reading`,
              highlightHouse: 10,
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
