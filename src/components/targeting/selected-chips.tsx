import React from "react";
import { Ban, CheckCircle2 } from "lucide-react";

// Chips listing what a rule includes / excludes (the right-hand "selected" panel).
const SelectedChips: React.FC<{
  include?: Array<string | number>;
  exclude?: Array<string | number>;
  empty: string;
  label?: (v: string) => string;
  onRemove?: (v: string, side: "include" | "exclude") => void;
  max?: number;
}> = ({ include = [], exclude = [], empty, label = (v) => v, onRemove, max = 60 }) => {
  const chip = (v: string, side: "include" | "exclude") => (
    <span
      key={`${side}-${v}`}
      className={`inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 border max-w-full ${
        side === "include"
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
      }`}
    >
      {side === "include" ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <Ban className="w-3 h-3 shrink-0" />}
      <span className="truncate">{label(v)}</span>
      {onRemove && (
        <button type="button" aria-label={`Remove ${label(v)}`} className="hover:text-foreground"
          onClick={() => onRemove(v, side)}>
          &times;
        </button>
      )}
    </span>
  );
  const inc = include.map(String);
  const exc = exclude.map(String);
  const hidden = Math.max(0, inc.length + exc.length - max);
  return (
    <div className="rounded-lg bg-muted/40 border border-border/60 p-3 min-h-[44px] flex flex-wrap gap-1.5 items-center">
      {inc.length === 0 && exc.length === 0 && <span className="text-xs text-muted-foreground">{empty}</span>}
      {inc.slice(0, max).map((v) => chip(v, "include"))}
      {exc.slice(0, Math.max(0, max - inc.length)).map((v) => chip(v, "exclude"))}
      {hidden > 0 && <span className="text-xs text-muted-foreground">+{hidden} more</span>}
    </div>
  );
};

export default SelectedChips;
