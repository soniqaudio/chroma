"use client";

import { PlaybackControls } from "@/components/playback-controls";
import { VisualizationCanvas } from "@/components/visualization-canvas";
import { LiveMidiIndicator } from "@/components/live-midi-indicator";
import { SettingsPanel } from "@/components/settings-panel";
import { useMidiStore } from "@/store/midi-store";

export default function Home() {
  const clips = useMidiStore((state) => state.clips);
  const duration = useMidiStore((state) => state.duration);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-[1920px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <div className="h-[2px] w-6 bg-white"></div>
                <div className="h-[2px] w-6 bg-white"></div>
                <div className="h-[2px] w-6 bg-white"></div>
              </div>
              <span className="text-sm font-medium tracking-tight text-white/90">SONIQAUDIO</span>
            </div>
            <div className="text-xs text-white/40 uppercase tracking-wider">Synesthesia</div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 border-r border-white/5 bg-black/30 backdrop-blur-xl flex flex-col">
          <div className="p-6 space-y-6 overflow-y-auto">
            <div>
              <h2 className="text-xs font-semibold text-white/60 uppercase tracking-[0.15em] mb-4">
                Playback
              </h2>
              <PlaybackControls />
            </div>

            <div className="border-t border-white/5 pt-6">
              <h2 className="text-xs font-semibold text-white/60 uppercase tracking-[0.15em] mb-4">
                Live MIDI
              </h2>
              <LiveMidiIndicator />
            </div>

            <div className="border-t border-white/5 pt-6">
              <h2 className="text-xs font-semibold text-white/60 uppercase tracking-[0.15em] mb-4">
                Visualization
              </h2>
              <SettingsPanel />
            </div>

            {clips.length > 0 && (
              <div className="border-t border-white/5 pt-6">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/50">Notes</span>
                    <span className="text-white font-medium">{clips.length.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/50">Duration</span>
                    <span className="text-white font-medium font-mono">
                      {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-black via-black to-gray-950">
          <div className="w-full h-full max-w-[1400px] max-h-[900px] relative">
            <div className="absolute inset-0 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent shadow-2xl shadow-black/50">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5"></div>
              <VisualizationCanvas />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
