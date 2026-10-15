import { apiClient } from "@/api/apiClient";

export type PresetKind = "campaign" | "lineItem" | "targeting";

export interface Preset {
  _id?: string;
  name: string;
  kind: PresetKind;
  advertiserId: string | null; // null = every advertiser
  advertiserName?: string | null;
  payload?: Record<string, any>; // only on get
  notes?: string | null;
  updatedAt?: string;
}

export interface PresetParams {
  page?: number;
  limit?: number;
  kind?: PresetKind;
  advertiserId?: string;
  search?: string;
}

export const presetService = {
  list: async (params?: PresetParams) => (await apiClient().get("presetList", params)).data,
  options: async (kind: PresetKind, advertiserId?: string) =>
    (await apiClient().get("presetOptions", { kind, ...(advertiserId ? { advertiserId } : {}) })).data,
  get: async (id: string) => (await apiClient().get("presetGet", undefined, undefined, { id })).data,
  create: async (payload: Partial<Preset>) => (await apiClient().post("presetAdd", payload)).data,
  update: async (id: string, payload: Partial<Preset>) =>
    (await apiClient().patch("presetUpdate", payload, {}, { id })).data,
  remove: async (id: string) => (await apiClient().del("presetDelete", undefined, undefined, { id })).data,
};
