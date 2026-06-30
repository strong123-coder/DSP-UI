import { apiClient } from "@/api/apiClient";

export interface SuperAdminRangeParams {
  preset?: string;
  startDate?: string;
  endDate?: string;
}

export const superAdminService = {
  // All-orgs aggregated stat cards + platform org/campaign counts.
  dashboardSummary: async (params?: SuperAdminRangeParams) => {
    const response = await apiClient().get("superAdminDashboardSummary", params);
    return response.data;
  },
  // Per-org rollup rows for the org table.
  orgs: async (params?: SuperAdminRangeParams) => {
    const response = await apiClient().get("superAdminOrgs", params);
    return response.data;
  },
  // Live bid-engine counters (total + today), proxied through the backend.
  engineCounts: async () => {
    const response = await apiClient().get("superAdminEngineCounts");
    return response.data;
  },
};
