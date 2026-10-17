import { apiClient } from "@/api/apiClient";

export interface IncludeExclude<T = string> {
  include: T[];
  exclude: T[];
}

export type Segment = "clickers" | "viewers" | "any";
export interface SegmentRef {
  campaignId: string | null; // null = this line item's campaign
  segment: Segment;
}

export interface FrequencyCap {
  count: number;
  every: number;
  unit: "hour" | "day" | "week";
}

export interface LineItemTargeting {
  geo: {
    countries: IncludeExclude;
    custom: Array<{ country?: string; state?: string; city?: string }>;
    metros?: IncludeExclude;
    zips?: IncludeExclude;
    zipLists?: IncludeExclude;
  };
  inventory?: { bundles: IncludeExclude; bundleLists: IncludeExclude; deals?: IncludeExclude; dealLists?: IncludeExclude };
  content?: { categories: IncludeExclude; languages: IncludeExclude };
  environment?: { channels: Array<"app" | "web"> };
  platform?: {
    deviceTypes: IncludeExclude<number>;
    connectionTypes?: IncludeExclude<number>;
    makes?: IncludeExclude;
    models?: IncludeExclude;
    carriers?: IncludeExclude;
    osVersion: { min: string | null; max: string | null };
  };
  time?: { timezone: string | null; slots: number[] };
  segments: {
    audienceTarget: "all" | "custom";
    customAudienceIds: string[];
    retargeting?: { include: SegmentRef[]; exclude: SegmentRef[] };
    requireDeviceId?: boolean;
  };
  exchange: {
    inventoryType: "programmatic" | "oem_premium_partners";
    oemPremiumPartners: string[];
    supplyPartners?: IncludeExclude;
    zones?: IncludeExclude;
  };
}

// Choices for the targeting pickers.
export interface TargetingOptions {
  supplyPartners: Array<{ id: string; name: string; status: string; zones: Array<{ zoneId: string; name: string | null }> }>;
  campaigns: Array<{ id: string; title: string; status: string }>;
  deviceTypes: Array<{ value: number; name: string }>;
  connectionTypes: Array<{ value: number; name: string }>;
  deals: Array<{ dealId: string; name: string | null; type: string; floorCpm: number | null; currency: string; partner: string }>;
}

export interface Flight {
  startDate: string;
  endDate: string;
  budget?: number | null;
}

export interface LineItem {
  _id?: string;
  campaignId: string;
  advertiserId?: string;
  approval?: import("./approval").Approval; // read-only; missing = approved
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
  frequencyCaps?: FrequencyCap[];
  flights?: Flight[];
  bidModifierId?: string | null;
  deliveryModifierId?: string | null;
  bidding: { strategy: "inherit" | "fixed_cpm"; cpm?: number | null; maxCpm?: number | null };
  targeting: LineItemTargeting;
  creatives: Array<{ creativeId: string; weight?: number }>;
  createdAt?: string;
}

export const lineItemService = {
  list: async (campaignId: string) => (await apiClient().get("lineItemList", { campaignId })).data,
  get: async (id: string) => (await apiClient().get("lineItemGet", undefined, undefined, { id })).data,
  targetingOptions: async () => (await apiClient().get("lineItemTargetingOptions")).data,
  create: async (payload: Partial<LineItem>) => (await apiClient().post("lineItemAdd", payload)).data,
  update: async (id: string, payload: Partial<LineItem>) =>
    (await apiClient().patch("lineItemUpdate", payload, {}, { id })).data,
  changeStatus: async (id: string, status: "active" | "paused") =>
    (await apiClient().patch("lineItemStatus", { status }, {}, { id })).data,
  remove: async (id: string) => (await apiClient().del("lineItemDelete", undefined, undefined, { id })).data,
};
