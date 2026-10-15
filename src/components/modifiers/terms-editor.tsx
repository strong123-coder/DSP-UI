import React from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SelectComponent from "@/components/inputComponents/select-component";
import MultiSelectComponent from "@/components/inputComponents/multi-select-component";
import type { ModifierField } from "@/services/bidModifier";

// Ordered "if … then <value>" terms shared by bid modifiers (value = bid
// multiplier) and delivery modifiers (value = % of matching requests).

// Fields with a fixed set of values get a picker instead of free text.
const pad = (n: number) => String(n).padStart(2, "0");
export const FIXED_VALUES: Record<string, Array<{ name: string; value: string }>> = {
  weekday: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => ({ name: d[0].toUpperCase() + d.slice(1), value: d })),
  hour: Array.from({ length: 24 }, (_, h) => ({ name: `${pad(h)}:00–${pad(h + 1 === 24 ? 0 : h + 1)}:00`, value: String(h) })),
  environment: [{ name: "In-app", value: "app" }, { name: "Web", value: "web" }],
  os: [{ name: "Android", value: "android" }, { name: "iOS", value: "ios" }],
  device_type: [
    ["Mobile / tablet", 1], ["Personal computer", 2], ["Connected TV", 3], ["Phone", 4], ["Tablet", 5], ["Connected device", 6], ["Set-top box", 7],
  ].map(([name, v]) => ({ name: String(name), value: String(v) })),
  connection_type: [
    ["Unknown", 0], ["Ethernet", 1], ["Wi-Fi", 2], ["Cellular (unknown)", 3], ["2G", 4], ["3G", 5], ["4G", 6], ["5G", 7],
  ].map(([name, v]) => ({ name: String(name), value: String(v) })),
};

// Free-text values: one per comma or line (values like city names keep spaces).
const parseValues = (text: string) => [...new Set(text.split(/[,\n]+/).map((v) => v.trim()).filter(Boolean))];

export interface CondRow {
  field: string;
  values: string[]; // fixed fields
  text: string; // free-text fields
}
export interface TermRow {
  conditions: CondRow[];
  value: string; // multiplier or share, as typed
}

const emptyCond = (): CondRow => ({ field: "bundle", values: [], text: "" });

type ApiTerm = { conditions: Array<{ field: string; values: string[] }> } & Record<string, any>;

// Saved terms → editor rows; valueKey is "multiplier" or "share".
export const fromApiTerms = (terms: ApiTerm[] = [], valueKey: string): TermRow[] =>
  terms.map((t) => ({
    value: String(t[valueKey]),
    conditions: t.conditions.map((c) =>
      FIXED_VALUES[c.field] ? { field: c.field, values: c.values, text: "" } : { field: c.field, values: [], text: c.values.join(", ") },
    ),
  }));

// Editor rows → API terms.
export const toApiTerms = <K extends string>(terms: TermRow[], valueKey: K) =>
  terms.map(
    (t) =>
      ({
        [valueKey]: Number(t.value),
        conditions: t.conditions.map((c) => ({ field: c.field, values: FIXED_VALUES[c.field] ? c.values : parseValues(c.text) })),
      }) as { conditions: Array<{ field: string; values: string[] }> } & Record<K, number>,
  );

// The first problem with the terms, or null.
export const termsError = (terms: TermRow[], fields: ModifierField[], value: { min: number; max: number; name: string }) => {
  for (const [i, t] of terms.entries()) {
    const n = Number(t.value);
    if (t.value === "" || isNaN(n) || n < value.min || n > value.max) {
      return `Term ${i + 1}: ${value.name} must be between ${value.min} and ${value.max}`;
    }
    if (!t.conditions.length) return `Term ${i + 1}: add at least one condition`;
    for (const c of t.conditions) {
      const vals = FIXED_VALUES[c.field] ? c.values : parseValues(c.text);
      if (!vals.length) return `Term ${i + 1}: give "${fields.find((f) => f.value === c.field)?.name || c.field}" a value`;
    }
  }
  return null;
};

const TermsEditor: React.FC<{
  terms: TermRow[];
  onChange: (terms: TermRow[]) => void;
  fields: ModifierField[];
  description: string;
  empty: string;
  value: {
    label: string; // "Then multiply the bid by"
    min: number;
    max: number;
    step: string;
    suffix?: string; // "%"
    initial: string; // value for a new term
    preview: (n: number) => { text: string; tone?: "bad" | "good" };
  };
}> = ({ terms, onChange, fields, description, empty, value }) => {
  const setTerm = (i: number, t: TermRow) => onChange(terms.map((x, j) => (j === i ? t : x)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...terms];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const fieldData = fields.map((f) => ({ name: f.name, value: f.value }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-3">
        <div>
          <CardTitle className="text-base">Terms</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button type="button" size="sm" variant="outline" className="gap-1 shrink-0" disabled={terms.length >= 50}
          onClick={() => onChange([...terms, { conditions: [emptyCond()], value: value.initial }])}>
          <Plus className="w-3.5 h-3.5" /> Add term
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {terms.length === 0 && (
          <div className="text-center py-5 text-muted-foreground border border-dashed border-border rounded-xl text-xs">{empty}</div>
        )}
        {terms.map((t, i) => {
          const n = Number(t.value);
          const preview = t.value !== "" && !isNaN(n) ? value.preview(n) : null;
          return (
            <div key={i} className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Term {i + 1}</span>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Move down" disabled={i === terms.length - 1} onClick={() => move(i, 1)}>
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" aria-label="Remove term"
                    onClick={() => onChange(terms.filter((_, j) => j !== i))}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {t.conditions.map((c, k) => {
                const hint = fields.find((f) => f.value === c.field)?.hint;
                const setCond = (nc: CondRow) => setTerm(i, { ...t, conditions: t.conditions.map((x, j) => (j === k ? nc : x)) });
                return (
                  <div key={k} className="grid grid-cols-1 sm:grid-cols-[48px_200px_minmax(0,1fr)_auto] gap-2 items-center">
                    <span className="text-xs text-muted-foreground">{k === 0 ? "If" : "and"}</span>
                    <SelectComponent id={`t${i}-c${k}-field`} search value={c.field} data={fieldData}
                      onValueChange={(f) => setCond({ field: f, values: [], text: "" })} />
                    {FIXED_VALUES[c.field] ? (
                      <MultiSelectComponent id={`t${i}-c${k}-values`} placeholder="Pick values" data={FIXED_VALUES[c.field]}
                        values={c.values} onValuesChange={(vals) => setCond({ ...c, values: vals })} className="w-full" />
                    ) : (
                      <Input id={`t${i}-c${k}-values`} value={c.text} placeholder={hint ? `${hint} · comma-separated` : "Values, comma-separated"}
                        aria-label="Values" onChange={(e) => setCond({ ...c, text: e.target.value })} />
                    )}
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Remove condition"
                      disabled={t.conditions.length === 1}
                      onClick={() => setTerm(i, { ...t, conditions: t.conditions.filter((_, j) => j !== k) })}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1" disabled={t.conditions.length >= 10}
                  onClick={() => setTerm(i, { ...t, conditions: [...t.conditions, emptyCond()] })}>
                  <Plus className="w-3 h-3" /> And condition
                </Button>
                <div className="flex items-center gap-2 ml-auto">
                  <Label htmlFor={`t${i}-value`} className="text-xs">{value.label}</Label>
                  <div className="relative">
                    <Input id={`t${i}-value`} type="number" min={value.min} max={value.max} step={value.step}
                      className={`w-24 ${value.suffix ? "pr-7" : ""}`} value={t.value}
                      onChange={(e) => setTerm(i, { ...t, value: e.target.value })} />
                    {value.suffix && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{value.suffix}</span>
                    )}
                  </div>
                  <span className={`text-xs tabular-nums w-32 ${
                    preview?.tone === "bad" ? "text-destructive" : preview?.tone === "good" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                  }`}>
                    {preview?.text}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default TermsEditor;
