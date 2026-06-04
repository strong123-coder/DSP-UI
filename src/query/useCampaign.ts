import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { campaignService } from "@/services/campaign";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { extractApiErrors } from "@/utils/getErrorMessage";
import type { AddCampaignFormValues, EditCampaignFormValues } from "@/utils/schemas/campaign";

export const useAddCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddCampaignFormValues) =>
      campaignService.addCampaign(payload),
    onSuccess: (response: any) => {
      const message =
        response?.message ||
        response?.data?.message ||
        "Campaign created successfully";
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (
      error: AxiosError<{ message?: string; data?: { message?: string } }>,
    ) => {
      const errorMsg = extractApiErrors(error.response?.data);
      errorMsg.forEach((msg) => toast.error(msg));
    },
  });
};

export const useGetSingleCampaign = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: () => campaignService.getCampaign(id),
    enabled: enabled && !!id,
  });
};

export const useEditCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditCampaignFormValues }) =>
      campaignService.editCampaign(id, payload),
    onSuccess: (response: any, variables) => {
      const message =
        response?.message ||
        response?.data?.message ||
        "Campaign updated successfully";
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["campaign", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (
      error: AxiosError<{ message?: string; data?: { message?: string } }>,
    ) => {
      const errorMsg = extractApiErrors(error.response?.data);
      errorMsg.forEach((msg) => toast.error(msg));
    },
  });
};

import { useEffect } from "react";
import { keepPreviousData } from "@tanstack/react-query";

export const useGetCampaign = (
  initialized: boolean,
  payload: {
    page: number;
    limit: number;
    search?: string;
    type?: string;
    status?: string;
  },
) => {
  return useQuery({
    queryKey: [
      "campaigns",
      payload?.page,
      payload?.limit,
      payload?.search,
      payload?.type,
      payload?.status,
    ],
    queryFn: () => campaignService.campaignList(payload),
    placeholderData: keepPreviousData,
    enabled: initialized,
  });
};

export const useGetCampaignPrefetch = (
  isPlaceholderData: boolean,
  totalPages: number,
  page: number,
  limit: number,
  search?: string,
  type?: string,
  status?: string,
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isPlaceholderData) return;

    const query = (payload: {
      page: number;
      limit: number;
      search?: string;
      type?: string;
      status?: string;
    }) => {
      queryClient.prefetchQuery({
        queryKey: [
          "campaigns",
          payload?.page,
          payload?.limit,
          payload?.search,
          payload?.type,
          payload?.status,
        ],
        queryFn: () => campaignService.campaignList(payload),
      });
    };

    if (page < totalPages) {
      query({ page: page + 1, limit, search, type, status });
    }
    if (page === 1 && page + 1 < totalPages) {
      query({ page: page + 2, limit, search, type, status });
    }
    if (page > 1) {
      query({ page: page - 1, limit, search, type, status });
    }
    if (page - 2 > 0 && page === totalPages) {
      query({ page: page - 2, limit, search, type, status });
    }
  }, [
    isPlaceholderData,
    totalPages,
    page,
    limit,
    search,
    type,
    status,
    queryClient,
  ]);
};

export const useGetCampaignOptions = (enabled = true) => {
  return useQuery({
    queryKey: ["campaignOptions"],
    queryFn: () => campaignService.campaignOptions(),
    enabled,
  });
};
