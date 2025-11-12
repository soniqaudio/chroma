/**
 * Visualization constants used across style implementations
 */

/** Pixels per second - controls horizontal spacing of particles based on MIDI time */
export const TIME_SCALE = 200; // Increased to make particles flow across full width

/** Pixels per MIDI note - controls vertical spacing of particles based on pitch */
export const PITCH_SCALE = 4;

/** Time window (in seconds) for determining which clips are visible */
export const VISIBLE_WINDOW_SECONDS = 10;

/** Minimum alpha value for trail fade effect */
export const TRAIL_MIN_ALPHA = 12;

/** Maximum alpha value for trail fade effect */
export const TRAIL_MAX_ALPHA = 220;

/** Minimum spawn rate multiplier (when complexity is 0) */
export const MIN_SPAWN_RATE = 0.3;

/** Maximum spawn rate multiplier (when complexity is 1) */
export const MAX_SPAWN_RATE = 0.7;

/** Base velocity multiplier for particle movement */
export const BASE_VELOCITY_MULTIPLIER = 0.5;

/** Rotation speed multiplier for motionSpeed control */
export const ROTATION_SPEED_MULTIPLIER = 0.02;

/** Velocity multiplier range for motionSpeed control */
export const VELOCITY_MULTIPLIER_RANGE = 0.5;

/** Blur filter multiplier (blurAmount * BLUR_MULTIPLIER = actual blur pixels) */
export const BLUR_MULTIPLIER = 3;

/** Culling distance for particles outside viewport (pixels) */
export const PARTICLE_CULL_DISTANCE = 100;

/** Connection line culling distance (pixels) */
export const CONNECTION_CULL_DISTANCE = 150;

/** MIDI note range constants */
export const MIDI_NOTE_MIN = 21; // A0
export const MIDI_NOTE_MAX = 108; // C8
export const MIDI_NOTE_RANGE = MIDI_NOTE_MAX - MIDI_NOTE_MIN; // 87 notes

/**
 * Calculates the Y position on canvas for a MIDI note number
 * Maps A0 (21) to bottom of canvas, C8 (108) to top
 * @param noteNumber - MIDI note number (0-127)
 * @param viewportHeight - Canvas height in pixels
 * @returns Y position in pixels (0 = top, viewportHeight = bottom)
 */
export function getNoteYPosition(noteNumber: number, viewportHeight: number): number {
  // Clamp note number to valid range
  const clampedNote = Math.max(MIDI_NOTE_MIN, Math.min(MIDI_NOTE_MAX, noteNumber));
  // Map note to 0-1 range (0 = A0, 1 = C8)
  const normalized = (clampedNote - MIDI_NOTE_MIN) / MIDI_NOTE_RANGE;
  // Invert so A0 is at bottom (viewportHeight) and C8 is at top (0)
  return viewportHeight * (1 - normalized);
}

