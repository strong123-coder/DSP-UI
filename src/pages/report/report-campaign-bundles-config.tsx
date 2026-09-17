import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const ReportCampaignBundles = React.lazy(() => import("./report-campaign-bundles"));

const ReportCampaignBundlesContainer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ReportCampaignBundles />
    </Suspense>
  );
};

// Opened by clicking a campaign row in the Report.
const ReportCampaignBundlesConfig = {
  path: "/report/campaign/:campaignId",
  title: "Campaign Bundle Breakdown",
  element: <ReportCampaignBundlesContainer />,
};

export default ReportCampaignBundlesConfig;
