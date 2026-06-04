import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";
import CampaignEdit from "./campaign-edit";

const CampaignEditContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CampaignEdit />
    </Suspense>
  );
};

const CampaignEditConfig = {
  path: "/campaign/edit/:id",
  title: "Edit Campaign",
  element: <CampaignEditContainer />,
};

export default CampaignEditConfig;
