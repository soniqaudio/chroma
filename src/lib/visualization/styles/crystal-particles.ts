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
 * Crystal-style particles with rotating polygons
 * Based on CrystalTrailBackground example, rebuilt using glitch foundation
 */
export class CrystalParticlesStyle implements IVisualizationStyle {
  private particles: Particle[] = [];
  private colorMapper: ColorMapper;
  private config: VisualizationConfig;
  private timeScale: number = TIME_SCALE;
  private viewportWidth: number = 0;
  private viewportHeight: number = 0;
  private cameraX: number = 0;

  // Crystal-specific properties
  private crystalVertices: Map<string, Array<{ x: number; y: number }>> = new Map();
  private crystalAngles: Map<string, number> = new Map();
  private crystalSpins: Map<string, number> = new Map();

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
    // Complexity affects spawn rate - higher complexity = more crystals
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

      // Apply complexity-based spawn rate for more crystals
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
          0, // pitchScale not used for crystals
          this.viewportHeight,
        );

        // Initialize crystal properties - make them larger and more prominent
        const numVertices = Math.floor(Math.random() * 3) + 3; // 3-5 vertices
        // Make crystals much larger - base size multiplied by 3-4x for visibility
        const crystalSize = (particle.size || this.config.particleSize) * (3 + Math.random() * 2);
        const vertices: Array<{ x: number; y: number }> = [];
        
        // Create more varied, irregular crystal shapes like the example
        for (let i = 0; i < numVertices; i++) {
          const angle = (i / numVertices) * Math.PI * 2;
          // More variation: random radius between size and 1.5x size
          const radius = Math.random() * crystalSize + crystalSize / 2;
          vertices.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
          });
        }
        
        this.crystalVertices.set(particle.clip.id, vertices);
        this.crystalAngles.set(particle.clip.id, Math.random() * Math.PI * 2);
        // Slower, more visible rotation
        this.crystalSpins.set(particle.clip.id, (Math.random() - 0.5) * 0.05);

        this.particles.push(particle);
        activeParticleIds.add(clip.id);
      }
    });

    // Remove old particles that are off screen
    this.particles = this.particles.filter((p) => {
      const particleX = (currentTime - p.clip.start) * this.timeScale;
      const isOnScreen = particleX >= -PARTICLE_CULL_DISTANCE && particleX <= this.viewportWidth + PARTICLE_CULL_DISTANCE;
      return isOnScreen && p.life > 0 && p.color.a > 0.01;
    });
  }

  update(currentTime: number): void {
    // Update particles with crystal rotation
    this.particles = this.particles.filter((particle) => {
      const baseX = (currentTime - particle.clip.start) * this.timeScale;
      
      // Crystal movement: smooth flow with slight drift
      particle.x = baseX;
      particle.y += particle.vy * 0.3;
      
      // Update crystal rotation
      const currentAngle = this.crystalAngles.get(particle.clip.id) || 0;
      const spin = this.crystalSpins.get(particle.clip.id) || 0;
      this.crystalAngles.set(particle.clip.id, currentAngle + spin);
      
      // Slight drift
      particle.y += (Math.random() - 0.5) * this.config.particleDrift * 0.5;
      
      particle.age++;
      particle.life--;

      const clipEnd = particle.clip.start + particle.duration;
      const isPastClipEnd = currentTime > clipEnd;
      
      if (isPastClipEnd) {
        const trailLengthSeconds = this.config.trailLength || 2;
        const timePastEnd = currentTime - clipEnd;
        // Slower fade for longer persistence - crystals should linger
        const fade = Math.max(0, 1 - timePastEnd / (trailLengthSeconds * 1.5));
        particle.color.a = fade;
      } else {
        const lifeRatio = particle.life / particle.maxLife;
        // Keep crystals more visible while alive
        particle.color.a = Math.max(0.8, lifeRatio);
      }

      return particle.life > 0 && particle.color.a > 0.01;
    });

    // Clean up crystal data for removed particles
    const activeIds = new Set(this.particles.map(p => p.clip.id));
    for (const id of this.crystalVertices.keys()) {
      if (!activeIds.has(id)) {
        this.crystalVertices.delete(id);
        this.crystalAngles.delete(id);
        this.crystalSpins.delete(id);
      }
    }
  }

  render(p5: p5): void {
    // Trail fade - lighter background like example (dark purple tint)
    if (this.config.trailMode !== "none") {
      const clampedIntensity = Math.max(0, Math.min(1, this.config.trailIntensity));
      const trailAlpha = TRAIL_MIN_ALPHA + clampedIntensity * (TRAIL_MAX_ALPHA - TRAIL_MIN_ALPHA);
      // Use darker purple background like example: rgba(10, 5, 20, 0.15)
      p5.fill(10, 5, 20, trailAlpha * 0.3);
      p5.rectMode(p5.CORNER);
      p5.noStroke();
      p5.rect(0, 0, p5.width, p5.height);
    } else {
      p5.clear();
    }

    // Render particles as rotating crystal polygons with glow effects
    this.particles.forEach((particle) => {
      const screenX = particle.x;
      if (screenX < -PARTICLE_CULL_DISTANCE || screenX > this.viewportWidth + PARTICLE_CULL_DISTANCE) return;

      const vertices = this.crystalVertices.get(particle.clip.id);
      const angle = this.crystalAngles.get(particle.clip.id) || 0;
      
      if (!vertices || vertices.length === 0) return;

      p5.push();
      p5.translate(screenX, particle.y);
      p5.rotate(angle);

      const intensityMultiplier = this.config.intensity;
      const lifeRatio = particle.life / particle.maxLife;
      // Higher alpha for more visibility - match example: life * 0.8 for stroke
      const strokeAlpha = lifeRatio * intensityMultiplier * 0.8 * 255;
      const fillAlpha = lifeRatio * intensityMultiplier * 0.1 * 255;
      
      // Draw glow halo (larger, more transparent)
      p5.push();
      p5.noStroke();
      p5.fill(particle.color.r, particle.color.g, particle.color.b, fillAlpha * 0.3);
      p5.beginShape();
      for (const vertex of vertices) {
        p5.vertex(vertex.x * 1.5, vertex.y * 1.5);
      }
      p5.endShape(p5.CLOSE);
      p5.pop();
      
      // Draw crystal outline - prominent stroke like example
      p5.stroke(particle.color.r, particle.color.g, particle.color.b, strokeAlpha);
      p5.strokeWeight(1.5); // Slightly thicker for visibility
      p5.fill(particle.color.r, particle.color.g, particle.color.b, fillAlpha);
      
      p5.beginShape();
      for (const vertex of vertices) {
        p5.vertex(vertex.x, vertex.y);
      }
      p5.endShape(p5.CLOSE);

      p5.pop();
    });

    // Render connections if enabled
    if (this.config.showTrails) {
      p5.strokeWeight(0.5);
      const maxDistance = this.config.connectionDistance * 0.8;

      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const p1 = this.particles[i];
          const p2 = this.particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const alpha = (1 - distance / maxDistance) * p1.color.a * 0.2;
            p5.stroke(p1.color.r, p1.color.g, p1.color.b, alpha * 255);
            p5.line(p1.x, p1.y, p2.x, p2.y);
          }
        }
      }
    }
  }

  clear(): void {
    this.particles = [];
    this.crystalVertices.clear();
    this.crystalAngles.clear();
    this.crystalSpins.clear();
  }
}

