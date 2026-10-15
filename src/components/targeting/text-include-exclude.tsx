import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SelectedChips from "./selected-chips";
import ValuesInput from "./values-input";

export interface TextIncludeExcludeValue {
  include: string[];
  exclude: string[];
}

// Include / exclude for free-text values with no fixed list (bundles, device
// makes, ZIPs, deal ids). Type or paste entries, pick which side they go to;
// the selected items show on the right.
const TextIncludeExclude: React.FC<{
  id: string;
  value: TextIncludeExcludeValue;
  onChange: (v: TextIncludeExcludeValue) => void;
  placeholder: string;
  empty: string;
  normalize?: (v: string) => string;
  label?: (v: string) => string;
}> = ({ id, value, onChange, placeholder, empty, normalize = (v) => v.toLowerCase(), label }) => {
  const [side, setSide] = useState<"include" | "exclude">("include");
  const add = (vals: string[]) => {
    const merged = (xs: string[]) => [...new Set([...xs, ...vals])];
    const without = (xs: string[]) => xs.filter((v) => !vals.includes(v));
    onChange(
      side === "include"
        ? { include: merged(value.include), exclude: without(value.exclude) }
        : { include: without(value.include), exclude: merged(value.exclude) },
    );
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={`${id}-input`}>Add as</Label>
          <div className="inline-flex rounded-md border border-border p-0.5 text-xs" role="radiogroup" aria-label="Add as">
            {(["include", "exclude"] as const).map((s) => (
              <button key={s} type="button" role="radio" aria-checked={side === s} onClick={() => setSide(s)}
                className={`px-2.5 py-1 rounded capitalize focus-visible:outline-2 focus-visible:outline-primary ${
                  side === s ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <ValuesInput id={`${id}-input`} placeholder={placeholder} normalize={normalize} onAdd={add} />
        <p className="text-[11px] text-muted-foreground tabular-nums">
          {value.include.length} included · {value.exclude.length} excluded
        </p>
      </div>
      <div className="space-y-2 min-w-0">
        <Label>Selected</Label>
        <SelectedChips include={value.include} exclude={value.exclude} empty={empty} label={label}
          onRemove={(v, s) => onChange({ ...value, [s]: value[s].filter((x) => x !== v) })} />
        {(value.include.length > 0 || value.exclude.length > 0) && (
          <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs"
            onClick={() => onChange({ include: [], exclude: [] })}>
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
};

export default TextIncludeExclude;
