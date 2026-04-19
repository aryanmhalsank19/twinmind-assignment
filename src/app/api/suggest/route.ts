import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { recent, full, systemPrompt, contextWindow = 2000 } = await req.json();

    const background = full.slice(-contextWindow * 4);

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 900,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: buildUserPrompt(recent, background) },
      ],
    });

    const content = response.choices[0].message.content ?? "{}";
    try {
      return NextResponse.json(JSON.parse(content));
    } catch {
      return NextResponse.json({ suggestions: [] });
    }
  } catch (error) {
    console.error("Suggest API error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}

function buildUserPrompt(recent: string, background: string) {
  return `BACKGROUND (full session): ${background}

RECENT (last ~2 min): ${recent}

Generate 3 suggestions for RIGHT NOW.`;
}
