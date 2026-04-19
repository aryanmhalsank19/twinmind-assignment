"use client";

import { Suggestion } from "@/lib/types";
import { HelpCircle, Lightbulb, CheckCircle2, AlertTriangle, Search } from "lucide-react";

const TYPE_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    glowClass: string;
    icon: typeof HelpCircle;
  }
> = {
  question: {
    label: "Ask",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/15",
    glowClass: "glow-blue",
    icon: HelpCircle,
  },
  talking_point: {
    label: "Raise",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/15",
    glowClass: "glow-purple",
    icon: Lightbulb,
  },
  answer: {
    label: "Answer",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/15",
    glowClass: "glow-green",
    icon: CheckCircle2,
  },
  fact_check: {
    label: "Verify",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/15",
    glowClass: "glow-yellow",
    icon: AlertTriangle,
  },
  clarify: {
    label: "Clarify",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/15",
    glowClass: "glow-orange",
    icon: Search,
  },
};

interface SuggestionCardProps {
  suggestion: Suggestion;
  onClick: () => void;
  faded?: boolean;
  index?: number;
}

export default function SuggestionCard({
  suggestion,
  onClick,
  faded,
  index = 0,
}: SuggestionCardProps) {
  const cfg = TYPE_CONFIG[suggestion.type] ?? TYPE_CONFIG.question;
  const Icon = cfg.icon;

  return (
    <div
      onClick={onClick}
      className={`
        group relative cursor-pointer rounded-xl border p-4
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:bg-white/[0.04]
        active:scale-[0.98]
        ${cfg.borderColor}
        ${faded ? "opacity-30 hover:opacity-50" : "opacity-100"}
        ${!faded ? cfg.glowClass : ""}
        animate-fade-slide-up
      `}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Top row: icon + type label */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className={`w-6 h-6 rounded-lg ${cfg.bgColor} flex items-center justify-center`}>
          <Icon size={12} className={cfg.color} />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${cfg.color}`}>
          {cfg.label}
        </span>

        {/* Arrow indicator on hover */}
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg width="14" height="14" viewBox="0 0 14 14" className={cfg.color}>
            <path d="M5 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Preview text */}
      <p className="text-[13px] text-gray-300 leading-[1.6] group-hover:text-gray-200 transition-colors duration-300">
        {suggestion.preview}
      </p>

      {/* Click hint */}
      <div className="mt-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-1">
        <span className="text-[10px] text-gray-600 font-medium">
          Click to explore in chat →
        </span>
      </div>
    </div>
  );
}
