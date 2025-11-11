import { Note, Key } from "tonal";

export function detectKey(notes: number[]): string | null {
  if (notes.length === 0) return null;

  try {
    const noteNames = notes.map((midi) => Note.fromMidi(midi)).filter(Boolean);
    if (noteNames.length === 0) return null;

    const detected = Key.detect(noteNames);
    return detected && detected.length > 0 ? detected[0] : null;
  } catch {
    return null;
  }
}

export function getScaleDegree(noteNumber: number, key: string): number | null {
  try {
    const noteName = Note.fromMidi(noteNumber);
    if (!noteName) return null;

    const keyInfo = Key.majorKey(key);
    if (!keyInfo) return null;

    const scale = keyInfo.scale;
    const degree = scale.indexOf(noteName);
    return degree >= 0 ? degree + 1 : null;
  } catch {
    return null;
  }
}

