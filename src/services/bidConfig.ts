import { apiClient } from "@/api/apiClient";

export interface CampaignBid {
  campaignId: string;
  campaignTitle?: string | null;
  bidPrice: number;
  currency?: string;
  enabled?: boolean;
  maxBidPrice?: number | null;
  note?: string | null;
}

export const bidConfigService = {
  get: async () => {
    const response = await apiClient().get("bidConfigGet");
    return response.data;
  },
  upsert: async (payload: {
    name?: string;
    status?: string;
    defaultBidPrice?: number | null;
    defaultCurrency?: string;
    campaignBids?: CampaignBid[];
  }) => {
    const response = await apiClient().post("bidConfigUpsert", payload);
    return response.data;
  },
  upsertCampaign: async (payload: CampaignBid) => {
    const response = await apiClient().post("bidConfigCampaignUpsert", payload);
    return response.data;
  },
  removeCampaign: async (campaignId: string) => {
    const response = await apiClient().post("bidConfigCampaignRemove", { campaignId });
    return response.data;
  },
  // All campaigns across orgs (for the picker).
  campaigns: async () => {
    const response = await apiClient().get("superAdminCampaigns");
    return response.data;
  },
};
