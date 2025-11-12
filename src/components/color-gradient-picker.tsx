"use client";

import { useVisualizationStore } from "@/store/visualization-store";

export function ColorGradientPicker() {
  const config = useVisualizationStore((state) => state.config);
  const setColorGradient = useVisualizationStore((state) => state.setColorGradient);

  const handleColorChange = (index: number, color: string) => {
    const newGradient = [...config.colorGradient];
    newGradient[index] = color;
    setColorGradient(newGradient);
  };

  const addColorStop = () => {
    if (config.colorGradient.length < 3) {
      // Add a color between the last two colors
      const lastColor = config.colorGradient[config.colorGradient.length - 1];
      setColorGradient([...config.colorGradient, lastColor]);
    }
  };

  const removeColorStop = (index: number) => {
    if (config.colorGradient.length > 2) {
      const newGradient = config.colorGradient.filter((_, i) => i !== index);
      setColorGradient(newGradient);
    }
  };

  // Create gradient preview string
  const gradientString = config.colorGradient.join(", ");

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-white/60 mb-1.5">
        Color Gradient
      </label>
      
      {/* Gradient Preview */}
      <div
        className="w-full h-8 rounded border border-white/10"
        style={{
          background: `linear-gradient(to right, ${gradientString})`,
        }}
      />

      {/* Color Pickers */}
      <div className="flex gap-2 items-center">
        {config.colorGradient.map((color, index) => (
          <div key={index} className="flex items-center gap-1">
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(index, e.target.value)}
              className="w-8 h-8 rounded border border-white/20 cursor-pointer"
              style={{ backgroundColor: color }}
            />
            {config.colorGradient.length > 2 && (
              <button
                onClick={() => removeColorStop(index)}
                className="text-white/40 hover:text-white/60 text-xs w-4 h-4 flex items-center justify-center"
                title="Remove color"
              >
                ×
              </button>
            )}
          </div>
        ))}
        
        {config.colorGradient.length < 3 && (
          <button
            onClick={addColorStop}
            className="text-white/40 hover:text-white/60 text-xs w-8 h-8 flex items-center justify-center border border-white/20 rounded"
            title="Add color"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}

