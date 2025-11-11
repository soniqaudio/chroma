"use client";

import { useState, useEffect } from "react";
import { LiveMidiHandler, type MidiInputDevice } from "@/lib/midi/live-midi";
import { useMidiStore } from "@/store/midi-store";

export function LiveMidiIndicator() {
  const [devices, setDevices] = useState<MidiInputDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [handler] = useState(() => new LiveMidiHandler());

  useEffect(() => {
    handler
      .requestAccess()
      .then(() => {
        setDevices(handler.getInputDevices());
      })
      .catch((err) => {
        console.error("Failed to request MIDI access:", err);
      });
  }, [handler]);

  const handleConnect = () => {
    if (!selectedDevice) return;

    try {
      handler.connect(selectedDevice, (event) => {
        useMidiStore.getState().addLiveEvent(event);
      });
      setIsConnected(true);
    } catch (err) {
      console.error("Failed to connect to MIDI device:", err);
    }
  };

  const handleDisconnect = () => {
    if (selectedDevice) {
      handler.disconnect(selectedDevice);
      setIsConnected(false);
    }
  };

  if (devices.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        No MIDI devices found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-gray-400"
          }`}
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Live MIDI
        </span>
      </div>
      <select
        value={selectedDevice || ""}
        onChange={(e) => setSelectedDevice(e.target.value)}
        disabled={isConnected}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50"
      >
        <option value="">Select MIDI device</option>
        {devices.map((device) => (
          <option key={device.id} value={device.id}>
            {device.name} ({device.manufacturer})
          </option>
        ))}
      </select>
      {!isConnected ? (
        <button
          onClick={handleConnect}
          disabled={!selectedDevice}
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
        >
          Connect
        </button>
      ) : (
        <button
          onClick={handleDisconnect}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Disconnect
        </button>
      )}
    </div>
  );
}

