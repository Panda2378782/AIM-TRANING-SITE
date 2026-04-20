import { useState } from "react";
import AimTrainer from "./components/AimTrainer";
import Menu from "./components/Menu";
import type { GameMode } from "./types";

export default function App() {
  const [mode, setMode] = useState<GameMode | null>(null);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#1a1033_0%,_#08070f_60%)] text-zinc-100">
      <header className="border-b border-white/5 bg-black/30 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-rose-500/40 blur-md" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-red-700 shadow-lg shadow-rose-900/50">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.2}>
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                PANDA<span className="text-rose-500">TRAINER</span>
              </h1>
              <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">Legitimate Aim Practice</p>
            </div>
          </div>
          {mode && (
            <button
              onClick={() => setMode(null)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-zinc-300 transition hover:border-rose-500/50 hover:text-white"
            >
              ← Menu
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {!mode ? <Menu onStart={setMode} /> : <AimTrainer mode={mode} onExit={() => setMode(null)} />}
      </main>

      <footer className="mx-auto mt-8 max-w-6xl px-6 pb-8 text-center text-xs text-zinc-500">
        Train your real skill — no cheats, no bans. Built for keyboard + mouse.
      </footer>
    </div>
  );
}
