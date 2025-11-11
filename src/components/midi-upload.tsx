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

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-300 dark:border-gray-700"}
          ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400 dark:hover:border-gray-600"}
        `}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mid,.midi"
          onChange={handleFileInput}
          className="hidden"
        />
        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading MIDI file...</p>
        ) : (
          <>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Drop MIDI file here or click to browse
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports .mid and .midi files
            </p>
          </>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

