import { apiClient } from "@/api/apiClient";

export const userManagement = {
  login: async (payload: any) => {
    const response = await apiClient().post("login", payload);
    return response.data;
  },
};
