import { SuggestionBatch, ChatMessage } from "./types";

export function exportSession({
  transcript,
  batches,
  chatHistory,
}: {
  transcript: string[];
  batches: SuggestionBatch[];
  chatHistory: ChatMessage[];
}) {
  const data = {
    exported_at: new Date().toISOString(),
    session_duration_chunks: transcript.length,
    transcript: {
      full_text: transcript.join(" "),
      chunks: transcript.map((text, i) => ({ chunk_index: i, text })),
    },
    suggestion_batches: batches.map((b, i) => ({
      batch_index: i,
      generated_at: b.timestamp,
      suggestion_count: b.suggestions.length,
      suggestions: b.suggestions,
    })),
    chat_history: chatHistory.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
    })),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement("a"), {
    href: url,
    download: `twinmind-${Date.now()}.json`,
  }).click();
  URL.revokeObjectURL(url);
}
