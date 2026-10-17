import React from "react";
import { Globe2, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";

export type Visibility = "private" | "public";

const OPTIONS: { value: Visibility; label: string; hint: string; icon: React.ReactNode }[] = [
  { value: "private", label: "Private", hint: "Only your organization sees and uses it.", icon: <Lock className="w-4 h-4" /> },
  { value: "public", label: "Public", hint: "Every network can use it too, but can't change it.", icon: <Globe2 className="w-4 h-4" /> },
];

// Who an organization's library item (targeting list, preset) is shared with.
const VisibilityField: React.FC<{ id: string; value: Visibility; onChange: (v: Visibility) => void; what: string }> = ({
  id,
  value,
  onChange,
  what,
}) => (
  <div className="space-y-2">
    <Label id={`${id}-label`}>Who can use this {what}</Label>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-labelledby={`${id}-label`}>
      {OPTIONS.map((o) => (
        <label key={o.value}
          className={`flex items-start gap-2.5 rounded-md border p-3 cursor-pointer text-sm ${value === o.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"}`}>
          <input type="radio" name={id} className="sr-only" checked={value === o.value} onChange={() => onChange(o.value)} />
          <span className={value === o.value ? "text-primary mt-0.5" : "text-muted-foreground mt-0.5"}>{o.icon}</span>
          <span>
            <span className="font-medium block">{o.label}</span>
            <span className="text-xs text-muted-foreground">{o.hint}</span>
          </span>
        </label>
      ))}
    </div>
  </div>
);

// How a library row reads at a glance: shared from the org, a network's own,
// or the org's own (private / public).
export const VisibilityTag: React.FC<{ shared?: boolean; networkName?: string | null; visibility?: Visibility; orgLevel: boolean }> = ({
  shared,
  networkName,
  visibility,
  orgLevel,
}) => {
  const cls = "inline-flex items-center gap-1 text-[11px] rounded-full border px-2 py-0.5 whitespace-nowrap";
  if (shared) return <span className={`${cls} border-sky-300 text-sky-800 dark:border-sky-800 dark:text-sky-300`}><Globe2 className="w-3 h-3" /> Shared by your organization</span>;
  if (networkName && orgLevel) return <span className={`${cls} border-border text-muted-foreground`}>Network: {networkName}</span>;
  if (!orgLevel) return null; // a network's own item: nothing to say
  return visibility === "public" ? (
    <span className={`${cls} border-sky-300 text-sky-800 dark:border-sky-800 dark:text-sky-300`}><Globe2 className="w-3 h-3" /> Public</span>
  ) : (
    <span className={`${cls} border-border text-muted-foreground`}><Lock className="w-3 h-3" /> Private</span>
  );
};

export default VisibilityField;
