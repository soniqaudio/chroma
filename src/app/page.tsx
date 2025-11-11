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
        <aside className="w-[320px] border-r border-white/5 bg-black/30 backdrop-blur-xl flex flex-col overflow-hidden shadow-[inset_-1px_0_0_rgba(255,255,255,0.03),0_20px_40px_rgba(0,0,0,0.35)]">
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
            <div className="absolute inset-0 border border-white/10 bg-gradient-to-br from-blue-950/30 via-[#05070d] to-blue-950/40 shadow-[0_40px_120px_rgba(0,0,0,0.7)]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute inset-0 ring-1 ring-inset ring-white/5"></div>
              {/* Subtle starfield for depth */}
              <div
                className="absolute inset-0 opacity-[0.18] pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
                  backgroundSize: '120px 120px, 60px 60px',
                  backgroundPosition: '0 0, 30px 30px'
                }}
              />
              
              {/* Primary Gradient Orb - Main center glow */}
              <div 
                className="absolute top-1/2 left-1/2 w-[700px] h-[700px] rounded-full blur-[120px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, rgba(96, 165, 250, 0.25) 0%, rgba(59, 130, 246, 0.18) 15%, rgba(37, 99, 235, 0.12) 30%, rgba(29, 78, 216, 0.06) 45%, transparent 65%)',
                  animation: 'pulse-orb 8s ease-in-out infinite',
                  transform: 'translate(-50%, -50%)'
                }}
              ></div>
              
              {/* Secondary orb - Top left accent */}
              <div 
                className="absolute top-1/3 left-[20%] w-[450px] h-[450px] rounded-full blur-[100px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, rgba(147, 197, 253, 0.2) 0%, rgba(96, 165, 250, 0.15) 20%, rgba(59, 130, 246, 0.1) 35%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)',
                  animation: 'pulse-orb-secondary 10s ease-in-out infinite',
                  transform: 'translate(-50%, -50%)',
                  animationDelay: '1s'
                }}
              ></div>
              
              {/* Tertiary orb - Bottom right accent */}
              <div 
                className="absolute bottom-1/4 right-[15%] w-[380px] h-[380px] rounded-full blur-[90px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, rgba(191, 219, 254, 0.15) 0%, rgba(147, 197, 253, 0.12) 25%, rgba(96, 165, 250, 0.08) 40%, transparent 65%)',
                  animation: 'pulse-orb-tertiary 12s ease-in-out infinite',
                  transform: 'translate(50%, 50%)',
                  animationDelay: '2s'
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
