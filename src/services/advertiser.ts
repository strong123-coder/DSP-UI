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
  createdAt?: string;
}

export interface AdvertiserListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const advertiserService = {
  list: async (params?: AdvertiserListParams) => (await apiClient().get("advertiserList", params)).data,
  options: async () => (await apiClient().get("advertiserOptions")).data,
  categories: async () => (await apiClient().get("advertiserCategories")).data,
  get: async (id: string) => (await apiClient().get("advertiserGet", undefined, undefined, { id })).data,
  create: async (payload: Partial<Advertiser>) => (await apiClient().post("advertiserAdd", payload)).data,
  update: async (id: string, payload: Partial<Advertiser>) =>
    (await apiClient().patch("advertiserUpdate", payload, {}, { id })).data,
  changeStatus: async (id: string, status: "active" | "paused") =>
    (await apiClient().patch("advertiserStatus", { status }, {}, { id })).data,
  remove: async (id: string) => (await apiClient().del("advertiserDelete", undefined, undefined, { id })).data,
};
