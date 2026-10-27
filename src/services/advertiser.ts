import { apiClient } from "@/api/apiClient";

export interface AdvertiserDefaults {
  geo: string[];
  currency: string;
  clickUrl?: string | null;
  mmpPlatform?: string | null;
}

export interface Advertiser {
  _id?: string;
  name: string;
  domain: string | null;
  appBundle?: string | null;
  appName?: string | null;
  appOs?: "android" | "ios" | null;
  appIconLink?: string | null;
  category: string | null;
  categoryName?: string | null;
  alternativeId?: string | null;
  notes?: string | null;
  status: "active" | "paused";
  defaults: AdvertiserDefaults;
  campaigns?: { total: number; active: number };
  networkId?: string | null;
  networkName?: string | null;
  // Org users only (never sent to network users): this advertiser's publisher
  // cut % (null = the network's), and the network's.
  publisherCut?: number | null;
  networkPublisherCut?: number | null;
  createdAt?: string;
}

export interface AdvertiserListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  networkId?: string; // org level: one network's advertisers
}

export const advertiserService = {
  list: async (params?: AdvertiserListParams) => (await apiClient().get("advertiserList", params)).data,
  options: async (networkId?: string) =>
    (await apiClient().get("advertiserOptions", networkId ? { networkId } : undefined)).data,
  categories: async () => (await apiClient().get("advertiserCategories")).data,
  get: async (id: string) => (await apiClient().get("advertiserGet", undefined, undefined, { id })).data,
  create: async (payload: Partial<Advertiser>) => (await apiClient().post("advertiserAdd", payload)).data,
  update: async (id: string, payload: Partial<Advertiser>) =>
    (await apiClient().patch("advertiserUpdate", payload, {}, { id })).data,
  changeStatus: async (id: string, status: "active" | "paused") =>
    (await apiClient().patch("advertiserStatus", { status }, {}, { id })).data,
  remove: async (id: string) => (await apiClient().del("advertiserDelete", undefined, undefined, { id })).data,
};
