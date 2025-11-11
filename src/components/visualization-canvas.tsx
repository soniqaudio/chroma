"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { VisualizationRenderer } from "@/lib/visualization/renderer";
import { useMidiStore } from "@/store/midi-store";
import { usePlaybackStore } from "@/store/playback-store";
import { useVisualizationStore } from "@/store/visualization-store";
import type p5 from "p5";

function VisualizationCanvasInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const rendererRef = useRef<VisualizationRenderer | null>(null);
  const configRef = useRef(useVisualizationStore.getState().config);
  const currentTimeRef = useRef(0);

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
      className="w-full h-full bg-black"
      style={{ minHeight: "600px" }}
    />
  );
}

export const VisualizationCanvas = dynamic(
  () => Promise.resolve(VisualizationCanvasInner),
  { ssr: false },
);

