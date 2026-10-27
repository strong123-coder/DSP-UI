import { apiClient } from "@/api/apiClient";

export type NetworkStatus = "active" | "inactive";

export interface Network {
  _id: string;
  name: string;
  status: NetworkStatus;
  contactName?: string | null;
  contactEmail?: string | null;
  requireApproval: boolean;
  notes?: string | null;
  publisherCut?: number | null; // % the org keeps; org users only
  adminId?: string | null;
  // list / get only
  advertisers?: number;
  activeCampaigns?: number;
  users?: number;
  createdAt?: string;
}

export interface NetworkParams {
  page?: number;
  limit?: number;
  status?: NetworkStatus;
  search?: string;
}

export type NetworkPayload = Partial<
  Pick<Network, "name" | "contactName" | "contactEmail" | "requireApproval" | "notes" | "status" | "publisherCut">
>;

export interface NetworkLoginPayload {
  name: string;
  email: string;
  mobile: string;
  password: string;
  type: "network_admin" | "network_team";
  networkId: string;
}

export const networkService = {
  current: async () => (await apiClient().get("networkCurrent")).data,
  list: async (params?: NetworkParams) => (await apiClient().get("networkList", params)).data,
  options: async () => (await apiClient().get("networkOptions")).data,
  get: async (id: string) => (await apiClient().get("networkGet", undefined, undefined, { id })).data,
  create: async (payload: NetworkPayload) => (await apiClient().post("networkAdd", payload)).data,
  update: async (id: string, payload: NetworkPayload) => (await apiClient().patch("networkUpdate", payload, {}, { id })).data,
  changeStatus: async (id: string, status: NetworkStatus) =>
    (await apiClient().patch("networkStatus", { status }, {}, { id })).data,
  remove: async (id: string) => (await apiClient().del("networkDelete", undefined, undefined, { id })).data,
  // Network logins are users with a networkId (created from the org level).
  logins: async (networkId: string) => (await apiClient().get("userList", { networkId, limit: 100 })).data,
  addLogin: async (payload: NetworkLoginPayload) => (await apiClient().post("addUser", payload)).data,
};
