import type { MidiNoteClip } from "@/lib/midi/types";
import type { ColorMappingMode, ColorPalette, ColorMode } from "@/store/visualization-store";
import { detectKey, getScaleDegree } from "@/lib/music-theory/key-detection";
import { detectChord } from "@/lib/music-theory/chord-analysis";

export class ColorMapper {
  private key: string | null = null;
  private colorPalette?: ColorPalette;
  private colorGradient: string[] = [];
  private colorMode: ColorMode = "rgb";
  private hueVariation: number = 0.2;

  setKey(key: string | null): void {
    this.key = key;
  }

  setColorPalette(palette: ColorPalette): void {
    this.colorPalette = palette;
  }

  setColorMode(mode: ColorMode): void {
    this.colorMode = mode;
  }

  setHueVariation(variation: number): void {
    this.hueVariation = variation;
  }

  setColorGradient(gradient: string[]): void {
    this.colorGradient = gradient;
  }

  getColor(
    clip: MidiNoteClip,
    mode: ColorMappingMode,
    velocity: number = 1,
  ): { r: number; g: number; b: number; a: number } {
    let hue = 0;
    let saturation = 0.7;
    let brightness = 0.8;

    // Use gradient colors if available
    if (this.colorGradient.length >= 2) {
      const normalizedPitch = clip.noteNumber / 127;
      const colorIndex = normalizedPitch * (this.colorGradient.length - 1);
      const lowerIndex = Math.floor(colorIndex);
      const upperIndex = Math.min(Math.ceil(colorIndex), this.colorGradient.length - 1);
      const t = colorIndex - lowerIndex;
      
      const lowerColor = this.hexToRgba(this.colorGradient[lowerIndex], 1);
      const upperColor = this.hexToRgba(this.colorGradient[upperIndex], 1);
      
      // Interpolate between colors
      const r = Math.round(lowerColor.r + (upperColor.r - lowerColor.r) * t);
      const g = Math.round(lowerColor.g + (upperColor.g - lowerColor.g) * t);
      const b = Math.round(lowerColor.b + (upperColor.b - lowerColor.b) * t);
      
      // Apply velocity to brightness
      const brightness = 0.5 + (velocity / 127) * 0.5;
      return {
        r: Math.round(r * brightness),
        g: Math.round(g * brightness),
        b: Math.round(b * brightness),
        a: 1,
      };
    }

    switch (mode) {
      case "pitch": {
        hue = (clip.noteNumber / 127) * 360;
        break;
      }

      case "scale-degree": {
        if (this.key) {
          const degree = getScaleDegree(clip.noteNumber, this.key);
          if (degree) {
            hue = ((degree - 1) / 7) * 360;
          } else {
            hue = (clip.noteNumber / 127) * 360;
          }
        } else {
          hue = (clip.noteNumber / 127) * 360;
        }
        break;
      }

      case "chord": {
        const chord = detectChord([clip.noteNumber]);
        if (chord) {
          hue = (chord.charCodeAt(0) % 360);
        } else {
          hue = (clip.noteNumber / 127) * 360;
        }
        break;
      }

      case "aesthetic": {
        if (this.colorPalette && this.colorPalette.colors.length > 0) {
          const index = clip.noteNumber % this.colorPalette.colors.length;
          const color = this.colorPalette.colors[index];
          return this.hexToRgba(color, velocity);
        }
        hue = (clip.noteNumber / 127) * 360;
        break;
      }
    }

    // Apply hue variation for visual variety
    if (this.hueVariation > 0) {
      const variation = (Math.random() - 0.5) * this.hueVariation * 60; // Max 30 degrees variation
      hue = (hue + variation + 360) % 360;
    }

    brightness = 0.5 + (velocity / 127) * 0.5;

    // Return color based on colorMode
    if (this.colorMode === "hsl" || this.colorMode === "hsla") {
      return this.hslToRgba(hue, saturation, brightness, 1);
    } else {
      // RGB mode (default)
      return this.hslToRgba(hue, saturation, brightness, 1);
    }
  }

  private hslToRgba(
    h: number,
    s: number,
    l: number,
    a: number,
  ): { r: number; g: number; b: number; a: number } {
    h = h / 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = l - c / 2;

    let r = 0;
    let g = 0;
    let b = 0;

    if (h < 1 / 6) {
      r = c;
      g = x;
      b = 0;
    } else if (h < 2 / 6) {
      r = x;
      g = c;
      b = 0;
    } else if (h < 3 / 6) {
      r = 0;
      g = c;
      b = x;
    } else if (h < 4 / 6) {
      r = 0;
      g = x;
      b = c;
    } else if (h < 5 / 6) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
      a,
    };
  }

  private hexToRgba(
    hex: string,
    alpha: number,
  ): { r: number; g: number; b: number; a: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      return { r: 255, g: 255, b: 255, a: alpha };
    }

    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: alpha,
    };
  }
}

