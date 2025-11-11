import { usePlaybackStore } from "@/store/playback-store";
import * as Tone from "tone";

export class TimingSync {
  private animationFrameId: number | null = null;

  start(): void {
    this.update();
  }

  pause(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private update = (): void => {
    const store = usePlaybackStore.getState();
    if (store.isPlaying) {
      const currentTime = Tone.Transport.seconds * store.playbackSpeed;
      store.setCurrentTime(currentTime);
    }

    this.animationFrameId = requestAnimationFrame(this.update);
  };
}

