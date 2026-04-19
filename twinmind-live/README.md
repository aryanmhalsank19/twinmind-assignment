# TwinMind Live Suggestions

AI-powered real-time meeting copilot that provides live transcription, contextual suggestions, and an interactive chat — all running on Vercel with zero backend servers.

## Live Demo

> Deploy your own instance and add the URL here after running `vercel`.

## Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Add your Groq API key
cp .env.example .env.local
# Edit .env.local and add your key from console.groq.com (free, no card required)

# 3. Run locally
npm run dev

# 4. Deploy to Vercel
npm install -g vercel
vercel
# Add GROQ_API_KEY in Vercel dashboard: Settings → Environment Variables
```

## Stack Choices & Why

| Layer | Solution | Why |
|-------|----------|-----|
| Speech → Text | transformers.js (Whisper Large V3 Turbo) | Runs entirely in the browser via WebWorker — no server, no cost, no latency round-trip |
| LLM: Suggestions | Groq Free Tier (llama-3.1-8b-instant) | 100K tokens/day free, sub-second latency for real-time suggestions |
| LLM: Chat | Groq Free Tier (llama-3.1-70b-versatile) | Bigger model for detailed, substantive chat answers |
| Streaming | Vercel AI SDK (`useChat`) | Built-in SSE streaming with one React hook |
| Deployment | Vercel (free hobby tier) | Zero config, instant deploys, global CDN, Edge Functions |
| State | Session memory only | No database needed — assignment requires no persistence |

## Prompt Strategy

The suggestion quality is the core differentiator. Key design decisions:

**Typed suggestions (5 types):** Without explicit types (`question`, `talking_point`, `answer`, `fact_check`, `clarify`), the model defaults to three near-identical follow-up questions. Types force genuine variety and let the model reason about what's most useful right now.

**Two-layer context:** Each suggestion request sends both a "recent" window (~800 chars of the last ~2 minutes) for relevance and a "background" window (2000 chars of the full transcript) to prevent context amnesia on long meetings.

**Self-contained previews:** The prompt requires each preview to deliver real insight without clicking. This prevents lazy outputs like "Click to learn more about pricing" and forces substantive reasoning in every card.

**JSON response format:** Using `response_format: { type: "json_object" }` adds ~80ms but eliminates JSON parse failures entirely. No retries needed for malformed output.

**Separate `detail_prompt` field:** The card preview text and the chat query are different. Clicking sends a well-formed question optimized for the chat model, not just the preview text.

## Tradeoffs

**Whisper.js vs server-side Whisper:** In-browser Whisper means zero transcription costs and no server dependency, but the initial model download is ~150MB (cached after first load). Server-side would give faster cold starts but requires Python infrastructure.

**Free tier limits:** Groq's free tier provides 100K tokens/day — enough for extended meeting sessions but not unlimited. For production, a paid tier would be needed.

**Model choices:** llama-3.1-8b-instant for suggestions (speed matters for real-time feel) vs llama-3.1-70b-versatile for chat (quality matters for detailed answers). This is the optimal speed/quality tradeoff.

**No persistence:** Sessions are in-memory only. The JSON export feature compensates by letting users save complete session data including transcript, all suggestion batches, and chat history.

## What I Would Improve With More Time

- **Speaker diarization** — identify different speakers in the transcript
- **Suggestion deduplication** — detect and filter near-duplicate suggestions across batches
- **Confidence scores** on fact-check suggestions
- **Keyboard shortcuts** — space to toggle recording, number keys to select suggestions
- **Mobile-optimized layout** — collapsible columns for small screens
- **Webhook integrations** — send suggestions to Slack/Teams in real-time
- **Custom model selection** — let users choose between available Groq models

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main 3-column UI
│   └── api/
│       ├── suggest/route.ts    # Edge: suggestion generation
│       └── chat/route.ts       # Edge: streaming chat
├── components/
│   ├── TranscriptPanel.tsx     # Column 1: mic + transcript
│   ├── SuggestionsPanel.tsx    # Column 2: live suggestions
│   ├── ChatPanel.tsx           # Column 3: streaming chat
│   ├── SuggestionCard.tsx      # Individual suggestion card
│   ├── SettingsModal.tsx       # Settings with prompt editing
│   └── StatusBar.tsx           # Top bar with title + gear
├── hooks/
│   ├── useWhisper.ts           # In-browser Whisper via WebWorker
│   └── useRecorder.ts          # MediaRecorder + 30s chunking
└── lib/
    ├── prompts.ts              # All prompt strings + defaults
    ├── types.ts                # TypeScript interfaces
    └── export.ts               # JSON session export
```
