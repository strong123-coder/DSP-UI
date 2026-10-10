import { apiClient } from "@/api/apiClient";

export const authService = {
  login: async (payload: any) => {
    const response = await apiClient().post("login", payload);
    return response.data;
  },
  superAdminLogin: async (payload: any) => {
    const response = await apiClient().post("superAdminLogin", payload);
    return response.data;
  },
  supplyLogin: async (payload: { email: string; password: string }) => {
    const response = await apiClient().post("supplyLogin", payload);
    return response.data;
  },
  supplySignup: async (payload: object) => {
    const response = await apiClient().post("supplySignup", payload);
    return response.data;
  },
};
