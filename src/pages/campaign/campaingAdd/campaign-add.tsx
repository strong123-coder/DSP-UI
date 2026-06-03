import { useState, lazy, Suspense } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

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
const StepObjectiveInfo = lazy(() => import("./components/StepObjectiveInfo"));
const StepMmpIntegration = lazy(
  () => import("./components/StepMmpIntegrations"),
);
const StepTargeting = lazy(() => import("./components/StepTargeting"));
const StepInventoryType = lazy(() => import("./components/StepInventoryType"));
const StepMediaCreatives = lazy(
  () => import("./components/StepMediaCreatives"),
);

const STEPS = [
  {
    id: 1,
    label: "Objective & Details",
    description: "Set campaign target & platform",
  },
  {
    id: 2,
    label: "MMP & Integration",
    description:
      "MMP integration enables accurate tracking, measurement, and optimization of advertising campaigns across multiple channels.",
  },
  {
    id: 3,
    label: "Targeting",
    description:
      "The strategic process of locating and reaching particular audiences with information or ads that is suited to them based on behavioral, psychographic, and demographic characteristics.",
  },
  {
    id: 4,
    label: "Inventroy Type",
    description:
      "Refers to the various forms of advertising space or placements available for purchase or allocation, such as display ads, video ads, or sponsored content.",
  },

  {
    id: 5,
    label: "Media Creatives",
    description: "Upload creative assets & links",
  },
];

const CamapaingAdd = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const { mutate: addCampaignMutation, isPending: addCampaignPending } =
    useAddCampaign();

  const methods = useForm<AddCampaignFormValues>({
    resolver: zodResolver(addCampaignSchema),
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

  const { handleSubmit, trigger } = methods;

  const nextStep = async () => {
    let fieldsToValidate: (keyof AddCampaignFormValues)[] = [];

    if (step === 1) {
      fieldsToValidate = [
        "goal",
        "title",
        "bundleId",
        "dailyBudget",
        "budget",
        "kpi",
        "isScheduling",
        "startDate",
        "endDate",
        "currency",
        "type",
      ];
    } else if (step === 2) {
      fieldsToValidate = ["mmpPlatform", "ctaUrl", "vtaUrl", "eventDetails"];
    } else if (step === 3) {
      fieldsToValidate = [
        "geo",
        "isCustomTargating",
        "customTargating",
        "audienceTarget",
        "customAudienceIds",
      ];
    } else if (step === 4) {
      fieldsToValidate = ["inventoryType", "oemPremiumPartners"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      const nextStepVal = step + 1;
      setStep(nextStepVal);
      if (nextStepVal > maxStepReached) {
        setMaxStepReached(nextStepVal);
      }
    } else {
      onInvalid(methods.formState.errors);
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const onInvalid = (errors: any) => {
    console.log(errors);
    // Helper to find the first error message in the validation error tree
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

  const handleButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (step < STEPS.length) {
      await nextStep();
    } else {
      handleSubmit(onSubmit, onInvalid)();
    }
  };

  const onSubmit = (data: AddCampaignFormValues) => {
    const cleanedData = { ...data };

    // Remove dates from the payload if scheduling is disabled, or if they are empty
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

    addCampaignMutation(cleanedData, {
      onSuccess: () => {
        navigate("/campaign/list");
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col gap-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step === STEPS.length) {
              handleSubmit(onSubmit, onInvalid)(e);
            }
          }}
          className="space-y-6"
        >
          <Accordion
            type="single"
            value={`step-${step}`}
            onValueChange={(val) => {
              if (val) {
                const stepNum = parseInt(val.replace("step-", ""), 10);
                if (stepNum <= maxStepReached) {
                  setStep(stepNum);
                }
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
                        <p className="text-sm font-semibold text-foreground">
                          {s.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.description}
                        </p>
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
                      {s.id === 3 && <StepTargeting />}
                      {s.id === 4 && <StepInventoryType />}
                      {s.id === 5 && <StepMediaCreatives />}
                    </Suspense>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Form Action Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1 || addCampaignPending}
              className="flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>

            <Button
              type="button"
              onClick={handleButtonClick}
              disabled={addCampaignPending}
              className="flex items-center gap-1.5 w-36 justify-center animate-in fade-in duration-200"
            >
              {step < STEPS.length ? (
                <>
                  Next <ArrowRight className="w-4 h-4" />
                </>
              ) : addCampaignPending ? (
                "Creating..."
              ) : (
                "Create Campaign"
              )}
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default CamapaingAdd;
