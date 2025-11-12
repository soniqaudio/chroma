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
  MIN_SPAWN_RATE,
  MAX_SPAWN_RATE,
  ROTATION_SPEED_MULTIPLIER,
  VELOCITY_MULTIPLIER_RANGE,
  PARTICLE_CULL_DISTANCE,
  CONNECTION_CULL_DISTANCE,
  getNoteYPosition,
} from "../constants";

/**
 * Flowing Particles visualization style
 * Particles flow left-to-right like sheet music, with various preset-specific behaviors
 */
export class FlowingParticlesStyle implements IVisualizationStyle {
  private particles: Particle[] = [];
  private colorMapper: ColorMapper;
  private config: VisualizationConfig;
  private timeScale: number = TIME_SCALE;
  private pitchScale: number = PITCH_SCALE;
  private viewportWidth: number = 0;
  private viewportHeight: number = 0;
  private cameraX: number = 0;
  private currentTime: number = 0;

  /**
   * Creates a new FlowingParticlesStyle instance
   * @param config - Visualization configuration
   * @param colorMapper - Color mapper for particle colors
   */
  constructor(config: VisualizationConfig, colorMapper: ColorMapper) {
    this.config = config;
    this.colorMapper = colorMapper;
  }

  /**
   * Updates the configuration
   * Clears particles if preset changes to ensure new particles use new settings
   * @param config - New visualization configuration
   */
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


  /**
   * Sets the viewport dimensions
   * @param width - Canvas width in pixels
   * @param height - Canvas height in pixels
   */
  setViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  /**
   * Sets the camera X position for scrolling
   * @param x - Camera X offset in pixels
   */
  setCameraX(x: number): void {
    this.cameraX = x;
  }

  /**
   * Updates clips and spawns particles based on current time
   * Only spawns particles for clips that are currently playing or recently played
   * @param clips - Array of MIDI note clips
   * @param currentTime - Current playback time in seconds
   */
  updateClips(clips: MidiNoteClip[], currentTime: number): void {
    const visibleWindow = VISIBLE_WINDOW_SECONDS;
    const trailLengthSeconds = this.config.trailLength || 2;
    // Complexity affects spawn rate - lower complexity = fewer particles
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

      // Apply complexity-based spawn rate
      const shouldSpawn = Math.random() < spawnRate;
      if ((isCurrentlyPlaying || isRecentlyPlayed) && !activeParticleIds.has(clip.id) && shouldSpawn) {
        // Position particles based on their MIDI time, flowing left-to-right like sheet music
        // Particles spawn from left edge (x=0) and flow rightward as time progresses
        // x = 0 when note starts, increases as time moves forward
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

        this.particles.push(particle);
        activeParticleIds.add(clip.id);
      }
    });

    // Remove particles that are completely outside the visible window
    this.particles = this.particles.filter((p) => {
      // Calculate particle position
      const particleX = (currentTime - p.clip.start) * this.timeScale;
      // Keep particles that are on screen or recently off screen (for smooth flow)
      const isOnScreen = particleX >= -PARTICLE_CULL_DISTANCE && particleX <= this.viewportWidth + PARTICLE_CULL_DISTANCE;
      // Also check if particle is still alive
      return isOnScreen && p.life > 0 && p.color.a > 0.01;
    });
  }

  /**
   * Updates particle positions and physics
   * Applies preset-specific behaviors (orbital motion, fluid dynamics, etc.)
   * @param currentTime - Current playback time in seconds
   */
  update(currentTime: number): void {
    this.currentTime = currentTime;
    const driftAmount = this.config.particleDrift;
    const rotationSpeed = this.config.motionSpeed * ROTATION_SPEED_MULTIPLIER;
    const velocityMultiplier = 1 + this.config.motionSpeed * VELOCITY_MULTIPLIER_RANGE;
    
    // Preset-specific update behaviors
    const preset = this.config.preset || "chromatic";
    
    // Update particles and filter out dead ones
    this.particles = this.particles.filter((particle) => {
      // Update particle position - particles flow rightward from left edge
      // x position increases as time progresses (particles move right)
      const baseX = (currentTime - particle.clip.start) * this.timeScale;
      
      // Preset-specific position updates
      if (preset === "orbital") {
        // Orbital motion: particles orbit around their spawn point
        const centerX = baseX;
        const centerY = getNoteYPosition(particle.clip.noteNumber, this.viewportHeight);
        const timeSinceStart = currentTime - particle.clip.start;
        const angle = timeSinceStart * 3; // Faster rotation
        const radius = 40 + particle.clip.velocity * 0.8; // Larger radius, velocity affects size
        particle.x = centerX + Math.cos(angle) * radius;
        particle.y = centerY + Math.sin(angle) * radius * 0.6; // Elliptical orbit
        // Add rotation to particle itself
        particle.rotation = angle;
      } else {
        // Standard flow: particles move rightward (x increases with time)
        particle.x = baseX;
        particle.y += particle.vy * velocityMultiplier;
      }
      
      // Random drift movement (affected by complexity)
      if (driftAmount > 0 && preset !== "orbital") {
        const complexityMultiplier = 0.5 + this.config.complexity * 0.5;
        particle.y += (particle.driftY + (Math.random() - 0.5) * driftAmount) * complexityMultiplier;
        
        // Update drift velocities with slight randomness
        particle.driftY += (Math.random() - 0.5) * 0.1;
        
        // Dampen drift
        particle.driftY *= 0.98;
      }
      
      // Fluid preset: smoother, more organic movement
      if (preset === "fluid") {
        particle.vy += (Math.random() - 0.5) * 0.02;
        particle.vy *= 0.95; // Damping for fluid feel
        particle.y += particle.vy;
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

  /**
   * Renders particles to the canvas
   * Applies preset-specific rendering effects (glow, glitch, etc.)
   * @param p5 - p5.js instance
   */
  render(p5: p5): void {
    const preset = this.config.preset || "chromatic";
    
    // Apply blur effect if configured (for fluid preset especially)
    // Note: p5.js doesn't have native blur filter, this would need to be implemented via shaders or post-processing
    // For now, we'll skip blur implementation as it requires more complex setup
    // TODO: Implement proper blur effect using p5.js filters or WebGL shaders

    // Apply trail effect instead of clearing (before any transformations)
    if (this.config.trailMode !== "none") {
      const clampedIntensity = Math.max(0, Math.min(1, this.config.trailIntensity));
      let trailAlpha = TRAIL_MIN_ALPHA + clampedIntensity * (TRAIL_MAX_ALPHA - TRAIL_MIN_ALPHA);
      
      // Glow mode uses different trail effect
      if (this.config.trailMode === "glow") {
        // Glow mode: lighter fade with more persistence
        trailAlpha = TRAIL_MIN_ALPHA + clampedIntensity * (TRAIL_MAX_ALPHA - TRAIL_MIN_ALPHA) * 0.6;
        p5.fill(0, 0, 0, trailAlpha);
      } else {
        // Fade mode: standard dark fade
        p5.fill(0, 0, 0, trailAlpha);
      }
      
      p5.rectMode(p5.CORNER);
      p5.noStroke();
      p5.rect(0, 0, p5.width, p5.height);
    } else {
      p5.clear();
    }
    
    // Glitch preset: add scanline effects
    if (preset === "glitch" && Math.random() > 0.95) {
      const scanlineY = Math.random() * p5.height;
      p5.stroke(255, 0, 255, 20);
      p5.strokeWeight(1);
      p5.line(0, scanlineY, p5.width, scanlineY);
    }

    this.particles.forEach((particle) => {
      // Apply camera offset for scrolling
      const screenX = particle.x;
      if (screenX < -PARTICLE_CULL_DISTANCE || screenX > this.viewportWidth + PARTICLE_CULL_DISTANCE) return;

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

      // Preset-specific rendering
      const preset = this.config.preset || "chromatic";
      
      // Render based on particle shape
      if (particle.shape === "circle") {
        // Size varies by velocity if showVelocity is enabled, otherwise use base size
        let baseSize = this.config.showVelocity ? particle.size : this.config.particleSize;
        // Intensity affects both size and alpha
        let size = baseSize * (0.4 + this.config.intensity * 0.6);
        
        // Orbital preset: add glow effect and show orbit trail
        if (preset === "orbital") {
          // Glow halo
          p5.push();
          p5.noStroke();
          p5.fill(particle.color.r, particle.color.g, particle.color.b, alpha * 0.2);
          p5.circle(particle.x, particle.y, size * 3);
          p5.pop();
          
          // Main particle
          p5.circle(particle.x, particle.y, size);
          
          // Orbit trail (faint line showing orbit path)
          const centerX = (this.currentTime - particle.clip.start) * this.timeScale;
          const centerY = getNoteYPosition(particle.clip.noteNumber, this.viewportHeight);
          p5.stroke(particle.color.r, particle.color.g, particle.color.b, alpha * 0.1);
          p5.strokeWeight(1);
          p5.noFill();
          const radius = 40 + particle.clip.velocity * 0.8;
          p5.ellipse(centerX, centerY, radius * 2, radius * 2 * 0.6);
        } else {
          p5.circle(particle.x, particle.y, size);
        }
      } else if (particle.shape === "rectangle" || particle.shape === "glitch-block") {
        p5.push();
        p5.translate(screenX, particle.y);
        if (this.config.particleRotation) {
          p5.rotate(particle.rotation);
        }
        p5.rectMode(p5.CENTER);
        // Intensity affects size
        let baseWidth = particle.width * (0.4 + this.config.intensity * 0.6);
        let baseHeight = particle.height * (0.4 + this.config.intensity * 0.6);
        
        // Glitch preset: add corruption effect
        if (preset === "glitch" && particle.shape === "glitch-block") {
          // Random offset for glitch effect
          const offsetX = (Math.random() - 0.5) * 5;
          const offsetY = (Math.random() - 0.5) * 5;
          p5.translate(offsetX, offsetY);
        }
        
        p5.rect(0, 0, baseWidth, baseHeight);
        p5.pop();
      }

      p5.pop();
    });

    if (this.config.showTrails) {
      this.renderConnections(p5);
    }
  }

  /**
   * Renders connection lines between nearby particles
   * @param p5 - p5.js instance
   */
  private renderConnections(p5: p5): void {
    p5.strokeWeight(1);
    const maxDistance = this.config.connectionDistance;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        if (
          (p1.x < -CONNECTION_CULL_DISTANCE && p2.x < -CONNECTION_CULL_DISTANCE) ||
          (p1.x > this.viewportWidth + CONNECTION_CULL_DISTANCE && p2.x > this.viewportWidth + CONNECTION_CULL_DISTANCE)
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

  /**
   * Clears all particles
   * Called when preset changes or visualization is reset
   */
  clear(): void {
    this.particles = [];
  }
}

