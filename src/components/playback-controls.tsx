"use client";

import { useEffect, useRef } from "react";
import { usePlaybackStore } from "@/store/playback-store";
import { useMidiStore } from "@/store/midi-store";
import { MidiPlaybackController } from "@/lib/audio/playback";
import { TimingSync } from "@/lib/audio/timing";

export function PlaybackControls() {
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const currentTime = usePlaybackStore((state) => state.currentTime);
  const duration = useMidiStore((state) => state.duration);
  const clips = useMidiStore((state) => state.clips);

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
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    usePlaybackStore.getState().setCurrentTime(time);
    playbackControllerRef.current?.seek(time);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={clips.length === 0}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={handleStop}
          disabled={clips.length === 0}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          Stop
        </button>
        <div className="flex-1" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {duration > 0 && (
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      )}
    </div>
  );
}

