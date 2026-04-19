"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function useWhisper() {
  const workerRef = useRef<Worker | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    workerRef.current = new Worker("/whisper-worker.js", { type: "module" });

    workerRef.current.onerror = (e) => {
      console.error("Whisper worker failed to load:", e);
      setStatus("idle");
    };

    workerRef.current.addEventListener("message", ({ data }) => {
      if (data.type === "ready") {
        setStatus("ready");
        setProgress(100);
      }
      if (data.type === "progress") {
        setProgress(data.progress);
      }
      if (data.type === "error") {
        console.error("Whisper worker error:", data.error);
        setStatus("idle");
      }
    });

    workerRef.current.postMessage({ type: "load" });
    setStatus("loading");

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const transcribe = useCallback(
    (audioBlob: Blob): Promise<string> =>
      new Promise(async (resolve) => {
        if (!workerRef.current) {
          resolve("");
          return;
        }

        const arrayBuffer = await audioBlob.arrayBuffer();

        // Decode audio to get Float32Array PCM data
        const audioContext = new AudioContext({ sampleRate: 16000 });
        try {
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const float32 = audioBuffer.getChannelData(0);

          workerRef.current.addEventListener(
            "message",
            function handler({ data }) {
              if (data.type === "result") {
                workerRef.current?.removeEventListener("message", handler);
                resolve(data.text);
              }
            }
          );

          workerRef.current.postMessage({
            type: "transcribe",
            audio: float32,
          });
        } catch {
          resolve("");
        } finally {
          audioContext.close();
        }
      }),
    []
  );

  return { status, progress, transcribe };
}
