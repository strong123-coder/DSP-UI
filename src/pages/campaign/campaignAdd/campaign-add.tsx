import { useState, lazy, Suspense } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { FormModeContext } from "@/utils/context/FormModeContext";

import { Button } from "@/components/ui/button";
import { useAddCampaign } from "@/query/useCampaign";
import {
  addCampaignSchema,
  type AddCampaignFormValues,
} from "@/utils/schemas/campaign";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CurrencyType } from "@/utils/data/data";
const StepObjectiveInfo = lazy(
  () => import("../components/stepComponents/stepObjectiveInfo"),
);
const StepMmpIntegration = lazy(
  () => import("../components/stepComponents/stepMmpIntegrations"),
);

// Campaign = the envelope: advertiser, app, goal, budget, flight, tracking.
// Targeting, bids and creatives are set per line item after the campaign is
// created (Advertiser → Campaign → Line Item).
const STEPS = [
  {
    id: 1,
    label: "Objective & Details",
    description: "Advertiser, campaign target & platform, budget",
  },
  {
    id: 2,
    label: "MMP & Integration",
    description:
      "MMP integration enables accurate tracking, measurement, and optimization of advertising campaigns across multiple channels.",
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

const CamapaingAdd = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const { mutate: addCampaignMutation, isPending: addCampaignPending } =
    useAddCampaign();

  const methods = useForm<AddCampaignFormValues>({
    resolver: zodResolver(addCampaignSchema),
    defaultValues: {
      // Opened from an advertiser's page → that advertiser is preselected.
      advertiserId: searchParams.get("advertiserId") || "",
      title: "",
      type: "mobile",
      goal: "install",
      status: "paused",
      currency: CurrencyType.USD,
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
      eventDetails: [
        {
          name: "Install",
          bidPrice: "",
          currency: CurrencyType.USD,
        },
      ],
    },
  });

  const { handleSubmit, trigger } = methods;

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

  const onInvalid = (errors: any) => {
    const firstError = getFirstVisualError(errors);
    if (firstError) {
      toast.error(firstError.message);
      // Wait for React Hook Form's native focus to fire, then override it.
      setTimeout(() => {
        methods.setFocus(firstError.path as any);
      }, 0);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate: (keyof AddCampaignFormValues)[] = [
      "advertiserId",
      "goal",
      "title",
      "appOs",
      "appIconLink",
      "appName",
      "bundleId",
      "dailyBudget",
      "budget",
      "budgetType",
      "kpi",
      "isScheduling",
      "startDate",
      "endDate",
      "currency",
      "type",
    ];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(2);
      setMaxStepReached(2);
    } else {
      const stepErrors: any = {};
      fieldsToValidate.forEach((field) => {
        if (methods.formState.errors[field]) stepErrors[field] = methods.formState.errors[field];
      });
      onInvalid(stepErrors);
    }
  };

  const onSubmit = (data: AddCampaignFormValues) => {
    const cleanedData = { ...data };

    // Remove dates from the payload if scheduling is disabled, or if they are empty
    if (!cleanedData.isScheduling) {
      delete cleanedData.startDate;
      delete cleanedData.endDate;
    } else {
      if (!cleanedData.startDate || cleanedData.startDate.trim() === "") delete cleanedData.startDate;
      if (!cleanedData.endDate || cleanedData.endDate.trim() === "") delete cleanedData.endDate;
    }

    addCampaignMutation(cleanedData, {
      onSuccess: (response: any) => {
        // Next step in the flow: add the campaign's line items.
        const id = response?.data?.data?._id;
        navigate(id ? `/campaign/view/${id}` : "/campaign/list");
      },
    });
  };

  const handleButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (step < STEPS.length) await nextStep();
    else handleSubmit(onSubmit, onInvalid)();
  };

  return (
    <FormModeContext.Provider value="add">
      <FormProvider {...methods}>
        <div className="flex flex-col gap-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step === STEPS.length) handleSubmit(onSubmit, onInvalid)(e);
            }}
            className="space-y-6"
          >
            <Accordion
              type="single"
              value={`step-${step}`}
              onValueChange={(val) => {
                if (val) {
                  const stepNum = parseInt(val.replace("step-", ""), 10);
                  if (stepNum <= maxStepReached) setStep(stepNum);
                }
              }}
              className="w-full space-y-4 border-none"
            >
              {STEPS.filter((s) => s.id <= maxStepReached).map((s) => {
                const isCompleted = maxStepReached > s.id;
                const isActive = step === s.id;
                return (
                  <AccordionItem
                    key={s.id}
                    value={`step-${s.id}`}
                    className="border border-border rounded-2xl overflow-hidden bg-card data-open:bg-card shadow-xs transition-all duration-200"
                  >
                    <AccordionTrigger className="hover:no-underline px-6 py-4 flex items-center justify-between data-[state=open]:bg-muted/10">
                      <div className="flex items-center gap-4 text-left">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all duration-300 ${
                            isCompleted
                              ? "bg-primary border-primary text-primary-foreground"
                              : isActive
                                ? "bg-background border-primary text-primary shadow-xs ring-4 ring-primary/10"
                                : "bg-muted border-border text-muted-foreground"
                          }`}
                        >
                          {isCompleted ? <Check className="w-4 h-4" /> : s.id}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{s.label}</p>
                          <p className="text-xs text-muted-foreground">{s.description}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 py-6 border-t border-border bg-card">
                      <Suspense
                        fallback={
                          <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
                            Loading setup panel...
                          </div>
                        }
                      >
                        {s.id === 1 && <StepObjectiveInfo />}
                        {s.id === 2 && <StepMmpIntegration />}
                      </Suspense>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            <p className="text-xs text-muted-foreground">
              After the campaign is created you'll add its line items: targeting, bid, and creatives.
            </p>

            {/* Form Action Controls */}
            <div className="flex justify-between items-center pt-4 mb-10 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                disabled={step === 1 || addCampaignPending}
                className="flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>

              <Button
                type="button"
                onClick={handleButtonClick}
                disabled={addCampaignPending}
                className="flex items-center gap-1.5 justify-center animate-in fade-in duration-200"
              >
                {step < STEPS.length ? (
                  <>
                    Next <ArrowRight className="w-4 h-4" />
                  </>
                ) : addCampaignPending ? (
                  "Creating..."
                ) : (
                  "Create & add line items"
                )}
              </Button>
            </div>
          </form>
        </div>
      </FormProvider>
    </FormModeContext.Provider>
  );
};

export default CamapaingAdd;
