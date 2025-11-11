"use client";

import { usePlaybackStore } from "@/store/playback-store";
import { useMidiStore } from "@/store/midi-store";
import { useEffect, useRef, useState } from "react";
import { MidiPlaybackController } from "@/lib/audio/playback";
import { TimingSync } from "@/lib/audio/timing";
import { Dropdown } from "@/components/ui/dropdown";

export function Topbar() {
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const currentTime = usePlaybackStore((state) => state.currentTime);
  const duration = useMidiStore((state) => state.duration);
  const clips = useMidiStore((state) => state.clips);
  const [projectTitle, setProjectTitle] = useState("Untitled Project");
  const [showSettings, setShowSettings] = useState(false);

  const fileOptions = [
    { value: "new", label: "New" },
    { value: "save", label: "Save" },
    { value: "export", label: "Export" },
  ];

  const editOptions = [
    { value: "undo", label: "Undo" },
    { value: "redo", label: "Redo" },
  ];

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

  const handleFileAction = (value: string) => {
    switch (value) {
      case "new":
        useMidiStore.getState().clear();
        usePlaybackStore.getState().stop();
        usePlaybackStore.getState().setCurrentTime(0);
        break;
      case "save":
        // TODO: Implement save functionality
        console.log("Save clicked");
        break;
      case "export":
        // TODO: Implement export functionality
        console.log("Export clicked");
        break;
    }
  };

  const handleEditAction = (value: string) => {
    switch (value) {
      case "undo":
        // TODO: Implement undo functionality
        console.log("Undo clicked");
        break;
      case "redo":
        // TODO: Implement redo functionality
        console.log("Redo clicked");
        break;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-12 border-b border-white/5 bg-black/50 backdrop-blur-xl flex items-center px-6 shadow-[0_10px_30px_rgba(0,0,0,0.4)] relative">
      <div className="flex items-center gap-4 flex-shrink-0">
        <span className="text-sm font-semibold tracking-tight text-white/90">Chroma</span>
        <Dropdown
          value=""
          options={fileOptions}
          onChange={handleFileAction}
          placeholder="File"
          className="w-[80px]"
        />
        <Dropdown
          value=""
          options={editOptions}
          onChange={handleEditAction}
          placeholder="Edit"
          className="w-[80px]"
        />
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-white/90 placeholder:text-white/40 font-medium min-w-[140px]"
          placeholder="Untitled Project"
        />
      </div>

      {/* Centered playback controls */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={clips.length === 0}
          className="w-9 h-9 flex items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-inner"
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
        <div className="text-xs text-white/50 font-mono tabular-nums">
          {formatTime(currentTime)}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-white/10 hover:bg-white/5 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/70">
            <circle cx="7" cy="7" r="2.33333" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path
              d="M7 1.16667V2.33333M7 11.6667V12.8333M12.8333 7H11.6667M2.33333 7H1.16667M11.2 2.8L10.2667 3.73333M3.73333 10.2667L2.8 11.2M11.2 11.2L10.2667 10.2667M3.73333 3.73333L2.8 2.8"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

