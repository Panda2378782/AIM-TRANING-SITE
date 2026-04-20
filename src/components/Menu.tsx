import { MODES } from "../modes";
import type { GameMode } from "../types";

interface Props {
  onStart: (mode: GameMode) => void;
}

export default function Menu({ onStart }: Props) {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-rose-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
          Skill Trainer • Browser Based
        </div>
        <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
          Train your aim. <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">Beat your last score.</span>
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          A free, fair-play aim trainer for FPS players (Blood Strike, CS, Valorant, Apex, etc.).
          Choose a drill, click targets as fast and accurately as you can, and review your hit-rate, average reaction time, and score.
        </p>
        <div className="mt-5 flex flex-wrap gap-4 text-xs text-zinc-400">
          <Stat label="Drills" value="4" />
          <Stat label="Avg session" value="30s" />
          <Stat label="Cost" value="Free" />
          <Stat label="Cheats" value="None — ever" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Object.values(MODES).map((m) => (
          <button
            key={m.id}
            onClick={() => onStart(m.id)}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-6 text-left transition hover:border-white/30 hover:bg-white/[0.06]"
          >
            <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${m.color} opacity-20 blur-2xl transition group-hover:opacity-40`} />
            <div className="relative">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-bold">{m.name}</h3>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{m.duration}s</span>
              </div>
              <p className="mt-1 text-sm font-medium text-zinc-300">{m.tagline}</p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">{m.description}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-rose-400 transition group-hover:gap-2">
                Start drill <span>→</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-relaxed text-amber-200/80">
        <strong className="text-amber-300">Why not an aimbot?</strong> Aimbots get your account permanently banned, are usually bundled with credential-stealing malware, and ruin matches for real people. Building real mechanical skill takes 10–15 minutes a day — start with Flick Shots and track your accuracy.
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-mono text-base font-bold text-white">{value}</span>
      <span className="uppercase tracking-wider">{label}</span>
    </div>
  );
}
