export interface Note {
  note: string;
  frequency: number;
  color: string;
  position: { x: number; y: number }
}

export const notes: Note[] = [
  { note: 'A2', frequency: 220, color: 'from-cyan-400 to-blue-600', position: { x: 0, y: -120 } },
  { note: 'C3', frequency: 261.63, color: 'from-blue-400 to-indigo-600', position: { x: 100, y: -60 } },
  { note: 'D3', frequency: 293.66, color: 'from-indigo-400 to-violet-600', position: { x: 100, y: 60 } },
  { note: 'E3', frequency: 329.63, color: 'from-violet-400 to-purple-600', position: { x: 0, y: 120 } },
  { note: 'G3', frequency: 392.00, color: 'from-purple-400 to-fuchsia-600', position: { x: -100, y: 60 } },
  { note: 'A3', frequency: 440.00, color: 'from-fuchsia-400 to-blue-600', position: { x: -100, y: -60 } }
];
