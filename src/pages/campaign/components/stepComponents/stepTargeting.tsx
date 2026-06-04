import React, { useState } from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Globe, Plus, Trash2 } from "lucide-react";
import SelectComponent from "@/components/inputComponents/select-component";
import type { AddCampaignFormValues } from "@/utils/schemas/campaign";
import MultiSelectComponent from "@/components/inputComponents/multi-select-component";
import { geoData } from "@/utils/data/data";
import { AudienceTargetData } from "@/utils/data/campaignData";
const StepTargeting: React.FC = () => {
  const {
    control,
    register,
    setValue,
    watch,
    formState: {},
  } = useFormContext<AddCampaignFormValues>();

  const watchIsCustomTargeting = watch("isCustomTargating");
  const watchAudienceTarget = watch("audienceTarget");

  const {
    fields: targetingFields,
    append: appendTargeting,
    remove: removeTargeting,
  } = useFieldArray({
    control,
    name: "customTargating",
  });

  // Local inputs for Tag arrays
  const geoList = watch("geo") || [];

  const [audienceIdInput, setAudienceIdInput] = useState("");
  const audienceIdList = watch("customAudienceIds") || [];

  const removeGeoTag = (idx: number) => {
    setValue(
      "geo",
      geoList.filter((_, i) => i !== idx),
      { shouldValidate: true },
    );
  };

  const addAudienceIdTag = () => {
    if (
      audienceIdInput.trim() &&
      !audienceIdList.includes(audienceIdInput.trim())
    ) {
      setValue(
        "customAudienceIds",
        [...audienceIdList, audienceIdInput.trim()],
        { shouldValidate: true },
      );
      setAudienceIdInput("");
    }
  };

  const removeAudienceIdTag = (idx: number) => {
    setValue(
      "customAudienceIds",
      audienceIdList.filter((_, i) => i !== idx),
      { shouldValidate: true },
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Geographic Filtering */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> Geographic Inclusions
          </CardTitle>
          <CardDescription>
            Tag target countries or regions for campaign delivery.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 ">
          {/* Geo Tag Box */}
          <div className="flex gap-2 w-full">
            <Controller
              name="geo"
              control={control}
              render={({ field }) => (
                <MultiSelectComponent
                  placeholder="Select regions/countries"
                  data={geoData}
                  values={field.value || []}
                  onValuesChange={field.onChange}
                  className="w-full"
                />
              )}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {geoList.length === 0 ? (
              <span className="text-xs text-muted-foreground italic">
                No geographic limits added. (Targeting is global)
              </span>
            ) : (
              geoList.map((tag, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-xs px-2.5 py-1 rounded-full font-medium"
                >
                  {geoData.find((g) => g.value === tag)?.name || tag}
                  <button
                    type="button"
                    onClick={() => removeGeoTag(idx)}
                    className="hover:text-destructive"
                  >
                    &times;
                  </button>
                </span>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom State / City Targeting */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Custom State / City Targeting</CardTitle>
            <CardDescription>
              Fine-tune target criteria with granular inclusions or exclusions.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Controller
              name="isCustomTargating"
              control={control}
              render={({ field }) => (
                <Switch
                  id="isCustomTargating"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label
              htmlFor="isCustomTargating"
              className="text-xs font-semibold cursor-pointer"
            >
              Enable
            </Label>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6 pt-0">
          {watchIsCustomTargeting && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  List custom granular targets
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    appendTargeting({ country: "", state: "", city: "" })
                  }
                  className="flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </Button>
              </div>

              {targetingFields.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-xl text-xs">
                  No state/city target lists configured.
                </div>
              ) : (
                <div className="space-y-3">
                  {targetingFields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="flex gap-3 items-end bg-muted/5 border border-border p-3 rounded-lg"
                    >
                      <div className="grid grid-cols-3 gap-3 flex-1">
                        <div className="space-y-2">
                          <Label>Country</Label>
                          <Input
                            placeholder="US"
                            {...register(
                              `customTargating.${idx}.country` as const,
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>State/Region</Label>
                          <Input
                            placeholder="CA"
                            {...register(
                              `customTargating.${idx}.state` as const,
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input
                            placeholder="Los Angeles"
                            {...register(
                              `customTargating.${idx}.city` as const,
                            )}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTargeting(idx)}
                        className="text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audience Targeting */}
      <Card>
        <CardHeader>
          <CardTitle>Audience Targeting</CardTitle>
          <CardDescription>
            The strategic process of identifying and reaching specific group of
            individuals most likely to be interested in a product or service.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="audienceTarget">Audience Target Type</Label>
              <Controller
                name="audienceTarget"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    onValueChange={field.onChange}
                    value={field.value || "all"}
                    placeholder="Select Target Type"
                    title="Audience Target Type"
                    data={AudienceTargetData}
                  />
                )}
              />
            </div>

            {watchAudienceTarget === "custom" && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <Label>Add Audience IDs</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Audience segment identifier"
                    value={audienceIdInput}
                    onChange={(e) => setAudienceIdInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addAudienceIdTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addAudienceIdTag}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>

          {watchAudienceTarget === "custom" && (
            <div className="flex flex-wrap gap-2 pt-2">
              {audienceIdList.map((tag, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-xs px-2.5 py-1 rounded-full font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeAudienceIdTag(idx)}
                    className="hover:text-destructive text-sm font-bold"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StepTargeting;
