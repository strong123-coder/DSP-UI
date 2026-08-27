import { apiClient } from "@/api/apiClient";
import type { PartnerEndpoint, PartnerAuth, PartnerDeal, DealTerm } from "@/services/mediation";

export type DemandEndpoint = PartnerEndpoint;

export interface DemandPartner {
  _id?: string;
  name: string;
  kind: string; // dsp | exchange | network (buy-side only)
  integration: string;
  status: string;
  endpoints: DemandEndpoint[];
  protocol?: string;
  auth?: PartnerAuth;
  seat?: string | null;
  deal?: PartnerDeal; // revshare | margin — our cut
  deals?: DealTerm[]; // PMP deals negotiated with this partner
  targeting?: {
    geos?: string[];
    adFormats?: string[];
    deviceTypes?: number[];
    os?: string[];
    trafficType?: string;
    bundlesAllow?: string[];
    bundlesBlock?: string[];
    categoriesBlock?: string[];
  };
  limits?: { qps?: number | null; dailyReqCap?: number | null; dailySpendCap?: number | null; timeoutMs?: number };
  sampling?: { trafficPct?: number };
  currency?: string;
  notifyWinUrl?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DemandListParams {
  page?: number;
  limit?: number;
  status?: string;
  kind?: string;
  integration?: string;
  search?: string;
}

export const demandService = {
  list: async (params?: DemandListParams) => {
    const res = await apiClient().get("demandList", params);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient().get("demandGet", undefined, undefined, { id });
    return res.data;
  },
  create: async (payload: Partial<DemandPartner>) => {
    const res = await apiClient().post("demandCreate", payload);
    return res.data;
  },
  update: async (id: string, payload: Partial<DemandPartner>) => {
    const res = await apiClient().put("demandUpdate", payload, undefined, { id });
    return res.data;
  },
  changeStatus: async (id: string, status: string) => {
    const res = await apiClient().post("demandStatus", { status }, undefined, { id });
    return res.data;
  },
  remove: async (id: string) => {
    const res = await apiClient().del("demandDelete", undefined, undefined, { id });
    return res.data;
  },
};
