"use client";

import { useState } from "react";
import { X, Sliders, MessageSquare, Sparkles, Timer, Type } from "lucide-react";
import { Settings } from "@/lib/prompts";

interface SettingsModalProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
}

export default function SettingsModal({
  settings,
  onSave,
  onClose,
}: SettingsModalProps) {
  const [draft, setDraft] = useState<Settings>({ ...settings });

  const handleSave = () => {
    onSave(draft);
    if (typeof window !== "undefined") {
      localStorage.setItem("twinmind-settings", JSON.stringify(draft));
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl animate-scale-in"
      >
        {/* Gradient border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-cyan-500/20 p-px">
          <div className="w-full h-full rounded-2xl bg-[#0c0c14]" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <Sliders size={14} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Settings</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                  Customize prompts & parameters
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-all duration-300"
            >
              <X size={16} />
            </button>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6 space-y-6">
            {/* Suggestions System Prompt */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Sparkles size={12} className="text-purple-400" />
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
                  Suggestions Prompt
                </label>
              </div>
              <textarea
                value={draft.suggestionsSystemPrompt}
                onChange={(e) =>
                  setDraft({ ...draft, suggestionsSystemPrompt: e.target.value })
                }
                rows={8}
                className="w-full bg-white/[0.02] border border-white/[0.06] text-[13px] text-gray-300 rounded-xl px-4 py-3 outline-none focus:border-purple-500/30 focus:bg-white/[0.03] resize-y font-mono leading-relaxed transition-all duration-300 placeholder:text-gray-700"
              />
            </div>

            {/* Chat System Prompt */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <MessageSquare size={12} className="text-cyan-400" />
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
                  Chat Prompt
                </label>
              </div>
              <textarea
                value={draft.chatSystemPrompt}
                onChange={(e) =>
                  setDraft({ ...draft, chatSystemPrompt: e.target.value })
                }
                rows={4}
                className="w-full bg-white/[0.02] border border-white/[0.06] text-[13px] text-gray-300 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/30 focus:bg-white/[0.03] resize-y font-mono leading-relaxed transition-all duration-300 placeholder:text-gray-700"
              />
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-2 gap-5">
              <SliderField
                icon={<Type size={12} className="text-blue-400" />}
                label="Suggest Context"
                value={draft.suggestionsContextWindow}
                min={500}
                max={5000}
                step={100}
                unit="chars"
                color="blue"
                onChange={(v) =>
                  setDraft({ ...draft, suggestionsContextWindow: v })
                }
              />
              <SliderField
                icon={<Type size={12} className="text-cyan-400" />}
                label="Chat Context"
                value={draft.chatContextWindow}
                min={2000}
                max={16000}
                step={500}
                unit="chars"
                color="cyan"
                onChange={(v) => setDraft({ ...draft, chatContextWindow: v })}
              />
              <SliderField
                icon={<Type size={12} className="text-purple-400" />}
                label="Recent Window"
                value={draft.recentWindowChars}
                min={200}
                max={2000}
                step={100}
                unit="chars"
                color="purple"
                onChange={(v) => setDraft({ ...draft, recentWindowChars: v })}
              />
              <SliderField
                icon={<Timer size={12} className="text-amber-400" />}
                label="Auto-Refresh"
                value={draft.autoRefreshInterval}
                min={10}
                max={60}
                step={5}
                unit="sec"
                color="amber"
                onChange={(v) => setDraft({ ...draft, autoRefreshInterval: v })}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <div className="flex justify-end gap-3 px-6 py-4">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm rounded-xl text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all duration-300 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 text-sm rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white transition-all duration-300 font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderField({
  icon,
  label,
  value,
  min,
  max,
  step,
  unit,
  color,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  color: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
            {label}
          </label>
        </div>
        <span className={`text-xs font-semibold text-${color}-400 tabular-nums`}>
          {value} <span className="text-gray-600 font-normal">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer bg-white/5 accent-blue-500"
        style={{
          accentColor: color === "blue" ? "#3b82f6" : color === "cyan" ? "#06b6d4" : color === "purple" ? "#8b5cf6" : "#f59e0b",
        }}
      />
    </div>
  );
}
