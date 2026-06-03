import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const CampaignList = React.lazy(() => import("./campaign-list"));

const CampaignListContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CampaignList />
    </Suspense>
  );
};

const CampaignListConfig = {
  path: "/campaign/list",
  title: "Campaign List",
  element: <CampaignListContainer />,
};

export default CampaignListConfig;
