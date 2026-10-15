import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Bookmark, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SavePresetDialog from "@/components/presets/save-preset-dialog";
import { useFetchPreset, usePresetOptions } from "@/query/usePreset";
import { fromFrequencyCaps, toFrequencyCaps } from "@/components/targeting/frequency-caps-editor";
import {
  browserTimezone,
  targetingToForm,
  toTargetingPayload,
  type LineItemFormValues,
} from "@/utils/schemas/lineItem";
import type { Preset, PresetKind } from "@/services/preset";

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));

// Writes a preset's settings into the line item form.
export const applyPresetToForm = (
  preset: Preset,
  setValue: ReturnType<typeof useFormContext<LineItemFormValues>>["setValue"],
) => {
  const p = preset.payload || {};
  const opts = { shouldDirty: true };
  if (preset.kind === "targeting") {
    setValue("targeting", targetingToForm(p, browserTimezone()), opts);
    return;
  }
  if (p.pacing) setValue("pacing", p.pacing, opts);
  if (p.frequencyCaps) setValue("frequencyCaps", fromFrequencyCaps(p.frequencyCaps), opts);
  if (p.bidding) {
    setValue("bidding", { strategy: p.bidding.strategy || "inherit", cpm: str(p.bidding.cpm), maxCpm: str(p.bidding.maxCpm) }, opts);
  }
  if (p.targeting) setValue("targeting", targetingToForm(p.targeting, browserTimezone()), opts);
};

// "Presets" menu on the line item form: apply a line item or targeting preset,
// or save the current settings as one.
const LineItemPresets: React.FC<{ advertiserId: string; advertiserName: string }> = ({ advertiserId, advertiserName }) => {
  const { getValues, setValue } = useFormContext<LineItemFormValues>();
  const { data: liResp } = usePresetOptions("lineItem", advertiserId);
  const { data: tgResp } = usePresetOptions("targeting", advertiserId);
  const liPresets: Array<{ id: string; value: string }> = liResp?.data ?? [];
  const tgPresets: Array<{ id: string; value: string }> = tgResp?.data ?? [];
  const fetchPreset = useFetchPreset();
  const [saving, setSaving] = useState<PresetKind | null>(null);

  const apply = async (id: string) => {
    try {
      const preset = await fetchPreset(id);
      applyPresetToForm(preset, setValue);
      toast.success(`Applied "${preset.name}". Review the tabs, then save the line item.`);
    } catch {
      toast.error("Couldn't load that preset");
    }
  };

  const payload = (kind: PresetKind) => {
    const v = getValues();
    const targeting = toTargetingPayload(v.targeting);
    if (kind === "targeting") return targeting;
    return {
      pacing: v.pacing,
      frequencyCaps: toFrequencyCaps(v.frequencyCaps),
      bidding: {
        strategy: v.bidding.strategy,
        cpm: v.bidding.strategy === "fixed_cpm" && v.bidding.cpm ? Number(v.bidding.cpm) : null,
        maxCpm: v.bidding.maxCpm ? Number(v.bidding.maxCpm) : null,
      },
      targeting,
    };
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-1.5">
            <Bookmark className="w-3.5 h-3.5" /> Presets <ChevronDown className="w-3.5 h-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Apply line item preset</DropdownMenuLabel>
          {liPresets.length === 0 && <DropdownMenuItem disabled>None saved yet</DropdownMenuItem>}
          {liPresets.map((p) => (
            <DropdownMenuItem key={p.id} onClick={() => apply(p.id)}>{p.value}</DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">Apply targeting preset</DropdownMenuLabel>
          {tgPresets.length === 0 && <DropdownMenuItem disabled>None saved yet</DropdownMenuItem>}
          {tgPresets.map((p) => (
            <DropdownMenuItem key={p.id} onClick={() => apply(p.id)}>{p.value}</DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSaving("lineItem")}>Save as line item preset…</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSaving("targeting")}>Save targeting as preset…</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SavePresetDialog
        open={saving !== null}
        onOpenChange={(o) => !o && setSaving(null)}
        kind={saving || "lineItem"}
        advertiserId={advertiserId}
        advertiserName={advertiserName}
        buildPayload={() => payload(saving || "lineItem")}
      />
    </>
  );
};

export default LineItemPresets;
