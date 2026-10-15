import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import SelectComponent from "@/components/inputComponents/select-component";
import { DatePickerComponent } from "@/components/inputComponents/date-picker-component";
import type { LineItemFormValues } from "@/utils/schemas/lineItem";

const toIsoDay = (d?: Date) => (d ? new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10) : "");

const noSign = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (["-", "e", "E", "+"].includes(e.key)) e.preventDefault();
};

const GeneralTab: React.FC<{ campaign: any }> = ({ campaign }) => {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<LineItemFormValues>();
  const strategy = watch("bidding.strategy");
  const creatives = watch("creatives");
  const impressions = campaign.budgetType === "impressions";
  const unit = impressions ? "impressions" : campaign.currency || "USD";

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Essential settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">
              Line item name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" placeholder="e.g. UK · banner 320x50 · evenings" {...register("name")}
              aria-invalid={!!errors.name} errorTooltip={errors.name?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start date</Label>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePickerComponent
                  id="startDate"
                  date={field.value ? new Date(field.value + "T00:00:00") : undefined}
                  onSelect={(d) => field.onChange(toIsoDay(d))}
                  placeholder="Campaign start"
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End date</Label>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <DatePickerComponent
                  id="endDate"
                  date={field.value ? new Date(field.value + "T00:00:00") : undefined}
                  onSelect={(d) => field.onChange(toIsoDay(d))}
                  placeholder="Campaign end"
                  ariaInvalid={!!errors.endDate}
                  errorTooltip={errors.endDate?.message}
                />
              )}
            />
          </div>
          <p className="md:col-span-2 -mt-2 text-[11px] text-muted-foreground">
            Leave blank to run for the whole campaign. Dates must sit inside the campaign's dates.
          </p>

          <div className="space-y-2">
            <Label htmlFor="alternativeId">Alternative ID</Label>
            <Input id="alternativeId" placeholder="Your own reference" {...register("alternativeId")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={1} placeholder="Internal notes" {...register("notes")} />
          </div>

          <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <Label htmlFor="status" className="text-sm">Active</Label>
              <p className="text-[11px] text-muted-foreground">
                {creatives.length === 0
                  ? "Attach a creative in Creative Association before activating."
                  : "Active line items bid as soon as the campaign is active."}
              </p>
            </div>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Switch
                  id="status"
                  checked={field.value === "active"}
                  onCheckedChange={(v) => field.onChange(v ? "active" : "paused")}
                  aria-invalid={!!errors.status}
                />
              )}
            />
          </div>
          {errors.status?.message && <p className="md:col-span-2 text-xs text-destructive -mt-2">{errors.status.message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Budget &amp; pacing</CardTitle>
          <CardDescription>
            In {impressions ? "impressions" : campaign.currency || "USD"}, the campaign's budget type. Blank means the
            line item shares the campaign's budget.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Budget ({unit})</Label>
            <Input id="budget" type="number" min="0" step={impressions ? "1" : "0.01"} onKeyDown={noSign}
              placeholder="Campaign budget" {...register("budget")}
              aria-invalid={!!errors.budget} errorTooltip={errors.budget?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dailyBudget">Daily budget ({unit})</Label>
            <Input id="dailyBudget" type="number" min="0" step={impressions ? "1" : "0.01"} onKeyDown={noSign}
              placeholder="Campaign daily" {...register("dailyBudget")}
              aria-invalid={!!errors.dailyBudget} errorTooltip={errors.dailyBudget?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pacing">Pacing</Label>
            <Controller
              name="pacing"
              control={control}
              render={({ field }) => (
                <SelectComponent
                  ref={field.ref}
                  id="pacing"
                  value={field.value}
                  onValueChange={field.onChange}
                  data={[
                    { name: "As fast as possible", value: "asap" },
                    { name: "Even across the day", value: "even" },
                  ]}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bidding</CardTitle>
          <CardDescription>
            "Use campaign bid" keeps today's price (Bid Configuration, else the campaign's event price). A fixed CPM
            bids exactly that price per 1,000 impressions.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="biddingStrategy">Bidding strategy</Label>
            <Controller
              name="bidding.strategy"
              control={control}
              render={({ field }) => (
                <SelectComponent
                  ref={field.ref}
                  id="biddingStrategy"
                  value={field.value}
                  onValueChange={field.onChange}
                  data={[
                    { name: "Use campaign bid", value: "inherit" },
                    { name: "Fixed CPM", value: "fixed_cpm" },
                  ]}
                />
              )}
            />
          </div>
          {strategy === "fixed_cpm" && (
            <div className="space-y-2">
              <Label htmlFor="cpm">
                CPM bid ({campaign.currency || "USD"}) <span className="text-destructive">*</span>
              </Label>
              <Input id="cpm" type="number" min="0" step="0.01" onKeyDown={noSign} placeholder="0.40"
                {...register("bidding.cpm")}
                aria-invalid={!!errors.bidding?.cpm} errorTooltip={errors.bidding?.cpm?.message} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="maxCpm">Max CPM ({campaign.currency || "USD"})</Label>
            <Input id="maxCpm" type="number" min="0" step="0.01" onKeyDown={noSign} placeholder="No cap"
              {...register("bidding.maxCpm")}
              aria-invalid={!!errors.bidding?.maxCpm} errorTooltip={errors.bidding?.maxCpm?.message} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralTab;
