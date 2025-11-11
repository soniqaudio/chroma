export interface MidiDomainEvent {
  id: string;
  type: "noteOn" | "noteOff" | "cc";
  timestamp: number;
  channel: number;
  noteNumber?: number;
  velocity?: number;
  controller?: number;
  value?: number;
}

export interface MidiNoteClip {
  id: string;
  noteNumber: number;
  noteName: string;
  start: number;
  duration: number;
  velocity: number;
  channel: number;
}

export interface MidiControlChangeEvent {
  id: string;
  controller: number;
  time: number;
  value: number;
  channel: number;
}

export interface ParsedMidiData {
  events: MidiDomainEvent[];
  clips: MidiNoteClip[];
  clipsWithoutSustain: MidiNoteClip[];
  controlEvents: MidiControlChangeEvent[];
  duration: number;
  tempo?: number;
}

