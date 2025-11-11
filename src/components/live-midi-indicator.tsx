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
      <div className="text-sm text-white/40">
        No MIDI devices found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full transition-colors ${
            isConnected ? "bg-green-500 shadow-lg shadow-green-500/50" : "bg-white/20"
          }`}
        />
        <span className="text-xs text-white/60">
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>
      <select
        value={selectedDevice || ""}
        onChange={(e) => setSelectedDevice(e.target.value)}
        disabled={isConnected}
        className="w-full px-2.5 py-1.5 border border-white/10 rounded-md bg-white/5 text-white text-xs focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="w-full px-3 py-1.5 bg-white text-black hover:bg-white/90 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed rounded-md font-medium transition-all text-xs shadow-lg shadow-black/20"
        >
          Connect
        </button>
      ) : (
        <button
          onClick={handleDisconnect}
          className="w-full px-3 py-1.5 border border-white/10 text-white/80 hover:border-white/20 hover:text-white hover:bg-white/5 rounded-md font-medium transition-all text-xs"
        >
          Disconnect
        </button>
      )}
    </div>
  );
}
