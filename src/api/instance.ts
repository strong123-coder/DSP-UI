import axios, { AxiosError, type AxiosInstance } from "axios";
import { useAppStore } from "@/store";

const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/",
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  (config) => {
    const { token, user, selectedOrg } = useAppStore.getState();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    // Super-admin "impersonation": when a super admin has entered an org, send
    // its id as x-org-id so every org-scoped endpoint resolves to that org
    // (backend auth.js honours this header only for super_admin tokens).
    if (user?.type === "super_admin" && selectedOrg?.id) {
      config.headers["x-org-id"] = selectedOrg.id;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      useAppStore.getState().logout();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default instance;
