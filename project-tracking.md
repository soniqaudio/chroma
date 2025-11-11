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

## Session Summary - Initial Build & UI Redesign

Built complete MVP from scratch: MIDI parsing with sustain pedal handling, live MIDI input, Tone.js playback engine, and p5.js visualization system. Implemented "Flowing Particles" style with horizontal scrolling, color mapping, and trail effects. Fixed multiple Turbopack build errors by extracting inline functions. Redesigned UI to match SoniqAudio aesthetic: left sidebar layout, centered main canvas, drag-drop MIDI upload directly on visualization, proper depth/layering with gradients, backdrop blur, and subtle borders. Extended particle lifetime and improved visual presence. Current state: fully functional MVP with professional UI, ready for enhancements.

## Todos

- Further redesign, UI/UX improvements
- Replace Tone.js synth with soundfont player piano sound (reference ToneDAW project implementation)
- Investigate and fix sustain pedal handling in audio playback (may be resolved with soundfont player)
- Implement proper music theory logic (key detection, chord analysis, scale degree mapping)
- Explore and implement different visualization styles and ideas

