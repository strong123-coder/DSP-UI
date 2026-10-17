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
    const { token, user, selectedOrg, selectedNetwork } = useAppStore.getState();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    // Super-admin "impersonation": when a super admin has entered an org, send
    // its id as x-org-id so every org-scoped endpoint resolves to that org
    // (backend auth.js honours this header only for super_admin tokens).
    if (user?.type === "super_admin" && selectedOrg?.id) {
      config.headers["x-org-id"] = selectedOrg.id;
    }
    // An org user (or a super admin inside an org) working inside one of the
    // org's networks: every network-scoped endpoint answers for that network.
    // Network users' own network comes from their token, never a header.
    const canEnter =
      user?.type === "admin" || user?.type === "team" || (user?.type === "super_admin" && !!selectedOrg?.id);
    if (canEnter && selectedNetwork?.id) {
      config.headers["x-network-id"] = selectedNetwork.id;
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
      const wasSupply = useAppStore.getState().user?.type === "supply";
      useAppStore.getState().exitNetwork();
      useAppStore.getState().logout();
      window.location.href = wasSupply ? "/supply/login" : "/login";
      return Promise.reject(error);
    }

    // The network this user had entered is gone (deleted, or access removed):
    // leave it instead of failing every request.
    const body = error.response?.data;
    if (
      error.response?.status === 400 &&
      useAppStore.getState().selectedNetwork &&
      typeof body === "string" &&
      /network/i.test(body)
    ) {
      useAppStore.getState().exitNetwork();
      window.location.href = "/dashboard";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default instance;
