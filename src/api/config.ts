export interface ApiEndpoint {
  name: string;
  path: string;
  hasPathParams?: boolean;
}

export const apiConfig: ApiEndpoint[] = [
  { name: "login", path: "/api/v1/user/login" },

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
];
