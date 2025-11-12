# Synesthesia Project Tracking

## Initial Implementation (MVP)

### Architecture Decisions
- Using `@tonejs/midi` for MIDI file parsing (same as ToneDAW)
- Web MIDI API directly (no wrapper library)
- Event-based architecture with domain events → clips conversion (ToneDAW pattern)
- p5.js for 2D visualization rendering
- Zustand for state management
- Modular visualization style system

### Core Features Implemented
- MIDI file upload and parsing
- Live MIDI input via Web MIDI API
- MIDI playback using Tone.js
- Flowing Particles visualization style (horizontal, bird-song inspired)
- Color mapping system (pitch, scale-degree, chord, aesthetic modes)
- Playback controls with seek
- Follow-playhead scrolling
- Settings panel for visualization configuration

### Technical Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- p5.js for visualization
- Tone.js for audio playback
- @tonejs/midi for MIDI parsing
- Tonal.js for music theory
- Zustand for state management

## Session 1 Summary - Initial Build & UI Redesign

Built complete MVP from scratch: MIDI parsing with sustain pedal handling, live MIDI input, Tone.js playback engine, and p5.js visualization system. Implemented "Flowing Particles" style with horizontal scrolling, color mapping, and trail effects. Fixed multiple Turbopack build errors by extracting inline functions. Redesigned UI to match SoniqAudio aesthetic: left sidebar layout, centered main canvas, drag-drop MIDI upload directly on visualization, proper depth/layering with gradients, backdrop blur, and subtle borders. Extended particle lifetime and improved visual presence. Current state: fully functional MVP with professional UI, ready for enhancements.

## Session 2 Summary - UI/UX Polish & Professional Redesign

Comprehensive UI/UX overhaul to achieve Vercel/Cursor/Linear-level design quality. Renamed application to "Chroma" and updated branding throughout. Redesigned topbar with File/Edit dropdown menus (New, Save, Export, Undo, Redo), centered playback controls with time display, and settings icon. Created custom shadcn-style dropdown component with proper z-index layering. Converted checkboxes to toggle button components with blue accent color for selected states. Added Parameters section with Intensity, Complexity, Motion Speed, and Blur Amount sliders, plus Layers section with Background, Particles, Harmonics, and Melody toggles. Implemented preset selection system (Chromatic, Minimal, Vibrant, Monochrome). Made sidebar ultra-compact with reduced spacing, grid layouts for related controls, and optimized typography to fit all content on one screen. Enhanced canvas background with smooth dark blue gradient orbs featuring subtle pulsating animations (8s, 10s, 12s cycles) and starfield overlay for depth. Fixed canvas transparency issue by replacing p5.js background fill with clear() to reveal background effects. Added proper shadows, depth, and premium visual polish throughout. Current state: polished, professional UI matching high-end design standards with improved UX flow and visual hierarchy.

## Session 3 Summary - Particle Graphics Enhancement & Preset System

Attempted to enhance particle visualization system with advanced effects inspired by GlitchCursor examples. Implemented multiple particle shapes (circle, rectangle, glitch-block, mixed), trail effects, HSL color system, random drift movement, and particle rotation. Created preset system with 6 presets (Chromatic, Minimal, Vibrant, Monochrome, Orbital, Fluid) extracted from ParticleCanvas and FluidCanvas examples. Fixed particle cleanup issues (dead particles leaving trails) and flow direction (particles now flow right like sheet music). Added config options for particle shape, trail mode/intensity, color mode, hue variation, particle drift, and rotation.

**CRITICAL ISSUES REMAINING:**

1. **Preset System Not Working Properly**: Presets are being applied (confirmed via console logs showing config changes), but visual differences are minimal (~2% change). The presets do not create dramatically different graphics, particles, or forms like the original ParticleCanvas and FluidCanvas examples. The current implementation only tweaks existing parameters (size, drift, trail intensity) rather than creating fundamentally different visual styles. Need to implement actual orbital motion patterns, fluid dynamics, and other distinct rendering approaches from the examples.

2. **Playback Starting Position Issue**: Playback visualization starts particles in the center of the screen instead of using the full screen width. Particles spawn at `centerX = viewportWidth * 0.5` which centers them, but they should start from the left edge and flow across the entire canvas width. The camera/positioning system needs to be adjusted so particles utilize the full screen space from left to right.

**Technical Notes:**
- Preset system architecture is in place (`src/lib/visualization/presets.ts`)
- Particle clearing on preset change is implemented but may not be working correctly
- Intensity now affects particle size and alpha
- Flow direction fixed (rightward like sheet music)
- Trail cleanup improved but may still have issues

**Next Steps:**
- Investigate why presets create minimal visual differences - may need to implement different rendering algorithms per preset rather than just parameter tweaks
- Fix playback positioning to use full screen width
- Consider implementing separate style classes for each preset (OrbitalStyle, FluidStyle) with distinct rendering logic

## Session 4 Summary - Code Quality, Bug Fixes & Distinct Style System

Comprehensive refactoring and bug fixing session focused on code quality, fixing critical particle positioning issues, and implementing distinct rendering styles for presets.

### Code Quality & Refactoring
- **Extracted constants**: Created `src/lib/visualization/constants.ts` with all magic numbers (TIME_SCALE, PITCH_SCALE, etc.) with documentation
- **Created style interface**: Implemented `IVisualizationStyle` interface (`src/lib/visualization/styles/base-style.ts`) for consistent style API
- **Split large files**: Extracted particle types (`src/lib/visualization/particles/particle-types.ts`) and particle factory (`src/lib/visualization/particles/particle-factory.ts`) from `flowing-particles.ts`
- **Added documentation**: JSDoc comments on all public methods explaining parameters and behavior

### Critical Bug Fixes
- **Fixed particle positioning**: Removed `centerX` offset that was centering particles. Particles now spawn from left edge (x=0) and flow rightward across full canvas width
- **Fixed visual variation**: Improved size/color differences based on velocity and pitch. Made `motionSpeed` affect particle velocity, `complexity` affect spawn rate
- **Fixed UI controls**: Implemented missing effects - `complexity` controls spawn rate, `motionSpeed` affects velocity, `trailMode: "glow"` has distinct effect from "fade"
- **Fixed particle removal**: Changed from time-based removal to position-based (particles stay until off-screen, allowing full-width flow)

### Distinct Style System Implementation
- **Created separate style classes**: Implemented distinct rendering engines for different presets
  - `GlitchParticlesStyle` (~250 lines): Adapted from GlitchCursor example - glitch blocks, scanlines, corruption effects, image data manipulation
  - `FluidParticlesStyle` (~330 lines): Adapted from FluidCanvas example - simplified fluid dynamics with velocity fields, density grid, smooth organic motion
  - `FlowingParticlesStyle`: Standard particle flow (existing, refactored)
- **Style factory pattern**: Updated `VisualizationRenderer` to create appropriate style instance based on preset selection
- **Glitch preset working well**: Notes render as glitch blocks with random sizes, corruption offsets, and scanline effects - serves as good template for future presets

### Outstanding Issues
1. **MIDI note positioning**: Notes currently cramped - need to map full MIDI range (A0 = 21 to C8 = 108, 87 notes) to full canvas height. A0 should be at bottom, C8 at top, evenly spaced.
2. **Orbital preset errors**: Runtime errors when switching to orbital preset - `currentTime` undefined in render method, needs proper state management
3. **Particle flow width**: Particles start at left but don't fully utilize canvas width - may need camera scrolling or better timeScale calculation

### Current State
- **Glitch preset**: Working well with distinct visual style - good foundation for building more presets
- **Code structure**: Much cleaner with separated concerns, constants extracted, proper interfaces
- **Preset system**: Architecture in place for distinct rendering styles, but needs refinement
- **Visual quality**: Particles have better variation, controls work properly, but positioning needs work

### Next Steps / Todos

**Immediate Priority:**
- Fix MIDI note positioning to use full height (A0 bottom, C8 top, evenly spaced across 87 notes)
- Fix orbital preset runtime errors (currentTime state management)
currentTime is not defined
src/lib/visualization/styles/flowing-particles.ts (321:27) @ eval


  319 |           
  320 |           // Orbit trail (faint line showing orbit path)
> 321 |           const centerX = (currentTime - particle.clip.start) * this.timeScale;
and Runtime TypeError


Cannot read properties of undefined (reading 'pixels')
- Ensure particles flow across full canvas width

**Short Term:**
- Build more presets based on glitch example pattern - different color variations, particle shapes, effects
- Refine existing presets (orbital, fluid) to match example quality
- Improve visual distinctness between presets

**Medium Term:**
- Replace current sinewave synth with soundfont-player piano sound (reference ToneDAW project - path available on ask but not immediate priority)
- Implement proper music theory integration (chord-based colors, mood-based effects like "minor chords glow dark red", "happy sections shine yellow")


**Long Term:**
- Further redesign, UI/UX improvements
- Investigate and fix sustain pedal handling in audio playback
- Implement File menu actions (Save, Export functionality)
- Implement Edit menu actions (Undo/Redo system)

## Session 5 Summary - Preset Refinement, Color System & Bug Fixes

Major refactoring session focused on fixing critical bugs, creating new presets based on glitch foundation, and implementing a global color gradient system.

### Critical Bug Fixes
- **Fixed orbital preset runtime error**: Added `currentTime` as class property in `FlowingParticlesStyle`, stored in `update()` method, used in `render()` method (line 324)
- **Fixed MIDI note positioning**: Created `getNoteYPosition()` helper function in `constants.ts` that maps A0 (21) to bottom of canvas and C8 (108) to top, evenly spaced across full canvas height. Updated all three style classes (flowing-particles, glitch-particles, crystal-particles, fluid-particles) to use this function

### Preset System Refinement
- **Removed unnecessary presets**: Cleaned up preset list, removed minimal, vibrant, monochrome presets that weren't providing distinct visual styles
- **Created Crystal preset**: New `CrystalParticlesStyle` class (~250 lines) based on glitch foundation
  - Rotating crystal polygons (3-5 vertices per crystal)
  - Individual rotation speeds per crystal
  - Glow halo effects for visibility
  - Larger crystals (3-4x size multiplier)
  - Trail connections between nearby crystals
  - Uses same unified architecture as glitch preset
- **Created Fluid preset**: New `FluidParticlesStyle` class (~330 lines) based on glitch foundation
  - Simplified fluid dynamics with velocity and density grids (128x128 grid)
  - Smooth organic particle motion influenced by fluid grid
  - Density field rendering for glowing cloud effects
  - Uses ColorMapper for gradient colors
  - **NOTE: Still has coordinate mapping bugs** - density field rendering has issues with canvas coverage

### Color System Overhaul
- **Made colors global**: Removed `colorMappingMode`, `colorMode`, and `hueVariation` from preset configs - these are now global settings that apply to all presets
- **Implemented color gradient picker**: Created `ColorGradientPicker` component
  - Live gradient preview bar
  - 2-3 color stops with add/remove functionality
  - Integrated into settings panel sidebar
  - Default gradient: Blue → Purple → Pink (`#3b82f6`, `#8b5cf6`, `#ec4899`)
- **Updated ColorMapper**: Added `setColorGradient()` method and gradient interpolation logic
  - Interpolates between gradient colors based on pitch (normalized 0-1)
  - Applies velocity-based brightness
  - Falls back to default hue mapping if no gradient set
- **Updated applyPreset()**: Now explicitly preserves color settings when switching presets

### Current Presets
1. **Chromatic** (default): Classic flowing particles
2. **Glitch**: Digital corruption with scanlines and glitch blocks - working well, serves as template
3. **Crystal**: Rotating crystal polygons with trails - working well
4. **Fluid**: Smooth fluid dynamics with density fields - **has coordinate mapping bugs**

### Outstanding Issues
1. **Fluid preset coordinate bugs**: Density field rendering doesn't properly cover full canvas - appears to only show in small section. Coordinate mapping between viewport and grid needs fixing. Attempted fixes using `p5.width`/`p5.height` but issue persists.
2. **Particle flow width**: Particles utilize full width correctly now, but may need further refinement

### Current State
- **Glitch preset**: Working perfectly - excellent foundation for building more presets
- **Crystal preset**: Working well with prominent, visible crystals
- **Fluid preset**: Functional but buggy - coordinate mapping issues prevent proper full-canvas rendering
- **Color system**: Global gradient picker working, colors apply across all presets
- **Code structure**: Clean, unified architecture with glitch as template pattern

### Next Steps / Todos

**Immediate Priority:**
- Fix fluid preset coordinate mapping - density field should render across full canvas like glitch/crystal presets
- Investigate why density field only appears in small section despite using `p5.width`/`p5.height`

**Short Term:**
- Build more presets based on glitch example pattern - different visual styles but unified architecture
- Refine fluid preset to match example quality (glowing clouds across full canvas)
- Test and verify all presets work correctly with color gradient system

**Medium Term:**
- Replace current sinewave synth with soundfont-player piano sound (reference ToneDAW project - path available on ask but not immediate priority)
- Implement proper music theory integration (chord-based colors, mood-based effects like "minor chords glow dark red", "happy sections shine yellow")

**Long Term:**
- Further redesign, UI/UX improvements
- Investigate and fix sustain pedal handling in audio playback
- Implement File menu actions (Save, Export functionality)
- Implement Edit menu actions (Undo/Redo system)

