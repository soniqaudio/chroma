import type { VisualizationConfig } from "@/store/visualization-store";

export interface PresetDefinition {
  name: string;
  description: string;
  config: Partial<VisualizationConfig>;
}

export const presets: Record<string, PresetDefinition> = {
  chromatic: {
    name: "Chromatic",
    description: "Classic flowing particles",
    config: {
      particleShape: "circle",
      trailMode: "fade",
      trailIntensity: 0.1,
      particleDrift: 0.3,
      particleRotation: false,
      intensity: 0.75,
      complexity: 0.6,
      motionSpeed: 0.5,
      showTrails: false,
      particleSize: 4,
      showVelocity: false,
    },
  },
  glitch: {
    name: "Glitch",
    description: "Digital corruption and scanline effects",
    config: {
      particleShape: "glitch-block",
      trailMode: "fade",
      trailIntensity: 0.15,
      particleDrift: 0.2,
      particleRotation: false,
      intensity: 0.9,
      complexity: 0.7,
      motionSpeed: 0.6,
      showTrails: false,
      particleSize: 8,
      showVelocity: false,
    },
  },
  crystal: {
    name: "Crystal",
    description: "Rotating crystal polygons with trails",
    config: {
      particleShape: "circle", // Will be overridden to crystal polygons
      trailMode: "fade",
      trailIntensity: 0.2,
      particleDrift: 0.05, // Very minimal drift for cleaner look
      particleRotation: true,
      intensity: 0.95, // Higher intensity for more visibility
      complexity: 0.9, // Higher complexity = more crystals spawn
      motionSpeed: 0.3, // Slower for more visible rotation
      showTrails: true,
      particleSize: 8, // Larger base size
      showVelocity: false,
    },
  },
  fluid: {
    name: "Fluid",
    description: "Smooth fluid dynamics with density fields",
    config: {
      particleShape: "circle",
      trailMode: "fade",
      trailIntensity: 0.4, // Higher for fluid trails
      particleDrift: 0.05, // Minimal - fluid grid handles movement
      particleRotation: false,
      intensity: 0.8,
      complexity: 1.0, // Maximum complexity for fluid behavior
      motionSpeed: 0.3, // Slower for fluid feel
      showTrails: true,
      particleSize: 3, // Smaller particles for fluid feel
      showVelocity: false,
    },
  },
};

export function applyPreset(
  presetName: string,
  currentConfig: VisualizationConfig,
): VisualizationConfig {
  const preset = presets[presetName];
  if (!preset) {
    console.warn(`Preset "${presetName}" not found`);
    return currentConfig;
  }

  // Preserve color settings (they are global, not preset-specific)
  const { colorMappingMode, colorMode, hueVariation, colorPalette } = currentConfig;

  return {
    ...currentConfig,
    ...preset.config,
    preset: presetName,
    // Explicitly preserve color settings
    colorMappingMode,
    colorMode,
    hueVariation,
    colorPalette,
  };
}

export function getPresetList(): PresetDefinition[] {
  return Object.values(presets);
}

