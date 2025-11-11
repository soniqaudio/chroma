"use client";

import { useRef, useState } from "react";
import { parseMidiFile } from "@/lib/midi/midi-parser";
import { useMidiStore } from "@/store/midi-store";

export function MidiUpload() {
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
    const base = "border border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200 relative overflow-hidden";
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
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
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

