"use client";

import { useState, useRef, useEffect, useImperativeHandle, forwardRef, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, MessageSquare, Bot, User } from "lucide-react";
import { Settings } from "@/lib/prompts";

interface ChatPanelProps {
  transcript: string[];
  settings: Settings;
}

export interface ChatPanelRef {
  sendMessage: (content: string) => void;
  getChatHistory: () => { role: "user" | "assistant"; content: string; timestamp: string }[];
}

function getMessageText(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text)
    .join("");
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-blue-400/60"
          style={{
            animation: `breathe 1.2s ease-in-out infinite ${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

const ChatPanel = forwardRef<ChatPanelRef, ChatPanelProps>(
  ({ transcript, settings }, ref) => {
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const fullTranscript = transcript.join(" ");
    const contextSlice = fullTranscript.slice(-settings.chatContextWindow);

    const systemPrompt = useMemo(
      () => `${settings.chatSystemPrompt}\n\nTRANSCRIPT CONTEXT:\n${contextSlice}`,
      [settings.chatSystemPrompt, contextSlice]
    );

    const transport = useMemo(
      () =>
        new DefaultChatTransport({
          api: "/api/chat",
          body: { system: systemPrompt },
        }),
      [systemPrompt]
    );

    const { messages, sendMessage, status } = useChat({ transport });

    const isLoading = status === "submitted" || status === "streaming";

    useImperativeHandle(ref, () => ({
      sendMessage: (content: string) => {
        sendMessage({ text: content });
      },
      getChatHistory: () =>
        messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            role: m.role as "user" | "assistant",
            content: getMessageText(m.parts),
            timestamp: new Date().toISOString(),
          })),
    }));

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages, status]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      sendMessage({ text: input });
      setInput("");
    };

    return (
      <div className="glass-panel flex flex-col rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-2.5">
          <MessageSquare size={14} className="text-cyan-400" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
            Chat
          </h2>
          {messages.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 font-medium">
              {messages.length}
            </span>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-3 space-y-4 min-h-0">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-white/5 flex items-center justify-center">
                <Bot size={18} className="text-gray-600" />
              </div>
              <p className="text-xs text-gray-600 text-center leading-relaxed max-w-52">
                Click a suggestion card or ask anything about your meeting
              </p>
            </div>
          )}

          {messages.map((m, i) => {
            const text = getMessageText(m.parts);
            const isUser = m.role === "user";

            return (
              <div
                key={m.id}
                className={`flex gap-2.5 animate-fade-slide-up ${isUser ? "flex-row-reverse" : ""}`}
                style={{ animationDelay: `${Math.min(i * 30, 150)}ms` }}
              >
                {/* Avatar */}
                <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                  isUser
                    ? "bg-gradient-to-br from-blue-500/20 to-blue-600/20"
                    : "bg-gradient-to-br from-purple-500/20 to-cyan-500/20"
                }`}>
                  {isUser ? (
                    <User size={12} className="text-blue-400" />
                  ) : (
                    <Bot size={12} className="text-purple-400" />
                  )}
                </div>

                {/* Message bubble */}
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-[13px] leading-[1.7] ${
                    isUser
                      ? "bg-gradient-to-br from-blue-500/15 to-blue-600/10 border border-blue-500/10 text-gray-200"
                      : "bg-white/[0.02] border border-white/5 text-gray-300"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{text}</div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {status === "submitted" && (
            <div className="flex gap-2.5 animate-fade-slide-up">
              <div className="shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                <Bot size={12} className="text-purple-400" />
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl">
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="px-4 pb-4 pt-2">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the meeting..."
              className="w-full bg-white/[0.03] border border-white/[0.06] text-sm text-gray-200 rounded-xl px-4 py-3 pr-12 outline-none focus:border-blue-500/30 focus:bg-white/[0.04] focus:shadow-[0_0_20px_rgba(59,130,246,0.08)] placeholder:text-gray-600 transition-all duration-300"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 transition-all duration-300 text-white shadow-lg shadow-blue-500/20 disabled:shadow-none hover:shadow-blue-500/30"
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      </div>
    );
  }
);

ChatPanel.displayName = "ChatPanel";
export default ChatPanel;
