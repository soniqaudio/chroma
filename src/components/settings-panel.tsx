"use client";

import { useVisualizationStore, type ColorMappingMode } from "@/store/visualization-store";

export function SettingsPanel() {
  const config = useVisualizationStore((state) => state.config);
  const setColorMappingMode = useVisualizationStore((state) => state.setColorMappingMode);
  const updateConfig = useVisualizationStore((state) => state.updateConfig);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Visualization Settings
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color Mapping
            </label>
            <select
              value={config.colorMappingMode}
              onChange={(e) => setColorMappingMode(e.target.value as ColorMappingMode)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="pitch">Pitch-based</option>
              <option value="scale-degree">Scale Degree</option>
              <option value="chord">Chord-based</option>
              <option value="aesthetic">Aesthetic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Show Velocity: {config.showVelocity ? "Yes" : "No"}
            </label>
            <input
              type="checkbox"
              checked={config.showVelocity}
              onChange={(e) => updateConfig({ showVelocity: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Show Trails: {config.showTrails ? "Yes" : "No"}
            </label>
            <input
              type="checkbox"
              checked={config.showTrails}
              onChange={(e) => updateConfig({ showTrails: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
          </div>

          {config.showTrails && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trail Length: {config.trailLength.toFixed(1)}s
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={config.trailLength}
                onChange={(e) => updateConfig({ trailLength: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Particle Size: {config.particleSize}
            </label>
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              value={config.particleSize}
              onChange={(e) => updateConfig({ particleSize: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Connection Distance: {config.connectionDistance}
            </label>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={config.connectionDistance}
              onChange={(e) => updateConfig({ connectionDistance: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

