import { NextRequest } from "next/server";
import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";

export const runtime = "edge";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { messages, system } = await req.json();

  const result = streamText({
    model: groq("llama-3.1-70b-versatile"),
    system,
    messages,
    maxOutputTokens: 1500,
    temperature: 0.5,
  });

  return result.toUIMessageStreamResponse();
}
