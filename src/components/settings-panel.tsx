"use client";

import { useVisualizationStore, type ColorMappingMode, type ParticleShape, type TrailMode, type ColorMode } from "@/store/visualization-store";
import { Dropdown } from "@/components/ui/dropdown";
import { getPresetList, presets } from "@/lib/visualization/presets";

export function SettingsPanel() {
  const config = useVisualizationStore((state) => state.config);
  const setPreset = useVisualizationStore((state) => state.setPreset);
  const setColorMappingMode = useVisualizationStore((state) => state.setColorMappingMode);
  const updateConfig = useVisualizationStore((state) => state.updateConfig);
  const toggleLayer = useVisualizationStore((state) => state.toggleLayer);

  // Create preset options directly from preset keys to ensure matching
  const presetOptions = Object.keys(presets).map((key) => ({
    value: key,
    label: presets[key].name,
  }));

  const colorMappingOptions = [
    { value: "pitch", label: "Pitch-based" },
    { value: "scale-degree", label: "Scale Degree" },
    { value: "chord", label: "Chord-based" },
    { value: "aesthetic", label: "Aesthetic" },
  ];

  const particleShapeOptions = [
    { value: "circle", label: "Circle" },
    { value: "rectangle", label: "Rectangle" },
    { value: "glitch-block", label: "Glitch Block" },
    { value: "mixed", label: "Mixed" },
  ];

  const trailModeOptions = [
    { value: "none", label: "None" },
    { value: "fade", label: "Fade" },
    { value: "glow", label: "Glow" },
  ];

  const colorModeOptions = [
    { value: "rgb", label: "RGB" },
    { value: "hsl", label: "HSL" },
    { value: "hsla", label: "HSLA" },
  ];

  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ intensity: parseFloat(e.target.value) });
  };

  const handleComplexityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ complexity: parseFloat(e.target.value) });
  };

  const handleMotionSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ motionSpeed: parseFloat(e.target.value) });
  };

  const handleBlurAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ blurAmount: parseFloat(e.target.value) });
  };

  const handleVelocityToggle = () => {
    updateConfig({ showVelocity: !config.showVelocity });
  };

  const handleTrailsToggle = () => {
    updateConfig({ showTrails: !config.showTrails });
  };

  const handleTrailIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ trailIntensity: parseFloat(e.target.value) });
  };

  const handleHueVariationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ hueVariation: parseFloat(e.target.value) });
  };

  const handleParticleDriftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ particleDrift: parseFloat(e.target.value) });
  };

  const handleParticleRotationToggle = () => {
    updateConfig({ particleRotation: !config.particleRotation });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">
            Preset
          </label>
          <Dropdown
            value={config.preset}
            options={presetOptions}
            onChange={setPreset}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">
            Color Mapping
          </label>
          <Dropdown
            value={config.colorMappingMode}
            options={colorMappingOptions}
            onChange={(value) => setColorMappingMode(value as ColorMappingMode)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">
            Particle Shape
          </label>
          <Dropdown
            value={config.particleShape}
            options={particleShapeOptions}
            onChange={(value) => updateConfig({ particleShape: value as ParticleShape })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">
            Trail Mode
          </label>
          <Dropdown
            value={config.trailMode}
            options={trailModeOptions}
            onChange={(value) => updateConfig({ trailMode: value as TrailMode })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">
            Color Mode
          </label>
          <Dropdown
            value={config.colorMode}
            options={colorModeOptions}
            onChange={(value) => updateConfig({ colorMode: value as ColorMode })}
          />
        </div>

        <button
          onClick={handleParticleRotationToggle}
          className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            config.particleRotation
              ? "bg-blue-500/15 text-blue-200 border border-blue-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/[0.07] hover:text-white/80"
          }`}
        >
          Rotation
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleVelocityToggle}
          className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            config.showVelocity
              ? "bg-blue-500/15 text-blue-200 border border-blue-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/[0.07] hover:text-white/80"
          }`}
        >
          Velocity
        </button>
        <button
          onClick={handleTrailsToggle}
          className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            config.showTrails
              ? "bg-blue-500/15 text-blue-200 border border-blue-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/[0.07] hover:text-white/80"
          }`}
        >
          Trails
        </button>
      </div>

      <div className="border-t border-white/5 pt-4">
        <div className="flex items-center gap-1.5 mb-3">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="text-white/50">
            <path d="M7 1L9 4.5L13 5.5L10.5 8.5L11 12.5L7 10.5L3 12.5L3.5 8.5L1 5.5L5 4.5L7 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-[0.15em]">
            Parameters
          </h3>
        </div>

        <div className="space-y-2.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-white/80">Intensity</label>
              <span className="text-xs text-white/50 font-mono">
                {config.intensity.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.intensity}
              onChange={handleIntensityChange}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
              style={{
                background: `linear-gradient(to right, white 0%, white ${config.intensity * 100}%, rgba(255,255,255,0.1) ${config.intensity * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-white/80">Complexity</label>
              <span className="text-xs text-white/50 font-mono">
                {config.complexity.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.complexity}
              onChange={handleComplexityChange}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
              style={{
                background: `linear-gradient(to right, white 0%, white ${config.complexity * 100}%, rgba(255,255,255,0.1) ${config.complexity * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-white/80">Motion Speed</label>
              <span className="text-xs text-white/50 font-mono">
                {config.motionSpeed.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.motionSpeed}
              onChange={handleMotionSpeedChange}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
              style={{
                background: `linear-gradient(to right, white 0%, white ${config.motionSpeed * 100}%, rgba(255,255,255,0.1) ${config.motionSpeed * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-white/80">Blur Amount</label>
              <span className="text-xs text-white/50 font-mono">
                {config.blurAmount.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.blurAmount}
              onChange={handleBlurAmountChange}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
              style={{
                background: `linear-gradient(to right, white 0%, white ${config.blurAmount * 100}%, rgba(255,255,255,0.1) ${config.blurAmount * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-white/80">Trail Intensity</label>
              <span className="text-xs text-white/50 font-mono">
                {config.trailIntensity.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.trailIntensity}
              onChange={handleTrailIntensityChange}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
              style={{
                background: `linear-gradient(to right, white 0%, white ${config.trailIntensity * 100}%, rgba(255,255,255,0.1) ${config.trailIntensity * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-white/80">Hue Variation</label>
              <span className="text-xs text-white/50 font-mono">
                {config.hueVariation.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.hueVariation}
              onChange={handleHueVariationChange}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
              style={{
                background: `linear-gradient(to right, white 0%, white ${config.hueVariation * 100}%, rgba(255,255,255,0.1) ${config.hueVariation * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-white/80">Particle Drift</label>
              <span className="text-xs text-white/50 font-mono">
                {config.particleDrift.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.particleDrift}
              onChange={handleParticleDriftChange}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
              style={{
                background: `linear-gradient(to right, white 0%, white ${config.particleDrift * 100}%, rgba(255,255,255,0.1) ${config.particleDrift * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 pt-4">
        <div className="flex items-center gap-1.5 mb-3">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="text-white/50">
            <rect x="2" y="2" width="10" height="10" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <rect x="4" y="4" width="6" height="6" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <rect x="6" y="6" width="2" height="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
          </svg>
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-[0.15em]">
            Layers
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => toggleLayer("background")}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              config.layers.background
                ? "bg-blue-500/15 text-blue-200 border border-blue-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/[0.07] hover:text-white/80"
            }`}
          >
            <div className={`w-2 h-2 rounded-full border ${config.layers.background ? "bg-white border-white" : "border-white/30"}`} />
            Background
          </button>
          <button
            onClick={() => toggleLayer("particles")}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              config.layers.particles
                ? "bg-blue-500/15 text-blue-200 border border-blue-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/[0.07] hover:text-white/80"
            }`}
          >
            <div className={`w-2 h-2 rounded-full border ${config.layers.particles ? "bg-white border-white" : "border-white/30"}`} />
            Particles
          </button>
          <button
            onClick={() => toggleLayer("harmonics")}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              config.layers.harmonics
                ? "bg-blue-500/15 text-blue-200 border border-blue-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/[0.07] hover:text-white/80"
            }`}
          >
            <div className={`w-2 h-2 rounded-full border ${config.layers.harmonics ? "bg-white border-white" : "border-white/30"}`} />
            Harmonics
          </button>
          <button
            onClick={() => toggleLayer("melody")}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              config.layers.melody
                ? "bg-blue-500/15 text-blue-200 border border-blue-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/[0.07] hover:text-white/80"
            }`}
          >
            <div className={`w-2 h-2 rounded-full border ${config.layers.melody ? "bg-white border-white" : "border-white/30"}`} />
            Melody
          </button>
        </div>
      </div>
    </div>
  );
}
