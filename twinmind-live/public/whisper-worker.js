// Use CDN import — bare npm imports don't work in static worker files
import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

let transcriber = null;

self.addEventListener("message", async ({ data }) => {
  if (data.type === "load") {
    self.postMessage({ type: "progress", progress: 1 });

    try {
      transcriber = await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-base",
        {
          dtype: "q4",
          progress_callback: (progress) => {
            if (progress.status === "progress") {
              self.postMessage({
                type: "progress",
                progress: Math.round(progress.progress || 0),
              });
            }
            if (progress.status === "initiate") {
              self.postMessage({
                type: "progress",
                progress: 2,
              });
            }
          },
        }
      );
      self.postMessage({ type: "ready" });
    } catch (err) {
      console.error("Whisper load error:", err);
      self.postMessage({ type: "error", error: err.message });
    }
  }

  if (data.type === "transcribe") {
    if (!transcriber) {
      self.postMessage({ type: "result", text: "" });
      return;
    }
    try {
      const result = await transcriber(data.audio, {
        language: data.language ?? null,
        task: "transcribe",
        return_timestamps: false,
      });
      self.postMessage({ type: "result", text: result.text.trim() });
    } catch (err) {
      console.error("Transcription error:", err);
      self.postMessage({ type: "result", text: "" });
    }
  }
});
