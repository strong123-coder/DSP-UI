import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreatePreset } from "@/query/usePreset";
import type { PresetKind } from "@/services/preset";

const KIND_TEXT: Record<PresetKind, string> = {
  campaign: "campaign settings (goal, KPI, currency, budgets, frequency caps, MMP, events)",
  lineItem: "line item settings (pacing, bidding, frequency caps and all targeting)",
  targeting: "targeting (every Targeting tab)",
};

// Saves the current form's settings as a preset, for one advertiser or all.
const SavePresetDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: PresetKind;
  advertiserId?: string;
  advertiserName?: string;
  buildPayload: () => Record<string, any>;
}> = ({ open, onOpenChange, kind, advertiserId, advertiserName, buildPayload }) => {
  const [name, setName] = useState("");
  const [scope, setScope] = useState<"advertiser" | "org">(advertiserId ? "advertiser" : "org");
  const [error, setError] = useState("");
  const createMut = useCreatePreset();

  useEffect(() => {
    if (open) {
      setName("");
      setError("");
      setScope(advertiserId ? "advertiser" : "org");
    }
  }, [open, advertiserId]);

  const save = () => {
    if (!name.trim()) {
      setError("Give the preset a name");
      return;
    }
    createMut.mutate(
      { name: name.trim(), kind, advertiserId: scope === "advertiser" ? advertiserId || null : null, payload: buildPayload() },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as preset</DialogTitle>
          <DialogDescription>Saves these {KIND_TEXT[kind]} so new ones can start from them.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preset-name">Preset name</Label>
            <Input id="preset-name" value={name} maxLength={120} placeholder="e.g. India Android evenings" autoFocus
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  save();
                }
              }}
              aria-invalid={!!error} errorTooltip={error} />
          </div>
          {advertiserId && (
            <div className="space-y-2" role="radiogroup" aria-label="Who can use it">
              <Label>Who can use it</Label>
              {([
                { id: "advertiser", text: `Only ${advertiserName || "this advertiser"}` },
                { id: "org", text: "Every advertiser in your organization" },
              ] as const).map((o) => (
                <label key={o.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="preset-scope" checked={scope === o.id} onChange={() => setScope(o.id)}
                    className="accent-[var(--primary)]" />
                  {o.text}
                </label>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createMut.isPending}>Cancel</Button>
          <Button type="button" onClick={save} disabled={createMut.isPending}>{createMut.isPending ? "Saving…" : "Save preset"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SavePresetDialog;
