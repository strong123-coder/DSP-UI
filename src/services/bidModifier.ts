import { apiClient } from "@/api/apiClient";

export interface ModifierCondition {
  field: string;
  values: string[];
}

export interface ModifierTerm {
  conditions: ModifierCondition[];
  multiplier: number;
}

export interface BidModifier {
  _id?: string;
  advertiserId: string;
  advertiserName?: string | null;
  name: string;
  minBid?: number | null;
  maxBid?: number | null;
  terms: ModifierTerm[];
  notes?: string | null;
  lineItems?: number; // line items using it (list)
  updatedAt?: string;
}

export interface ModifierField {
  value: string;
  name: string;
  hint: string;
}

export interface BidModifierParams {
  page?: number;
  limit?: number;
  advertiserId?: string;
  search?: string;
}

export const bidModifierService = {
  fields: async () => (await apiClient().get("bidModifierFields")).data,
  list: async (params?: BidModifierParams) => (await apiClient().get("bidModifierList", params)).data,
  options: async (advertiserId: string) => (await apiClient().get("bidModifierOptions", { advertiserId })).data,
  get: async (id: string) => (await apiClient().get("bidModifierGet", undefined, undefined, { id })).data,
  create: async (payload: Partial<BidModifier>) => (await apiClient().post("bidModifierAdd", payload)).data,
  update: async (id: string, payload: Partial<BidModifier>) =>
    (await apiClient().patch("bidModifierUpdate", payload, {}, { id })).data,
  remove: async (id: string) => (await apiClient().del("bidModifierDelete", undefined, undefined, { id })).data,
};
