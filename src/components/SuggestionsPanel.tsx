"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import SuggestionCard from "./SuggestionCard";
import { SuggestionBatch } from "@/lib/types";
import { Settings } from "@/lib/prompts";

interface SuggestionsPanelProps {
  batches: SuggestionBatch[];
  setBatches: React.Dispatch<React.SetStateAction<SuggestionBatch[]>>;
  transcript: string[];
  settings: Settings;
  isRecording: boolean;
  onSuggestionClick: (detailPrompt: string) => void;
}

function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = (seconds / total) * circumference;

  return (
    <svg width="28" height="28" viewBox="0 0 28 28" className="transform -rotate-90">
      <circle
        cx="14" cy="14" r={radius}
        fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2"
      />
      <circle
        cx="14" cy="14" r={radius}
        fill="none" stroke="rgba(59,130,246,0.4)" strokeWidth="2"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-linear"
      />
      <text
        x="14" y="14"
        textAnchor="middle" dominantBaseline="central"
        className="fill-gray-500 transform rotate-90 origin-center"
        style={{ fontSize: "8px", fontWeight: 600, transformOrigin: "14px 14px" }}
      >
        {seconds}
      </text>
    </svg>
  );
}

export default function SuggestionsPanel({
  batches,
  setBatches,
  transcript,
  settings,
  isRecording,
  onSuggestionClick,
}: SuggestionsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(settings.autoRefreshInterval);
  const [error, setError] = useState<string | null>(null);
  const countdownRef = useRef(settings.autoRefreshInterval);

  const refreshSuggestions = useCallback(async () => {
    if (transcript.length === 0) return;

    setLoading(true);
    setError(null);

    const fullText = transcript.join(" ");
    const recent = fullText.slice(-settings.recentWindowChars);

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recent,
          full: fullText,
          systemPrompt: settings.suggestionsSystemPrompt,
          contextWindow: settings.suggestionsContextWindow,
        }),
      });

      const data = await res.json();

      if (data.suggestions?.length) {
        setBatches((prev) => [
          {
            id: Date.now(),
            suggestions: data.suggestions,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch (err) {
      setError("Failed to generate suggestions. Check your API key.");
      console.error("Suggestion refresh error:", err);
    }

    setLoading(false);
    countdownRef.current = settings.autoRefreshInterval;
    setCountdown(settings.autoRefreshInterval);
  }, [transcript, settings, setBatches]);

  useEffect(() => {
    if (!isRecording) return;

    const id = setInterval(() => {
      countdownRef.current -= 1;
      setCountdown(countdownRef.current);

      if (countdownRef.current <= 0) {
        refreshSuggestions();
      }
    }, 1000);

    return () => clearInterval(id);
  }, [isRecording, refreshSuggestions]);

  useEffect(() => {
    countdownRef.current = settings.autoRefreshInterval;
    setCountdown(settings.autoRefreshInterval);
  }, [settings.autoRefreshInterval]);

  return (
    <div className="glass-panel flex flex-col rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles size={14} className="text-purple-400" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
            Suggestions
          </h2>
          {batches.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 font-medium">
              {batches.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isRecording && (
            <CountdownRing seconds={countdown} total={settings.autoRefreshInterval} />
          )}
          <button
            onClick={refreshSuggestions}
            disabled={loading || transcript.length === 0}
            className="group p-2 rounded-xl hover:bg-white/5 transition-all duration-300 disabled:opacity-30"
            title="Refresh suggestions"
          >
            <RefreshCw
              size={14}
              className={`text-gray-500 group-hover:text-gray-300 transition-all duration-300 ${
                loading ? "animate-spin" : "group-hover:rotate-90"
              }`}
              style={{ transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), color 0.3s" }}
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 min-h-0">
        {error && (
          <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-3 animate-fade-slide-up">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-white/5 p-4 animate-fade-slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg shimmer-skeleton" />
                  <div className="h-3 w-12 rounded shimmer-skeleton" />
                </div>
                <div className="h-3 w-full rounded shimmer-skeleton mb-2" />
                <div className="h-3 w-3/4 rounded shimmer-skeleton" />
              </div>
            ))}
          </div>
        )}

        {/* Empty states */}
        {!loading && batches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/5 flex items-center justify-center">
              <Sparkles size={18} className="text-gray-600" />
            </div>
            <p className="text-xs text-gray-600 text-center leading-relaxed max-w-48">
              {transcript.length === 0
                ? "Start recording to receive AI-powered suggestions"
                : "Tap refresh or wait for auto-generation"}
            </p>
          </div>
        )}

        {/* Suggestion batches */}
        {batches.map((batch, batchIndex) => (
          <div key={batch.id}>
            {batchIndex > 0 && (
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <span className="text-[9px] text-gray-700 font-medium uppercase tracking-widest shrink-0">
                  Earlier
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              </div>
            )}
            <div className="space-y-2.5">
              {batch.suggestions.map((suggestion, i) => (
                <SuggestionCard
                  key={`${batch.id}-${i}`}
                  suggestion={suggestion}
                  onClick={() => onSuggestionClick(suggestion.detail_prompt)}
                  faded={batchIndex > 0}
                  index={i}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
