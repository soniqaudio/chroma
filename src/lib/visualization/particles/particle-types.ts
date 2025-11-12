import type { MidiNoteClip } from "@/lib/midi/types";

export type ParticleShapeType = "circle" | "rectangle" | "glitch-block";

/**
 * Represents a single particle in the visualization
 */
export interface Particle {
  /** X position on canvas */
  x: number;
  /** Y position on canvas */
  y: number;
  /** Vertical velocity */
  vy: number;
  /** Particle size (radius for circles) */
  size: number;
  /** Particle color (RGBA) */
  color: { r: number; g: number; b: number; a: number };
  /** Current age in frames */
  age: number;
  /** Maximum age in frames */
  maxAge: number;
  /** Current life remaining */
  life: number;
  /** Maximum life */
  maxLife: number;
  /** Associated MIDI clip */
  clip: MidiNoteClip;
  /** Particle shape type */
  shape: ParticleShapeType;
  /** Rotation angle (for rectangles/glitch blocks) */
  rotation: number;
  /** Y-axis drift velocity */
  driftY: number;
  /** Width (for rectangles/glitch blocks) */
  width: number;
  /** Height (for rectangles/glitch blocks) */
  height: number;
}

