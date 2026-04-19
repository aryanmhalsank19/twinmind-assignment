"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import TranscriptPanel from "@/components/TranscriptPanel";
import SuggestionsPanel from "@/components/SuggestionsPanel";
import ChatPanel, { ChatPanelRef } from "@/components/ChatPanel";
import SettingsModal from "@/components/SettingsModal";
import StatusBar from "@/components/StatusBar";
import { DEFAULT_SETTINGS, Settings } from "@/lib/prompts";
import { SuggestionBatch } from "@/lib/types";

export default function Home() {
  const [transcript, setTranscript] = useState<string[]>([]);
  const [batches, setBatches] = useState<SuggestionBatch[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const chatRef = useRef<ChatPanelRef>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("twinmind-settings");
      if (saved) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const handleSuggestionClick = useCallback((detailPrompt: string) => {
    chatRef.current?.sendMessage(detailPrompt);
  }, []);

  return (
    <div className="h-screen bg-[#06060a] text-gray-100 flex flex-col overflow-hidden noise-overlay">
      {/* Ambient background gradient mesh */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none" />

      {/* Top line accent */}
      <div className="relative z-10 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
        <StatusBar
          onSettings={() => setShowSettings(true)}
          isRecording={isRecording}
        />

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 p-3 overflow-hidden">
          <TranscriptPanel
            transcript={transcript}
            setTranscript={setTranscript}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            batches={batches}
            chatHistory={chatRef.current?.getChatHistory() ?? []}
          />

          <SuggestionsPanel
            batches={batches}
            setBatches={setBatches}
            transcript={transcript}
            settings={settings}
            isRecording={isRecording}
            onSuggestionClick={handleSuggestionClick}
          />

          <ChatPanel
            ref={chatRef}
            transcript={transcript}
            settings={settings}
          />
        </div>
      </div>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
