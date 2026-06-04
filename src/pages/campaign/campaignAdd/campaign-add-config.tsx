import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";
import CamapaingAdd from "./campaign-add";

const CampaignAddContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CamapaingAdd />
    </Suspense>
  );
};

const CampaignAddConfig = {
  path: "/campaign/add",
  title: "Add Campaign",
  element: <CampaignAddContainer />,
};

export default CampaignAddConfig;
