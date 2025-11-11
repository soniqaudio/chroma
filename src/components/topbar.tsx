"use client";

import { usePlaybackStore } from "@/store/playback-store";
import { useMidiStore } from "@/store/midi-store";
import { useEffect, useRef, useState } from "react";
import { MidiPlaybackController } from "@/lib/audio/playback";
import { TimingSync } from "@/lib/audio/timing";

export function Topbar() {
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const currentTime = usePlaybackStore((state) => state.currentTime);
  const duration = useMidiStore((state) => state.duration);
  const clips = useMidiStore((state) => state.clips);
  const [projectTitle, setProjectTitle] = useState("Untitled Project");
  const [showSettings, setShowSettings] = useState(false);

  const playbackControllerRef = useRef<MidiPlaybackController | null>(null);
  const timingSyncRef = useRef<TimingSync | null>(null);

  useEffect(() => {
    playbackControllerRef.current = new MidiPlaybackController();
    timingSyncRef.current = new TimingSync();

    playbackControllerRef.current.setTimingSync({
      start: () => timingSyncRef.current?.start(),
      pause: () => timingSyncRef.current?.pause(),
      stop: () => timingSyncRef.current?.stop(),
    });

    return () => {
      playbackControllerRef.current?.dispose();
      playbackControllerRef.current = null;
      timingSyncRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (clips.length > 0 && playbackControllerRef.current) {
      playbackControllerRef.current.loadClips(clips);
    }
  }, [clips]);

  const handlePlay = async () => {
    if (!playbackControllerRef.current || clips.length === 0) return;
    await playbackControllerRef.current.play(currentTime);
    usePlaybackStore.getState().play();
  };

  const handlePause = () => {
    playbackControllerRef.current?.pause();
    usePlaybackStore.getState().pause();
  };

  const handleStop = () => {
    playbackControllerRef.current?.stop();
    usePlaybackStore.getState().stop();
    usePlaybackStore.getState().setCurrentTime(0);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export clicked");
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-12 border-b border-white/5 bg-black/50 backdrop-blur-xl flex items-center px-6">
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-4 h-4 border border-white/30 rounded-sm flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white/60">
            <path d="M5 1L6.5 3.5L9.5 4L7.5 6L8 8.5L5 7.5L2 8.5L2.5 6L0.5 4L3.5 3.5L5 1Z" stroke="currentColor" strokeWidth="0.8" fill="none" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight text-white/90">Chroma</span>
      </div>

      <div className="flex-1 flex items-center justify-center gap-2">
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={clips.length === 0}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white">
              <rect x="3" y="2" width="2" height="8" fill="currentColor" />
              <rect x="7" y="2" width="2" height="8" fill="currentColor" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white">
              <path d="M2 2L10 6L2 10V2Z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-white/90 placeholder:text-white/40 font-medium text-center min-w-[120px]"
          placeholder="Untitled Project"
        />
        <div className="text-xs text-white/50 font-mono tabular-nums">
          {formatTime(currentTime)}
        </div>
        <button
          onClick={handleExport}
          disabled={clips.length === 0}
          className="px-3 py-1.5 rounded-md border border-white/10 text-xs text-white/70 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Export
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-white/10 hover:bg-white/5 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/70">
            <path
              d="M7 8.75C7.9665 8.75 8.75 7.9665 8.75 7C8.75 6.0335 7.9665 5.25 7 5.25C6.0335 5.25 5.25 6.0335 5.25 7C5.25 7.9665 6.0335 8.75 7 8.75Z"
              fill="currentColor"
            />
            <path
              d="M7 1.75L8.64583 4.64583L11.8125 5.25L9.625 7.4375L10.0625 10.5L7 9.1875L3.9375 10.5L4.375 7.4375L2.1875 5.25L5.35417 4.64583L7 1.75Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

