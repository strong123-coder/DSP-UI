import React from "react";
import { useFormContext } from "react-hook-form";
import CampaingObjective from "../../components/campaign-objective";
import CampaignDetails from "../../components/campaign-details";
import type { AddCampaignFormValues } from "@/utils/schemas/campaign";

const StepObjectiveInfo: React.FC = () => {
  const { watch, setValue } = useFormContext<AddCampaignFormValues>();
  const watchGoal = watch("goal");

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <CampaingObjective
        selectedGoal={watchGoal || "install"}
        setSelectedGoal={(goal) =>
          setValue("goal", goal, { shouldValidate: true })
        }
      />
      <CampaignDetails />
    </div>
  );
};

export default StepObjectiveInfo;
