import { Note, Chord } from "tonal";
import type { MidiNoteClip } from "@/lib/midi/types";

export function detectChord(notes: number[], timeWindow: number = 0.1): string | null {
  if (notes.length < 2) return null;

  try {
    const noteNames = notes.map((midi) => Note.fromMidi(midi)).filter(Boolean);
    if (noteNames.length < 2) return null;

    const detected = Chord.detect(noteNames);
    return detected && detected.length > 0 ? detected[0] : null;
  } catch {
    return null;
  }
}

export function getChordsAtTime(
  clips: MidiNoteClip[],
  time: number,
  window: number = 0.1,
): string[] {
  const activeNotes = clips
    .filter(
      (clip) =>
        clip.start <= time && clip.start + clip.duration >= time - window,
    )
    .map((clip) => clip.noteNumber);

  if (activeNotes.length === 0) return [];

  const chord = detectChord(activeNotes, window);
  return chord ? [chord] : [];
}

