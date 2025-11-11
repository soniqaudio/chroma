"use client";

import { useRef, useState } from "react";
import { parseMidiFile } from "@/lib/midi/midi-parser";
import { useMidiStore } from "@/store/midi-store";

type MidiUploadProps = {
  variant?: "default" | "compact";
};

export function MidiUpload({ variant = "default" }: MidiUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isLoading = useMidiStore((state) => state.isLoading);
  const error = useMidiStore((state) => state.error);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".mid") && !file.name.endsWith(".midi")) {
      useMidiStore.getState().setError("Please upload a MIDI file (.mid or .midi)");
      return;
    }

    useMidiStore.getState().setLoading(true);
    useMidiStore.getState().setError(null);

    try {
      const data = await parseMidiFile(file);
      useMidiStore.getState().setMidiData(data);
    } catch (err) {
      useMidiStore.getState().setError(
        err instanceof Error ? err.message : "Failed to parse MIDI file",
      );
    } finally {
      useMidiStore.getState().setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const getDropZoneClassName = () => {
    const padding = variant === "compact" ? "p-3" : "p-16";
    const radius = variant === "compact" ? "rounded-md" : "rounded-2xl";
    const base = `border border-dashed ${radius} ${padding} text-center cursor-pointer transition-all duration-200 relative overflow-hidden`;
    if (isLoading) {
      return `${base} opacity-50 cursor-not-allowed border-gray-900`;
    }
    if (isDragging) {
      return `${base} border-white/30 bg-white/5`;
    }
    return `${base} border-gray-900 hover:border-gray-800 hover:bg-white/[0.02]`;
  };

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={getDropZoneClassName()}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <div className={`absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none ${variant === "compact" ? "rounded-lg" : "rounded-2xl"}`}></div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".mid,.midi"
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="relative">
          {isLoading ? (
            <p className="text-gray-400">Loading MIDI file...</p>
          ) : variant === "compact" ? (
            <div className="flex items-center justify-between gap-2">
              <div className="text-left">
                <p className="text-xs text-white/80">Upload MIDI</p>
                <p className="text-[10px] text-gray-500">.mid or .midi</p>
              </div>
              <span className="px-2 py-1 text-xs rounded border border-white/10 text-white/80">
                Browse
              </span>
            </div>
          ) : (
            <>
              <p className="text-base font-medium text-white mb-2">
                Drop MIDI file here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports .mid and .midi files
              </p>
            </>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

