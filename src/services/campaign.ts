import { apiClient } from "@/api/apiClient";
import type { AddCampaignFormValues } from "@/utils/schemas/campaign";

export const campaignService = {
  addCampaign: async (payload: AddCampaignFormValues) => {
    const response = await apiClient().post("addCampaign", payload);
    return response.data;
  },
  campaignList: async (params?: object) => {
    const response = await apiClient().get("campaignList", params);
    return response.data;
  },
};
