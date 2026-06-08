import { apiClient } from "@/api/apiClient";

export const reportService = {
  reportData: async (payload?: object) => {
    const response = await apiClient().post("reportData", payload);
    return response.data;
  },
};
