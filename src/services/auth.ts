import { apiClient } from "@/api/apiClient";

export const authService = {
  login: async (payload: any) => {
    const response = await apiClient().post("login", payload);
    return response.data;
  },
};
