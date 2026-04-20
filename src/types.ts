export type GameMode = "flick" | "tracking" | "precision" | "reaction";

export interface ModeConfig {
  id: GameMode;
  name: string;
  tagline: string;
  description: string;
  duration: number; // seconds
  targetSize: number; // px
  spawnInterval?: number; // ms (for reaction)
  maxTargets?: number;
  color: string;
}

export interface Score {
  hits: number;
  misses: number;
  accuracy: number;
  reactionMs: number;
  score: number;
}
