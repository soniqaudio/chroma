import type p5 from "p5";
import type { MidiNoteClip } from "@/lib/midi/types";
import type { VisualizationConfig } from "@/store/visualization-store";
import { ColorMapper } from "../color-mapper";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: { r: number; g: number; b: number; a: number };
  age: number;
  maxAge: number;
  clip: MidiNoteClip;
}

export class FlowingParticlesStyle {
  private particles: Particle[] = [];
  private colorMapper: ColorMapper;
  private config: VisualizationConfig;
  private timeScale: number = 100;
  private pitchScale: number = 4;
  private viewportWidth: number = 0;
  private viewportHeight: number = 0;
  private cameraX: number = 0;

  constructor(config: VisualizationConfig, colorMapper: ColorMapper) {
    this.config = config;
    this.colorMapper = colorMapper;
  }

  updateConfig(config: VisualizationConfig): void {
    this.config = config;
  }

  setViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  setCameraX(x: number): void {
    this.cameraX = x;
  }

  updateClips(clips: MidiNoteClip[], currentTime: number): void {
    const visibleWindow = 5;
    const visibleClips = clips.filter(
      (clip) =>
        clip.start <= currentTime + visibleWindow &&
        clip.start + clip.duration >= currentTime - visibleWindow,
    );

    const activeParticleIds = new Set(
      this.particles.map((p) => p.clip.id),
    );

    visibleClips.forEach((clip) => {
      const isActive = clip.start <= currentTime && clip.start + clip.duration >= currentTime;

      if (isActive && !activeParticleIds.has(clip.id)) {
        const x = clip.start * this.timeScale;
        const y = this.viewportHeight - (clip.noteNumber * this.pitchScale);
        const velocity = clip.velocity / 127;

        const particle: Particle = {
          x,
          y,
          vx: 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: this.config.particleSize * (0.5 + velocity * 0.5),
          color: this.colorMapper.getColor(clip, this.config.colorMappingMode, clip.velocity),
          age: 0,
          maxAge: clip.duration * 60,
          clip,
        };

        this.particles.push(particle);
        activeParticleIds.add(clip.id);
      }
    });

    this.particles = this.particles.filter((p) => {
      const clipEnd = p.clip.start + p.clip.duration;
      return clipEnd >= currentTime - 1;
    });
  }

  update(currentTime: number): void {
    this.particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.age++;

      const fade = 1 - particle.age / particle.maxAge;
      particle.color.a = fade * 0.8;

      if (particle.y < 0 || particle.y > this.viewportHeight) {
        particle.vy *= -0.8;
      }
    });
  }

  render(p5: p5): void {
    p5.push();
    p5.translate(-this.cameraX, 0);

    if (this.config.showTrails) {
      this.renderConnections(p5);
    }

    this.particles.forEach((particle) => {
      const screenX = particle.x - this.cameraX;
      if (screenX < -100 || screenX > this.viewportWidth + 100) return;

      p5.push();
      p5.fill(
        particle.color.r,
        particle.color.g,
        particle.color.b,
        particle.color.a * 255,
      );
      p5.noStroke();

      if (this.config.showVelocity) {
        p5.circle(particle.x, particle.y, particle.size);
      } else {
        p5.circle(particle.x, particle.y, this.config.particleSize);
      }

      p5.pop();
    });

    p5.pop();
  }

  private renderConnections(p5: p5): void {
    p5.strokeWeight(1);
    const maxDistance = this.config.connectionDistance;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          const alpha = (1 - distance / maxDistance) * p1.color.a * 0.3;
          p5.stroke(
            p1.color.r,
            p1.color.g,
            p1.color.b,
            alpha * 255,
          );
          p5.line(p1.x, p1.y, p2.x, p2.y);
        }
      }
    }
  }

  clear(): void {
    this.particles = [];
  }
}

