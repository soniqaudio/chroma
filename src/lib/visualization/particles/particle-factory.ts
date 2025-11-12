import type { MidiNoteClip } from "@/lib/midi/types";
import type { VisualizationConfig, ParticleShape } from "@/store/visualization-store";
import type { Particle, ParticleShapeType } from "./particle-types";
import { ColorMapper } from "../color-mapper";
import { BASE_VELOCITY_MULTIPLIER } from "../constants";

/**
 * Creates a particle from a MIDI clip
 */
export function createParticle(
  clip: MidiNoteClip,
  currentTime: number,
  config: VisualizationConfig,
  colorMapper: ColorMapper,
  x: number,
  y: number,
  timeScale: number,
  pitchScale: number,
  viewportHeight: number,
): Particle {
  const clipStart = clip.start;
  const clipEnd = clip.start + clip.duration;
  const isCurrentlyPlaying = clipStart <= currentTime && clipEnd >= currentTime;
  const velocity = clip.velocity / 127;
  const shape = getParticleShape(config.particleShape);
  const trailLengthSeconds = config.trailLength || 2;
  const maxLife = (clip.duration + trailLengthSeconds) * 60;

  // Calculate particle dimensions based on shape
  let width = config.particleSize;
  let height = config.particleSize;

  if (shape === "rectangle" || shape === "glitch-block") {
    const baseSize = config.particleSize * (0.5 + velocity * 0.5);
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

  // Calculate base size with velocity variation (more visible difference)
  const baseSize = config.particleSize * (0.3 + velocity * 0.7);

  const driftAmount = config.particleDrift;

  return {
    x,
    y,
    vy: (Math.random() - 0.5) * BASE_VELOCITY_MULTIPLIER * (1 + config.motionSpeed),
    size: baseSize,
    color: colorMapper.getColor(clip, config.colorMappingMode, clip.velocity),
    age: isCurrentlyPlaying ? 0 : Math.floor((currentTime - clipEnd) * 60),
    maxAge: maxLife,
    life: maxLife,
    maxLife: maxLife,
    clip,
    shape,
    rotation: config.particleRotation ? Math.random() * Math.PI * 2 : 0,
    driftY: (Math.random() - 0.5) * driftAmount * 2,
    width,
    height,
  };
}

/**
 * Converts ParticleShape config to ParticleShapeType
 */
function getParticleShape(shapeConfig: ParticleShape): ParticleShapeType {
  if (shapeConfig === "mixed") {
    const rand = Math.random();
    if (rand < 0.33) return "circle";
    if (rand < 0.66) return "rectangle";
    return "glitch-block";
  }
  return shapeConfig as ParticleShapeType;
}

