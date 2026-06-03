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
  const scriptTextRef = useRef<string>("");
  const totalWordsRef = useRef(0);
  const elapsedWordsRef = useRef(0);
  const currentWordOffsetRef = useRef(0);
  const progressTimerRef = useRef<number | null>(null);
  const playStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (progressTimerRef.current !== null) {
        window.clearInterval(progressTimerRef.current);
      }
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

  const wordsPerSecond = useCallback(() => 2.2 / speed, [speed]);

  const estimateCurrentWords = useCallback(() => {
    if (!playStartTimeRef.current || totalWordsRef.current === 0) {
      return elapsedWordsRef.current;
    }

    const elapsedSeconds = (Date.now() - playStartTimeRef.current) / 1000;
    return Math.min(
      totalWordsRef.current,
      Math.round(
        currentWordOffsetRef.current + elapsedSeconds * wordsPerSecond(),
      ),
    );
  }, [wordsPerSecond]);

  const stopProgressTimer = useCallback(() => {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const startProgressTimer = useCallback(() => {
    stopProgressTimer();
    playStartTimeRef.current = Date.now();
    progressTimerRef.current = window.setInterval(() => {
      if (!playStartTimeRef.current || totalWordsRef.current === 0) return;
      const elapsedSeconds = Math.round(
        (Date.now() - playStartTimeRef.current) / 1000,
      );
      const estimatedWords = Math.min(
        totalWordsRef.current,
        Math.round(
          currentWordOffsetRef.current + elapsedSeconds * wordsPerSecond(),
        ),
      );
      elapsedWordsRef.current = Math.max(
        elapsedWordsRef.current,
        estimatedWords,
      );
      setProgress(Math.min(1, elapsedWordsRef.current / totalWordsRef.current));
    }, 250);
  }, [stopProgressTimer, wordsPerSecond]);

  const createUtterance = useCallback(
    (text: string, charOffset = 0, wordOffset = 0) => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = speed * 0.95;
      utter.pitch = 1;
      utter.onstart = () => {
        setStatus("playing");
        playStartTimeRef.current = Date.now();
        currentWordOffsetRef.current = wordOffset;
        startProgressTimer();
      };
      utter.onpause = () => {
        const estimatedWords = estimateCurrentWords();
        elapsedWordsRef.current = Math.max(
          elapsedWordsRef.current,
          estimatedWords,
        );
        setProgress(
          Math.min(1, elapsedWordsRef.current / totalWordsRef.current),
        );
        playStartTimeRef.current = null;
        setStatus("paused");
        stopProgressTimer();
      };
      utter.onresume = () => {
        setStatus("playing");
        playStartTimeRef.current = Date.now();
        startProgressTimer();
      };
      utter.onerror = (e) => {
        setError(`Audio error: ${e.error || "unknown"}`);
        setStatus("idle");
        stopProgressTimer();
      };
      utter.onend = () => {
        setStatus("idle");
        setProgress(1);
        stopProgressTimer();
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
      currentWordOffsetRef.current = wordOffset;
      utteranceRef.current = utter;
      return utter;
    },
    [speed, startProgressTimer, stopProgressTimer],
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
      scriptTextRef.current = text;
      currentWordOffsetRef.current = 0;
      totalWordsRef.current = words.length;
      elapsedWordsRef.current = 0;
      setProgress(0);
      const utter = createUtterance(text, 0, 0);
      window.speechSynthesis.speak(utter);
      startProgressTimer();
    },
    [buildScript, createUtterance, startProgressTimer, supported],
  );

  const pause = useCallback(() => {
    if (supported && status === "playing") {
      const estimatedWords = estimateCurrentWords();
      elapsedWordsRef.current = Math.max(
        elapsedWordsRef.current,
        estimatedWords,
      );
      setProgress(Math.min(1, elapsedWordsRef.current / totalWordsRef.current));
      playStartTimeRef.current = null;
      window.speechSynthesis.pause();
      stopProgressTimer();
      setStatus("paused");
    }
  }, [estimateCurrentWords, status, supported, stopProgressTimer]);

  const resume = useCallback(() => {
    if (!(supported && status === "paused")) {
      return;
    }

    const synth = window.speechSynthesis;
    const fullText = scriptTextRef.current || utteranceRef.current?.text || "";
    const startWord = elapsedWordsRef.current;

    const restartFromPausedPoint = () => {
      if (!fullText) return;
      const charIndex = getCharIndexForWord(fullText, startWord);
      const remainingText = fullText.slice(charIndex);
      if (!remainingText) return;
      synth.cancel();
      const utter = createUtterance(remainingText, charIndex, startWord);
      window.speechSynthesis.speak(utter);
      playStartTimeRef.current = Date.now();
      startProgressTimer();
      setStatus("playing");
    };

    synth.cancel();
    restartFromPausedPoint();
  }, [
    createUtterance,
    getCharIndexForWord,
    startProgressTimer,
    status,
    supported,
  ]);

  const stop = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      scriptTextRef.current = "";
      currentWordOffsetRef.current = 0;
      setStatus("idle");
      setProgress(0);
      elapsedWordsRef.current = 0;
      playStartTimeRef.current = null;
      stopProgressTimer();
    }
  }, [supported, stopProgressTimer]);

  const replay = useCallback(() => {
    if (supported && utteranceRef.current && status !== "idle") {
      // Restart from ~5 seconds back (estimate ~12 words per second at normal speed)
      const replayWords = Math.round(12 / speed);
      const newStartWord = Math.max(0, elapsedWordsRef.current - replayWords);
      const fullText = scriptTextRef.current || utteranceRef.current.text || "";
      const charIndex = getCharIndexForWord(fullText, newStartWord);

      window.speechSynthesis.cancel();
      const remainingText = fullText.slice(charIndex);
      const utter = createUtterance(remainingText, charIndex, newStartWord);
      window.speechSynthesis.speak(utter);
    }
  }, [createUtterance, getCharIndexForWord, supported, status, speed]);

  const getElapsedSeconds = () => {
    // Estimate: ~140-150 words per minute = ~2.3-2.5 words per second at normal rate
    // At rate 0.95, it's about 2.2 words per second
    const wordsPerSec = wordsPerSecond();
    return Math.round(elapsedWordsRef.current / wordsPerSec);
  };

  const getTotalSeconds = () => {
    const wordsPerSec = wordsPerSecond();
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
