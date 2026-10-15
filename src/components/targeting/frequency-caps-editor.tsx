import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SelectComponent from "@/components/inputComponents/select-component";
import { FrequencyUnitData } from "@/utils/data/targetingData";

// Numbers stay strings while editing (like the other numeric form fields).
export interface FrequencyCapRow {
  count: string;
  every: string;
  unit: "hour" | "day" | "week";
}

export const MAX_FREQUENCY_CAPS = 5;

export const toFrequencyCaps = (rows: FrequencyCapRow[] = []) =>
  rows.map((r) => ({ count: Number(r.count), every: Number(r.every), unit: r.unit }));

export const fromFrequencyCaps = (caps?: Array<{ count: number; every: number; unit: string }> | null): FrequencyCapRow[] =>
  (caps || []).map((c) => ({ count: String(c.count), every: String(c.every), unit: c.unit as FrequencyCapRow["unit"] }));

// "At most <count> ads every <every> <unit> per user", one row per cap.
const FrequencyCapsEditor: React.FC<{
  id: string;
  value: FrequencyCapRow[];
  onChange: (rows: FrequencyCapRow[]) => void;
  errors?: Array<{ count?: { message?: string }; every?: { message?: string } } | undefined>;
}> = ({ id, value, onChange, errors = [] }) => {
  const set = (i: number, patch: Partial<FrequencyCapRow>) =>
    onChange(value.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const noSign = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["-", "e", "E", "+", "."].includes(e.key)) e.preventDefault();
  };
  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <div className="text-center py-4 text-muted-foreground border border-dashed border-border rounded-xl text-xs">
          No frequency cap: a user can see these ads any number of times.
        </div>
      )}
      {value.map((r, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">At most</span>
          <Input id={`${id}-${i}-count`} type="number" min="1" step="1" className="w-20" aria-label="Impressions"
            value={r.count} onKeyDown={noSign} onChange={(e) => set(i, { count: e.target.value })}
            aria-invalid={!!errors[i]?.count} errorTooltip={errors[i]?.count?.message} />
          <span className="text-muted-foreground">ads every</span>
          <Input id={`${id}-${i}-every`} type="number" min="1" step="1" className="w-20" aria-label="Window length"
            value={r.every} onKeyDown={noSign} onChange={(e) => set(i, { every: e.target.value })}
            aria-invalid={!!errors[i]?.every} errorTooltip={errors[i]?.every?.message} />
          <div className="w-32">
            <SelectComponent id={`${id}-${i}-unit`} value={r.unit} onValueChange={(v) => set(i, { unit: v as FrequencyCapRow["unit"] })}
              data={FrequencyUnitData} />
          </div>
          <span className="text-muted-foreground">per user</span>
          <Button type="button" variant="ghost" size="icon" aria-label="Remove cap" className="text-destructive hover:bg-destructive/10"
            onClick={() => onChange(value.filter((_, j) => j !== i))}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      {value.length < MAX_FREQUENCY_CAPS && (
        <Button type="button" size="sm" variant="outline" className="gap-1"
          onClick={() => onChange([...value, { count: "3", every: "1", unit: "day" }])}>
          <Plus className="w-3.5 h-3.5" /> Add frequency cap
        </Button>
      )}
    </div>
  );
};

export default FrequencyCapsEditor;
