import type p5 from "p5";
import type { MidiNoteClip } from "@/lib/midi/types";
import type { VisualizationConfig } from "@/store/visualization-store";

/**
 * Base interface for all visualization styles
 * Each style implementation should provide methods for updating and rendering particles
 */
export interface IVisualizationStyle {
  /**
   * Update the viewport dimensions
   * @param width - Canvas width in pixels
   * @param height - Canvas height in pixels
   */
  setViewport(width: number, height: number): void;

  /**
   * Set the camera X position for scrolling
   * @param x - Camera X offset in pixels
   */
  setCameraX(x: number): void;

  /**
   * Update configuration
   * @param config - New visualization configuration
   */
  updateConfig(config: VisualizationConfig): void;

  /**
   * Update clips and spawn particles based on current time
   * @param clips - Array of MIDI note clips
   * @param currentTime - Current playback time in seconds
   */
  updateClips(clips: MidiNoteClip[], currentTime: number): void;

  /**
   * Update particle positions and physics
   * @param currentTime - Current playback time in seconds
   */
  update(currentTime: number): void;

  /**
   * Render particles to the canvas
   * @param p5 - p5.js instance
   */
  render(p5: p5): void;

  /**
   * Clear all particles
   */
  clear(): void;
}

