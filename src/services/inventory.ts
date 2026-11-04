import { apiClient } from "@/api/apiClient";

// bundle = app bundles / site domains (can be targeted); name = app / site
// names as the exchange reports them (reference only).
export type InventoryKind = "bundle" | "name";

export interface InventoryApp {
  key: string; // the bundle or the name
  requests: number;
  exchanges: string[];
  deviceTypes: string[];
}

export interface InventoryAppsParams {
  country?: string;
  kind?: InventoryKind;
  search?: string;
  exchange?: string;
  deviceType?: string;
  page?: number;
  limit?: number;
}

export interface InventoryFacets {
  country: string;
  countries: string[];
  exchanges: string[];
  deviceTypes: string[];
  loaded: Partial<Record<InventoryKind, { apps: number; requests: number; fileName: string | null; updatedAt: string }>>;
}

export interface InventoryPartners {
  oems: string[];
  dsps: string[];
}

export interface InventoryUpload {
  _id: string;
  country: string;
  kind: InventoryKind;
  fileName: string | null;
  rows: number;
  apps: number;
  requests: number;
  createdAt: string;
}

export const inventoryService = {
  apps: async (params: InventoryAppsParams) => (await apiClient().get("inventoryApps", params)).data,
  facets: async (country: string) => (await apiClient().get("inventoryFacets", { country })).data,
  partners: async () => (await apiClient().get("inventoryPartners")).data,
  upload: async (payload: { country: string; fileName?: string; csv: string }) =>
    (await apiClient().post("inventoryUpload", payload)).data,
  uploads: async () => (await apiClient().get("inventoryUploads")).data,
};
