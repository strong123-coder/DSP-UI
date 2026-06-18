import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bidConfigService, type CampaignBid } from "@/services/bidConfig";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { extractApiErrors } from "@/utils/getErrorMessage";

const onError = (error: AxiosError<{ message?: string }>) => {
  const msgs = extractApiErrors(error.response?.data);
  msgs.forEach((m) => toast.error(m));
};

export const useGetBidConfig = () =>
  useQuery({
    queryKey: ["bidConfig"],
    queryFn: () => bidConfigService.get(),
  });

export const useGetAllCampaigns = () =>
  useQuery({
    queryKey: ["superAdminCampaigns"],
    queryFn: () => bidConfigService.campaigns(),
    staleTime: 60 * 1000,
  });

export const useUpsertBidConfig = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof bidConfigService.upsert>[0]) =>
      bidConfigService.upsert(payload),
    onSuccess: () => {
      toast.success("Bid configuration saved");
      qc.invalidateQueries({ queryKey: ["bidConfig"] });
    },
    onError,
  });
};

export const useUpsertCampaignBid = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CampaignBid) => bidConfigService.upsertCampaign(payload),
    onSuccess: () => {
      toast.success("Campaign bid saved");
      qc.invalidateQueries({ queryKey: ["bidConfig"] });
    },
    onError,
  });
};

export const useRemoveCampaignBid = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => bidConfigService.removeCampaign(campaignId),
    onSuccess: () => {
      toast.success("Campaign bid removed");
      qc.invalidateQueries({ queryKey: ["bidConfig"] });
    },
    onError,
  });
};

export const useSetCampaignEnableBidding = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { campaignId: string; enableBidding: boolean }) =>
      bidConfigService.setEnableBidding(payload),
    onSuccess: (_data, variables) => {
      toast.success(
        variables.enableBidding ? "Bidding enabled" : "Bidding disabled"
      );
      qc.invalidateQueries({ queryKey: ["superAdminCampaigns"] });
    },
    onError,
  });
};
