"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "playing" | "paused";

/**
 * Hook around the browser's Web Speech API. Builds a long narration
 * (intro + summary + famousFor + backstory) and reads it aloud.
 * Streams words spoken for the progress indicator.
 */
export function useNarration() {
  const [status, setStatus] = useState<Status>("idle");
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const totalWordsRef = useRef(0);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  const buildScript = useCallback(
    (parts: { intro?: string; summary: string; famousFor: string; backstory: string }) => {
      const segments = [
        parts.intro ? parts.intro : "Here's what to know about this place.",
        parts.summary,
        `It is famous for: ${parts.famousFor}`,
        "And now, a longer backstory.",
        parts.backstory,
      ];
      return segments.join(" ");
    },
    [],
  );

  const play = useCallback(
    (parts: { intro?: string; summary: string; famousFor: string; backstory: string }) => {
      if (!supported) {
        setError("Audio playback is not supported in this browser.");
        return;
      }
      window.speechSynthesis.cancel();
      const text = buildScript(parts);
      const words = text.split(/\s+/).filter(Boolean);
      totalWordsRef.current = words.length;
      setProgress(0);
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.95;
      utter.pitch = 1;
      utter.onstart = () => setStatus("playing");
      utter.onpause = () => setStatus("paused");
      utter.onresume = () => setStatus("playing");
      utter.onerror = (e) => {
        setError(`Audio error: ${e.error || "unknown"}`);
        setStatus("idle");
      };
      utter.onend = () => {
        setStatus("idle");
        setProgress(1);
      };
      // Best-effort progress tracking. onboundary is fired per word/sentence.
      utter.onboundary = (e) => {
        if (e.name && e.name !== "word") return;
        const charIndex = e.charIndex || 0;
        const spoken = text.slice(0, charIndex).split(/\s+/).filter(Boolean).length;
        setProgress(Math.min(1, spoken / totalWordsRef.current));
      };
      utteranceRef.current = utter;
      window.speechSynthesis.speak(utter);
    },
    [buildScript, supported],
  );

  const pause = useCallback(() => {
    if (supported && status === "playing") {
      window.speechSynthesis.pause();
      setStatus("paused");
    }
  }, [status, supported]);

  const resume = useCallback(() => {
    if (supported && status === "paused") {
      window.speechSynthesis.resume();
      setStatus("playing");
    }
  }, [status, supported]);

  const stop = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setStatus("idle");
      setProgress(0);
    }
  }, [supported]);

  return { status, supported, error, progress, play, pause, resume, stop };
}
