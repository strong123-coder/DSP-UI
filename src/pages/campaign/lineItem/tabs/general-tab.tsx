import React from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import SelectComponent from "@/components/inputComponents/select-component";
import { DatePickerComponent } from "@/components/inputComponents/date-picker-component";
import FrequencyCapsEditor from "@/components/targeting/frequency-caps-editor";
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
  const { fields: flightRows, append: addFlight, remove: removeFlight } = useFieldArray({ control, name: "flights" });
  const flights = watch("flights");
  const flightTotal = flights.reduce((sum, f) => sum + (Number(f.budget) || 0), 0);
  const creatives = watch("creatives");
  const impressions = campaign.budgetType === "impressions";
  const unit = impressions ? "impressions" : campaign.currency || "USD";
  const campaignCaps: string[] = (campaign.frequencyCaps || []).map(
    (c: { count: number; every: number; unit: string }) => `${c.count} every ${c.every} ${c.unit}${c.every > 1 ? "s" : ""}`,
  );

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
        <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-3">
          <div>
            <CardTitle className="text-base">Flights</CardTitle>
            <CardDescription>
              Split the line item into bursts. With flights, it bids only inside one, and each flight's budget caps what it
              delivers in that flight. Leave empty to run continuously.
            </CardDescription>
          </div>
          <Button type="button" size="sm" variant="outline" className="gap-1 shrink-0" disabled={flightRows.length >= 20}
            onClick={() => addFlight({ startDate: "", endDate: "", budget: "" })}>
            <Plus className="w-3.5 h-3.5" /> Add flight
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {flightRows.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground border border-dashed border-border rounded-xl text-xs">
              No flights: bids for the whole line item run.
            </div>
          ) : (
            <>
              {flightRows.map((f, i) => (
                <div key={f.id} className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_140px_auto] gap-2 items-end">
                  <div className="space-y-1.5">
                    <Label className="text-xs" htmlFor={`flight-${i}-start`}>Start</Label>
                    <Controller
                      name={`flights.${i}.startDate` as const}
                      control={control}
                      render={({ field }) => (
                        <DatePickerComponent id={`flight-${i}-start`} placeholder="Start date"
                          date={field.value ? new Date(field.value + "T00:00:00") : undefined}
                          onSelect={(d) => field.onChange(toIsoDay(d))}
                          ariaInvalid={!!errors.flights?.[i]?.startDate} errorTooltip={errors.flights?.[i]?.startDate?.message} />
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs" htmlFor={`flight-${i}-end`}>End</Label>
                    <Controller
                      name={`flights.${i}.endDate` as const}
                      control={control}
                      render={({ field }) => (
                        <DatePickerComponent id={`flight-${i}-end`} placeholder="End date"
                          date={field.value ? new Date(field.value + "T00:00:00") : undefined}
                          onSelect={(d) => field.onChange(toIsoDay(d))}
                          ariaInvalid={!!errors.flights?.[i]?.endDate} errorTooltip={errors.flights?.[i]?.endDate?.message} />
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs" htmlFor={`flight-${i}-budget`}>Budget ({unit})</Label>
                    <Input id={`flight-${i}-budget`} type="number" min="0" step={impressions ? "1" : "0.01"} onKeyDown={noSign}
                      placeholder="No cap" {...register(`flights.${i}.budget` as const)}
                      aria-invalid={!!errors.flights?.[i]?.budget} errorTooltip={errors.flights?.[i]?.budget?.message} />
                  </div>
                  <Button type="button" variant="ghost" size="icon" aria-label="Remove flight"
                    className="text-destructive hover:bg-destructive/10" onClick={() => removeFlight(i)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground tabular-nums">
                Flight budgets: {flightTotal ? `${flightTotal} ${unit}` : "none set"}. Dates are whole days in UTC.
              </p>
            </>
          )}
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Frequency cap</CardTitle>
          <CardDescription>
            Limit how often one person sees this line item's ads.
            {campaignCaps.length > 0 && ` The campaign also caps it at ${campaignCaps.join(" and ")}; the stricter limit wins.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Controller
            name="frequencyCaps"
            control={control}
            render={({ field }) => (
              <FrequencyCapsEditor id="li-fcap" value={field.value} onChange={field.onChange}
                errors={errors.frequencyCaps as any} />
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralTab;
