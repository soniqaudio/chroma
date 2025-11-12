import type p5 from "p5";
import type { MidiNoteClip } from "@/lib/midi/types";
import type { VisualizationConfig } from "@/store/visualization-store";
import { ColorMapper } from "../color-mapper";
import { IVisualizationStyle } from "./base-style";
import type { Particle } from "../particles/particle-types";
import { createParticle } from "../particles/particle-factory";
import {
  TIME_SCALE,
  PITCH_SCALE,
  VISIBLE_WINDOW_SECONDS,
  TRAIL_MIN_ALPHA,
  TRAIL_MAX_ALPHA,
  PARTICLE_CULL_DISTANCE,
  getNoteYPosition,
} from "../constants";

/**
 * Glitch-style particles with corruption effects, scanlines, and digital artifacts
 * Adapted from GlitchCursor example
 */
export class GlitchParticlesStyle implements IVisualizationStyle {
  private particles: Particle[] = [];
  private colorMapper: ColorMapper;
  private config: VisualizationConfig;
  private timeScale: number = TIME_SCALE;
  private pitchScale: number = PITCH_SCALE;
  private viewportWidth: number = 0;
  private viewportHeight: number = 0;
  private cameraX: number = 0;
  private scanlines: Array<{ y: number; height: number; speed: number; life: number; offsetX: number }> = [];

  constructor(config: VisualizationConfig, colorMapper: ColorMapper) {
    this.config = config;
    this.colorMapper = colorMapper;
  }

  updateConfig(config: VisualizationConfig): void {
    const oldPreset = this.config.preset;
    const newPreset = config.preset;
    
    if (oldPreset !== newPreset) {
      this.clear();
    }
    
    this.config = config;
    this.colorMapper.setColorMode(config.colorMode);
    this.colorMapper.setHueVariation(config.hueVariation);
  }

  setViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  setCameraX(x: number): void {
    this.cameraX = x;
  }

  updateClips(clips: MidiNoteClip[], currentTime: number): void {
    const visibleWindow = VISIBLE_WINDOW_SECONDS;
    const trailLengthSeconds = this.config.trailLength || 2;
    const visibleClips = clips.filter(
      (clip) =>
        clip.start <= currentTime + visibleWindow &&
        clip.start + clip.duration + trailLengthSeconds >= currentTime - visibleWindow,
    );

    const activeParticleIds = new Set(
      this.particles.map((p) => p.clip.id),
    );

    visibleClips.forEach((clip) => {
      const clipStart = clip.start;
      const clipEnd = clip.start + clip.duration;
      const isCurrentlyPlaying = clipStart <= currentTime && clipEnd >= currentTime;
      const isRecentlyPlayed = clipEnd >= currentTime - trailLengthSeconds && clipEnd <= currentTime;

      if ((isCurrentlyPlaying || isRecentlyPlayed) && !activeParticleIds.has(clip.id)) {
        const x = (currentTime - clipStart) * this.timeScale;
        const y = getNoteYPosition(clip.noteNumber, this.viewportHeight);

        const particle = createParticle(
          clip,
          currentTime,
          this.config,
          this.colorMapper,
          x,
          y,
          this.timeScale,
          this.pitchScale,
          this.viewportHeight,
        );

        // Force particles to be glitch blocks (rectangles with random sizes)
        particle.shape = "glitch-block";
        particle.width = Math.random() * 50 + 10;
        particle.height = Math.random() * 30 + 5;

        this.particles.push(particle);
        activeParticleIds.add(clip.id);
      }
    });

    // Spawn scanlines randomly
    if (Math.random() > 0.98) {
      this.scanlines.push({
        y: Math.random() * this.viewportHeight,
        height: Math.random() * 10 + 1,
        speed: (Math.random() - 0.5) * 4,
        life: 15,
        offsetX: (Math.random() - 0.5) * 100,
      });
    }

    // Remove old particles that are off screen
    this.particles = this.particles.filter((p) => {
      const particleX = (currentTime - p.clip.start) * this.timeScale;
      const isOnScreen = particleX >= -PARTICLE_CULL_DISTANCE && particleX <= this.viewportWidth + PARTICLE_CULL_DISTANCE;
      return isOnScreen && p.life > 0 && p.color.a > 0.01;
    });
  }

  update(currentTime: number): void {
    // Update particles with glitch corruption movement
    this.particles = this.particles.filter((particle) => {
      const baseX = (currentTime - particle.clip.start) * this.timeScale;
      
      // Glitch corruption: random jitter
      particle.x = baseX + (Math.random() - 0.5) * 4;
      particle.y += particle.vy + (Math.random() - 0.5) * 2;
      
      // Random drift with corruption
      particle.y += (Math.random() - 0.5) * this.config.particleDrift * 2;
      
      particle.age++;
      particle.life--;

      const clipEnd = particle.clip.start + particle.duration;
      const isPastClipEnd = currentTime > clipEnd;
      
      if (isPastClipEnd) {
        const trailLengthSeconds = this.config.trailLength || 2;
        const timePastEnd = currentTime - clipEnd;
        const fade = Math.max(0, 1 - timePastEnd / trailLengthSeconds);
        particle.color.a = fade * 0.9;
      } else {
        const lifeRatio = particle.life / particle.maxLife;
        particle.color.a = Math.max(0.7, lifeRatio * 0.95);
      }

      return particle.life > 0 && particle.color.a > 0.01;
    });

    // Update scanlines
    this.scanlines = this.scanlines.filter((line) => {
      line.life--;
      line.y += line.speed;
      return line.life > 0;
    });
  }

  render(p5: p5): void {
    // Trail fade
    if (this.config.trailMode !== "none") {
      const clampedIntensity = Math.max(0, Math.min(1, this.config.trailIntensity));
      const trailAlpha = TRAIL_MIN_ALPHA + clampedIntensity * (TRAIL_MAX_ALPHA - TRAIL_MIN_ALPHA);
      p5.fill(0, 0, 0, trailAlpha);
      p5.rectMode(p5.CORNER);
      p5.noStroke();
      p5.rect(0, 0, p5.width, p5.height);
    } else {
      p5.clear();
    }

    // Render scanlines (glitch effect)
    this.scanlines.forEach((line) => {
      // Get image data and shift it for corruption effect
      const imageData = p5.drawingContext.getImageData(0, line.y, p5.width, line.height);
      p5.drawingContext.putImageData(imageData, line.offsetX, line.y);
      
      // Overlay scanline color
      p5.fill(255, 0, 255, 5);
      p5.noStroke();
      p5.rect(0, line.y, p5.width, line.height);
    });

    // Render particles as glitch blocks
    this.particles.forEach((particle) => {
      const screenX = particle.x;
      if (screenX < -PARTICLE_CULL_DISTANCE || screenX > this.viewportWidth + PARTICLE_CULL_DISTANCE) return;

      p5.push();
      p5.noStroke();

      const intensityMultiplier = this.config.intensity;
      const alpha = particle.color.a * intensityMultiplier * 255;
      
      p5.fill(particle.color.r, particle.color.g, particle.color.b, alpha);

      // Glitch blocks for particles
      if (particle.shape === "glitch-block" || particle.shape === "rectangle") {
        // Random corruption offset
        const offsetX = (Math.random() - 0.5) * 5;
        const offsetY = (Math.random() - 0.5) * 5;
        
        p5.push();
        p5.translate(screenX + offsetX, particle.y + offsetY);
        p5.rectMode(p5.CENTER);
        const baseWidth = particle.width * (0.4 + this.config.intensity * 0.6);
        const baseHeight = particle.height * (0.4 + this.config.intensity * 0.6);
        p5.rect(0, 0, baseWidth, baseHeight);
        p5.pop();
      } else {
        // Circles with glitch effect
        const baseSize = this.config.showVelocity ? particle.size : this.config.particleSize;
        const size = baseSize * (0.4 + this.config.intensity * 0.6);
        p5.circle(particle.x, particle.y, size);
      }

      p5.pop();
    });

    // Render connections if enabled
    if (this.config.showTrails) {
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
            p5.stroke(p1.color.r, p1.color.g, p1.color.b, alpha * 255);
            p5.line(p1.x, p1.y, p2.x, p2.y);
          }
        }
      }
    }
  }

  clear(): void {
    this.particles = [];
    this.scanlines = [];
  }
}

