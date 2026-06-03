import { Navigate } from "react-router";
import CampaignListConfig from "./campaingList/campaign-list-config";
import CampaignAddConfig from "./campaingAdd/campaign-add-config";

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
