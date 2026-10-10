import { apiClient } from "@/api/apiClient";

export type McpServerStatus =
  | "draft"
  | "in_review"
  | "live"
  | "paused"
  | "rejected"
  | "suspended";

export interface McpPlacement {
  key: string;
  name?: string | null;
  format?: "text_card" | "mcp_app_card";
  status?: "active" | "paused";
  toolAllowlist: string[];
  toolCategoryMap: Record<string, string>;
  frequency: { perSession: number; perHourPerSession: number };
  floorCpc: number;
}

export interface McpServer {
  _id?: string;
  orgId?: string;
  name: string;
  description?: string | null;
  serverUrl?: string | null;
  homepage?: string | null;
  transport?: "stdio" | "http" | "both";
  categories: string[];
  blockedCategories: string[];
  blockedAdvertiserDomains: string[];
  blockedHosts: string[];
  placements: McpPlacement[];
  status?: McpServerStatus;
  reviewNotes?: string | null;
  revShare?: number;
  submittedAt?: string | null;
  approvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface McpApiKey {
  _id: string;
  mode: "test" | "live";
  label?: string | null;
  prefix: string;
  status: "active" | "revoked";
  lastUsedAt?: string | null;
  revokedAt?: string | null;
  createdAt?: string;
  secret?: string; // only on create
}

export interface McpCategory {
  id: string;
  label: string;
  sensitive?: boolean;
}

export interface McpIntegration {
  serverId: string;
  status: McpServerStatus;
  liveFilling: boolean;
  bidderUrl: string;
  endpoints: { select: string; rendered: string };
  auth: string;
  placements: { key: string; name?: string; status?: string }[];
  keys: McpApiKey[];
  env: Record<string, string>;
  sdk: { go: { install: string; snippet: string } };
}

export interface McpListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

// Strip server-owned fields before sending a server back to the API.
export const toServerPayload = (s: Partial<McpServer>) => ({
  name: s.name,
  description: s.description || "",
  serverUrl: s.serverUrl || "",
  homepage: s.homepage || "",
  transport: s.transport,
  categories: s.categories,
  blockedCategories: s.blockedCategories,
  blockedAdvertiserDomains: s.blockedAdvertiserDomains,
  blockedHosts: s.blockedHosts,
  placements: s.placements?.map((p) => ({
    key: p.key,
    name: p.name || "",
    format: p.format,
    status: p.status,
    toolAllowlist: p.toolAllowlist,
    toolCategoryMap: p.toolCategoryMap,
    frequency: p.frequency,
    floorCpc: p.floorCpc,
  })),
});

export const mcpPublisherService = {
  categories: async () => (await apiClient().get("mcpCategories")).data,
  list: async (params?: McpListParams) => (await apiClient().get("mcpServerList", params)).data,
  get: async (id: string) =>
    (await apiClient().get("mcpServerGet", undefined, undefined, { id })).data,
  create: async (payload: object) => (await apiClient().post("mcpServerCreate", payload)).data,
  update: async (id: string, payload: object) =>
    (await apiClient().put("mcpServerUpdate", payload, undefined, { id })).data,
  remove: async (id: string) =>
    (await apiClient().del("mcpServerDelete", undefined, undefined, { id })).data,
  submit: async (id: string) =>
    (await apiClient().post("mcpServerSubmit", {}, undefined, { id })).data,
  changeStatus: async (id: string, status: "live" | "paused") =>
    (await apiClient().post("mcpServerStatus", { status }, undefined, { id })).data,
  keys: async (id: string) =>
    (await apiClient().get("mcpKeyList", undefined, undefined, { id })).data,
  createKey: async (id: string, payload: { mode: "test" | "live"; label?: string }) =>
    (await apiClient().post("mcpKeyCreate", payload, undefined, { id })).data,
  revokeKey: async (id: string, keyId: string) =>
    (await apiClient().del("mcpKeyRevoke", undefined, undefined, { id, keyId })).data,
  integration: async (id: string) =>
    (await apiClient().get("mcpIntegration", undefined, undefined, { id })).data,
};

export const mcpReviewService = {
  servers: async (params?: McpListParams) =>
    (await apiClient().get("mcpReviewServers", params)).data,
  decideServer: async (id: string, payload: { decision: string; notes?: string; revShare?: number }) =>
    (await apiClient().post("mcpReviewServerDecision", payload, undefined, { id })).data,
  campaigns: async (params?: { page?: number; limit?: number; reviewStatus?: string }) =>
    (await apiClient().get("mcpReviewCampaigns", params)).data,
  decideCampaign: async (id: string, payload: { decision: string; notes?: string }) =>
    (await apiClient().post("mcpReviewCampaignDecision", payload, undefined, { id })).data,
};
