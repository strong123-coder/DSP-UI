import { apiClient } from "@/api/apiClient";

export const orgService = {
  orgList: async () => {
    const response = await apiClient().get("orgList");
    return response.data;
  },
  getOrgConfig: async () => {
    const response = await apiClient().get("getOrgConfig");
    return response.data;
  },
};
