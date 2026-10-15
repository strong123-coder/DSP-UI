import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Link } from "react-router-dom";
import { Bookmark, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import SavePresetDialog from "@/components/presets/save-preset-dialog";
import { fromFrequencyCaps } from "@/components/targeting/frequency-caps-editor";
import { useFetchPreset, usePresetOptions } from "@/query/usePreset";
import type { Preset } from "@/services/preset";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SelectComponent from "@/components/inputComponents/select-component";
import { useAdvertiser, useAdvertiserOptions } from "@/query/useAdvertiser";
import { useFormMode } from "@/utils/context/FormModeContext";
import type { AddCampaignFormValues } from "@/utils/schemas/campaign";

// First card of the campaign form: which advertiser owns the campaign, plus the
// campaign-level settings that sit beside it in the screenshots (budget type,
// alternative ID, notes). Picking an advertiser on a NEW campaign prefills the
// app, currency, MMP and click URL from the advertiser's defaults.
// The campaign fields a campaign preset carries.
const PRESET_FIELDS = ["goal", "kpi", "currency", "budgetType", "budget", "dailyBudget", "frequencyCaps", "mmpPlatform", "eventDetails"] as const;
const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));

const StepAdvertiser = () => {
  const isEdit = useFormMode() === "edit";
  const { control, register, watch, setValue, getValues, formState: { errors, defaultValues } } =
    useFormContext<AddCampaignFormValues>();

  const advertiserId = watch("advertiserId");
  const { data: optionsResp, isLoading: optionsLoading } = useAdvertiserOptions();
  const options: Array<{ id: string; value: string; status: string }> = optionsResp?.data ?? [];
  const { data: advResp } = useAdvertiser(advertiserId || undefined);
  const advertiser = advResp?.data?.data;

  // An existing campaign keeps its advertiser (its line items and creatives
  // belong to it). Campaigns from before advertisers existed can pick one once.
  // defaultValues is what the edit page reset() the form to (the saved campaign).
  const locked = isEdit && !!defaultValues?.advertiserId;

  const fetchPreset = useFetchPreset();
  const { data: presetResp } = usePresetOptions("campaign", advertiserId || undefined, !!advertiserId);
  const presets: Array<{ id: string; value: string }> = presetResp?.data ?? [];
  const [savingPreset, setSavingPreset] = useState(false);

  // Writes a campaign preset's settings into the form.
  const applyPreset = (p: Preset) => {
    const v = p.payload || {};
    const opts = { shouldDirty: true, shouldValidate: true };
    if (v.goal) setValue("goal", v.goal, opts);
    if (v.kpi !== undefined) setValue("kpi", str(v.kpi), opts);
    if (v.currency) setValue("currency", v.currency, opts);
    if (v.budgetType) setValue("budgetType", v.budgetType, opts);
    if (v.budget !== undefined) setValue("budget", str(v.budget), opts);
    if (v.dailyBudget !== undefined) setValue("dailyBudget", str(v.dailyBudget), opts);
    if (v.frequencyCaps) setValue("frequencyCaps", fromFrequencyCaps(v.frequencyCaps), opts);
    if (v.mmpPlatform) setValue("mmpPlatform", v.mmpPlatform, opts);
    if (Array.isArray(v.eventDetails)) {
      setValue(
        "eventDetails",
        v.eventDetails.map((e: any) => ({ name: str(e.name), bidPrice: str(e.bidPrice), currency: str(e.currency) || "USD" })),
        opts,
      );
    }
  };

  const applyPresetById = async (id: string, announce = true) => {
    try {
      const p = await fetchPreset(id);
      applyPreset(p);
      if (announce) toast.success(`Applied "${p.name}"`);
      return p;
    } catch {
      if (announce) toast.error("Couldn't load that preset");
      return null;
    }
  };

  // Prefill a new campaign from the advertiser's defaults (and its default
  // campaign preset), once per pick.
  const prefilledFor = useRef<string | null>(null);
  useEffect(() => {
    if (isEdit || !advertiser || prefilledFor.current === advertiser._id) return;
    prefilledFor.current = advertiser._id;
    const d = advertiser.defaults || {};
    // Advertisers with apps on both stores have no single OS; guess it from
    // the bundle (App Store ids are numeric, Play bundles are com.x.y).
    const os = advertiser.appOs || (advertiser.appBundle ? (/^(id)?\d+$/i.test(advertiser.appBundle) ? "ios" : "android") : null);
    if (os) setValue("appOs", os, { shouldValidate: true });
    if (advertiser.appBundle) setValue("bundleId", advertiser.appBundle, { shouldValidate: true });
    if (d.currency) setValue("currency", d.currency);
    if (d.mmpPlatform) setValue("mmpPlatform", d.mmpPlatform);
    if (d.clickUrl && !getValues("ctaUrl")) setValue("ctaUrl", d.clickUrl);
    if (d.campaignPresetId) {
      applyPresetById(d.campaignPresetId, false).then((p) => p && toast.info(`Started from the advertiser's preset "${p.name}"`));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advertiser, isEdit, setValue, getValues]);

  const presetPayload = () => {
    const v = getValues();
    const out: Record<string, unknown> = {};
    for (const k of PRESET_FIELDS) {
      const val = v[k];
      if (val !== undefined && val !== "" && !(Array.isArray(val) && val.length === 0)) out[k] = val;
    }
    return out;
  };

  const budgetType = watch("budgetType") || "spend";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Advertiser</CardTitle>
        <CardDescription>
          The brand this campaign runs for. New campaigns start from the advertiser's app and defaults.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="advertiserId">
                Advertiser <span className="text-destructive">*</span>
              </Label>
              {!locked && (
                <Link to="/advertiser/new" className="text-xs text-primary inline-flex items-center gap-1 hover:underline">
                  <Plus className="w-3 h-3" /> New advertiser
                </Link>
              )}
            </div>
            <Controller
              name="advertiserId"
              control={control}
              render={({ field }) => (
                <SelectComponent
                  ref={field.ref}
                  id="advertiserId"
                  search
                  disabled={locked || optionsLoading}
                  placeholder={optionsLoading ? "Loading advertisers…" : options.length ? "Select advertiser" : "No advertisers yet — create one first"}
                  onValueChange={field.onChange}
                  value={field.value}
                  ariaInvalid={!!errors.advertiserId}
                  errorTooltip={errors.advertiserId?.message}
                  data={options.map((o) => ({
                    name: o.status === "paused" ? `${o.value} (paused)` : o.value,
                    value: String(o.id),
                  }))}
                />
              )}
            />
            {locked && (
              <p className="text-[11px] text-muted-foreground">
                A campaign's advertiser can't change, because its line items and creatives belong to that advertiser.
              </p>
            )}
          </div>

          {advertiserId && (
            <div className="space-y-2 md:col-span-2 rounded-lg border border-dashed border-border p-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Label htmlFor="campaignPreset" className="flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-primary" /> Campaign preset
                </Label>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSavingPreset(true)}>
                  Save these settings as a preset…
                </Button>
              </div>
              <SelectComponent id="campaignPreset" value="" search
                placeholder={presets.length ? "Apply a preset (goal, KPI, budgets, caps, MMP, events)" : "No campaign presets yet"}
                disabled={!presets.length}
                data={presets.map((p) => ({ name: p.value, value: String(p.id) }))}
                onValueChange={(id) => id && applyPresetById(id)} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="budgetType">Budget type</Label>
            <Controller
              name="budgetType"
              control={control}
              render={({ field }) => (
                <SelectComponent
                  ref={field.ref}
                  id="budgetType"
                  onValueChange={field.onChange}
                  value={field.value || "spend"}
                  data={[
                    { name: "Spend", value: "spend" },
                    { name: "Impressions", value: "impressions" },
                  ]}
                />
              )}
            />
            <p className="text-[11px] text-muted-foreground">
              {budgetType === "impressions"
                ? "Total and daily budgets count impressions delivered. Line items inherit this."
                : "Total and daily budgets count money spent. Line items inherit this."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alternativeId">Alternative ID</Label>
            <Input id="alternativeId" placeholder="Your own reference, e.g. IO-2026-114" {...register("alternativeId")} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} placeholder="Internal notes" {...register("notes")} />
          </div>
        </div>
      </CardContent>
      <SavePresetDialog open={savingPreset} onOpenChange={setSavingPreset} kind="campaign"
        advertiserId={advertiserId || undefined} advertiserName={advertiser?.name} buildPayload={presetPayload} />
    </Card>
  );
};

export default StepAdvertiser;
