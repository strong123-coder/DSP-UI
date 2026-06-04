import { lazy, Suspense, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useGetSingleCampaign, useEditCampaign } from "@/query/useCampaign";
import {
  editCampaignSchema,
  type EditCampaignFormValues,
} from "@/utils/schemas/campaign";
import LoadingFallback from "@/components/ui/loading-fallback";

const StepObjectiveInfo = lazy(
  () => import("../components/stepComponents/stepObjectiveInfo"),
);
const StepMmpIntegration = lazy(
  () => import("../components/stepComponents/stepMmpIntegrations"),
);
const StepTargeting = lazy(
  () => import("../components/stepComponents/stepTargeting"),
);
const StepInventoryType = lazy(
  () => import("../components/stepComponents/stepInventoryType"),
);
const StepMediaCreatives = lazy(
  () => import("../components/stepComponents/stepMediaCreatives"),
);

const SECTIONS = [
  {
    id: "objective",
    title: "Objective & Details",
    description: "Set campaign target & platform",
    Component: StepObjectiveInfo,
  },
  {
    id: "mmp",
    title: "MMP & Integration",
    description:
      "MMP integration enables accurate tracking, measurement, and optimization of advertising campaigns across multiple channels.",
    Component: StepMmpIntegration,
  },
  {
    id: "targeting",
    title: "Targeting",
    description:
      "The strategic process of locating and reaching particular audiences with information or ads based on behavioral, psychographic, and demographic characteristics.",
    Component: StepTargeting,
  },
  {
    id: "inventory",
    title: "Inventory Type",
    description:
      "Refers to the various forms of advertising space or placements available for purchase or allocation, such as display ads, video ads, or sponsored content.",
    Component: StepInventoryType,
  },
  {
    id: "media",
    title: "Media Creatives",
    description: "Upload creative assets & links",
    Component: StepMediaCreatives,
  },
];

const CamapaingEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: campaignResponse, isLoading } = useGetSingleCampaign(id || "");
  const { mutate: editCampaignMutation, isPending: editCampaignPending } =
    useEditCampaign();

  const methods = useForm<EditCampaignFormValues>({
    resolver: zodResolver(editCampaignSchema),
    defaultValues: {
      title: "",
      type: "mobile",
      goal: "install",
      status: "paused",
      currency: "USD",
      bundleId: "",
      budget: "",
      dailyBudget: "",
      kpi: "",
      isScheduling: false,
      startDate: "",
      endDate: "",
      mmpPlatform: "appsflyer",
      ctaUrl: "",
      vtaUrl: "",
      eventDetails: [],
      geo: [],
      isCustomTargating: false,
      customTargating: [],
      audienceTarget: "all",
      customAudienceIds: [],
      inventoryType: "programmatic",
      oemPremiumPartners: [],
      media: [],
    },
  });

  const { handleSubmit } = methods;

  const campaignData = campaignResponse?.data?.data;

  useEffect(() => {
    if (campaignData) {
      methods.reset({
        title: campaignData.title || "",
        type: campaignData.type || "mobile",
        goal: campaignData.goal || "install",
        status: campaignData.status || "paused",
        currency: campaignData.currency || "USD",
        bundleId: campaignData.bundleId || "",
        budget: campaignData.budget ? String(campaignData.budget) : "",
        dailyBudget: campaignData.dailyBudget
          ? String(campaignData.dailyBudget)
          : "",
        kpi: campaignData.kpi || "",
        isScheduling: campaignData.isScheduling || false,
        startDate: campaignData.startDate || "",
        endDate: campaignData.endDate || "",
        mmpPlatform: campaignData.mmpPlatform || "appsflyer",
        ctaUrl: campaignData.ctaUrl || "",
        vtaUrl: campaignData.vtaUrl || "",
        eventDetails: campaignData.eventDetails || [],
        geo: campaignData.geo || [],
        isCustomTargating: campaignData.isCustomTargating || false,
        customTargating: campaignData.customTargating || [],
        audienceTarget: campaignData.audienceTarget || "all",
        customAudienceIds: campaignData.customAudienceIds || [],
        inventoryType: campaignData.inventoryType || "programmatic",
        oemPremiumPartners: campaignData.oemPremiumPartners || [],
        media: campaignData.media || [],
      });
    }
  }, [campaignData, methods]);

  const onInvalid = (errors: any) => {
    console.log(errors);
    const findFirstError = (obj: any): string | null => {
      if (!obj) return null;
      if (typeof obj === "object" && obj.message) return obj.message;
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (val && typeof val === "object") {
          const result = findFirstError(val);
          if (result) return result;
        }
      }
      return null;
    };

    const firstErrorMessage = findFirstError(errors);
    if (firstErrorMessage) {
      toast.error(firstErrorMessage);
    }
  };

  const onSubmit = (data: EditCampaignFormValues) => {
    const cleanedData = { ...data };

    if (!cleanedData.isScheduling) {
      delete cleanedData.startDate;
      delete cleanedData.endDate;
    } else {
      if (!cleanedData.startDate || cleanedData.startDate.trim() === "") {
        delete cleanedData.startDate;
      }
      if (!cleanedData.endDate || cleanedData.endDate.trim() === "") {
        delete cleanedData.endDate;
      }
    }

    if (!id) {
      toast.error("Campaign ID not found");
      return;
    }

    editCampaignMutation(
      { id, payload: cleanedData },
      {
        onSuccess: () => {
          navigate("/campaign/list");
        },
      },
    );
  };

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col gap-6">
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="space-y-6"
        >
          <div className="w-full space-y-6">
            {SECTIONS.map(({ id, title, description, Component }) => (
              <div
                key={id}
                className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs transition-all duration-200"
              >
                <div className="px-6 py-4 border-b border-border bg-muted/5">
                  <h3 className="text-sm font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {description}
                  </p>
                </div>
                <div className="px-6 py-6 bg-card">
                  <Suspense
                    fallback={
                      <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
                        Loading panel...
                      </div>
                    }
                  >
                    <Component />
                  </Suspense>
                </div>
              </div>
            ))}
          </div>

          {/* Form Action Controls */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/campaign/list")}
              disabled={editCampaignPending}
              className="flex items-center gap-1.5 w-40 justify-center"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={editCampaignPending}
              className="flex items-center gap-1.5 w-40 justify-center"
            >
              {editCampaignPending ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" /> Saving...
                </>
              ) : (
                "Update Campaign"
              )}
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default CamapaingEdit;
