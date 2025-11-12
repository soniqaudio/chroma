# Codebase Analysis - Session 4

## File Size Analysis

### Large Files (>200 lines)
- **settings-panel.tsx** (404 lines): Large component with many controls. Could be split into:
  - `PresetSelector.tsx`
  - `VisualizationControls.tsx` 
  - `ParameterSliders.tsx`
  - `LayerToggles.tsx`

- **flowing-particles.ts** (307 lines): Core visualization logic. Should be split into:
  - `ParticleManager.ts` - particle lifecycle, spawning, cleanup
  - `ParticleRenderer.ts` - rendering logic
  - `ParticleUpdater.ts` - update logic (position, physics)
  - `FlowingParticlesStyle.ts` - main orchestrator class

### Medium Files (100-200 lines)
- `midi-parser.ts` (189 lines) - Reasonable size
- `topbar.tsx` (172 lines) - Reasonable size
- `visualization-canvas.tsx` (168 lines) - Reasonable size
- `color-mapper.ts` (161 lines) - Reasonable size

## Critical Issues Identified

### 1. Particle Positioning Bug
**Location**: `src/lib/visualization/styles/flowing-particles.ts:95-98, 163-166`

**Problem**: 
- Particles spawn at `centerX = viewportWidth * 0.5` (centered)
- This causes left 50% of canvas to be empty
- Particles should flow left-to-right like sheet music

**Current Code**:
```typescript
const centerX = this.viewportWidth > 0 ? this.viewportWidth * 0.5 : 0;
const x = (currentTime - clipStart) * this.timeScale + centerX;
```

**Expected Behavior**:
- Particles should spawn based on their MIDI time position
- Flow rightward across full canvas width
- Camera should follow playhead (like FL Studio scrolling)

### 2. Camera/Scrolling Not Implemented
**Location**: `src/lib/visualization/renderer.ts:48-53`

**Problem**:
- `setCameraX()` exists but is always set to 0
- No actual camera scrolling/following playhead
- `followPlayhead` flag exists but does nothing

**Missing**:
- Camera position calculation based on currentTime
- Viewport offset calculation
- Smooth scrolling behavior

### 3. UI Controls Not Fully Functional
**Location**: `src/lib/visualization/styles/flowing-particles.ts`

**Missing Implementations**:
- `blurAmount` - Not used anywhere (should apply p5.js blur filter)
- `complexity` - Not affecting anything (should control particle density/spawn rate)
- `motionSpeed` - Only affects rotation speed, not particle velocity
- `trailMode: "glow"` - Same as "fade", no glow effect
- `showVelocity` - Only affects circle size, not clearly visible

### 4. Visual Variation Issues
**Location**: `src/lib/visualization/styles/flowing-particles.ts`, `color-mapper.ts`

**Problems**:
- Particles look too similar despite different pitches/velocities
- Color variation (`hueVariation`) may not be strong enough
- Size variation based on velocity may be too subtle
- `intensity` affects alpha but size calculation is confusing

### 5. Preset System Limitations
**Location**: `src/lib/visualization/presets.ts`

**Problem**:
- Presets only tweak parameters (minimal visual difference)
- No distinct rendering algorithms per preset
- "Orbital" and "Fluid" presets don't actually implement orbital/fluid motion

**Need**:
- Different visual styles per preset (inspired by FluidCanvas, GlitchCursor)
- Modular system where presets can use MIDI + music theory data

### 6. Music Theory Integration Missing
**Location**: `src/lib/music-theory/`

**Available but Unused**:
- `detectChord()` - detects chords but not used for visual effects
- `getChordsAtTime()` - gets chords at specific time, not used
- `detectKey()` - detects key, only used for color mapping
- `getScaleDegree()` - gets scale degree, only used for color mapping

**Potential Uses** (from user requirements):
- "All minor chords glow dark red pulsating"
- "Happy sections shine yellow sunrise-y"
- Chord-based visual effects
- Mood/emotion-based color schemes

## Architecture Questions

### Question 1: Camera/Scrolling System
How should the camera/scroll system work?

**Option A**: Auto-follow playhead (like FL Studio)
- Camera automatically scrolls to keep playhead centered/visible
- User can't manually scroll while playing
- Smooth scrolling animation

**Option B**: Manual + Auto hybrid
- Auto-follow when playing
- User can manually scroll when paused
- Toggle between modes

**Option C**: Always manual
- User controls camera position
- No auto-scrolling

### Question 2: Music Theory Data Access
How should presets access music theory data?

**Option A**: Pass analysis results to style classes
```typescript
interface StyleContext {
  clips: MidiNoteClip[];
  currentTime: number;
  chords: ChordAnalysis[];  // Pre-computed chords
  key: string | null;
  mood?: EmotionAnalysis;   // Future: happy/sad sections
}
```

**Option B**: Style classes compute on-demand
- Styles call analysis functions themselves
- More flexible but potentially slower

**Option C**: Hybrid - pass computed data + allow on-demand
- Pre-compute common analyses (chords, key)
- Allow styles to compute additional analyses if needed

### Question 3: Preset Architecture
How should different preset styles be implemented?

**Option A**: Separate style classes
- `FlowingParticlesStyle` (current)
- `OrbitalParticlesStyle` (new)
- `FluidParticlesStyle` (new)
- `GlitchParticlesStyle` (new)
- Each implements `IVisualizationStyle` interface

**Option B**: Single style class with mode switching
- `FlowingParticlesStyle` with `renderMode` property
- Different rendering methods: `renderOrbital()`, `renderFluid()`, etc.
- Simpler but less modular

**Option C**: Plugin/strategy pattern
- Base `ParticleStyle` class
- Preset-specific "renderers" or "behaviors"
- Most flexible, most complex

### Question 4: Particle Positioning System
How should particles be positioned relative to time?

**Current**: `x = (currentTime - clipStart) * timeScale + centerX`

**Option A**: Absolute positioning (sheet music style)
- `x = clipStart * timeScale` (absolute position on timeline)
- Camera scrolls to show current time
- Particles stay in fixed positions

**Option B**: Relative positioning (current approach, but fixed)
- `x = (currentTime - clipStart) * timeScale` (no centerX)
- Particles spawn at x=0 and move rightward
- Camera follows playhead

**Option C**: Hybrid
- Particles have absolute positions
- Camera offset applied during rendering
- More flexible for different visualization modes

## Code Quality Issues

### 1. Magic Numbers
**Location**: Throughout `flowing-particles.ts`
- `timeScale: 100` - What does this represent?
- `pitchScale: 4` - Pixels per MIDI note?
- `visibleWindow: 10` - Seconds? Why 10?
- `trailAlpha: minAlpha = 12, maxAlpha = 220` - Why these values?

**Solution**: Extract to named constants with comments

### 2. Missing Documentation
- No JSDoc comments on public methods
- No explanation of coordinate systems
- No comments explaining complex logic

### 3. Type Safety
- `ParticleShapeType` vs `ParticleShape` - slight inconsistency
- Some `any` types or loose typing possible

### 4. Error Handling
- No error handling in particle rendering
- No validation of config values
- No bounds checking on calculations

## Refactoring Recommendations

### Phase 1: Critical Fixes
1. Fix particle positioning (remove centerX, implement proper camera)
2. Fix visual variation (ensure config values actually work)
3. Implement missing UI controls (blurAmount, complexity, motionSpeed)

### Phase 2: Architecture Improvements
1. Create `IVisualizationStyle` interface
2. Split `flowing-particles.ts` into smaller modules
3. Split `settings-panel.tsx` into smaller components
4. Extract constants to config file

### Phase 3: Music Theory Integration
1. Create `StyleContext` interface with music theory data
2. Implement chord-based visual effects
3. Add mood/emotion analysis (future)

### Phase 4: Preset System Enhancement
1. Implement distinct visual styles per preset
2. Create separate style classes or render modes
3. Add preset-specific initialization

## Next Steps

1. **Answer architecture questions** (above)
2. **Create detailed refactoring plan** based on answers
3. **Implement fixes** in priority order
4. **Test and validate** each change

