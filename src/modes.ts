import type { ModeConfig } from "./types";

export const MODES: Record<string, ModeConfig> = {
  flick: {
    id: "flick",
    name: "Flick Shots",
    tagline: "One target. Snap to it.",
    description: "A single target spawns at a random location. Click it as fast and accurately as possible.",
    duration: 30,
    targetSize: 56,
    color: "from-rose-500 to-red-700",
  },
  tracking: {
    id: "tracking",
    name: "Tracking",
    tagline: "Follow the moving target.",
    description: "Hold left-click on a moving target. Score builds while your crosshair stays on it.",
    duration: 25,
    targetSize: 70,
    color: "from-amber-400 to-orange-600",
  },
  precision: {
    id: "precision",
    name: "Micro Precision",
    tagline: "Tiny targets, surgical clicks.",
    description: "Smaller targets test crosshair placement and fine motor control.",
    duration: 30,
    targetSize: 28,
    color: "from-emerald-400 to-teal-600",
  },
  reaction: {
    id: "reaction",
    name: "Reaction Rush",
    tagline: "Targets spawn fast. So should you.",
    description: "Multiple targets appear and disappear quickly. Hit as many as you can.",
    duration: 30,
    targetSize: 50,
    spawnInterval: 700,
    maxTargets: 4,
    color: "from-fuchsia-500 to-purple-700",
  },
};
