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
  const [speed, setSpeed] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const totalWordsRef = useRef(0);
  const elapsedWordsRef = useRef(0);

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

  const getCharIndexForWord = useCallback((text: string, wordIndex: number) => {
    let charIndex = 0;
    const words = text.split(/\s+/).filter(Boolean);
    for (let i = 0; i < wordIndex && i < words.length; i += 1) {
      const idx = text.indexOf(words[i], charIndex);
      if (idx === -1) break;
      charIndex = idx + words[i].length + 1;
    }
    return charIndex;
  }, []);

  const createUtterance = useCallback(
    (text: string, charOffset = 0, wordOffset = 0) => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = speed * 0.95;
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
      utter.onboundary = (e) => {
        if (e.name && e.name !== "word") return;
        const spoken = text
          .slice(0, e.charIndex || 0)
          .split(/\s+/)
          .filter(Boolean).length;
        elapsedWordsRef.current = Math.min(
          totalWordsRef.current,
          wordOffset + spoken,
        );
        setProgress(
          Math.min(1, elapsedWordsRef.current / totalWordsRef.current),
        );
      };
      utteranceRef.current = utter;
      return utter;
    },
    [speed],
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
      elapsedWordsRef.current = 0;
      setProgress(0);
      const utter = createUtterance(text);
      window.speechSynthesis.speak(utter);
    },
    [buildScript, createUtterance, supported],
  );

  const pause = useCallback(() => {
    if (supported && status === "playing") {
      window.speechSynthesis.pause();
      setStatus("paused");
    }
  }, [status, supported]);

  const resume = useCallback(() => {
    if (!(supported && status === "paused")) {
      return;
    }

    const synth = window.speechSynthesis;
    const currentText = utteranceRef.current?.text || "";

    if (synth.paused && utteranceRef.current) {
      synth.resume();
      setStatus("playing");
      return;
    }

    if (!currentText) {
      return;
    }

    const startWord = elapsedWordsRef.current;
    const charIndex = getCharIndexForWord(currentText, startWord);
    const remainingText = currentText.slice(charIndex);

    if (!remainingText) {
      return;
    }

    synth.cancel();
    const utter = createUtterance(remainingText, charIndex, startWord);
    synth.speak(utter);
  }, [createUtterance, getCharIndexForWord, status, supported]);

  const stop = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setStatus("idle");
      setProgress(0);
      elapsedWordsRef.current = 0;
    }
  }, [supported]);

  const replay = useCallback(() => {
    if (supported && utteranceRef.current && status !== "idle") {
      // Restart from ~5 seconds back (estimate ~12 words per second at normal speed)
      const replayWords = Math.round(12 / speed);
      const newStartWord = Math.max(0, elapsedWordsRef.current - replayWords);
      const text = utteranceRef.current.text || "";
      const charIndex = getCharIndexForWord(text, newStartWord);

      window.speechSynthesis.cancel();
      const remainingText = text.slice(charIndex);
      const utter = createUtterance(remainingText, charIndex, newStartWord);
      window.speechSynthesis.speak(utter);
    }
  }, [createUtterance, getCharIndexForWord, supported, status, speed]);

  const getElapsedSeconds = () => {
    // Estimate: ~140-150 words per minute = ~2.3-2.5 words per second at normal rate
    // At rate 0.95, it's about 2.2 words per second
    const wordsPerSec = 2.2 / speed;
    return Math.round(elapsedWordsRef.current / wordsPerSec);
  };

  const getTotalSeconds = () => {
    const wordsPerSec = 2.2 / speed;
    return Math.round(totalWordsRef.current / wordsPerSec);
  };

  return {
    status,
    supported,
    error,
    progress,
    speed,
    setSpeed,
    play,
    pause,
    resume,
    stop,
    replay,
    getElapsedSeconds,
    getTotalSeconds,
  };
}
