import type p5 from "p5";
import type { MidiNoteClip } from "@/lib/midi/types";
import type { VisualizationConfig } from "@/store/visualization-store";
import { FlowingParticlesStyle } from "./styles/flowing-particles";
import { ColorMapper } from "./color-mapper";
import { detectKey } from "@/lib/music-theory/key-detection";

export class VisualizationRenderer {
  private p5Instance: p5 | null = null;
  private style: FlowingParticlesStyle;
  private colorMapper: ColorMapper;
  private config: VisualizationConfig;
  private clips: MidiNoteClip[] = [];
  private currentTime: number = 0;
  private cameraX: number = 0;
  private followPlayhead: boolean = true;

  constructor(config: VisualizationConfig) {
    this.config = config;
    this.colorMapper = new ColorMapper();
    this.colorMapper.setColorMode(config.colorMode);
    this.colorMapper.setHueVariation(config.hueVariation);
    this.style = new FlowingParticlesStyle(config, this.colorMapper);
  }

  initialize(p5: p5): void {
    this.p5Instance = p5;
    this.style.setViewport(p5.width, p5.height);

    const key = detectKey(this.clips.map((c) => c.noteNumber));
    this.colorMapper.setKey(key);
  }

  updateConfig(config: VisualizationConfig): void {
    this.config = config;
    this.style.updateConfig(config);
    this.colorMapper.setColorPalette(config.colorPalette!);
    this.colorMapper.setColorMode(config.colorMode);
    this.colorMapper.setHueVariation(config.hueVariation);
  }

  setClips(clips: MidiNoteClip[]): void {
    this.clips = clips;
    const key = detectKey(clips.map((c) => c.noteNumber));
    this.colorMapper.setKey(key);
  }

  setCurrentTime(time: number): void {
    this.currentTime = time;

    this.cameraX = 0;
    this.style.setCameraX(0);
  }

  setFollowPlayhead(follow: boolean): void {
    this.followPlayhead = follow;
  }

  render(p5: p5): void {
    // Trail effect is handled in style.render()
    this.style.updateClips(this.clips, this.currentTime);
    this.style.update(this.currentTime);
    this.style.render(p5);
  }

  resize(width: number, height: number): void {
    if (this.p5Instance) {
      this.style.setViewport(width, height);
    }
  }

  dispose(): void {
    this.style.clear();
  }
}

