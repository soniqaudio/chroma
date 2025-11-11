Synesthesia Architecture Plan
System Overview
Synesthesia is a browser-native MIDI visualizer that transforms structured musical data (notes, velocity, timing, harmony) into generative visual art. The system processes MIDI input (file upload or live) and renders expressive visuals synchronized to playback.

Core Architecture Layers
1. Data Layer (src/lib/midi/)
MIDI Parser (midi-parser.ts): Wraps midi-parser-js to extract note events, timing, velocity
MIDI Normalizer (midi-normalizer.ts): Converts raw MIDI data into normalized format (time-based events, note ranges)
Live MIDI Handler (live-midi.ts): Web MIDI API integration for real-time input
MIDI Types (types.ts): TypeScript interfaces for MIDI events, notes, tracks
2. Music Theory Layer (src/lib/music-theory/)
Key Detection (key-detection.ts): Uses Tonal.js to detect key signatures
Chord Analysis (chord-analysis.ts): Identifies chords and harmonic progressions
Scale Mapping (scale-mapping.ts): Maps notes to scale degrees for color assignment
Harmony Analyzer (harmony.ts): Analyzes harmonic relationships between notes
3. Audio Engine Layer (src/lib/audio/)
Playback Controller (playback.ts): Manages MIDI playback using Tone.js
Timing Sync (timing.ts): Synchronizes visualization with audio playback
Transport (transport.ts): Play/pause/seek controls, position tracking
4. Visualization Engine (src/lib/visualization/)
p5 Wrapper (p5-wrapper.ts): React-friendly wrapper for p5.js instance
Visual Style System (styles/): Modular visual style implementations
piano-flow.ts: First MVP style (X=time, Y=pitch, color=scale degree, brightness=velocity)
Renderer (renderer.ts): Main rendering loop, manages visual elements
Color Mapper (color-mapper.ts): Maps musical properties to colors (pitch→hue, velocity→brightness)
Note Visualizer (note-visualizer.ts): Individual note rendering logic
5. State Management (src/store/)
MIDI Store (midi-store.ts): Zustand store for MIDI data, parsed events
Playback Store (playback-store.ts): Playback state, position, transport controls
Visualization Store (visualization-store.ts): Visual config, style selection, color rules
6. UI Components (src/components/)
MIDI Upload (midi-upload.tsx): File input with drag-drop
Playback Controls (playback-controls.tsx): Play/pause/seek bar
Visualization Canvas (visualization-canvas.tsx): React wrapper for p5.js canvas
Settings Panel (settings-panel.tsx): Visual style selection, color mapping options
Live MIDI Indicator (live-midi-indicator.tsx): Shows active MIDI input status
Key Technical Decisions
p5.js Integration Strategy
Use React ref + useEffect to create p5 instance
Separate p5 sketch logic from React components
Pass state updates via props/callbacks, not direct state access
Cleanup on unmount to prevent memory leaks
State Management Pattern
Zustand for global app state (MIDI data, playback, config)
Local React state for UI-only concerns (modals, dropdowns)
Derived state computed in selectors (e.g., "notes in current viewport")
MIDI Data Structure
interface MIDINote {
  pitch: number;        // MIDI note number (0-127)
  velocity: number;     // 0-127
  startTime: number;    // seconds from start
  duration: number;     // seconds
  channel: number;      // MIDI channel
}

interface MIDIEvent {
  type: 'noteOn' | 'noteOff';
  note: MIDINote;
  time: number;
}
Visualization Rendering Strategy
Pre-process MIDI into time-sorted events
Render only visible notes (viewport culling)
Use requestAnimationFrame for smooth 60fps
Implement "follow playhead" scrolling (camera follows playback position)
Color Mapping System
Pitch → Hue: Map MIDI note to HSL hue (configurable mapping)
Velocity → Brightness/Saturation: Dynamic intensity
Scale Degree → Color: Use Tonal.js to map notes to scale degrees
Preset color schemes: "Rainbow", "Scale-based", "Random", "Monochrome"
File Structure
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main app page
│   └── globals.css         # Global styles
├── components/
│   ├── midi-upload.tsx
│   ├── playback-controls.tsx
│   ├── visualization-canvas.tsx
│   ├── settings-panel.tsx
│   └── live-midi-indicator.tsx
├── lib/
│   ├── midi/
│   │   ├── midi-parser.ts
│   │   ├── midi-normalizer.ts
│   │   ├── live-midi.ts
│   │   └── types.ts
│   ├── music-theory/
│   │   ├── key-detection.ts
│   │   ├── chord-analysis.ts
│   │   ├── scale-mapping.ts
│   │   └── harmony.ts
│   ├── audio/
│   │   ├── playback.ts
│   │   ├── timing.ts
│   │   └── transport.ts
│   └── visualization/
│       ├── p5-wrapper.ts
│       ├── renderer.ts
│       ├── color-mapper.ts
│       ├── note-visualizer.ts
│       └── styles/
│           └── piano-flow.ts
└── store/
    ├── midi-store.ts
    ├── playback-store.ts
    └── visualization-store.ts
MVP Feature Set
Phase 1: Core Foundation
MIDI file upload (.mid)
Parse MIDI into normalized note events
Basic playback using Tone.js
Simple "Piano Flow" visualization (2D, time vs pitch)
Play/pause controls
Follow-playhead scrolling
Phase 2: Enhancement
Live MIDI input via Web MIDI API
Color mapping presets
Velocity visualization (brightness/size)
Note trails/fade effects
Basic settings panel
Phase 3: Polish
Chord detection and visualization
Multiple visual styles (modular system)
Export options (screenshot, video?)
Performance optimizations
Performance Considerations
Viewport culling: Only render notes visible in current time window
Object pooling: Reuse visual note objects instead of creating/destroying
Throttle updates: Limit state updates to 60fps max
Lazy loading: Load MIDI parser only when needed
Web Workers: Consider moving MIDI parsing to worker thread for large files
Technical Decisions Made
MIDI Library: Use @tonejs/midi (same as ToneDAW) instead of midi-parser-js
Live MIDI: Use Web MIDI API directly (native browser API) - no WebMIDI.js wrapper needed
Event Architecture: Adopt ToneDAW's event-based system with domain events → clips conversion
Visual Style: Start with one style ("Flowing Particles") but build modular system from start
Visual Direction: Horizontal flowing style (like sheet music), inspired by bird-song visualization
Color System: Support both music-theory based AND purely aesthetic/configurable mappings