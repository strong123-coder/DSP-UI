import React from "react";
import { EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// "" = not set. Otherwise a percentage 0–90 as typed.
export const cutError = (v: string) => {
  if (v.trim() === "") return "";
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return "Enter a percentage from 0 to 90";
  if (n > 90) return "Publisher cut can be at most 90%";
  return "";
};

export const cutPayload = (v: string): number | null => (v.trim() === "" ? null : Number(v));

// The org's publisher cut on a network or an advertiser. Only org users and
// super admins ever render this: network users must not see it.
const PublisherCutField: React.FC<{
  id: string;
  value: string;
  onChange: (v: string) => void;
  // advertiser level: the network's cut, used while this one is empty
  inherited?: number | null;
  level: "network" | "advertiser";
}> = ({ id, value, onChange, inherited, level }) => {
  const error = cutError(value);
  const own = value.trim() === "" ? null : Number(value);
  const effective = own ?? (level === "advertiser" ? inherited ?? null : null);
  const keep = effective !== null && !error ? 100 - effective : null;
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-1.5">
        Publisher cut (%)
        <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          <EyeOff className="w-3 h-3" /> hidden from networks
        </span>
      </Label>
      <Input id={id} type="number" min={0} max={90} step="0.5" inputMode="decimal" value={value}
        placeholder={
          level === "advertiser"
            ? inherited !== null && inherited !== undefined
              ? `Network's cut: ${inherited}%`
              : "No cut"
            : "No cut"
        }
        aria-invalid={!!error} errorTooltip={error}
        onChange={(e) => onChange(e.target.value)} />
      <p className="text-[11px] text-muted-foreground">
        {keep !== null && effective! > 0
          ? `The engine spends ${keep}% of every spend budget (a $1,000 budget spends $${(10 * keep).toLocaleString()}). The network still sees its full budget and spend scaled to it.`
          : level === "advertiser"
            ? "Leave empty to use the network's cut. Enter 0 for no cut on this advertiser."
            : "Applies to every advertiser in this network that has no cut of its own."}
      </p>
    </div>
  );
};

export default PublisherCutField;
