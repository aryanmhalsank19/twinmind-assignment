"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Mic, MicOff, Download, Radio } from "lucide-react";
import { useWhisper } from "@/hooks/useWhisper";
import { useRecorder } from "@/hooks/useRecorder";
import { exportSession } from "@/lib/export";
import { SuggestionBatch, ChatMessage } from "@/lib/types";

interface TranscriptPanelProps {
  transcript: string[];
  setTranscript: React.Dispatch<React.SetStateAction<string[]>>;
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  batches: SuggestionBatch[];
  chatHistory: ChatMessage[];
}

function WaveformVisualizer({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-6">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-blue-500 to-cyan-400 transition-all duration-200"
          style={{
            height: active ? "100%" : "4px",
            animation: active ? `waveform ${0.6 + i * 0.15}s ease-in-out infinite ${i * 0.1}s` : "none",
            opacity: active ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
}

export default function TranscriptPanel({
  transcript,
  setTranscript,
  isRecording,
  setIsRecording,
  batches,
  chatHistory,
}: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { status: whisperStatus, progress, transcribe } = useWhisper();
  const [transcribing, setTranscribing] = useState(false);

  const onChunk = useCallback(
    async (blob: Blob) => {
      setTranscribing(true);
      const text = await transcribe(blob);
      if (text) {
        setTranscript((prev) => [...prev, text]);
      }
      setTranscribing(false);
    },
    [transcribe, setTranscript]
  );

  const { start, stop } = useRecorder({ onChunk });

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stop();
      setIsRecording(false);
    } else {
      start();
      setIsRecording(true);
    }
  }, [isRecording, start, stop, setIsRecording]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const getStatusText = () => {
    if (whisperStatus === "loading") return `Loading model... ${progress}%`;
    if (transcribing) return "Transcribing...";
    if (isRecording) return "Listening";
    return "Ready";
  };

  return (
    <div className="glass-panel flex flex-col rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Radio size={14} className="text-blue-400" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
            Transcript
          </h2>
          {transcript.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 font-medium">
              {transcript.length} chunks
            </span>
          )}
        </div>
        <button
          onClick={() => exportSession({ transcript, batches, chatHistory })}
          className="group p-2 rounded-xl hover:bg-white/5 transition-all duration-300"
          title="Export session as JSON"
        >
          <Download size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
        </button>
      </div>

      {/* Model loading progress */}
      {whisperStatus === "loading" && (
        <div className="px-5 pb-3 animate-fade-in">
          <div className="relative w-full h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 shimmer-skeleton rounded-full" />
          </div>
          <p className="text-[10px] text-gray-600 mt-1.5 font-medium">
            Downloading Whisper model... {progress}%
          </p>
        </div>
      )}

      {/* Mic button area */}
      <div className="flex flex-col items-center py-6 gap-4">
        {/* Mic button */}
        <button
          onClick={toggleRecording}
          disabled={whisperStatus === "loading"}
          className="group relative"
        >
          {/* Outer glow rings when recording */}
          {isRecording && (
            <>
              <div
                className="absolute inset-[-8px] rounded-full border border-red-500/20"
                style={{ animation: "pulseRing 2s ease-out infinite" }}
              />
              <div
                className="absolute inset-[-4px] rounded-full border border-red-500/30"
                style={{ animation: "pulseRing 2s ease-out infinite 0.5s" }}
              />
            </>
          )}

          {/* Button itself */}
          <div
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
              isRecording
                ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                : whisperStatus === "loading"
                ? "bg-white/5 cursor-not-allowed"
                : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:shadow-[0_0_40px_rgba(59,130,246,0.35)] hover:scale-105"
            }`}
          >
            {isRecording ? (
              <MicOff size={22} className="relative z-10 text-white" />
            ) : (
              <Mic size={22} className="relative z-10 text-white" />
            )}
          </div>
        </button>

        {/* Status + waveform */}
        <div className="flex flex-col items-center gap-2">
          <WaveformVisualizer active={isRecording} />
          <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
            isRecording ? "text-red-400" : transcribing ? "text-cyan-400" : "text-gray-600"
          }`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      {/* Transcript area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
        {transcript.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Mic size={16} className="text-gray-600" />
            </div>
            <p className="text-xs text-gray-600 text-center leading-relaxed max-w-48">
              {whisperStatus === "ready"
                ? "Tap the mic to begin recording your meeting"
                : "Loading speech recognition model..."}
            </p>
          </div>
        ) : (
          transcript.map((chunk, i) => (
            <div
              key={i}
              className="animate-fade-slide-up group"
              style={{ animationDelay: `${Math.min(i * 50, 200)}ms` }}
            >
              <div className="flex gap-3">
                <span className="text-[10px] text-gray-700 font-mono pt-0.5 select-none shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors">
                  {chunk}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
