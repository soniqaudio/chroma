import type { MidiDomainEvent } from "./types";
import { NoteStack } from "./note-stack";

export interface MidiInputDevice {
  id: string;
  name: string;
  manufacturer: string;
}

export class LiveMidiHandler {
  private access: MIDIAccess | null = null;
  private noteStack = new NoteStack();
  private onEventCallback: ((event: MidiDomainEvent) => void) | null = null;
  private startTime: number = 0;

  async requestAccess(): Promise<MIDIAccess> {
    if (!navigator.requestMIDIAccess) {
      throw new Error("Web MIDI API not supported in this browser");
    }
    this.access = await navigator.requestMIDIAccess({ sysex: false });
    return this.access;
  }

  getInputDevices(): MidiInputDevice[] {
    if (!this.access) return [];
    const devices: MidiInputDevice[] = [];
    this.access.inputs.forEach((input) => {
      devices.push({
        id: input.id,
        name: input.name,
        manufacturer: input.manufacturer || "Unknown",
      });
    });
    return devices;
  }

  connect(deviceId: string, onEvent: (event: MidiDomainEvent) => void): void {
    if (!this.access) {
      throw new Error("MIDI access not requested");
    }

    const input = this.access.inputs.get(deviceId);
    if (!input) {
      throw new Error(`MIDI input device ${deviceId} not found`);
    }

    this.onEventCallback = onEvent;
    this.startTime = performance.now() / 1000;
    this.noteStack.clear();

    input.onmidimessage = (message) => {
      this.handleMidiMessage(message);
    };
  }

  disconnect(deviceId: string): void {
    if (!this.access) return;
    const input = this.access.inputs.get(deviceId);
    if (input) {
      input.onmidimessage = null;
    }
    this.onEventCallback = null;
  }

  private handleMidiMessage(message: MIDIMessageEvent): void {
    const [status, data1, data2] = message.data;
    const command = status & 0xf0;
    const channel = status & 0x0f;
    const currentTime = performance.now() / 1000 - this.startTime;

    if (command === 0x90 && data2 > 0) {
      const event: MidiDomainEvent = {
        id: `live-noteOn-${currentTime}-${data1}`,
        type: "noteOn",
        timestamp: currentTime,
        channel,
        noteNumber: data1,
        velocity: data2,
      };
      this.noteStack.push(channel, data1, data2, currentTime);
      this.onEventCallback?.(event);
    } else if (command === 0x80 || (command === 0x90 && data2 === 0)) {
      const event: MidiDomainEvent = {
        id: `live-noteOff-${currentTime}-${data1}`,
        type: "noteOff",
        timestamp: currentTime,
        channel,
        noteNumber: data1,
        velocity: 0,
      };
      this.noteStack.pop(channel, data1);
      this.onEventCallback?.(event);
    } else if (command === 0xb0) {
      const event: MidiDomainEvent = {
        id: `live-cc-${currentTime}-${data1}`,
        type: "cc",
        timestamp: currentTime,
        channel,
        controller: data1,
        value: data2,
      };
      this.onEventCallback?.(event);
    }
  }
}

