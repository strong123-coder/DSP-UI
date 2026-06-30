import React, { useEffect, useRef, useState } from "react";
import { Gavel, Ban, Trophy, MousePointerClick } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSuperAdminEngineCounts } from "@/query/useSuperAdmin";
import { cn } from "@/lib/utils";

/**
 * useLiveCount — a CONTINUOUSLY ticking counter.
 *
 * The backend is polled every few seconds, but instead of jumping on each poll
 * we estimate the per-millisecond rate from the delta between the last two polls
 * and extrapolate it every animation frame, so the number keeps climbing
 * smoothly between polls (odometer feel). On each new poll we re-baseline to the
 * real value so the display never drifts far from truth.
 *
 * Robustness:
 *  - Seeds (snaps, no run-up) on the first real value, so the initial 0 → 5.6M
 *    load isn't mistaken for a "rate".
 *  - Forward-only for normal ticks (never counts backward); snaps DOWN only on a
 *    real decrease (e.g. a "today" counter resetting at UTC midnight).
 *  - If a poll is much later than expected (tab was hidden), it re-seeds instead
 *    of computing an absurd rate; extrapolation is also capped to ~2 intervals.
 */
function useLiveCount(actual: number, intervalMs: number): number {
  const [display, setDisplay] = useState(0);

  const seeded = useRef(false);
  const baseValue = useRef(0);
  const baseTs = useRef(0);
  const rate = useRef(0); // units per ms
  const prevActual = useRef(0);
  const prevTs = useRef(0);
  const displayRef = useRef(0);
  const raf = useRef<number | null>(null);

  // Recompute baseline + rate whenever a fresh polled value arrives.
  useEffect(() => {
    const now = performance.now();

    // Wait for the first real (>0) value, then snap to it with no rate.
    if (!seeded.current) {
      if (actual > 0) {
        seeded.current = true;
        baseValue.current = actual;
        displayRef.current = actual;
        prevActual.current = actual;
        prevTs.current = now;
        baseTs.current = now;
        setDisplay(actual);
      }
      return;
    }

    const elapsedReal = now - prevTs.current;
    const delta = actual - prevActual.current;

    if (delta < 0 || elapsedReal > intervalMs * 3) {
      // Counter reset (midnight) or a long gap (tab was hidden) → re-seed, no rate.
      rate.current = 0;
      baseValue.current = actual;
    } else {
      // Per-ms rate from the real time between polls; extrapolate forward.
      rate.current = elapsedReal > 0 ? delta / elapsedReal : 0;
      baseValue.current = Math.max(displayRef.current, actual);
    }
    baseTs.current = now;
    prevActual.current = actual;
    prevTs.current = now;
  }, [actual, intervalMs]);

  // Animation loop — throttled to ~30fps; only re-render when the integer changes.
  useEffect(() => {
    let lastPaint = 0;
    const loop = (ts: number) => {
      raf.current = requestAnimationFrame(loop);
      if (ts - lastPaint < 33) return;
      lastPaint = ts;

      const elapsed = Math.min(performance.now() - baseTs.current, intervalMs * 2);
      const next = baseValue.current + rate.current * elapsed;
      if (Math.floor(next) !== Math.floor(displayRef.current)) {
        displayRef.current = next;
        setDisplay(next);
      }
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [intervalMs]);

  return display;
}

const fmtInt = (n: number) => Math.floor(n || 0).toLocaleString("en-US");

interface CounterMap {
  bid?: number;
  nobid?: number;
  win?: number;
  bill?: number;
  click?: number;
  loss?: number;
  [k: string]: number | undefined;
}

const TILES: Array<{
  key: keyof CounterMap;
  label: string;
  icon: React.ReactNode;
  accent: string;
}> = [
  { key: "nobid", label: "No-Bids", icon: <Ban className="w-4 h-4" />, accent: "text-slate-500 bg-slate-500/10" },
  { key: "bid", label: "Bids", icon: <Gavel className="w-4 h-4" />, accent: "text-blue-600 bg-blue-500/10" },
  { key: "win", label: "Wins", icon: <Trophy className="w-4 h-4" />, accent: "text-emerald-600 bg-emerald-500/10" },
  { key: "click", label: "Clicks", icon: <MousePointerClick className="w-4 h-4" />, accent: "text-amber-600 bg-amber-500/10" },
];

const CounterTile: React.FC<{
  label: string;
  icon: React.ReactNode;
  accent: string;
  total: number;
  today: number;
  intervalMs: number;
}> = ({ label, icon, accent, total, today, intervalMs }) => {
  const liveTotal = useLiveCount(total, intervalMs);
  const liveToday = useLiveCount(today, intervalMs);
  return (
    <Card className="p-4 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className={cn("p-1.5 rounded-lg", accent)}>{icon}</span>
      </div>
      <div className="text-xl font-bold tabular-nums leading-none truncate" title={fmtInt(liveTotal)}>
        {fmtInt(liveTotal)}
      </div>
      <div className="text-[11px] text-muted-foreground tabular-nums">
        Today: <span className="font-semibold text-foreground/80">{fmtInt(liveToday)}</span>
      </div>
    </Card>
  );
};

export const LiveCounters: React.FC<{ intervalMs?: number }> = ({ intervalMs = 5000 }) => {
  const { data, isError, dataUpdatedAt } = useSuperAdminEngineCounts(intervalMs);

  // execute() wraps as { status, data: { total, today, unavailable } }; apiClient
  // returns response.data, so counts live at data?.data.
  const payload = data?.data;
  const total: CounterMap = payload?.total || {};
  const today: CounterMap = payload?.today || {};
  const unavailable = isError || payload?.unavailable;

  // "x seconds ago" since the last successful fetch.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const secondsAgo = dataUpdatedAt ? Math.max(0, Math.round((Date.now() - dataUpdatedAt) / 1000)) : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {!unavailable && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            )}
            <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", unavailable ? "bg-rose-500" : "bg-emerald-500")} />
          </span>
          <h2 className="text-base font-bold">Live Engine Activity</h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {unavailable
            ? "Engine unreachable — retrying…"
            : secondsAgo === null
              ? "Connecting…"
              : `Synced ${secondsAgo}s ago · live`}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TILES.map((t) => (
          <CounterTile
            key={t.key as string}
            label={t.label}
            icon={t.icon}
            accent={t.accent}
            total={Number(total[t.key] || 0)}
            today={Number(today[t.key] || 0)}
            intervalMs={intervalMs}
          />
        ))}
      </div>
    </div>
  );
};

export default LiveCounters;
