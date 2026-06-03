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
    (parts: {
      intro?: string;
      summary: string;
      famousFor: string;
      backstory: string;
    }) => {
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
    (parts: {
      intro?: string;
      summary: string;
      famousFor: string;
      backstory: string;
    }) => {
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
        const spoken = text
          .slice(0, charIndex)
          .split(/\s+/)
          .filter(Boolean).length;
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
    if (supported && status === "paused" && utteranceRef.current) {
      const utter = utteranceRef.current;
      const text = utter.text || "";

      // Estimate characters per second based on rate and average word length
      // At rate 0.95 (5% slower), typical speech is ~140-150 words per minute = ~2.3-2.5 words per second
      // Average word is ~5 characters plus space, so ~15 chars per second
      const estimatedCharsPerSec = Math.round(15 / utter.rate);
      const seekBackChars = estimatedCharsPerSec; // ~1 second back

      // Cancel current utterance
      window.speechSynthesis.cancel();

      // Estimate where we are in the text by calculating from progress
      const estimatedCharIndex = Math.round(text.length * progress);
      const newStartIndex = Math.max(0, estimatedCharIndex - seekBackChars);

      // If we can seek back, restart from the new position
      if (newStartIndex > 0) {
        const remainingText = text.slice(newStartIndex);
        const newUtter = new SpeechSynthesisUtterance(remainingText);
        newUtter.rate = utter.rate;
        newUtter.pitch = utter.pitch;

        newUtter.onstart = () => setStatus("playing");
        newUtter.onpause = () => setStatus("paused");
        newUtter.onresume = () => setStatus("playing");
        newUtter.onerror = (e) => {
          setError(`Audio error: ${e.error || "unknown"}`);
          setStatus("idle");
        };
        newUtter.onend = () => {
          setStatus("idle");
          setProgress(1);
        };

        newUtter.onboundary = (e) => {
          if (e.name && e.name !== "word") return;
          const charIndex = (e.charIndex || 0) + newStartIndex;
          const spoken = text
            .slice(0, charIndex)
            .split(/\s+/)
            .filter(Boolean).length;
          setProgress(Math.min(1, spoken / totalWordsRef.current));
        };

        utteranceRef.current = newUtter;
        window.speechSynthesis.speak(newUtter);
      } else {
        // If already near the beginning, just resume normally
        window.speechSynthesis.resume();
        setStatus("playing");
      }
    }
  }, [status, supported, progress]);

  const stop = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setStatus("idle");
      setProgress(0);
    }
  }, [supported]);

  return { status, supported, error, progress, play, pause, resume, stop };
}
