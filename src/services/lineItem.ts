import { apiClient } from "@/api/apiClient";

export interface LineItemTargeting {
  geo: {
    countries: { include: string[]; exclude: string[] };
    custom: Array<{ country?: string; state?: string; city?: string }>;
  };
  segments: { audienceTarget: "all" | "custom"; customAudienceIds: string[] };
  exchange: { inventoryType: "programmatic" | "oem_premium_partners"; oemPremiumPartners: string[] };
}

export interface LineItem {
  _id?: string;
  campaignId: string;
  advertiserId?: string;
  name: string;
  format: "banner" | "video";
  status: "active" | "paused";
  alternativeId?: string | null;
  notes?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  budget?: number | null;
  dailyBudget?: number | null;
  pacing: "asap" | "even";
  bidding: { strategy: "inherit" | "fixed_cpm"; cpm?: number | null; maxCpm?: number | null };
  targeting: LineItemTargeting;
  creatives: Array<{ creativeId: string }>;
  createdAt?: string;
}

export const lineItemService = {
  list: async (campaignId: string) => (await apiClient().get("lineItemList", { campaignId })).data,
  get: async (id: string) => (await apiClient().get("lineItemGet", undefined, undefined, { id })).data,
  create: async (payload: Partial<LineItem>) => (await apiClient().post("lineItemAdd", payload)).data,
  update: async (id: string, payload: Partial<LineItem>) =>
    (await apiClient().patch("lineItemUpdate", payload, {}, { id })).data,
  changeStatus: async (id: string, status: "active" | "paused") =>
    (await apiClient().patch("lineItemStatus", { status }, {}, { id })).data,
  remove: async (id: string) => (await apiClient().del("lineItemDelete", undefined, undefined, { id })).data,
};
