import { Navigate } from "react-router";
import CampaignListConfig from "./campaignList/campaign-list-config";
import CampaignAddConfig from "./campaignAdd/campaign-add-config";

const CampaignConfig = {
  path: "/campaign",
  title: "Campaign",
  children: [
    {
      index: true,
      element: <Navigate to="/campaign/list" replace />,
    },
    CampaignListConfig,
    CampaignAddConfig,
  ],
};

export default CampaignConfig;
