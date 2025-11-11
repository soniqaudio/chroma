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

## Todos

- Further redesign, UI/UX improvements
- Replace Tone.js synth with soundfont player piano sound (reference ToneDAW project implementation)
- Investigate and fix sustain pedal handling in audio playback (may be resolved with soundfont player)
- Implement proper music theory logic (key detection, chord analysis, scale degree mapping)
- Explore and implement different visualization styles and ideas
- Implement File menu actions (Save, Export functionality)
- Implement Edit menu actions (Undo/Redo system)

