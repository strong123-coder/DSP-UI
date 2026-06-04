import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  dashboardService,
  type DashboardSummaryParams,
  type DashboardPerformanceParams,
  type DashboardGoalReportParams,
  type DashboardTopCampaignsParams,
} from "@/services/dashboard";

export const useGetDashboardSummary = (
  initialized: boolean,
  payload: DashboardSummaryParams,
) => {
  return useQuery({
    queryKey: [
      "dashboardSummary",
      payload?.preset,
      payload?.startDate,
      payload?.endDate,
      payload?.campaignId,
    ],
    queryFn: () => dashboardService.summary(payload),
    placeholderData: keepPreviousData,
    enabled: initialized,
  });
};

export const useGetDashboardPerformance = (
  initialized: boolean,
  payload: DashboardPerformanceParams,
) => {
  return useQuery({
    queryKey: [
      "dashboardPerformance",
      payload?.preset,
      payload?.startDate,
      payload?.endDate,
      payload?.campaignId,
      payload?.metric,
    ],
    queryFn: () => dashboardService.performance(payload),
    placeholderData: keepPreviousData,
    enabled: initialized,
  });
};

export const useGetDashboardGoalReport = (
  initialized: boolean,
  payload: DashboardGoalReportParams,
) => {
  return useQuery({
    queryKey: [
      "dashboardGoalReport",
      payload?.preset,
      payload?.startDate,
      payload?.endDate,
      payload?.campaignId,
    ],
    queryFn: () => dashboardService.goalReport(payload),
    placeholderData: keepPreviousData,
    enabled: initialized,
  });
};

export const useGetDashboardTopCampaigns = (
  initialized: boolean,
  payload: DashboardTopCampaignsParams,
) => {
  return useQuery({
    queryKey: [
      "dashboardTopCampaigns",
      payload?.preset,
      payload?.startDate,
      payload?.endDate,
      payload?.sortBy,
      payload?.limit,
    ],
    queryFn: () => dashboardService.topCampaigns(payload),
    placeholderData: keepPreviousData,
    enabled: initialized,
  });
};

