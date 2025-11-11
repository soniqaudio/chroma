import { create } from "zustand";
import type {
  MidiDomainEvent,
  MidiNoteClip,
  MidiControlChangeEvent,
  ParsedMidiData,
} from "@/lib/midi/types";

interface MidiStore {
  events: MidiDomainEvent[];
  clips: MidiNoteClip[];
  clipsWithoutSustain: MidiNoteClip[];
  controlEvents: MidiControlChangeEvent[];
  duration: number;
  tempo?: number;
  isLoading: boolean;
  error: string | null;

  setMidiData: (data: ParsedMidiData) => void;
  addLiveEvent: (event: MidiDomainEvent) => void;
  clear: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMidiStore = create<MidiStore>((set) => ({
  events: [],
  clips: [],
  clipsWithoutSustain: [],
  controlEvents: [],
  duration: 0,
  tempo: undefined,
  isLoading: false,
  error: null,

  setMidiData: (data) =>
    set({
      events: data.events,
      clips: data.clips,
      clipsWithoutSustain: data.clipsWithoutSustain,
      controlEvents: data.controlEvents,
      duration: data.duration,
      tempo: data.tempo,
      error: null,
    }),

  addLiveEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
    })),

  clear: () =>
    set({
      events: [],
      clips: [],
      clipsWithoutSustain: [],
      controlEvents: [],
      duration: 0,
      tempo: undefined,
      error: null,
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}));

