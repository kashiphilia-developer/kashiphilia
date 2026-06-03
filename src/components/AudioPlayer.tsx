"use client";

import { useState } from "react";
import { useNarration } from "@/lib/useNarration";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

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
  const {
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
  } = useNarration();
  const [showError, setShowError] = useState(false);

  if (!supported) {
    return (
      <p className="text-xs text-slate-500">
        Your browser doesn't support audio playback.
      </p>
    );
  }

  const elapsedTime = formatTime(getElapsedSeconds());
  const totalTime = formatTime(getTotalSeconds());

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-center gap-2">
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
            {status === "paused" ? "Resume" : "Play"}
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
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={replay}
              aria-label="Replay last 5 seconds"
            >
              <ReplayIcon className="h-4 w-4" /> Replay 5s
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={stop}
              aria-label="Stop audio"
            >
              <StopIcon className="h-4 w-4" /> Stop
            </button>
          </>
        )}
        {status !== "idle" && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">
              {elapsedTime} / {totalTime}
            </span>
            <select
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="text-xs rounded border border-slate-300 bg-white px-2 py-1"
              aria-label="Playback speed"
            >
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
            </select>
          </div>
        )}
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-brand-600 transition-[width] duration-300"
          style={{ width: `${Math.round((progress || 0) * 100)}%` }}
        />
      </div>
      {status !== "idle" && (
        <p className="mt-1 text-[11px] text-slate-500">
          Tip: Use Replay 5s to hear something again, or adjust playback speed.
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
function ReplayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
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
