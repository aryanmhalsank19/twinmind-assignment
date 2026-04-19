"use client";

import { Settings2, Zap } from "lucide-react";

interface StatusBarProps {
  onSettings: () => void;
  isRecording: boolean;
}

export default function StatusBar({ onSettings, isRecording }: StatusBarProps) {
  return (
    <div className="relative flex items-center justify-between px-5 py-3">
      {/* Subtle bottom border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="flex items-center gap-3">
        {/* Animated logo mark */}
        <div className="relative flex items-center justify-center w-8 h-8">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-sm" />
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Zap size={14} className="text-white" fill="white" />
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="text-sm font-semibold tracking-tight text-white">
            TwinMind
          </h1>
          <span className="text-[10px] font-medium tracking-widest uppercase text-gray-500">
            Live Suggestions
          </span>
        </div>

        {/* Live indicator */}
        {isRecording && (
          <div className="flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 animate-fade-in">
            <div className="relative w-1.5 h-1.5">
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
              <div className="relative w-1.5 h-1.5 rounded-full bg-red-500" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-red-400">
              Live
            </span>
          </div>
        )}
      </div>

      <button
        onClick={onSettings}
        className="group relative p-2 rounded-xl hover:bg-white/5 transition-all duration-300"
        title="Settings"
      >
        <Settings2
          size={18}
          className="text-gray-500 group-hover:text-gray-300 transition-colors duration-300 group-hover:rotate-45"
          style={{ transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), color 0.3s" }}
        />
      </button>
    </div>
  );
}
