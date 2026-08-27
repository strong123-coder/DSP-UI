import { apiClient } from "@/api/apiClient";
import type { PartnerEndpoint, PartnerAuth, PartnerDeal, DealTerm } from "@/services/mediation";

// A zone is the unit of supply — what appears in the engine's ?zone= param.
export interface SupplyZone {
  zoneId: string;
  name?: string | null;
  status?: string;
  formats?: string[];
  sizes?: string[];
  deviceTypes?: number[];
  floorCpm?: number | null;
}

export interface SupplyPartner {
  _id?: string;
  name: string;
  kind: string; // ssp | network | publisher | exchange
  status: string;
  flow: string; // inbound | outbound | both
  inbound?: { authToken?: string | null; qps?: number | null };
  outbound?: { endpoints?: PartnerEndpoint[]; auth?: PartnerAuth };
  deal?: PartnerDeal; // revshare | margin (+ floorCpm default)
  zones: SupplyZone[];
  deals?: DealTerm[]; // PMP deals arranged with this supply
  supplyChain?: { sellerId?: string | null; sellerDomain?: string | null; isDirect?: boolean };
  limits?: { dailyReqCap?: number | null };
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplyListParams {
  page?: number;
  limit?: number;
  status?: string;
  kind?: string;
  flow?: string;
  search?: string;
}

export const supplyService = {
  list: async (params?: SupplyListParams) => {
    const res = await apiClient().get("supplyList", params);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient().get("supplyGet", undefined, undefined, { id });
    return res.data;
  },
  create: async (payload: Partial<SupplyPartner>) => {
    const res = await apiClient().post("supplyCreate", payload);
    return res.data;
  },
  update: async (id: string, payload: Partial<SupplyPartner>) => {
    const res = await apiClient().put("supplyUpdate", payload, undefined, { id });
    return res.data;
  },
  changeStatus: async (id: string, status: string) => {
    const res = await apiClient().post("supplyStatus", { status }, undefined, { id });
    return res.data;
  },
  remove: async (id: string) => {
    const res = await apiClient().del("supplyDelete", undefined, undefined, { id });
    return res.data;
  },
};
