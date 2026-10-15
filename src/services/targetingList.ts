import { apiClient } from "@/api/apiClient";

export type TargetingListKind = "bundle" | "zip" | "deal";

export interface TargetingList {
  _id?: string;
  name: string;
  kind: TargetingListKind;
  values?: string[]; // only on get
  count?: number; // on list / options
  lineItems?: number; // line items using it (list)
  notes?: string | null;
  updatedAt?: string;
}

export interface TargetingListParams {
  page?: number;
  limit?: number;
  kind?: TargetingListKind;
  search?: string;
}

export const targetingListService = {
  list: async (params?: TargetingListParams) => (await apiClient().get("targetingListList", params)).data,
  options: async (kind: TargetingListKind = "bundle") => (await apiClient().get("targetingListOptions", { kind })).data,
  get: async (id: string) => (await apiClient().get("targetingListGet", undefined, undefined, { id })).data,
  create: async (payload: Partial<TargetingList>) => (await apiClient().post("targetingListAdd", payload)).data,
  update: async (id: string, payload: Partial<TargetingList>) =>
    (await apiClient().patch("targetingListUpdate", payload, {}, { id })).data,
  remove: async (id: string) => (await apiClient().del("targetingListDelete", undefined, undefined, { id })).data,
};
