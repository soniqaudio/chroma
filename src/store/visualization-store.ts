import { create } from "zustand";
import { applyPreset } from "@/lib/visualization/presets";

export type ColorMappingMode = "pitch" | "scale-degree" | "chord" | "aesthetic";
export type ParticleShape = "circle" | "rectangle" | "glitch-block" | "mixed";
export type TrailMode = "none" | "fade" | "glow";
export type ColorMode = "rgb" | "hsl" | "hsla";

export interface ColorPalette {
  colors: string[];
  name: string;
}

export interface VisualizationConfig {
  style: string;
  preset: string;
  colorMappingMode: ColorMappingMode;
  colorPalette?: ColorPalette;
  showVelocity: boolean;
  showTrails: boolean;
  trailLength: number;
  particleSize: number;
  connectionDistance: number;
  intensity: number;
  complexity: number;
  motionSpeed: number;
  blurAmount: number;
  particleShape: ParticleShape;
  trailMode: TrailMode;
  trailIntensity: number;
  colorMode: ColorMode;
  hueVariation: number;
  particleDrift: number;
  particleRotation: boolean;
  layers: {
    background: boolean;
    particles: boolean;
    harmonics: boolean;
    melody: boolean;
  };
}

interface VisualizationStore {
  config: VisualizationConfig;
  setStyle: (style: string) => void;
  setPreset: (preset: string) => void;
  setColorMappingMode: (mode: ColorMappingMode) => void;
  setColorPalette: (palette: ColorPalette) => void;
  updateConfig: (updates: Partial<VisualizationConfig>) => void;
  toggleLayer: (layer: keyof VisualizationConfig["layers"]) => void;
}

const defaultConfig: VisualizationConfig = {
  style: "flowing-particles",
  preset: "chromatic",
  colorMappingMode: "pitch",
  showVelocity: true,
  showTrails: true,
  trailLength: 2,
  particleSize: 4,
  connectionDistance: 100,
  intensity: 0.75,
  complexity: 0.6,
  motionSpeed: 0.5,
  blurAmount: 0.25,
  particleShape: "circle",
  trailMode: "fade",
  trailIntensity: 0.1,
  colorMode: "rgb",
  hueVariation: 0.2,
  particleDrift: 0.3,
  particleRotation: false,
  layers: {
    background: true,
    particles: true,
    harmonics: true,
    melody: true,
  },
};

export const useVisualizationStore = create<VisualizationStore>((set) => ({
  config: defaultConfig,

  setStyle: (style) =>
    set((state) => ({
      config: { ...state.config, style },
    })),

  setPreset: (preset) =>
    set((state) => {
      const newConfig = applyPreset(preset, state.config);
      return { config: newConfig };
    }),

  setColorMappingMode: (mode) =>
    set((state) => ({
      config: { ...state.config, colorMappingMode: mode },
    })),

  setColorPalette: (palette) =>
    set((state) => ({
      config: { ...state.config, colorPalette: palette },
    })),

  updateConfig: (updates) =>
    set((state) => ({
      config: { ...state.config, ...updates },
    })),

  toggleLayer: (layer) =>
    set((state) => ({
      config: {
        ...state.config,
        layers: {
          ...state.config.layers,
          [layer]: !state.config.layers[layer],
        },
      },
    })),
}));

