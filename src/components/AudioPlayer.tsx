"use client";

import { useState } from "react";
import { useNarration } from "@/lib/useNarration";

export default function AudioPlayer({
  intro,
  summary,
  famousFor,
  backstory,
}: {
  intro?: string;
  summary: string;
  famousFor: string;
  backstory: string;
}) {
  const { status, supported, error, progress, play, pause, resume, stop } =
    useNarration();
  const [showError, setShowError] = useState(false);

  if (!supported) {
    return (
      <p className="text-xs text-slate-500">
        Your browser doesn't support audio playback.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2">
        {status !== "playing" ? (
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setShowError(false);
              if (status === "paused") {
                resume();
              } else {
                play({ intro, summary, famousFor, backstory });
              }
            }}
            aria-label={
              status === "paused" ? "Resume audio" : "Play audio narration"
            }
          >
            <PlayIcon className="h-4 w-4" />{" "}
            {status === "paused" ? "Resume" : "Play 5-min audio"}
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary"
            onClick={pause}
            aria-label="Pause audio"
          >
            <PauseIcon className="h-4 w-4" /> Pause
          </button>
        )}
        {status !== "idle" && (
          <button
            type="button"
            className="btn-secondary"
            onClick={stop}
            aria-label="Stop audio"
          >
            <StopIcon className="h-4 w-4" /> Stop
          </button>
        )}
        <div className="ml-auto text-xs text-slate-500">
          {status === "idle"
            ? "Ready"
            : status === "playing"
              ? "Playing…"
              : "Paused"}
        </div>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-brand-600 transition-[width] duration-300"
          style={{ width: `${Math.round((progress || 0) * 100)}%` }}
        />
      </div>
      {status !== "idle" && (
        <p className="mt-1 text-[11px] text-slate-500">
          About 5 minutes — feel free to play, pause, or stop anytime.
        </p>
      )}
      {error && showError && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="button"
        className="mt-2 text-[11px] text-slate-400 underline"
        onClick={() => setShowError((s) => !s)}
      >
        {showError ? "Hide" : "Show"} audio diagnostics
      </button>
    </div>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      stroke="none"
    >
      <polygon points="6,4 20,12 6,20" />
    </svg>
  );
}
function PauseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      stroke="none"
    >
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}
function StopIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      stroke="none"
    >
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );
}
