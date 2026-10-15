import { useState, lazy, Suspense, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useGetSingleCampaign, useEditCampaign } from "@/query/useCampaign";
import {
  editCampaignSchema,
  type EditCampaignFormValues,
} from "@/utils/schemas/campaign";
import LoadingFallback from "@/components/ui/loading-fallback";
import UpdatePopupModal from "@/components/popupModals/update-popup-modal";
import { FormModeContext } from "@/utils/context/FormModeContext";

const StepObjectiveInfo = lazy(
  () => import("../components/stepComponents/stepObjectiveInfo"),
);
const StepMmpIntegration = lazy(
  () => import("../components/stepComponents/stepMmpIntegrations"),
);

// Targeting, bids and creatives are edited per line item (campaign page →
// line item), not here.
const SECTIONS = [
  {
    id: "objective",
    title: "Objective & Details",
    description: "Advertiser, campaign target & platform, budget",
    Component: StepObjectiveInfo,
  },
  {
    id: "mmp",
    title: "MMP & Integration",
    description:
      "MMP integration enables accurate tracking, measurement, and optimization of advertising campaigns across multiple channels.",
    Component: StepMmpIntegration,
  },
];

const ORDERED_FIELDS = [
  "advertiserId",
  "title",
  "goal",
  "appOs",
  "bundleId",
  "appName",
  "appIconLink",
  "budget",
  "dailyBudget",
  "kpi",
  "isScheduling",
  "startDate",
  "endDate",
  "mmpPlatform",
  "ctaUrl",
  "vtaUrl",
  "eventDetails",
];

const CamapaingEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: campaignResponse, isLoading } = useGetSingleCampaign(id || "");
  const { mutate: editCampaignMutation, isPending: editCampaignPending } =
    useEditCampaign();

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [formData, setFormData] = useState<EditCampaignFormValues | null>(null);

  const methods = useForm<EditCampaignFormValues>({
    resolver: zodResolver(editCampaignSchema),
    defaultValues: {
      advertiserId: "",
      title: "",
      type: "mobile",
      goal: "install",
      status: "paused",
      currency: "USD",
      bundleId: "",
      budget: "",
      dailyBudget: "",
      budgetType: "spend",
      alternativeId: "",
      notes: "",
      kpi: "",
      isScheduling: false,
      startDate: "",
      endDate: "",
      mmpPlatform: "appsflyer",
      ctaUrl: "",
      vtaUrl: "",
      eventDetails: [],
    },
  });

  const { handleSubmit } = methods;
  const campaignData = campaignResponse?.data?.data;

  useEffect(() => {
    if (campaignData) {
      methods.reset({
        advertiserId: campaignData.advertiserId || "",
        title: campaignData.title || "",
        type: campaignData.type || "mobile",
        goal: campaignData.goal || "install",
        status: campaignData.status || "paused",
        currency: campaignData.currency || "USD",
        appOs: campaignData.appOs || "",
        appIconLink: campaignData.appIconLink || "",
        appName: campaignData.appName || "",
        bundleId: campaignData.bundleId || "",
        budget: campaignData.budget ? String(campaignData.budget) : "",
        dailyBudget: campaignData.dailyBudget ? String(campaignData.dailyBudget) : "",
        budgetType: campaignData.budgetType || "spend",
        alternativeId: campaignData.alternativeId || "",
        notes: campaignData.notes || "",
        kpi: campaignData.kpi || "",
        isScheduling: campaignData.isScheduling || false,
        startDate: campaignData.startDate || "",
        endDate: campaignData.endDate || "",
        mmpPlatform: campaignData.mmpPlatform || "appsflyer",
        ctaUrl: campaignData.ctaUrl || "",
        vtaUrl: campaignData.vtaUrl || "",
        eventDetails: campaignData.eventDetails || [],
      });
    }
  }, [campaignData, methods]);

  const onInvalid = (errors: any) => {
    const getFirstVisualError = (errorsObj: any) => {
      for (const field of ORDERED_FIELDS) {
        if (errorsObj[field]) {
          if (Array.isArray(errorsObj[field])) {
            const firstErrIndex = errorsObj[field].findIndex(
              (err: any) => err !== undefined && err !== null
            );
            if (firstErrIndex !== -1) {
              const errObj = errorsObj[field][firstErrIndex];
              for (const key of Object.keys(errObj)) {
                if (errObj[key]?.message) {
                  return { message: errObj[key].message, path: `${field}.${firstErrIndex}.${key}` };
                }
              }
            }
          }
          if (errorsObj[field].message) {
            return { message: errorsObj[field].message, path: field };
          }
        }
      }
      return null;
    };

    const firstError = getFirstVisualError(errors);
    if (firstError) {
      toast.error(firstError.message);
      setTimeout(() => {
        methods.setFocus(firstError.path as any);
      }, 0);
    }
  };

  const onSubmit = (data: EditCampaignFormValues) => {
    const cleanedData = { ...data };
    if (!cleanedData.isScheduling) {
      delete cleanedData.startDate;
      delete cleanedData.endDate;
    } else {
      if (!cleanedData.startDate || cleanedData.startDate.trim() === "") delete cleanedData.startDate;
      if (!cleanedData.endDate || cleanedData.endDate.trim() === "") delete cleanedData.endDate;
    }
    if (!id) {
      toast.error("Campaign ID not found");
      return;
    }
    setFormData(cleanedData);
    setShowUpdateModal(true);
  };

  if (isLoading || !campaignData) {
    return <LoadingFallback />;
  }

  return (
    <FormModeContext.Provider value="edit">
      <FormProvider {...methods}>
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
            <div className="w-full space-y-6">
              {SECTIONS.map(({ id: secId, title, description, Component }) => (
                <div
                  key={secId}
                  className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs transition-all duration-200"
                >
                  <div className="px-6 py-4 border-b border-border bg-muted/5">
                    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
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

            <div className="flex justify-end items-center gap-3 pt-4 mb-10 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/campaign/view/${id}`)}
                disabled={editCampaignPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={editCampaignPending}>
                Update Campaign
              </Button>
            </div>
          </form>
        </div>

        <UpdatePopupModal
          isOpen={showUpdateModal}
          title={<strong>Update Campaign</strong>}
          description={
            <span>
              Are you sure you want to update the campaign{" "}
              <strong>{campaignData?.title}</strong>? This will apply all
              changes immediately.
            </span>
          }
          cancelButtonAction={() => {
            setShowUpdateModal(false);
            setFormData(null);
          }}
          updateButtonAction={() => {
            if (formData && id) {
              editCampaignMutation(
                { id, payload: formData },
                {
                  onSuccess: () => {
                    setShowUpdateModal(false);
                    setFormData(null);
                    navigate(`/campaign/view/${id}`);
                  },
                },
              );
            }
          }}
          isUpdating={editCampaignPending}
        />
      </FormProvider>
    </FormModeContext.Provider>
  );
};

export default CamapaingEdit;
