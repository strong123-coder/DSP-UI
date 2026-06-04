import { apiClient } from "@/api/apiClient";

export interface DashboardSummaryParams {
  preset?: string;
  startDate?: string;
  endDate?: string;
  campaignId?: string;
}

export interface DashboardPerformanceParams {
  preset?: string;
  startDate?: string;
  endDate?: string;
  campaignId?: string;
  metric?: string;
}

export interface DashboardGoalReportParams {
  preset?: string;
  startDate?: string;
  endDate?: string;
  campaignId?: string;
}

export interface DashboardTopCampaignsParams {
  preset?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  limit?: number;
}

export const dashboardService = {
  summary: async (params?: DashboardSummaryParams) => {
    const response = await apiClient().get("dashboardSummary", params);
    return response.data;
  },
  performance: async (params?: DashboardPerformanceParams) => {
    const response = await apiClient().get("dashboardPerformance", params);
    return response.data;
  },
  goalReport: async (params?: DashboardGoalReportParams) => {
    const response = await apiClient().get("dashboardGoalReport", params);
    return response.data;
  },
  topCampaigns: async (params?: DashboardTopCampaignsParams) => {
    const response = await apiClient().get("dashboardTopCampaigns", params);
    return response.data;
  },
};
