interface NoteEntry {
  noteNumber: number;
  velocity: number;
  timestamp: number;
}

export class NoteStack {
  private stack: Map<string, NoteEntry> = new Map();

  private key(channel: number, noteNumber: number): string {
    return `${channel}:${noteNumber}`;
  }

  push(channel: number, noteNumber: number, velocity: number, timestamp: number): void {
    const key = this.key(channel, noteNumber);
    this.stack.set(key, { noteNumber, velocity, timestamp });
  }

  pop(channel: number, noteNumber: number): NoteEntry | null {
    const key = this.key(channel, noteNumber);
    const entry = this.stack.get(key);
    if (entry) {
      this.stack.delete(key);
      return entry;
    }
    return null;
  }

  clear(): void {
    this.stack.clear();
  }

  has(channel: number, noteNumber: number): boolean {
    return this.stack.has(this.key(channel, noteNumber));
  }
}

