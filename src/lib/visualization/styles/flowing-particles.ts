import type p5 from "p5";
import type { MidiNoteClip } from "@/lib/midi/types";
import type { VisualizationConfig, ParticleShape } from "@/store/visualization-store";
import { ColorMapper } from "../color-mapper";

type ParticleShapeType = "circle" | "rectangle" | "glitch-block";

interface Particle {
  x: number;
  y: number;
  vy: number;
  size: number;
  color: { r: number; g: number; b: number; a: number };
  age: number;
  maxAge: number;
  life: number;
  maxLife: number;
  clip: MidiNoteClip;
  shape: ParticleShapeType;
  rotation: number;
  driftY: number;
  width: number;
  height: number;
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
    const oldPreset = this.config.preset;
    const newPreset = config.preset;
    
    // If preset changed, clear all particles so new ones use new settings
    if (oldPreset !== newPreset) {
      this.clear();
    }
    
    this.config = config;
    // Update color mapper settings
    this.colorMapper.setColorMode(config.colorMode);
    this.colorMapper.setHueVariation(config.hueVariation);
  }

  private getParticleShape(shapeConfig: ParticleShape): ParticleShapeType {
    if (shapeConfig === "mixed") {
      const rand = Math.random();
      if (rand < 0.33) return "circle";
      if (rand < 0.66) return "rectangle";
      return "glitch-block";
    }
    return shapeConfig as ParticleShapeType;
  }

  setViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  setCameraX(x: number): void {
    this.cameraX = x;
  }

  updateClips(clips: MidiNoteClip[], currentTime: number): void {
    const visibleWindow = 10;
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
        const centerX =
          this.viewportWidth > 0 ? this.viewportWidth * 0.5 : 0;
        const x =
          (currentTime - clipStart) * this.timeScale + centerX;
        const y = this.viewportHeight - (clip.noteNumber * this.pitchScale);
        const velocity = clip.velocity / 127;
        const shape = this.getParticleShape(this.config.particleShape);
        
        // Calculate particle dimensions based on shape
        let width = this.config.particleSize;
        let height = this.config.particleSize;
        
        if (shape === "rectangle" || shape === "glitch-block") {
          const baseSize = this.config.particleSize * (0.5 + velocity * 0.5);
          if (shape === "glitch-block") {
            // More variation for glitch blocks
            width = baseSize * (Math.random() * 2 + 0.5);
            height = baseSize * (Math.random() * 1.5 + 0.3);
          } else {
            // Regular rectangles
            width = baseSize * (Math.random() * 1.5 + 0.5);
            height = baseSize * (Math.random() * 1.2 + 0.4);
          }
        }

        const driftAmount = this.config.particleDrift;
        const maxLife = (clip.duration + trailLengthSeconds) * 60;

        const particle: Particle = {
          x,
          y,
          vy: (Math.random() - 0.5) * 0.5,
          size: this.config.particleSize * (0.5 + velocity * 0.5),
          color: this.colorMapper.getColor(clip, this.config.colorMappingMode, clip.velocity),
          age: isCurrentlyPlaying ? 0 : Math.floor((currentTime - clipEnd) * 60),
          maxAge: maxLife,
          life: maxLife,
          maxLife: maxLife,
          clip,
          shape,
          rotation: this.config.particleRotation ? Math.random() * Math.PI * 2 : 0,
          driftY: (Math.random() - 0.5) * driftAmount * 2,
          width,
          height,
        };

        this.particles.push(particle);
        activeParticleIds.add(clip.id);
      }
    });

    // Remove particles that are completely outside the visible window
    this.particles = this.particles.filter((p) => {
      const clipEnd = p.clip.start + p.clip.duration;
      const trailLengthSeconds = this.config.trailLength || 2;
      // Keep particles that are still within the trail window
      const isVisible = clipEnd + trailLengthSeconds >= currentTime - 0.5;
      // Also check if particle is still alive and visible
      return isVisible && p.life > 0 && p.color.a > 0.01;
    });
  }

  update(currentTime: number): void {
    const driftAmount = this.config.particleDrift;
    const rotationSpeed = this.config.motionSpeed * 0.02; // Use motionSpeed for rotation speed
    
    // Update particles and filter out dead ones
    this.particles = this.particles.filter((particle) => {
      const centerX =
        this.viewportWidth > 0 ? this.viewportWidth * 0.5 : 0;
      particle.x =
        (currentTime - particle.clip.start) * this.timeScale + centerX;
      particle.y += particle.vy;
      
      // Random drift movement
      if (driftAmount > 0) {
        particle.y += particle.driftY + (Math.random() - 0.5) * driftAmount;
        
        // Update drift velocities with slight randomness
        particle.driftY += (Math.random() - 0.5) * 0.1;
        
        // Dampen drift
        particle.driftY *= 0.98;
      }
      
      // Update rotation if enabled
      if (this.config.particleRotation && (particle.shape === "rectangle" || particle.shape === "glitch-block")) {
        particle.rotation += rotationSpeed;
      }
      
      particle.age++;
      particle.life--;

      const clipEnd = particle.clip.start + particle.clip.duration;
      const isPastClipEnd = currentTime > clipEnd;
      
      // Use life counter for fade-out
      if (isPastClipEnd) {
        const trailLengthSeconds = this.config.trailLength || 2;
        const timePastEnd = currentTime - clipEnd;
        const fade = Math.max(0, 1 - timePastEnd / trailLengthSeconds);
        particle.color.a = fade * 0.9;
      } else {
        const lifeRatio = particle.life / particle.maxLife;
        particle.color.a = Math.max(0.7, lifeRatio * 0.95);
      }

      if (particle.y < 0 || particle.y > this.viewportHeight) {
        particle.vy *= -0.8;
      }

      // Remove particle if life is depleted or alpha is too low
      return particle.life > 0 && particle.color.a > 0.01;
    });
  }

  render(p5: p5): void {
    // Apply trail effect instead of clearing (before any transformations)
    if (this.config.trailMode !== "none") {
      const minAlpha = 12;
      const maxAlpha = 220;
      const clampedIntensity = Math.max(0, Math.min(1, this.config.trailIntensity));
      const trailAlpha =
        minAlpha + clampedIntensity * (maxAlpha - minAlpha);
      p5.fill(0, 0, 0, trailAlpha);
      p5.rectMode(p5.CORNER);
      p5.noStroke();
      p5.rect(0, 0, p5.width, p5.height);
    } else {
      p5.clear();
    }

    this.particles.forEach((particle) => {
      const screenX = particle.x;
      if (screenX < -100 || screenX > this.viewportWidth + 100) return;

      p5.push();
      p5.noStroke();

      // Apply intensity to particle alpha and size
      const intensityMultiplier = this.config.intensity;
      const alpha = particle.color.a * intensityMultiplier * 255;
      
      p5.fill(
        particle.color.r,
        particle.color.g,
        particle.color.b,
        alpha,
      );

      // Render based on particle shape
      if (particle.shape === "circle") {
        const baseSize = this.config.showVelocity ? particle.size : this.config.particleSize;
        const size = baseSize * (0.5 + this.config.intensity * 0.5); // Size affected by intensity
        p5.circle(particle.x, particle.y, size);
      } else if (particle.shape === "rectangle" || particle.shape === "glitch-block") {
        p5.push();
        p5.translate(screenX, particle.y);
        if (this.config.particleRotation) {
          p5.rotate(particle.rotation);
        }
        p5.rectMode(p5.CENTER);
        const baseWidth = particle.width * (0.5 + this.config.intensity * 0.5);
        const baseHeight = particle.height * (0.5 + this.config.intensity * 0.5);
        p5.rect(0, 0, baseWidth, baseHeight);
        p5.pop();
      }

      p5.pop();
    });

    if (this.config.showTrails) {
      this.renderConnections(p5);
    }
  }

  private renderConnections(p5: p5): void {
    p5.strokeWeight(1);
    const maxDistance = this.config.connectionDistance;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        if (
          (p1.x < -150 && p2.x < -150) ||
          (p1.x > this.viewportWidth + 150 && p2.x > this.viewportWidth + 150)
        ) {
          continue;
        }
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

