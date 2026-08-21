import { useEffect, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Controller, useFormContext } from "react-hook-form";
import { DatePickerComponent } from "@/components/inputComponents/date-picker-component";
import type { AddCampaignFormValues } from "@/utils/schemas/campaign";
import SelectComponent from "@/components/inputComponents/select-component";
import { useGetAppDetails } from "@/query/useCampaign";
import { Loader2 } from "lucide-react";
import { extractApiErrors } from "@/utils/getErrorMessage";
import { useFormMode } from "@/utils/context/FormModeContext";
import { toast } from "sonner";
import { currencyData } from "@/utils/data/data";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const StepCampaignDetails = () => {
  const mode = useFormMode();
  const isEdit = mode === "edit";

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<AddCampaignFormValues>();

  const watchType = watch("type");
  const isMobile = watchType === "mobile";
  const isCtv = watchType === "ctv";
  const watchIsScheduling = watch("isScheduling");
  const watchBundleId = watch("bundleId");
  const watchAppOs = watch("appOs");
  const watchAppIconLink = watch("appIconLink");
  const watchCurrency = watch("currency");

  const debouncedBundleId = useDebounce(watchBundleId, 500);

  const {
    data: appDetailsData,
    isLoading: appDetailsLoading,
    isError: appDetailsIsError,
    error: appDetailsError,
  } = useGetAppDetails(
    {
      bundleId: debouncedBundleId ?? "",
      platform: (watchAppOs ?? "android") as "android" | "ios",
    },
    !isEdit && isMobile, // app-store lookup only applies to Mobile campaigns
  );

  useEffect(() => {
    if (appDetailsData?.data?.data) {
      const { iconUrl, title } = appDetailsData.data.data;
      if (iconUrl) {
        setValue("appIconLink", iconUrl, { shouldValidate: true });
      }
      if (title) {
        setValue("appName", title, { shouldValidate: true });
      }
    } else if (appDetailsIsError) {
      setValue("appIconLink", "");
      setValue("appName", "");
      toast.error(extractApiErrors((appDetailsError as any).response?.data)[0]);
    }
  }, [appDetailsData, appDetailsIsError, appDetailsError, setValue]);

  useEffect(() => {
    if (!isEdit) {
      setValue("appIconLink", "");
      setValue("appName", "");
    }
  }, [watchBundleId, watchAppOs, isEdit, setValue]);

  const appDetailsErrorMessage =
    appDetailsIsError && appDetailsError
      ? extractApiErrors((appDetailsError as any).response?.data)[0]
      : undefined;

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
          <div className="space-y-2 md:col-span-2">
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

          {/* Campaign Type / Platform */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="type">
              Campaign Type <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <SelectComponent
                  ref={field.ref}
                  disabled={isEdit}
                  id="type"
                  placeholder="Select campaign type"
                  onValueChange={field.onChange}
                  value={field.value}
                  ariaInvalid={!!errors.type}
                  data={[
                    { name: "Mobile App", value: "mobile" },
                    { name: "Web", value: "web" },
                    { name: "CTV / Video", value: "ctv" },
                  ]}
                  errorTooltip={errors.type?.message}
                />
              )}
            />
            <p className="text-[11px] text-muted-foreground">
              {watchType === "ctv"
                ? "CTV runs video creatives (upload MP4 or paste a VAST tag) on connected-TV & in-app video."
                : "Mobile & Web run image (display) creatives."}
            </p>
          </div>

          {/* App OS — mobile app-install only (android/iOS store OS).
              CTV runs on TV OSes (Fire TV / Roku / Android TV) so this doesn't apply. */}
          {isMobile && (
            <div className="space-y-2">
              <Label htmlFor="appOs">Selelect App OS</Label>
              <Controller
                name="appOs"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    ref={field.ref}
                    disabled={isEdit}
                    id="appOs"
                    placeholder="Please select app OS"
                    onValueChange={field.onChange}
                    value={field.value}
                    ariaInvalid={!!errors.appOs}
                    data={[
                      { name: "Android", value: "android" },
                      { name: "iOS", value: "ios" },
                    ]}
                    errorTooltip={errors.appOs?.message}
                  />
                )}
              />
            </div>
          )}

          {/* App / Bundle ID — Mobile (with store lookup) AND CTV (plain input:
              the CTV app the campaign advertises/targets, e.g. B07DBBTDBS). */}
          {(isMobile || isCtv) && (
            <div className="space-y-2">
              <Label htmlFor="bundleId">
                {isCtv ? "App Bundle ID" : "Bundle / Package ID"}
                {isCtv && (
                  <span className="text-muted-foreground font-normal"> (Optional)</span>
                )}
              </Label>
              <div className="relative flex items-center">
                <Input
                  id="bundleId"
                  placeholder={
                    isCtv
                      ? "CTV app bundle e.g. B07DBBTDBS / com.roku.channel"
                      : !Boolean(watchAppOs)
                        ? "Please select app OS first"
                        : "Provide Bundle ID ex.(com.package.name)"
                  }
                  disabled={isEdit || (isMobile && !Boolean(watchAppOs))}
                  {...register("bundleId")}
                  aria-invalid={!!errors.bundleId || (isMobile && appDetailsIsError)}
                  errorTooltip={
                    errors.bundleId?.message ||
                    (isMobile ? appDetailsErrorMessage : undefined)
                  }
                  className={
                    isMobile && (appDetailsData?.data?.data?.iconUrl || appDetailsLoading)
                      ? "pr-9"
                      : ""
                  }
                />
                {isMobile && appDetailsLoading && (
                  <Loader2 className="absolute right-2.5 w-4 h-4 animate-spin text-muted-foreground" />
                )}
                {isMobile &&
                  !appDetailsLoading &&
                  (appDetailsData?.data?.data?.iconUrl || watchAppIconLink) && (
                    <img
                      src={
                        appDetailsData?.data?.data?.iconUrl || watchAppIconLink
                      }
                      alt="App Icon"
                      className="absolute right-0 top-0 w-9 h-full rounded-md object-cover"
                    />
                  )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dailyBudget">Daily Budget</Label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted-foreground text-sm font-medium select-none">
                {
                  currencyData?.find((item) => item.value === watchCurrency)
                    ?.symbol
                }
              </span>
              <Input
                id="dailyBudget"
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
                {...register("dailyBudget")}
                aria-invalid={!!errors.dailyBudget}
                errorTooltip={errors.dailyBudget?.message}
                className="pl-7"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Total Budget</Label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted-foreground text-sm font-medium select-none">
                {
                  currencyData?.find((item) => item.value === watchCurrency)
                    ?.symbol
                }
              </span>
              <Input
                id="budget"
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
                {...register("budget")}
                aria-invalid={!!errors.budget}
                errorTooltip={errors.budget?.message}
                className="pl-7"
              />
            </div>
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

          {/* Scheduling Switch */}
          <div className="space-y-2 col-span-2 flex flex-col justify-end pb-2">
            <Controller
              name="isScheduling"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2.5">
                  <Switch
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
