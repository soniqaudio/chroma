import type { MidiNoteClip } from "@/lib/midi/types";
import type { ColorMappingMode, ColorPalette } from "@/store/visualization-store";
import { detectKey, getScaleDegree } from "@/lib/music-theory/key-detection";
import { detectChord } from "@/lib/music-theory/chord-analysis";

export class ColorMapper {
  private key: string | null = null;
  private colorPalette?: ColorPalette;

  setKey(key: string | null): void {
    this.key = key;
  }

  setColorPalette(palette: ColorPalette): void {
    this.colorPalette = palette;
  }

  getColor(
    clip: MidiNoteClip,
    mode: ColorMappingMode,
    velocity: number = 1,
  ): { r: number; g: number; b: number; a: number } {
    let hue = 0;
    let saturation = 0.7;
    let brightness = 0.8;

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

    brightness = 0.5 + (velocity / 127) * 0.5;

    return this.hslToRgba(hue, saturation, brightness, 1);
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

