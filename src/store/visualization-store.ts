import { create } from "zustand";

export type ColorMappingMode = "pitch" | "scale-degree" | "chord" | "aesthetic";

export interface ColorPalette {
  colors: string[];
  name: string;
}

export interface VisualizationConfig {
  style: string;
  colorMappingMode: ColorMappingMode;
  colorPalette?: ColorPalette;
  showVelocity: boolean;
  showTrails: boolean;
  trailLength: number;
  particleSize: number;
  connectionDistance: number;
}

interface VisualizationStore {
  config: VisualizationConfig;
  setStyle: (style: string) => void;
  setColorMappingMode: (mode: ColorMappingMode) => void;
  setColorPalette: (palette: ColorPalette) => void;
  updateConfig: (updates: Partial<VisualizationConfig>) => void;
}

const defaultConfig: VisualizationConfig = {
  style: "flowing-particles",
  colorMappingMode: "pitch",
  showVelocity: true,
  showTrails: true,
  trailLength: 2,
  particleSize: 4,
  connectionDistance: 100,
};

export const useVisualizationStore = create<VisualizationStore>((set) => ({
  config: defaultConfig,

  setStyle: (style) =>
    set((state) => ({
      config: { ...state.config, style },
    })),

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
}));

