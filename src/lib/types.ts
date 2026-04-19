export interface Suggestion {
  type: "question" | "talking_point" | "answer" | "fact_check" | "clarify";
  preview: string;
  detail_prompt: string;
}

export interface SuggestionBatch {
  id: number;
  suggestions: Suggestion[];
  timestamp: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
