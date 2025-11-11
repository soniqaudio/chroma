"use client";

import { MidiUpload } from "@/components/midi-upload";
import { PlaybackControls } from "@/components/playback-controls";
import { VisualizationCanvas } from "@/components/visualization-canvas";
import { LiveMidiIndicator } from "@/components/live-midi-indicator";
import { SettingsPanel } from "@/components/settings-panel";
import { useMidiStore } from "@/store/midi-store";

export default function Home() {
  const clips = useMidiStore((state) => state.clips);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Synesthesia
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Transform MIDI performances into expressive visual art
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            <MidiUpload />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <VisualizationCanvas />
            </div>
            <PlaybackControls />
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Live MIDI
              </h2>
              <LiveMidiIndicator />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <SettingsPanel />
            </div>
          </div>
        </div>

        {clips.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loaded: {clips.length} notes | Duration:{" "}
              {Math.round(useMidiStore.getState().duration)}s
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
