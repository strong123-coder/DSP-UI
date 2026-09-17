import { apiClient } from "@/api/apiClient";

export const reportService = {
  reportData: async (payload?: object) => {
    const response = await apiClient().post("reportData", payload);
    return response.data;
  },
  // Campaign drill-down: one campaign's delivery grouped by supply bundleId.
  campaignBundles: async (payload?: object) => {
    const response = await apiClient().post("reportCampaignBundles", payload);
    return response.data;
  },
};
