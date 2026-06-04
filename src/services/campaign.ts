import { apiClient } from "@/api/apiClient";
import type {
  AddCampaignFormValues,
  EditCampaignFormValues,
} from "@/utils/schemas/campaign";

export const campaignService = {
  addCampaign: async (payload: AddCampaignFormValues) => {
    const response = await apiClient().post("addCampaign", payload);
    return response.data;
  },
  campaignList: async (params?: object) => {
    const response = await apiClient().get("campaignList", params);
    return response.data;
  },
  campaignOptions: async () => {
    const response = await apiClient().get("campaignOptions");
    return response.data;
  },
  getCampaign: async (id: string) => {
    const response = await apiClient().get(
      "getCampaign",
      undefined,
      undefined,
      { id },
    );
    return response.data;
  },
  editCampaign: async (id: string, payload: EditCampaignFormValues) => {
    const response = await apiClient().patch(
      "editCampaign",
      payload,
      {},
      { id },
    );
    return response.data;
  },
  updateCampaignStatus: async (id: string, status: "active" | "paused") => {
    const response = await apiClient().patch(
      "updateCampaignStatus",
      { status },
      {},
      { id },
    );
    return response.data;
  },
  deleteCampaign: async (id: string) => {
    const response = await apiClient().del(
      "deletCampaign",
      undefined,
      undefined,
      { id },
    );
    return response.data;
  },
  getAppDetails: async (payload: {
    bundleId: string;
    platform: "android" | "ios";
    country?: string;
  }) => {
    const response = await apiClient().get("getAppDetails", payload);
    return response.data;
  },
};
