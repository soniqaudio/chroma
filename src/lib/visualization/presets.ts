import type { VisualizationConfig } from "@/store/visualization-store";

export interface PresetDefinition {
  name: string;
  description: string;
  config: Partial<VisualizationConfig>;
}

export const presets: Record<string, PresetDefinition> = {
  chromatic: {
    name: "Chromatic",
    description: "Classic chromatic color mapping",
    config: {
      colorMappingMode: "pitch",
      colorMode: "rgb",
      particleShape: "circle",
      trailMode: "fade",
      trailIntensity: 0.1,
      particleDrift: 0.3,
      particleRotation: false,
      intensity: 0.75,
      complexity: 0.6,
      motionSpeed: 0.5,
      hueVariation: 0.2,
    },
  },
  minimal: {
    name: "Minimal",
    description: "Clean and minimal aesthetic",
    config: {
      colorMappingMode: "pitch",
      colorMode: "rgb",
      particleShape: "circle",
      trailMode: "none",
      trailIntensity: 0.05,
      particleDrift: 0.05, // Very low drift
      particleRotation: false,
      intensity: 0.3, // Low intensity
      complexity: 0.2, // Low complexity
      motionSpeed: 0.3,
      hueVariation: 0.05, // Minimal variation
      showTrails: false,
      particleSize: 3, // Smaller particles
      showVelocity: false,
    },
  },
  vibrant: {
    name: "Vibrant",
    description: "High saturation and energy",
    config: {
      colorMappingMode: "pitch",
      colorMode: "hsl",
      particleShape: "mixed", // Mixed shapes
      trailMode: "glow",
      trailIntensity: 0.25,
      particleDrift: 0.7, // High drift
      particleRotation: true, // Rotation enabled
      intensity: 1.0, // Maximum intensity
      complexity: 0.95, // High complexity
      motionSpeed: 0.9, // Fast motion
      hueVariation: 0.6, // High hue variation
      showTrails: true,
      particleSize: 7, // Larger particles
      showVelocity: true,
    },
  },
  monochrome: {
    name: "Monochrome",
    description: "Single color aesthetic",
    config: {
      colorMappingMode: "aesthetic",
      colorMode: "rgb",
      particleShape: "rectangle", // Rectangles
      trailMode: "fade",
      trailIntensity: 0.12,
      particleDrift: 0.15, // Low drift
      particleRotation: false,
      intensity: 0.5,
      complexity: 0.3,
      motionSpeed: 0.4,
      hueVariation: 0, // No hue variation
      showTrails: true,
      particleSize: 5,
      showVelocity: false,
    },
  },
  orbital: {
    name: "Orbital",
    description: "Radial motion inspired by orbital particles",
    config: {
      colorMappingMode: "pitch",
      colorMode: "hsl",
      particleShape: "circle",
      trailMode: "glow",
      trailIntensity: 0.3, // Higher for visible trails
      particleDrift: 1.0, // Maximum drift for orbital feel
      particleRotation: false,
      intensity: 1.0,
      complexity: 0.9,
      motionSpeed: 0.8,
      hueVariation: 0.7, // Very high hue variation for color wheel effect
      showTrails: true,
      particleSize: 6, // Larger particles
      showVelocity: true,
    },
  },
  fluid: {
    name: "Fluid",
    description: "Smooth, flowing motion like fluid dynamics",
    config: {
      colorMappingMode: "pitch",
      colorMode: "hsla",
      particleShape: "circle",
      trailMode: "fade",
      trailIntensity: 0.4, // Much higher for fluid trails
      particleDrift: 0.9, // High smooth organic movement
      particleRotation: false,
      intensity: 0.8,
      complexity: 1.0, // Maximum complexity for fluid-like behavior
      motionSpeed: 0.3, // Slower for fluid feel
      hueVariation: 0.4,
      showTrails: true,
      particleSize: 2, // Much smaller particles for fluid feel
      blurAmount: 0.6, // More blur for fluid effect
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

  return {
    ...currentConfig,
    ...preset.config,
    preset: presetName,
  };
}

export function getPresetList(): PresetDefinition[] {
  return Object.values(presets);
}

