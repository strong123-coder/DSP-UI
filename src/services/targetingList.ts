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
  // private = the org only; public = shared with every network (read-only there).
  visibility?: "private" | "public";
  networkId?: string | null; // set = a network's own list
  networkName?: string | null;
  shared?: boolean; // an org list seen from inside a network
}

export interface TargetingListParams {
  page?: number;
  limit?: number;
  kind?: TargetingListKind;
  search?: string;
}

export const targetingListService = {
  list: async (params?: TargetingListParams) => (await apiClient().get("targetingListList", params)).data,
  options: async (kind: TargetingListKind = "bundle", networkId?: string) =>
    (await apiClient().get("targetingListOptions", networkId ? { kind, networkId } : { kind })).data,
  get: async (id: string) => (await apiClient().get("targetingListGet", undefined, undefined, { id })).data,
  create: async (payload: Partial<TargetingList>) => (await apiClient().post("targetingListAdd", payload)).data,
  update: async (id: string, payload: Partial<TargetingList>) =>
    (await apiClient().patch("targetingListUpdate", payload, {}, { id })).data,
  remove: async (id: string) => (await apiClient().del("targetingListDelete", undefined, undefined, { id })).data,
};
