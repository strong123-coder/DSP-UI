export interface ApiEndpoint {
  name: string;
  path: string;
  hasPathParams?: boolean;
}

export const apiConfig: ApiEndpoint[] = [
  { name: "login", path: "/api/v1/user/login" },
  // MCP publishers (supply login)
  { name: "supplyLogin", path: "/api/v1/user/supply/login" },
  { name: "supplySignup", path: "/api/v1/user/supply/signup" },
  { name: "mcpCategories", path: "/api/v1/mcp-publisher/categories" },
  { name: "mcpServerList", path: "/api/v1/mcp-publisher/servers" },
  { name: "mcpServerCreate", path: "/api/v1/mcp-publisher/servers" },
  { name: "mcpServerGet", path: "/api/v1/mcp-publisher/servers/{id}", hasPathParams: true },
  { name: "mcpServerUpdate", path: "/api/v1/mcp-publisher/servers/{id}", hasPathParams: true },
  { name: "mcpServerDelete", path: "/api/v1/mcp-publisher/servers/{id}", hasPathParams: true },
  { name: "mcpServerSubmit", path: "/api/v1/mcp-publisher/servers/{id}/submit", hasPathParams: true },
  { name: "mcpServerStatus", path: "/api/v1/mcp-publisher/servers/{id}/status", hasPathParams: true },
  { name: "mcpKeyList", path: "/api/v1/mcp-publisher/servers/{id}/keys", hasPathParams: true },
  { name: "mcpKeyCreate", path: "/api/v1/mcp-publisher/servers/{id}/keys", hasPathParams: true },
  { name: "mcpKeyRevoke", path: "/api/v1/mcp-publisher/servers/{id}/keys/{keyId}", hasPathParams: true },
  { name: "mcpIntegration", path: "/api/v1/mcp-publisher/servers/{id}/integration", hasPathParams: true },
  // MCP review (super admin only)
  { name: "mcpReviewServers", path: "/api/v1/mcp-review/servers" },
  { name: "mcpReviewServerDecision", path: "/api/v1/mcp-review/servers/{id}/decision", hasPathParams: true },
  { name: "mcpReviewCampaigns", path: "/api/v1/mcp-review/campaigns" },
  { name: "mcpReviewCampaignDecision", path: "/api/v1/mcp-review/campaigns/{id}/decision", hasPathParams: true },
  { name: "mcpReviewCampaignConfig", path: "/api/v1/mcp-review/campaigns/{id}/config", hasPathParams: true },
  { name: "mcpReviewCategories", path: "/api/v1/mcp-review/categories" },
  // super admin
  { name: "superAdminLogin", path: "/api/v1/user/super-admin/login" },
  { name: "superAdminDashboardSummary", path: "/api/v1/super-admin/dashboard/summary" },
  { name: "superAdminOrgs", path: "/api/v1/super-admin/orgs" },
  { name: "superAdminCampaigns", path: "/api/v1/super-admin/campaigns" },
  { name: "superAdminEngineCounts", path: "/api/v1/super-admin/engine-counts" },
  { name: "superAdminReport", path: "/api/v1/super-admin/report" },
  // demand partners (super admin only)
  { name: "demandList", path: "/api/v1/demand" },
  { name: "demandCreate", path: "/api/v1/demand" },
  { name: "demandGet", path: "/api/v1/demand/{id}", hasPathParams: true },
  { name: "demandUpdate", path: "/api/v1/demand/{id}", hasPathParams: true },
  { name: "demandStatus", path: "/api/v1/demand/{id}/status", hasPathParams: true },
  { name: "demandDelete", path: "/api/v1/demand/{id}", hasPathParams: true },
  // supply partners (super admin only)
  { name: "supplyList", path: "/api/v1/supply" },
  { name: "supplyCreate", path: "/api/v1/supply" },
  { name: "supplyGet", path: "/api/v1/supply/{id}", hasPathParams: true },
  { name: "supplyUpdate", path: "/api/v1/supply/{id}", hasPathParams: true },
  { name: "supplyStatus", path: "/api/v1/supply/{id}/status", hasPathParams: true },
  { name: "supplyDelete", path: "/api/v1/supply/{id}", hasPathParams: true },
  // bid configuration (super admin only)
  { name: "bidConfigGet", path: "/api/v1/bid-config/get" },
  { name: "bidConfigUpsert", path: "/api/v1/bid-config/upsert" },
  { name: "bidConfigCampaignUpsert", path: "/api/v1/bid-config/campaign/upsert" },
  { name: "bidConfigCampaignRemove", path: "/api/v1/bid-config/campaign/remove" },
  { name: "bidConfigCampaignEnableBidding", path: "/api/v1/bid-config/campaign/enable-bidding" },
  // user managment
  { name: "userProfile", path: "/api/v1/user/profile" },
  { name: "updateProfilePic", path: "/api/v1/user/update-profile-pic" },
  { name: "getOrgConfig", path: "/api/v1/org/config-by-id" },
  { name: "orgList", path: "/api/v1/org/list" },
  { name: "userList", path: "/api/v1/user/list" },
  { name: "addUser", path: "/api/v1/user/create" },
  {
    name: "getUser",
    path: "/api/v1/user/get/{id}",
    hasPathParams: true,
  },
  {
    name: "editUser",
    path: "/api/v1/user/update/{id}",
    hasPathParams: true,
  },
  {
    name: "deleteUser",
    path: "/api/v1/user/delete/{id}",
    hasPathParams: true,
  },

  { name: "addCampaign", path: "/api/v1/campaign/add" },
  { name: "campaignList", path: "/api/v1/campaign/list" },
  { name: "campaignOptions", path: "/api/v1/campaign/options" },
  {
    name: "getCampaign",
    path: "/api/v1/campaign/get/{id}",
    hasPathParams: true,
  },
  {
    name: "editCampaign",
    path: "/api/v1/campaign/update/{id}",
    hasPathParams: true,
  },
  {
    name: "updateCampaignStatus",
    path: "/api/v1/campaign/status/{id}",
    hasPathParams: true,
  },
  // advertiser opt-in to the MCP bidder
  {
    name: "setCampaignMcp",
    path: "/api/v1/campaign/mcp/{id}",
    hasPathParams: true,
  },
  {
    name: "deletCampaign",
    path: "/api/v1/campaign/delete/{id}",
    hasPathParams: true,
  },

  { name: "getAppDetails", path: "/api/v1/campaign/app-details" },
  // advertisers (org → advertiser → campaign → line item)
  { name: "advertiserList", path: "/api/v1/advertiser/list" },
  { name: "advertiserOptions", path: "/api/v1/advertiser/options" },
  { name: "advertiserCategories", path: "/api/v1/advertiser/categories" },
  { name: "advertiserGet", path: "/api/v1/advertiser/get/{id}", hasPathParams: true },
  { name: "advertiserAdd", path: "/api/v1/advertiser/add" },
  { name: "advertiserUpdate", path: "/api/v1/advertiser/update/{id}", hasPathParams: true },
  { name: "advertiserStatus", path: "/api/v1/advertiser/status/{id}", hasPathParams: true },
  { name: "advertiserDelete", path: "/api/v1/advertiser/delete/{id}", hasPathParams: true },
  // networks (org → network → advertiser); org users only, except networkCurrent
  { name: "networkCurrent", path: "/api/v1/network/current" },
  { name: "networkList", path: "/api/v1/network/list" },
  { name: "networkOptions", path: "/api/v1/network/options" },
  { name: "networkGet", path: "/api/v1/network/get/{id}", hasPathParams: true },
  { name: "networkAdd", path: "/api/v1/network/add" },
  { name: "networkUpdate", path: "/api/v1/network/update/{id}", hasPathParams: true },
  { name: "networkStatus", path: "/api/v1/network/status/{id}", hasPathParams: true },
  { name: "networkDelete", path: "/api/v1/network/delete/{id}", hasPathParams: true },
  // the org's approval of what networks create or change
  { name: "approvalQueue", path: "/api/v1/approval/queue" },
  { name: "approvalCount", path: "/api/v1/approval/count" },
  { name: "approvalReview", path: "/api/v1/approval/review" },
  { name: "approvalResubmit", path: "/api/v1/approval/resubmit" },
  // the signed-in user's own permission checklist (org / network team members)
  { name: "userConfigMe", path: "/api/v1/user-config/me" },
  // line items
  { name: "lineItemList", path: "/api/v1/line-item/list" },
  { name: "lineItemGet", path: "/api/v1/line-item/get/{id}", hasPathParams: true },
  { name: "lineItemAdd", path: "/api/v1/line-item/add" },
  { name: "lineItemUpdate", path: "/api/v1/line-item/update/{id}", hasPathParams: true },
  { name: "lineItemStatus", path: "/api/v1/line-item/status/{id}", hasPathParams: true },
  { name: "lineItemDelete", path: "/api/v1/line-item/delete/{id}", hasPathParams: true },
  { name: "lineItemTargetingOptions", path: "/api/v1/line-item/targeting-options" },
  // reusable targeting lists (bundles / domains)
  { name: "targetingListList", path: "/api/v1/targeting-list/list" },
  { name: "targetingListOptions", path: "/api/v1/targeting-list/options" },
  { name: "targetingListGet", path: "/api/v1/targeting-list/get/{id}", hasPathParams: true },
  { name: "targetingListAdd", path: "/api/v1/targeting-list/add" },
  { name: "targetingListUpdate", path: "/api/v1/targeting-list/update/{id}", hasPathParams: true },
  { name: "targetingListDelete", path: "/api/v1/targeting-list/delete/{id}", hasPathParams: true },
  // bid modifiers (per advertiser)
  { name: "bidModifierFields", path: "/api/v1/bid-modifier/fields" },
  { name: "bidModifierList", path: "/api/v1/bid-modifier/list" },
  { name: "bidModifierOptions", path: "/api/v1/bid-modifier/options" },
  { name: "bidModifierGet", path: "/api/v1/bid-modifier/get/{id}", hasPathParams: true },
  { name: "bidModifierAdd", path: "/api/v1/bid-modifier/add" },
  { name: "bidModifierUpdate", path: "/api/v1/bid-modifier/update/{id}", hasPathParams: true },
  { name: "bidModifierDelete", path: "/api/v1/bid-modifier/delete/{id}", hasPathParams: true },
  // delivery modifiers (per advertiser; condition fields come from bidModifierFields)
  { name: "deliveryModifierList", path: "/api/v1/delivery-modifier/list" },
  { name: "deliveryModifierOptions", path: "/api/v1/delivery-modifier/options" },
  { name: "deliveryModifierGet", path: "/api/v1/delivery-modifier/get/{id}", hasPathParams: true },
  { name: "deliveryModifierAdd", path: "/api/v1/delivery-modifier/add" },
  { name: "deliveryModifierUpdate", path: "/api/v1/delivery-modifier/update/{id}", hasPathParams: true },
  { name: "deliveryModifierDelete", path: "/api/v1/delivery-modifier/delete/{id}", hasPathParams: true },
  // presets (campaign / line item / targeting)
  { name: "presetList", path: "/api/v1/preset/list" },
  { name: "presetOptions", path: "/api/v1/preset/options" },
  { name: "presetGet", path: "/api/v1/preset/get/{id}", hasPathParams: true },
  { name: "presetAdd", path: "/api/v1/preset/add" },
  { name: "presetUpdate", path: "/api/v1/preset/update/{id}", hasPathParams: true },
  { name: "presetDelete", path: "/api/v1/preset/delete/{id}", hasPathParams: true },
  // creatives (advertiser library)
  { name: "creativeList", path: "/api/v1/creative/list" },
  { name: "creativeAdd", path: "/api/v1/creative/add" },
  { name: "creativeUpdate", path: "/api/v1/creative/update/{id}", hasPathParams: true },
  { name: "creativeDelete", path: "/api/v1/creative/delete/{id}", hasPathParams: true },

  // media

  { name: "addMedia", path: "/api/v1/media/add" },
  { name: "deleteMedias", path: "/api/v1/media/delete-many" },
  {
    name: "deleteMedia",
    path: "/api/v1/media/delete/{id}",
    hasPathParams: true,
  },
  { name: "dashboardSummary", path: "/api/v1/dashboard/summary" },
  { name: "dashboardPerformance", path: "/api/v1/dashboard/performance" },
  { name: "dashboardGoalReport", path: "/api/v1/dashboard/goal-report" },
  { name: "dashboardTopCampaigns", path: "/api/v1/dashboard/top-campaigns" },
  { name: "reportData", path: "/api/v1/report/data" },
  // campaign drill-down: one campaign's delivery grouped by supply bundleId
  { name: "reportCampaignBundles", path: "/api/v1/report/campaign-bundles" },
];
