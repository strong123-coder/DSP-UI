import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Controller, useFormContext } from "react-hook-form";
import { DatePickerComponent } from "@/components/inputComponents/date-picker-component";
import type { AddCampaignFormValues } from "@/utils/schemas/campaign";

const StepCampaignDetails = () => {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<AddCampaignFormValues>();

  const watchIsScheduling = watch("isScheduling");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Campaign Details</CardTitle>
        <CardDescription>
          Strategically target and engage online audiences across various
          digital channels to achieve marketing objectives.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campaign Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Campaign Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              {...register("title")}
              aria-invalid={!!errors.title}
              errorTooltip={errors.title?.message}
            />
          </div>

          {/* Bundle ID */}
          <div className="space-y-2">
            <Label htmlFor="bundleId">Bundle / Package ID</Label>
            <Input
              id="bundleId"
              {...register("bundleId")}
              aria-invalid={!!errors.bundleId}
              errorTooltip={errors.bundleId?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dailyBudget">Daily Budget</Label>
            <Input
              id="dailyBudget"
              type="number"
              {...register("dailyBudget")}
              aria-invalid={!!errors.dailyBudget}
              errorTooltip={errors.dailyBudget?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Total Budget</Label>
            <Input
              id="budget"
              type="number"
              {...register("budget")}
              aria-invalid={!!errors.budget}
              errorTooltip={errors.budget?.message}
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="kpi">KPI</Label>
            <Textarea
              id="kpi"
              {...register("kpi")}
              aria-invalid={!!errors.kpi}
              errorTooltip={errors.kpi?.message}
            />
          </div>

          {/* Scheduling Checkbox */}
          <div className="space-y-2 col-span-2 flex flex-col justify-end pb-2">
            <Controller
              name="isScheduling"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id="isScheduling"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label
                    htmlFor="isScheduling"
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    Campaign Scheduling
                  </Label>
                </div>
              )}
            />
          </div>

          {/* Start Date */}
          {watchIsScheduling && (
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="startDate" className="mb-1">
                Start Date
              </Label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DatePickerComponent
                    id="startDate"
                    date={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) =>
                      field.onChange(
                        date ? date.toISOString().split("T")[0] : "",
                      )
                    }
                    placeholder="Pick a start date"
                    ariaInvalid={!!errors.startDate}
                    errorTooltip={errors.startDate?.message}
                  />
                )}
              />
            </div>
          )}

          {/* End Date */}
          {watchIsScheduling && (
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="endDate" className="mb-1">
                End Date
              </Label>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DatePickerComponent
                    id="endDate"
                    date={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) =>
                      field.onChange(
                        date ? date.toISOString().split("T")[0] : "",
                      )
                    }
                    placeholder="Pick an end date"
                    ariaInvalid={!!errors.endDate}
                    errorTooltip={errors.endDate?.message}
                  />
                )}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StepCampaignDetails;
