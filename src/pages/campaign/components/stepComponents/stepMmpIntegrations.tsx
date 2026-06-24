import React from "react";
import { useFormContext, Controller, useFieldArray } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import SelectComponent from "@/components/inputComponents/select-component";
import { MmpPlatformData } from "@/utils/data/campaignData";
import type { AddCampaignFormValues } from "@/utils/schemas/campaign";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { currencyData } from "@/utils/data/data";
import MacroHelp from "../macro-help";

const StepMmpIntegration: React.FC = () => {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<AddCampaignFormValues>();

  const watchCurrency = watch("currency");

  const {
    fields: eventFields,
    append: appendEvent,
    remove: removeEvent,
  } = useFieldArray({
    control,
    name: "eventDetails",
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <Card className="border-none shadow-none bg-transparent p-0">
        {/* <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" /> MMP Tracking URLs
          </CardTitle>
          <CardDescription>
            Configure attribution endpoints for install measurements.
          </CardDescription>
        </CardHeader> */}
        <CardContent className="space-y-4   py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* MMP Platform */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="mmpPlatform">Choose (MMP)</Label>
              <Controller
                name="mmpPlatform"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    ref={field.ref}
                    onValueChange={field.onChange}
                    value={field.value || "appsflyer"}
                    placeholder="Select MMP"
                    title="Select MMP"
                    data={MmpPlatformData}
                    ariaInvalid={!!errors.mmpPlatform}
                    errorTooltip={errors.mmpPlatform?.message}
                  />
                )}
              />
            </div>

            {/* CTA URL */}
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="ctaUrl" className="flex items-center gap-1.5">
                Click Through Attribution Link (CTA)
                <MacroHelp />
              </Label>
              <Textarea
                id="ctaUrl"
                {...register("ctaUrl")}
                aria-invalid={!!errors.ctaUrl}
                errorTooltip={errors.ctaUrl?.message}
              />
            </div>
          </div>

          {/* VTA URL */}
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="vtaUrl" className="flex items-center gap-1.5">
              View Through Attribution Link (VTA){" "}
              <span className="text-muted-foreground font-normal">
                (Optional)
              </span>
              <MacroHelp />
            </Label>
            <Textarea
              id="vtaUrl"
              {...register("vtaUrl")}
              aria-invalid={!!errors.vtaUrl}
              errorTooltip={errors.vtaUrl?.message}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Details List */}

      <Card className="border border-border/50 rounded-xl bg-muted/10 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6">
          <div>
            <CardTitle className="text-lg">Event Configs</CardTitle>
            <CardDescription>Define specific event details.</CardDescription>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              appendEvent({ name: "", bidPrice: "", currency: "USD" })
            }
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Event
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 p-6 pt-0">
          {eventFields.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-xl">
              No conversion events added yet.
            </div>
          ) : (
            <div className="space-y-3">
              {eventFields.map((field, idx) => (
                <div
                  key={field.id}
                  className="flex gap-4 items-end bg-muted/10 border border-border p-4 rounded-xl relative group"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                    <div className="space-y-1.5">
                      <Label htmlFor={`eventDetails.${idx}.name`}>
                        Event Key Name{" "}
                        <span className="text-destructive">*</span>
                      </Label>

                      <Input
                        id={`eventDetails.${idx}.name`}
                        placeholder="e.g. purchase, registration"
                        {...register(`eventDetails.${idx}.name` as const)}
                        aria-invalid={!!errors.eventDetails?.[idx]?.name}
                        readOnly={idx === 0}
                        errorTooltip={errors.eventDetails?.[idx]?.name?.message}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`eventDetails.${idx}.bidPrice`}>
                        Bid Price Value
                      </Label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-muted-foreground text-sm font-medium select-none">
                          {
                            currencyData?.find(
                              (item) => item.value === watchCurrency,
                            )?.symbol
                          }
                        </span>
                        <Input
                          id={`eventDetails.${idx}.bidPrice`}
                          type="number"
                          min="0.01"
                          step="0.01"
                          onKeyDown={(e) => {
                            if (
                              e.key === "-" ||
                              e.key === "e" ||
                              e.key === "E" ||
                              e.key === "+"
                            ) {
                              e.preventDefault();
                            }
                          }}
                          aria-invalid={!!errors.eventDetails?.[idx]?.bidPrice}
                          errorTooltip={
                            errors.eventDetails?.[idx]?.bidPrice?.message
                          }
                          className="pl-7"
                          {...register(`eventDetails.${idx}.bidPrice` as const)}
                        />
                      </div>
                    </div>

                    {/* <div className="space-y-1.5">
                      <Label className="text-xs">Event Currency</Label>

                      <Input
                        placeholder="USD"
                        {...register(`eventDetails.${idx}.currency` as const)}
                      />
                    </div> */}
                    <input
                      type="hidden"
                      value="USD"
                      {...register(`eventDetails.${idx}.currency` as const)}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className={`${idx === 0 ? "invisible" : ""}`}
                    onClick={() => removeEvent(idx)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StepMmpIntegration;
