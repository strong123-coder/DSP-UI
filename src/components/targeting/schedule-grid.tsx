import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { DAYS } from "@/utils/data/targetingData";

// Hour-of-week grid: slot = day * 24 + hour, Monday 00:00 = 0. Click a cell,
// drag a rectangle (days × hours) from it, or click a day / hour label to
// toggle the whole row / column. No slots selected means "every hour".
const ScheduleGrid: React.FC<{ value: number[]; onChange: (slots: number[]) => void }> = ({ value, onChange }) => {
  const selected = new Set(value);
  const latest = useRef(selected);
  latest.current = selected;
  // While dragging: the cell the drag started on, whether it selects or
  // clears, and the selection before the drag (each move redraws from it).
  const drag = useRef<{ anchor: number; on: boolean; base: Set<number> } | null>(null);

  useEffect(() => {
    const stop = () => (drag.current = null);
    window.addEventListener("pointerup", stop);
    return () => window.removeEventListener("pointerup", stop);
  }, []);

  const commit = (s: Set<number>) => onChange([...s].sort((a, b) => a - b));
  const paintRect = (to: number) => {
    const d = drag.current;
    if (!d) return;
    const s = new Set(d.base);
    const [d0, d1] = [Math.floor(d.anchor / 24), Math.floor(to / 24)].sort((a, b) => a - b);
    const [h0, h1] = [d.anchor % 24, to % 24].sort((a, b) => a - b);
    for (let day = d0; day <= d1; day++) {
      for (let h = h0; h <= h1; h++) {
        if (d.on) s.add(day * 24 + h);
        else s.delete(day * 24 + h);
      }
    }
    commit(s);
  };
  const setSlots = (slots: number[], on: boolean) => {
    const s = new Set(latest.current);
    slots.forEach((x) => (on ? s.add(x) : s.delete(x)));
    commit(s);
  };
  const toggleGroup = (slots: number[]) => setSlots(slots, !slots.every((x) => selected.has(x)));

  const range = (from: number, to: number) => Array.from({ length: to - from }, (_, i) => from + i);
  const dayCells = (d: number) => range(d * 24, d * 24 + 24);
  const hourCells = (h: number) => range(0, 7).map((d) => d * 24 + h);
  const weekdaysWorkHours = range(0, 5).flatMap((d) => range(d * 24 + 9, d * 24 + 18));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <Button type="button" size="sm" variant="outline" onClick={() => onChange([])}>Every hour</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onChange(weekdaysWorkHours)}>Weekdays 09–18</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onChange(range(0, 168).filter((s) => s % 24 >= 7 && s % 24 < 23))}>
          Every day 07–23
        </Button>
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">
          {value.length === 0 ? "Runs every hour" : `${value.length} of 168 hours a week`}
        </span>
      </div>

      <div className="overflow-x-auto">
        <div
          className="grid gap-[2px] min-w-[520px] select-none touch-none"
          style={{ gridTemplateColumns: "44px repeat(24, minmax(16px, 1fr))" }}
          role="grid"
          aria-label="Hours of the week"
        >
          <div />
          {range(0, 24).map((h) => (
            <button key={`h${h}`} type="button" onClick={() => toggleGroup(hourCells(h))}
              className="text-[10px] text-muted-foreground tabular-nums hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary rounded"
              aria-label={`Toggle ${String(h).padStart(2, "0")}:00 on every day`}>
              {h % 3 === 0 ? String(h).padStart(2, "0") : ""}
            </button>
          ))}
          {DAYS.map((day, d) => (
            <React.Fragment key={day}>
              <button type="button" onClick={() => toggleGroup(dayCells(d))}
                className="text-xs text-muted-foreground text-left hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary rounded"
                aria-label={`Toggle all of ${day}`}>
                {day}
              </button>
              {dayCells(d).map((slot) => {
                const on = selected.has(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    role="gridcell"
                    aria-pressed={on}
                    aria-label={`${day} ${String(slot % 24).padStart(2, "0")}:00`}
                    className={`h-5 rounded-[3px] transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                      on ? "bg-primary hover:bg-primary/85" : "bg-muted hover:bg-muted-foreground/20"
                    }`}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      drag.current = { anchor: slot, on: !on, base: new Set(latest.current) };
                      paintRect(slot);
                    }}
                    onPointerEnter={() => paintRect(slot)}
                    onClick={(e) => {
                      if (e.detail === 0) setSlots([slot], !on); // keyboard (Enter / Space)
                    }}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleGrid;
