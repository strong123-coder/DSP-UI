export interface ApiEndpoint {
  name: string;
  path: string;
  hasPathParams?: boolean;
}

export const apiConfig: ApiEndpoint[] = [
  { name: "login", path: "/api/v1/user/login" },
  // super admin
  { name: "superAdminLogin", path: "/api/v1/user/super-admin/login" },
  { name: "superAdminDashboardSummary", path: "/api/v1/super-admin/dashboard/summary" },
  { name: "superAdminOrgs", path: "/api/v1/super-admin/orgs" },
  { name: "superAdminCampaigns", path: "/api/v1/super-admin/campaigns" },
  // bid configuration (super admin only)
  { name: "bidConfigGet", path: "/api/v1/bid-config/get" },
  { name: "bidConfigUpsert", path: "/api/v1/bid-config/upsert" },
  { name: "bidConfigCampaignUpsert", path: "/api/v1/bid-config/campaign/upsert" },
  { name: "bidConfigCampaignRemove", path: "/api/v1/bid-config/campaign/remove" },
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
  {
    name: "deletCampaign",
    path: "/api/v1/campaign/delete/{id}",
    hasPathParams: true,
  },

  { name: "getAppDetails", path: "/api/v1/campaign/app-details" },

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
];
