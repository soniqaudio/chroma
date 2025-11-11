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

