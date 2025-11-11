"use client";

import { useVisualizationStore, type ColorMappingMode } from "@/store/visualization-store";

export function SettingsPanel() {
  const config = useVisualizationStore((state) => state.config);
  const setColorMappingMode = useVisualizationStore((state) => state.setColorMappingMode);
  const updateConfig = useVisualizationStore((state) => state.updateConfig);

  const handleColorMappingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setColorMappingMode(e.target.value as ColorMappingMode);
  };

  const handleVelocityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ showVelocity: e.target.checked });
  };

  const handleTrailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ showTrails: e.target.checked });
  };

  const handleTrailLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ trailLength: parseFloat(e.target.value) });
  };

  const handleParticleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ particleSize: parseInt(e.target.value) });
  };

  const handleConnectionDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ connectionDistance: parseInt(e.target.value) });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-white/50 mb-2.5">
          Color Mapping
        </label>
        <select
          value={config.colorMappingMode}
          onChange={handleColorMappingChange}
          className="w-full px-3.5 py-2.5 border border-white/10 rounded-lg bg-white/5 text-white text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all backdrop-blur-sm"
        >
          <option value="pitch">Pitch-based</option>
          <option value="scale-degree">Scale Degree</option>
          <option value="chord">Chord-based</option>
          <option value="aesthetic">Aesthetic</option>
        </select>
      </div>

      <div className="flex items-center justify-between py-1">
        <label className="text-sm text-white/80">
          Show Velocity
        </label>
        <input
          type="checkbox"
          checked={config.showVelocity}
          onChange={handleVelocityChange}
          className="w-4 h-4 rounded border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-white/20 focus:ring-offset-0 focus:ring-offset-transparent checked:bg-white checked:border-white"
        />
      </div>

      <div className="flex items-center justify-between py-1">
        <label className="text-sm text-white/80">
          Show Trails
        </label>
        <input
          type="checkbox"
          checked={config.showTrails}
          onChange={handleTrailsChange}
          className="w-4 h-4 rounded border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-white/20 focus:ring-offset-0 focus:ring-offset-transparent checked:bg-white checked:border-white"
        />
      </div>

      {config.showTrails && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-sm text-white/80">
              Trail Length
            </label>
            <span className="text-xs text-white/50 font-mono">
              {config.trailLength.toFixed(1)}s
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={config.trailLength}
            onChange={handleTrailLengthChange}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-sm text-white/80">
            Particle Size
          </label>
          <span className="text-xs text-white/50 font-mono">
            {config.particleSize}
          </span>
        </div>
        <input
          type="range"
          min="2"
          max="20"
          step="1"
          value={config.particleSize}
          onChange={handleParticleSizeChange}
          className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-sm text-white/80">
            Connection Distance
          </label>
          <span className="text-xs text-white/50 font-mono">
            {config.connectionDistance}
          </span>
        </div>
        <input
          type="range"
          min="50"
          max="300"
          step="10"
          value={config.connectionDistance}
          onChange={handleConnectionDistanceChange}
          className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
        />
      </div>
    </div>
  );
}
