import { apiClient } from "@/api/apiClient";

// catalog = our segment workbook, decided from bid request fields;
// iab = IAB Audience Taxonomy 1.1, sent by the exchange in user.data.
export type SegmentSource = "catalog" | "iab";
export type SegmentStatus = "live" | "needs_data" | "not_offered";
export type SegmentRoute = "request" | "app_usage" | "modeled" | "exchange";

export interface Segment {
  key: string; // what line items save: "in.26", "iab4.243"
  source?: SegmentSource;
  number?: number;
  name: string;
  category?: string | null;
  subCategory?: string | null;
  path?: string | null;
  definition?: string | null;
  signalType?: string | null;
  verticals?: string | null;
  route?: SegmentRoute;
  status: SegmentStatus | null; // null = no such segment any more
  reason?: string | null;
  note?: string | null;
  reachMn?: number | null;
  scaleTier?: string | null;
  match?: string | null; // how the engine decides it
}

export interface SegmentListParams {
  source?: SegmentSource;
  country?: string;
  search?: string;
  category?: string;
  status?: SegmentStatus | "";
  route?: SegmentRoute | "";
  page?: number;
  limit?: number;
}

export interface SegmentSummary {
  total: number;
  live: number;
  needsData: number;
  notOffered: number;
  categories: Array<{ name: string; total: number; live: number }>;
}

export interface SegmentFacets {
  country: string;
  catalog: SegmentSummary & { baseMn: number | null; fileName: string | null; updatedAt: string | null };
  iab: SegmentSummary & { segtax: number };
}

export interface SegmentUpload {
  _id: string;
  country: string;
  fileName: string | null;
  baseMn: number | null;
  segments: number;
  live: number;
  createdAt: string;
}

export const segmentService = {
  list: async (params: SegmentListParams) => (await apiClient().get("segmentList", params)).data,
  facets: async (country: string) => (await apiClient().get("segmentFacets", { country })).data,
  resolve: async (keys: string[]) => (await apiClient().get("segmentResolve", { keys: keys.join(",") })).data,
  upload: async (payload: { country: string; fileName: string; file: string }) =>
    (await apiClient().post("segmentUpload", payload)).data,
  uploads: async () => (await apiClient().get("segmentUploads")).data,
};
