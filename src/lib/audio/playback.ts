import * as Tone from "tone";
import type { MidiNoteClip } from "@/lib/midi/types";

export class MidiPlaybackController {
  private synth: Tone.PolySynth | null = null;
  private clips: MidiNoteClip[] = [];
  private scheduledNotes: Tone.ToneEvent[] = [];
  private isInitialized = false;
  private timingSync: { start: () => void; pause: () => void; stop: () => void } | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await Tone.start();
    this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    this.isInitialized = true;
  }

  loadClips(clips: MidiNoteClip[]): void {
    this.clips = clips;
  }

  setTimingSync(sync: { start: () => void; pause: () => void; stop: () => void }): void {
    this.timingSync = sync;
  }

  async play(startTime: number = 0): Promise<void> {
    if (!this.synth) {
      await this.initialize();
    }

    this.stop();

    Tone.Transport.cancel();
    Tone.Transport.time = startTime;

    this.clips.forEach((clip) => {
      if (clip.start < startTime) return;

      const event = new Tone.ToneEvent((time) => {
        this.synth?.triggerAttackRelease(
          clip.noteName,
          clip.duration,
          time,
          clip.velocity / 127,
        );
      });

      event.start(clip.start);
      this.scheduledNotes.push(event);
    });

    Tone.Transport.start();
    this.timingSync?.start();
  }

  pause(): void {
    Tone.Transport.pause();
    this.timingSync?.pause();
  }

  stop(): void {
    this.scheduledNotes.forEach((event) => event.dispose());
    this.scheduledNotes = [];
    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.time = 0;
    this.timingSync?.stop();
  }

  seek(time: number): void {
    const wasPlaying = Tone.Transport.state === "started";
    this.stop();
    Tone.Transport.time = time;

    if (wasPlaying) {
      this.play(time);
    }
  }

  dispose(): void {
    this.stop();
    this.synth?.dispose();
    this.synth = null;
    this.isInitialized = false;
  }
}

