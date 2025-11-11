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
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={clips.length === 0}
          className="px-6 py-2.5 bg-white text-black hover:bg-white/90 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed rounded-lg font-medium transition-all text-sm shadow-lg shadow-black/20"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={handleStop}
          disabled={clips.length === 0}
          className="px-6 py-2.5 border border-white/10 text-white/80 hover:border-white/20 hover:text-white hover:bg-white/5 disabled:border-white/5 disabled:text-white/20 disabled:cursor-not-allowed rounded-lg font-medium transition-all text-sm"
        >
          Stop
        </button>
        <div className="flex-1" />
        <span className="text-xs text-white/50 font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {duration > 0 && (
        <div>
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
            style={{
              background: `linear-gradient(to right, white 0%, white ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
        </div>
      )}
    </div>
  );
}

