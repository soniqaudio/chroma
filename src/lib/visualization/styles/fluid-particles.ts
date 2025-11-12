import type p5 from "p5";
import type { MidiNoteClip } from "@/lib/midi/types";
import type { VisualizationConfig } from "@/store/visualization-store";
import { ColorMapper } from "../color-mapper";
import { IVisualizationStyle } from "./base-style";
import type { Particle } from "../particles/particle-types";
import { createParticle } from "../particles/particle-factory";
import {
  TIME_SCALE,
  VISIBLE_WINDOW_SECONDS,
  TRAIL_MIN_ALPHA,
  TRAIL_MAX_ALPHA,
  MIN_SPAWN_RATE,
  MAX_SPAWN_RATE,
  PARTICLE_CULL_DISTANCE,
  getNoteYPosition,
} from "../constants";

/**
 * Fluid-style particles with smooth organic motion and density-based rendering
 * Based on FluidCanvas example, rebuilt using glitch foundation
 */
export class FluidParticlesStyle implements IVisualizationStyle {
  private particles: Particle[] = [];
  private colorMapper: ColorMapper;
  private config: VisualizationConfig;
  private timeScale: number = TIME_SCALE;
  private viewportWidth: number = 0;
  private viewportHeight: number = 0;
  private cameraX: number = 0;
  
  // Simplified fluid grid for velocity fields - larger grid for better resolution
  private gridSize: number = 128;
  private velocityX: Float32Array;
  private velocityY: Float32Array;
  private density: Float32Array;

  constructor(config: VisualizationConfig, colorMapper: ColorMapper) {
    this.config = config;
    this.colorMapper = colorMapper;
    
    // Initialize fluid grid
    const gridLength = this.gridSize * this.gridSize;
    this.velocityX = new Float32Array(gridLength);
    this.velocityY = new Float32Array(gridLength);
    this.density = new Float32Array(gridLength);
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
    const spawnRate = MIN_SPAWN_RATE + this.config.complexity * (MAX_SPAWN_RATE - MIN_SPAWN_RATE);
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

      const shouldSpawn = Math.random() < spawnRate;
      if ((isCurrentlyPlaying || isRecentlyPlayed) && !activeParticleIds.has(clip.id) && shouldSpawn) {
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
          0,
          this.viewportHeight,
        );

        // Add density to fluid grid at particle position - more density for visibility
        this.addDensity(x, y, clip.velocity / 127 * 25);
        // Add velocity to fluid grid
        this.addVelocity(x, y, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.2);

        this.particles.push(particle);
        activeParticleIds.add(clip.id);
      }
    });

    // Update fluid simulation
    this.updateFluid();

    // Remove old particles that are off screen
    this.particles = this.particles.filter((p) => {
      const particleX = (currentTime - p.clip.start) * this.timeScale;
      const isOnScreen = particleX >= -PARTICLE_CULL_DISTANCE && particleX <= this.viewportWidth + PARTICLE_CULL_DISTANCE;
      return isOnScreen && p.life > 0 && p.color.a > 0.01;
    });
  }

  private addDensity(x: number, y: number, amount: number): void {
    // Ensure coordinates are within bounds
    const normalizedX = Math.max(0, Math.min(1, x / this.viewportWidth));
    const normalizedY = Math.max(0, Math.min(1, y / this.viewportHeight));
    const gridX = Math.floor(normalizedX * this.gridSize);
    const gridY = Math.floor(normalizedY * this.gridSize);
    const radius = 4;
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const px = gridX + dx;
        const py = gridY + dy;
        
        if (px >= 0 && px < this.gridSize && py >= 0 && py < this.gridSize) {
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= radius) {
            const falloff = 1 - (distance / radius);
            const index = py * this.gridSize + px;
            this.density[index] += amount * falloff * falloff;
          }
        }
      }
    }
  }

  private addVelocity(x: number, y: number, vx: number, vy: number): void {
    // Ensure coordinates are within bounds
    const normalizedX = Math.max(0, Math.min(1, x / this.viewportWidth));
    const normalizedY = Math.max(0, Math.min(1, y / this.viewportHeight));
    const gridX = Math.floor(normalizedX * this.gridSize);
    const gridY = Math.floor(normalizedY * this.gridSize);
    const radius = 3;
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const px = gridX + dx;
        const py = gridY + dy;
        
        if (px >= 0 && px < this.gridSize && py >= 0 && py < this.gridSize) {
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= radius) {
            const falloff = 1 - (distance / radius);
            const index = py * this.gridSize + px;
            this.velocityX[index] += vx * falloff;
            this.velocityY[index] += vy * falloff;
          }
        }
      }
    }
  }

  private updateFluid(): void {
    // Simplified fluid update: diffuse and decay - slower decay for more persistence
    const viscosity = 0.98;
    const decay = 0.995;
    
    for (let i = 0; i < this.gridSize * this.gridSize; i++) {
      // Diffuse velocity
      this.velocityX[i] *= viscosity;
      this.velocityY[i] *= viscosity;
      
      // Decay density - slower decay for more visible clouds
      this.density[i] *= decay;
      this.density[i] = Math.max(0, this.density[i] - 0.01);
    }
  }

  update(currentTime: number): void {
    // Update particles with fluid-like motion
    this.particles = this.particles.filter((particle) => {
      const baseX = (currentTime - particle.clip.start) * this.timeScale;
      
      // Get velocity from fluid grid - ensure we're using valid coordinates
      const normalizedX = Math.max(0, Math.min(1, particle.x / this.viewportWidth));
      const normalizedY = Math.max(0, Math.min(1, particle.y / this.viewportHeight));
      const gridX = Math.floor(normalizedX * this.gridSize);
      const gridY = Math.floor(normalizedY * this.gridSize);
      const index = Math.max(0, Math.min(this.gridSize * this.gridSize - 1, gridY * this.gridSize + gridX));
      
      const fluidVx = this.velocityX[index] * 2;
      const fluidVy = this.velocityY[index] * 2;
      
      // Smooth, organic movement - particles flow rightward like glitch
      particle.x = baseX + fluidVx;
      particle.y += particle.vy * 0.3 + fluidVy;
      
      // Damping for fluid feel
      particle.vy += (Math.random() - 0.5) * 0.02;
      particle.vy *= 0.94;
      
      // Slight drift
      particle.y += (Math.random() - 0.5) * this.config.particleDrift * 0.3;
      
      particle.age++;
      particle.life--;

      const clipEnd = particle.clip.start + particle.duration;
      const isPastClipEnd = currentTime > clipEnd;
      
      if (isPastClipEnd) {
        const trailLengthSeconds = this.config.trailLength || 2;
        const timePastEnd = currentTime - clipEnd;
        const fade = Math.max(0, 1 - timePastEnd / (trailLengthSeconds * 1.2));
        particle.color.a = fade * 0.85;
      } else {
        const lifeRatio = particle.life / particle.maxLife;
        particle.color.a = Math.max(0.75, lifeRatio * 0.9);
      }

      return particle.life > 0 && particle.color.a > 0.01;
    });
  }

  render(p5: p5): void {
    // Trail fade - use p5.width/height like glitch and crystal
    if (this.config.trailMode !== "none") {
      const clampedIntensity = Math.max(0, Math.min(1, this.config.trailIntensity));
      const trailAlpha = TRAIL_MIN_ALPHA + clampedIntensity * (TRAIL_MAX_ALPHA - TRAIL_MIN_ALPHA) * 0.9;
      p5.fill(0, 0, 0, trailAlpha);
      p5.rectMode(p5.CORNER);
      p5.noStroke();
      p5.rect(0, 0, p5.width, p5.height);
    } else {
      p5.clear();
    }

    // Render fluid density field as background - use p5.width/height like example code
    const imageData = p5.drawingContext.createImageData(p5.width, p5.height);
    const data = imageData.data;
    
    for (let j = 0; j < p5.height; j++) {
      for (let i = 0; i < p5.width; i++) {
        // Map screen coordinates to grid coordinates - exactly like example
        const gridX = Math.floor((i / p5.width) * this.gridSize);
        const gridY = Math.floor((j / p5.height) * this.gridSize);
        const index = gridY * this.gridSize + gridX;
        const d = Math.min(1, this.density[index] * 0.8);
        
        const pixelIndex = (j * p5.width + i) * 4;
        
        if (d > 0.01) {
          // Use ColorMapper to get color based on position (pitch-based)
          // Map Y position back to note number for color
          const normalizedYPos = j / p5.height;
          const noteNumber = 21 + (1 - normalizedYPos) * 87; // A0 to C8
          const mockClip = { noteNumber: Math.round(noteNumber), velocity: 127 } as MidiNoteClip;
          const color = this.colorMapper.getColor(mockClip, this.config.colorMappingMode, 127);
          
          // Apply density to alpha for glowing effect - match example opacity
          const alpha = d * 200 * this.config.intensity;
          
          data[pixelIndex] = color.r;
          data[pixelIndex + 1] = color.g;
          data[pixelIndex + 2] = color.b;
          data[pixelIndex + 3] = Math.floor(alpha);
        } else {
          data[pixelIndex] = 0;
          data[pixelIndex + 1] = 0;
          data[pixelIndex + 2] = 0;
          data[pixelIndex + 3] = 0;
        }
      }
    }
    
    p5.drawingContext.putImageData(imageData, 0, 0);

    // Render particles as small, smooth circles on top
    this.particles.forEach((particle) => {
      const screenX = particle.x;
      if (screenX < -PARTICLE_CULL_DISTANCE || screenX > this.viewportWidth + PARTICLE_CULL_DISTANCE) return;

      p5.push();
      p5.noStroke();

      const intensityMultiplier = this.config.intensity;
      const alpha = particle.color.a * intensityMultiplier * 255;
      
      p5.fill(particle.color.r, particle.color.g, particle.color.b, alpha);

      // Small, smooth circles for fluid feel
      const baseSize = this.config.showVelocity ? particle.size : this.config.particleSize;
      const size = baseSize * (0.4 + this.config.intensity * 0.4);
      p5.circle(particle.x, particle.y, size);

      p5.pop();
    });

    // Render connections for fluid flow
    if (this.config.showTrails) {
      p5.strokeWeight(0.5);
      const maxDistance = this.config.connectionDistance * 0.6;

      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const p1 = this.particles[i];
          const p2 = this.particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const alpha = (1 - distance / maxDistance) * p1.color.a * 0.15;
            p5.stroke(p1.color.r, p1.color.g, p1.color.b, alpha * 255);
            p5.line(p1.x, p1.y, p2.x, p2.y);
          }
        }
      }
    }
  }

  clear(): void {
    this.particles = [];
    // Reset fluid grid
    this.velocityX.fill(0);
    this.velocityY.fill(0);
    this.density.fill(0);
  }
}
