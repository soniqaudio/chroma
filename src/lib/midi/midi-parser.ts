import { Midi } from "@tonejs/midi";
import type {
  MidiDomainEvent,
  MidiNoteClip,
  MidiControlChangeEvent,
  ParsedMidiData,
} from "./types";
import { NoteStack } from "./note-stack";
import { Note } from "tonal";

export function parseMidiFile(file: File): Promise<ParsedMidiData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error("Failed to read file"));
          return;
        }
        const midi = new Midi(arrayBuffer);
        const parsed = convertMidiToDomainEvents(midi);
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

function convertMidiToDomainEvents(midi: Midi): ParsedMidiData {
  const events: MidiDomainEvent[] = [];
  const controlEvents: MidiControlChangeEvent[] = [];
  let maxTime = 0;

  midi.tracks.forEach((track, trackIndex) => {
    track.notes.forEach((note) => {
      const noteOnEvent: MidiDomainEvent = {
        id: `${trackIndex}-noteOn-${note.ticks}-${note.midi}`,
        type: "noteOn",
        timestamp: note.time,
        channel: note.channel ?? 0,
        noteNumber: note.midi,
        velocity: Math.round(note.velocity * 127),
      };
      events.push(noteOnEvent);

      const noteOffTime = note.time + note.duration;
      const noteOffEvent: MidiDomainEvent = {
        id: `${trackIndex}-noteOff-${note.ticks + note.duration}-${note.midi}`,
        type: "noteOff",
        timestamp: noteOffTime,
        channel: note.channel ?? 0,
        noteNumber: note.midi,
        velocity: 0,
      };
      events.push(noteOffEvent);

      maxTime = Math.max(maxTime, noteOffTime);
    });

    if (track.controlChanges && Array.isArray(track.controlChanges)) {
      track.controlChanges.forEach((cc) => {
        const ccEvent: MidiControlChangeEvent = {
          id: `${trackIndex}-cc-${cc.ticks}-${cc.number}`,
          controller: cc.number,
          time: cc.time,
          value: cc.value,
          channel: cc.channel ?? 0,
        };
        controlEvents.push(ccEvent);
      });
    }
  });

  events.sort((a, b) => a.timestamp - b.timestamp);

  const { clips, clipsWithoutSustain } = deriveClipsFromEvents(
    events,
    controlEvents,
  );

  return {
    events,
    clips,
    clipsWithoutSustain,
    controlEvents,
    duration: maxTime,
    tempo: midi.header.tempos[0]?.bpm,
  };
}

function deriveClipsFromEvents(
  events: MidiDomainEvent[],
  controlEvents: MidiControlChangeEvent[],
): {
  clips: MidiNoteClip[];
  clipsWithoutSustain: MidiNoteClip[];
} {
  const noteStack = new NoteStack();
  const clips: MidiNoteClip[] = [];
  const clipsWithoutSustain: MidiNoteClip[] = [];
  const sustainPedalState = new Map<number, boolean>();
  const pendingNoteOffs = new Map<string, MidiDomainEvent>();

  controlEvents.forEach((cc) => {
    if (cc.controller === 64) {
      sustainPedalState.set(cc.channel, cc.value >= 64);
      if (cc.value < 64) {
        const channel = cc.channel;
        pendingNoteOffs.forEach((event, key) => {
          if (event.channel === channel) {
            const stackEntry = noteStack.pop(channel, event.noteNumber!);
            if (stackEntry) {
              const clip: MidiNoteClip = {
                id: `clip-${stackEntry.timestamp}-${event.noteNumber}`,
                noteNumber: event.noteNumber!,
                noteName: Note.fromMidi(event.noteNumber!) || "",
                start: stackEntry.timestamp,
                duration: event.timestamp - stackEntry.timestamp,
                velocity: stackEntry.velocity,
                channel,
              };
              clips.push(clip);
            }
            pendingNoteOffs.delete(key);
          }
        });
      }
    }
  });

  events.forEach((event) => {
    if (event.type === "noteOn" && event.noteNumber !== undefined) {
      noteStack.push(
        event.channel,
        event.noteNumber,
        event.velocity ?? 64,
        event.timestamp,
      );
    } else if (event.type === "noteOff" && event.noteNumber !== undefined) {
      const isSustainPressed =
        sustainPedalState.get(event.channel) ?? false;
      const stackEntry = noteStack.pop(event.channel, event.noteNumber);

      if (stackEntry) {
        const clip: MidiNoteClip = {
          id: `clip-${stackEntry.timestamp}-${event.noteNumber}`,
          noteNumber: event.noteNumber,
          noteName: Note.fromMidi(event.noteNumber) || "",
          start: stackEntry.timestamp,
          duration: event.timestamp - stackEntry.timestamp,
          velocity: stackEntry.velocity,
          channel: event.channel,
        };

        clipsWithoutSustain.push(clip);

        if (isSustainPressed) {
          const key = `${event.channel}-${event.noteNumber}`;
          pendingNoteOffs.set(key, event);
        } else {
          clips.push(clip);
        }
      }
    }
  });

  pendingNoteOffs.forEach((event) => {
    const stackEntry = noteStack.pop(event.channel, event.noteNumber!);
    if (stackEntry) {
      const clip: MidiNoteClip = {
        id: `clip-${stackEntry.timestamp}-${event.noteNumber}`,
        noteNumber: event.noteNumber!,
        noteName: Note.fromMidi(event.noteNumber!) || "",
        start: stackEntry.timestamp,
        duration: event.timestamp - stackEntry.timestamp,
        velocity: stackEntry.velocity,
        channel: event.channel,
      };
      clips.push(clip);
    }
  });

  return { clips, clipsWithoutSustain };
}

