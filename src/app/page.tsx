"use client";

import { VisualizationCanvas } from "@/components/visualization-canvas";
import { LiveMidiIndicator } from "@/components/live-midi-indicator";
import { SettingsPanel } from "@/components/settings-panel";
import { MidiUpload } from "@/components/midi-upload";
import { Topbar } from "@/components/topbar";
import { useMidiStore } from "@/store/midi-store";

export default function Home() {
  const clips = useMidiStore((state) => state.clips);
  const duration = useMidiStore((state) => state.duration);

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      <Topbar />

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-[320px] border-r border-white/5 bg-black/30 backdrop-blur-xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-white/60 uppercase tracking-[0.15em] mb-2">
                Upload
              </h2>
              <MidiUpload variant="compact" />
            </div>

            <div className="border-t border-white/5 pt-4">
              <h2 className="text-xs font-semibold text-white/60 uppercase tracking-[0.15em] mb-2">
                Visualization
              </h2>
              <SettingsPanel />
            </div>

            <div className="border-t border-white/5 pt-4">
              <h2 className="text-xs font-semibold text-white/60 uppercase tracking-[0.15em] mb-2">
                Live MIDI
              </h2>
              <LiveMidiIndicator />
            </div>
          </div>
        </aside>

        <main className="flex-1 flex items-center justify-center p-6 overflow-hidden">
          <div className="w-full h-full relative">
            <div className="absolute inset-0 border border-white/10 bg-gradient-to-br from-blue-950/20 via-black to-blue-950/30 shadow-2xl shadow-black/50">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute inset-0 ring-1 ring-inset ring-white/5"></div>
              
              {/* Gradient Orb */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none opacity-50"
                style={{
                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 30%, transparent 70%)'
                }}
              ></div>
              
              <VisualizationCanvas />
              {clips.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border border-white/10 bg-black/30 backdrop-blur-md p-6 text-center">
                    <p className="text-white/90 font-medium mb-1">No MIDI loaded</p>
                    <p className="text-white/60 text-sm">Drop a .mid file anywhere to begin</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
