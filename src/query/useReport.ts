import { useQuery, useQueryClient } from "@tanstack/react-query";
import { reportService } from "@/services/report";
import { keepPreviousData } from "@tanstack/react-query";
import { useEffect } from "react";

export interface ReportPayload {
  groupBy: string[];
  columns: string[];
  campaignId?: string;
  campaignIds?: string[];
  search?: string;
  preset?: string;
  startDate?: string;
  endDate?: string;
  timezone?: string;
  sortBy?: string;
  sortOrder?: string;
  page: number;
  limit: number;
}

export const useGetReportData = (
  initialized: boolean,
  payload: ReportPayload,
) => {
  return useQuery({
    queryKey: ["reportData", payload],
    queryFn: () => reportService.reportData(payload),
    placeholderData: keepPreviousData,
    enabled: initialized,
  });
};

export const useGetReportPrefetch = (
  isPlaceholderData: boolean,
  totalPages: number,
  page: number,
  limit: number,
  payload: ReportPayload,
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isPlaceholderData) return;

    const query = (pageVal: number) => {
      const nextPayload = { ...payload, page: pageVal };
      queryClient.prefetchQuery({
        queryKey: ["reportData", nextPayload],
        queryFn: () => reportService.reportData(nextPayload),
      });
    };

    if (page < totalPages) {
      query(page + 1);
    }
    if (page === 1 && page + 1 < totalPages) {
      query(page + 2);
    }
    if (page > 1) {
      query(page - 1);
    }
    if (page - 2 > 0 && page === totalPages) {
      query(page - 2);
    }
  }, [isPlaceholderData, totalPages, page, limit, payload, queryClient]);
};
