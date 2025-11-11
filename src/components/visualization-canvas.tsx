"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { VisualizationRenderer } from "@/lib/visualization/renderer";
import { useMidiStore } from "@/store/midi-store";
import { usePlaybackStore } from "@/store/playback-store";
import { useVisualizationStore } from "@/store/visualization-store";
import { parseMidiFile } from "@/lib/midi/midi-parser";
import type p5 from "p5";

function VisualizationCanvasInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const rendererRef = useRef<VisualizationRenderer | null>(null);
  const configRef = useRef(useVisualizationStore.getState().config);
  const currentTimeRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const clips = useMidiStore((state) => state.clips);
  const currentTime = usePlaybackStore((state) => state.currentTime);
  const config = useVisualizationStore((state) => state.config);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    configRef.current = config;
    if (rendererRef.current) {
      rendererRef.current.updateConfig(config);
    }
  }, [config]);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".mid") && !file.name.endsWith(".midi")) {
      useMidiStore.getState().setError("Please upload a MIDI file (.mid or .midi)");
      return;
    }

    setIsLoading(true);
    useMidiStore.getState().setLoading(true);
    useMidiStore.getState().setError(null);

    try {
      const data = await parseMidiFile(file);
      useMidiStore.getState().setMidiData(data);
    } catch (err) {
      useMidiStore.getState().setError(
        err instanceof Error ? err.message : "Failed to parse MIDI file",
      );
    } finally {
      setIsLoading(false);
      useMidiStore.getState().setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;

    const loadP5 = async () => {
      const p5Module = await import("p5");
      const p5 = p5Module.default;

      if (!mounted) return;

      const sketch = (p: p5) => {
        p.setup = () => {
          const width = containerRef.current?.clientWidth || 800;
          const height = containerRef.current?.clientHeight || 600;
          p.createCanvas(width, height);

          const renderer = new VisualizationRenderer(configRef.current);
          renderer.initialize(p);
          renderer.setClips(clips);
          rendererRef.current = renderer;
        };

        p.draw = () => {
          if (rendererRef.current) {
            rendererRef.current.setCurrentTime(currentTimeRef.current);
            rendererRef.current.render(p);
          }
        };

        p.windowResized = () => {
          const width = containerRef.current?.clientWidth || 800;
          const height = containerRef.current?.clientHeight || 600;
          p.resizeCanvas(width, height);
          rendererRef.current?.resize(width, height);
        };
      };

      p5InstanceRef.current = new p5(sketch, containerRef.current);
    };

    loadP5();

    return () => {
      mounted = false;
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setClips(clips);
    }
  }, [clips]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative rounded-3xl overflow-hidden"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/30 rounded-3xl flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-lg font-medium text-white mb-1">Drop MIDI file here</p>
            <p className="text-sm text-white/60">Supports .mid and .midi files</p>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm rounded-3xl flex items-center justify-center pointer-events-none">
          <p className="text-white">Loading MIDI file...</p>
        </div>
      )}
    </div>
  );
}

export const VisualizationCanvas = dynamic(
  () => Promise.resolve(VisualizationCanvasInner),
  { ssr: false },
);

