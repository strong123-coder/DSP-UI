import { apiClient } from "@/api/apiClient";

export interface Creative {
  _id: string;
  advertiserId: string;
  name: string | null;
  type: "image" | "video";
  status: "active" | "paused";
  link: string | null;
  w: number | null;
  h: number | null;
  duration?: number;
  vastTag?: string;
  mime?: string;
  clickUrl?: string | null;
  createdAt?: string;
}

export interface CreativeCreatePayload {
  advertiserId: string;
  mediaId?: string;
  name?: string;
  type: "image" | "video";
  link?: string;
  w?: number;
  h?: number;
  duration?: number;
  vastTag?: string;
  mime?: string;
}

export const creativeService = {
  list: async (params: { advertiserId: string; type?: "image" | "video"; search?: string; limit?: number }) =>
    (await apiClient().get("creativeList", params)).data,
  create: async (payload: CreativeCreatePayload) => (await apiClient().post("creativeAdd", payload)).data,
  update: async (id: string, payload: { name?: string; clickUrl?: string; status?: string }) =>
    (await apiClient().patch("creativeUpdate", payload, {}, { id })).data,
  remove: async (id: string) => (await apiClient().del("creativeDelete", undefined, undefined, { id })).data,
};
