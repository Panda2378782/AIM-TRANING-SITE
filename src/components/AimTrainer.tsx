import { useCallback, useEffect, useRef, useState } from "react";
import { MODES } from "../modes";
import type { GameMode } from "../types";

interface Props {
  mode: GameMode;
  onExit: () => void;
}

interface Target {
  id: number;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  spawnedAt: number;
}

type Phase = "ready" | "playing" | "done";

export default function AimTrainer({ mode, onExit }: Props) {
  const config = MODES[mode];
  const arenaRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>("ready");
  const [targets, setTargets] = useState<Target[]>([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [reactionSum, setReactionSum] = useState(0);
  const [trackingScore, setTrackingScore] = useState(0); // for tracking mode
  const [timeLeft, setTimeLeft] = useState(config.duration);
  const [crosshair, setCrosshair] = useState({ x: 0, y: 0, visible: false });
  const mouseDownRef = useRef(false);
  const onTargetRef = useRef(false);
  const idCounter = useRef(0);

  // === Helpers ===
  const arenaSize = () => {
    const el = arenaRef.current;
    if (!el) return { w: 800, h: 500 };
    return { w: el.clientWidth, h: el.clientHeight };
  };

  const spawnTarget = useCallback((): Target => {
    const { w, h } = arenaSize();
    const pad = config.targetSize;
    const id = ++idCounter.current;
    const t: Target = {
      id,
      x: pad + Math.random() * Math.max(1, w - pad * 2),
      y: pad + Math.random() * Math.max(1, h - pad * 2),
      spawnedAt: performance.now(),
    };
    if (mode === "tracking") {
      const angle = Math.random() * Math.PI * 2;
      const speed = 180; // px / sec
      t.vx = Math.cos(angle) * speed;
      t.vy = Math.sin(angle) * speed;
    }
    return t;
  }, [config.targetSize, mode]);

  // === Start / Reset ===
  const start = () => {
    setHits(0);
    setMisses(0);
    setReactionSum(0);
    setTrackingScore(0);
    setTimeLeft(config.duration);
    idCounter.current = 0;
    if (mode === "reaction") {
      setTargets([spawnTarget()]);
    } else {
      setTargets([spawnTarget()]);
    }
    setPhase("playing");
  };

  // === Countdown timer ===
  useEffect(() => {
    if (phase !== "playing") return;
    const start = performance.now();
    const total = config.duration * 1000;
    const id = setInterval(() => {
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, total - elapsed);
      setTimeLeft(remaining / 1000);
      if (remaining <= 0) {
        setPhase("done");
        setTargets([]);
        clearInterval(id);
      }
    }, 50);
    return () => clearInterval(id);
  }, [phase, config.duration]);

  // === Reaction-mode spawner ===
  useEffect(() => {
    if (phase !== "playing" || mode !== "reaction") return;
    const interval = setInterval(() => {
      setTargets((prev) => {
        if (prev.length >= (config.maxTargets ?? 3)) return prev;
        return [...prev, spawnTarget()];
      });
    }, config.spawnInterval ?? 800);
    return () => clearInterval(interval);
  }, [phase, mode, config.maxTargets, config.spawnInterval, spawnTarget]);

  // === Reaction-mode auto-despawn (missed if not clicked in time) ===
  useEffect(() => {
    if (phase !== "playing" || mode !== "reaction") return;
    const id = setInterval(() => {
      const now = performance.now();
      setTargets((prev) => {
        const expired = prev.filter((t) => now - t.spawnedAt > 1400);
        if (expired.length) setMisses((m) => m + expired.length);
        return prev.filter((t) => now - t.spawnedAt <= 1400);
      });
    }, 100);
    return () => clearInterval(id);
  }, [phase, mode]);

  // === Tracking mode: move target + accumulate score while held on target ===
  useEffect(() => {
    if (phase !== "playing" || mode !== "tracking") return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const { w, h } = arenaSize();
      const r = config.targetSize / 2;
      setTargets((prev) =>
        prev.map((t) => {
          let { x, y, vx = 0, vy = 0 } = t;
          x += vx * dt;
          y += vy * dt;
          if (x < r) { x = r; vx = -vx; }
          if (x > w - r) { x = w - r; vx = -vx; }
          if (y < r) { y = r; vy = -vy; }
          if (y > h - r) { y = h - r; vy = -vy; }
          return { ...t, x, y, vx, vy };
        }),
      );
      if (mouseDownRef.current && onTargetRef.current) {
        setTrackingScore((s) => s + dt * 100);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, mode, config.targetSize]);

  // === Click handlers ===
  const handleArenaClick = (e: React.MouseEvent) => {
    if (phase !== "playing" || mode === "tracking") return;
    // If we reached here, the click missed targets (target onClick stops propagation).
    setMisses((m) => m + 1);
    spawnRipple(e, false);
  };

  const handleTargetClick = (e: React.MouseEvent, t: Target) => {
    e.stopPropagation();
    if (phase !== "playing") return;
    const reaction = performance.now() - t.spawnedAt;
    setHits((h) => h + 1);
    setReactionSum((r) => r + reaction);
    spawnRipple(e, true);
    if (mode === "reaction") {
      setTargets((prev) => prev.filter((x) => x.id !== t.id));
    } else {
      setTargets([spawnTarget()]);
    }
  };

  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; hit: boolean }[]>([]);
  const rippleId = useRef(0);
  const spawnRipple = (e: React.MouseEvent, hit: boolean) => {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const id = ++rippleId.current;
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top, hit }]);
    setTimeout(() => setRipples((p) => p.filter((r) => r.id !== id)), 500);
  };

  // === Mouse tracking for crosshair + tracking mode hit-test ===
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCrosshair({ x, y, visible: true });

    if (mode === "tracking" && targets[0]) {
      const t = targets[0];
      const dx = x - t.x;
      const dy = y - t.y;
      onTargetRef.current = Math.sqrt(dx * dx + dy * dy) <= config.targetSize / 2;
    }
  };

  // === Stats ===
  const total = hits + misses;
  const accuracy = total === 0 ? 0 : (hits / total) * 100;
  const avgReaction = hits === 0 ? 0 : reactionSum / hits;
  const score =
    mode === "tracking"
      ? Math.round(trackingScore)
      : Math.round(hits * 100 - misses * 25 + (avgReaction > 0 ? Math.max(0, 500 - avgReaction) * hits * 0.1 : 0));

  return (
    <div className="space-y-4">
      {/* HUD */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Hud label="Mode" value={config.name} mono={false} />
        <Hud label="Time" value={timeLeft.toFixed(1) + "s"} accent={timeLeft < 5 ? "rose" : undefined} />
        <Hud label="Hits" value={String(hits)} />
        <Hud label="Accuracy" value={accuracy.toFixed(0) + "%"} />
        <Hud label={mode === "tracking" ? "Score" : "Avg RT"} value={mode === "tracking" ? String(score) : avgReaction.toFixed(0) + "ms"} />
      </div>

      {/* Arena */}
      <div
        ref={arenaRef}
        onClick={handleArenaClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setCrosshair((c) => ({ ...c, visible: false }))}
        onMouseDown={() => (mouseDownRef.current = true)}
        onMouseUp={() => (mouseDownRef.current = false)}
        className="relative h-[60vh] min-h-[420px] w-full overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(circle_at_50%_40%,_#1f1730_0%,_#0a0815_100%)] shadow-inner"
        style={{ cursor: phase === "playing" ? "none" : "default" }}
      >
        {/* Grid backdrop */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Targets */}
        {phase === "playing" &&
          targets.map((t) => (
            <button
              key={t.id}
              onMouseDown={(e) => handleTargetClick(e, t)}
              className="absolute rounded-full focus:outline-none"
              style={{
                left: t.x - config.targetSize / 2,
                top: t.y - config.targetSize / 2,
                width: config.targetSize,
                height: config.targetSize,
                cursor: "none",
                background: `radial-gradient(circle at 35% 30%, #fff 0%, #fda4af 18%, #e11d48 55%, #7f1d1d 100%)`,
                boxShadow: "0 0 0 2px rgba(255,255,255,0.15), 0 0 20px rgba(244,63,94,0.6)",
              }}
            >
              <span
                className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90"
                style={{ width: config.targetSize * 0.18, height: config.targetSize * 0.18 }}
              />
            </button>
          ))}

        {/* Click ripples */}
        {ripples.map((r) => (
          <span
            key={r.id}
            className={`pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full ${r.hit ? "bg-emerald-400/60" : "bg-rose-500/60"
              } animate-ping`}
            style={{ left: r.x, top: r.y }}
          />
        ))}

        {/* Crosshair */}
        {crosshair.visible && phase === "playing" && (
          <div
            className="pointer-events-none absolute"
            style={{ left: crosshair.x, top: crosshair.y, transform: "translate(-50%, -50%)" }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="2" fill="#fb7185" />
              <line x1="14" y1="0" x2="14" y2="9" stroke="#fb7185" strokeWidth="2" />
              <line x1="14" y1="19" x2="14" y2="28" stroke="#fb7185" strokeWidth="2" />
              <line x1="0" y1="14" x2="9" y2="14" stroke="#fb7185" strokeWidth="2" />
              <line x1="19" y1="14" x2="28" y2="14" stroke="#fb7185" strokeWidth="2" />
            </svg>
          </div>
        )}

        {/* Ready overlay */}
        {phase === "ready" && (
          <Overlay>
            <h3 className="text-3xl font-black">{config.name}</h3>
            <p className="mt-1 text-sm text-zinc-400">{config.description}</p>
            <button onClick={start} className="mt-6 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 px-8 py-3 text-sm font-bold uppercase tracking-wider shadow-lg shadow-rose-900/50 transition hover:scale-105">
              Start ({config.duration}s)
            </button>
            <p className="mt-3 text-[11px] text-zinc-500">{mode === "tracking" ? "Hold left-click and follow the target" : "Click targets as fast as you can"}</p>
          </Overlay>
        )}

        {/* Done overlay */}
        {phase === "done" && (
          <Overlay>
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">Drill Complete</h3>
            <div className="mt-2 text-6xl font-black bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">{score}</div>
            <div className="mt-4 grid grid-cols-3 gap-6 text-center text-sm">
              <ResultStat label="Hits" value={String(hits)} />
              <ResultStat label="Accuracy" value={accuracy.toFixed(1) + "%"} />
              <ResultStat label="Avg RT" value={avgReaction.toFixed(0) + "ms"} />
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={start} className="rounded-lg bg-gradient-to-r from-rose-500 to-red-600 px-6 py-2.5 text-sm font-bold uppercase tracking-wider shadow-lg shadow-rose-900/50 transition hover:scale-105">
                Retry
              </button>
              <button onClick={onExit} className="rounded-lg border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-zinc-300 transition hover:border-white/30 hover:text-white">
                Change drill
              </button>
            </div>
          </Overlay>
        )}
      </div>
    </div>
  );
}

function Hud({ label, value, accent }: { label: string; value: string; mono?: boolean; accent?: "rose" }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`mt-0.5 font-mono text-lg font-bold ${accent === "rose" ? "text-rose-400" : "text-white"}`}>{value}</div>
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 px-6 text-center backdrop-blur-sm">
      {children}
    </div>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-2xl font-bold text-white">{value}</div>
      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
    </div>
  );
}
