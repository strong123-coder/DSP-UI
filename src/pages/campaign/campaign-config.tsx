import { Navigate } from "react-router";
import CampaignListConfig from "./campaignList/campaign-list-config";
import CampaignAddConfig from "./campaignAdd/campaign-add-config";
import CampaignEditConfig from "./campaignEdit/campaign-edit-config";
import { McpCampaignAddConfig, McpCampaignEditConfig } from "./mcp/mcp-campaign-config";

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
    McpCampaignAddConfig,
    McpCampaignEditConfig,
  ],
};

export default CampaignConfig;
