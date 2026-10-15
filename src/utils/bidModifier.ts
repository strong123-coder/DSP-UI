import type { ModifierCondition, ModifierField } from "@/services/bidModifier";

// "×1.2 (+20%)", "×0.5 (−50%)", "Don't bid".
export const multiplierText = (m: number) => {
  if (m === 0) return "Don't bid";
  const pct = Math.round((m - 1) * 100);
  return pct === 0 ? "×1 (no change)" : `×${m} (${pct > 0 ? "+" : "−"}${Math.abs(pct)}%)`;
};

const MAX_SHOWN = 4;

// "country is IN or US, and hour is 0 or 1" (field labels lower-cased, values as entered).
export const termText = (t: { conditions: ModifierCondition[] }, fields: ModifierField[]) =>
  t.conditions
    .map((c) => {
      const label = (fields.find((f) => f.value === c.field)?.name || c.field).toLowerCase();
      const shown = c.values.slice(0, MAX_SHOWN).join(" or ");
      const more = c.values.length > MAX_SHOWN ? ` (+${c.values.length - MAX_SHOWN} more)` : "";
      const value = c.field === "country" ? shown.toUpperCase() : shown;
      return `${label} is ${value}${more}`;
    })
    .join(", and ");

// "Bid on 30%", "Never bid", "Always bid" — a delivery modifier term's effect.
export const shareText = (pct: number) => (pct <= 0 ? "Never bid" : pct >= 100 ? "Always bid" : `Bid on ${pct}%`);
