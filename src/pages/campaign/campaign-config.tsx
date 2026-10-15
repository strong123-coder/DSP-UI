import { Navigate } from "react-router";
import CampaignListConfig from "./campaignList/campaign-list-config";
import CampaignAddConfig from "./campaignAdd/campaign-add-config";
import CampaignEditConfig from "./campaignEdit/campaign-edit-config";
import { CampaignViewConfig, LineItemNewConfig, LineItemEditConfig } from "./campaignView/campaign-view-config";

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
    CampaignEditConfig,
    CampaignViewConfig,
    LineItemNewConfig,
    LineItemEditConfig,
  ],
};

export default CampaignConfig;
