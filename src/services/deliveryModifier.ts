import { apiClient } from "@/api/apiClient";
import type { ModifierCondition } from "@/services/bidModifier";

export interface DeliveryTerm {
  conditions: ModifierCondition[];
  share: number; // % of matching requests the line item bids on (0–100)
}

export interface DeliveryModifier {
  _id?: string;
  advertiserId: string;
  advertiserName?: string | null;
  name: string;
  terms: DeliveryTerm[];
  notes?: string | null;
  lineItems?: number; // line items using it (list)
  updatedAt?: string;
}

export interface DeliveryModifierParams {
  page?: number;
  limit?: number;
  advertiserId?: string;
  search?: string;
}

export const deliveryModifierService = {
  list: async (params?: DeliveryModifierParams) => (await apiClient().get("deliveryModifierList", params)).data,
  options: async (advertiserId: string) => (await apiClient().get("deliveryModifierOptions", { advertiserId })).data,
  get: async (id: string) => (await apiClient().get("deliveryModifierGet", undefined, undefined, { id })).data,
  create: async (payload: Partial<DeliveryModifier>) => (await apiClient().post("deliveryModifierAdd", payload)).data,
  update: async (id: string, payload: Partial<DeliveryModifier>) =>
    (await apiClient().patch("deliveryModifierUpdate", payload, {}, { id })).data,
  remove: async (id: string) => (await apiClient().del("deliveryModifierDelete", undefined, undefined, { id })).data,
};
