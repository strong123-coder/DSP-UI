import { useEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
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

  // Prefill a new campaign from the advertiser's defaults, once per pick.
  const prefilledFor = useRef<string | null>(null);
  useEffect(() => {
    if (isEdit || !advertiser || prefilledFor.current === advertiser._id) return;
    prefilledFor.current = advertiser._id;
    const d = advertiser.defaults || {};
    if (advertiser.appOs) setValue("appOs", advertiser.appOs, { shouldValidate: true });
    if (advertiser.appBundle) setValue("bundleId", advertiser.appBundle, { shouldValidate: true });
    if (d.currency) setValue("currency", d.currency);
    if (d.mmpPlatform) setValue("mmpPlatform", d.mmpPlatform);
    if (d.clickUrl && !getValues("ctaUrl")) setValue("ctaUrl", d.clickUrl);
  }, [advertiser, isEdit, setValue, getValues]);

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
    </Card>
  );
};

export default StepAdvertiser;
