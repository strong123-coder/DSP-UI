import { apiClient } from "@/api/apiClient";

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ApprovalKind = "campaign" | "lineItem" | "creative";

// approval on a campaign / line item / creative. Missing = approved.
export interface Approval {
  status?: ApprovalStatus;
  note?: string | null;
  changes?: string[];
  submittedBy?: string | null;
  submittedAt?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
}

export interface ApprovalItem {
  id: string;
  name?: string;
  title?: string;
  type?: string;
  format?: string;
  status?: string;
  link?: string;
  w?: number;
  h?: number;
  clickUrl?: string | null;
  budget?: number | string | null;
  approval?: Approval;
}

export interface ApprovalGroup {
  key: string;
  campaign: (ApprovalItem & { inReview: boolean; dailyBudget?: string | null }) | null;
  advertiser: { id: string; name: string } | null;
  network: { id: string; name: string | null } | null;
  lineItems: ApprovalItem[];
  creatives: ApprovalItem[];
  submittedAt: string | null;
}

export interface ReviewPayload {
  items: { kind: ApprovalKind; id: string }[];
  decision: "approve" | "reject";
  note?: string;
}

export const approvalService = {
  queue: async (status: ApprovalStatus) => (await apiClient().get("approvalQueue", { status })).data,
  count: async () => (await apiClient().get("approvalCount")).data,
  review: async (payload: ReviewPayload) => (await apiClient().post("approvalReview", payload)).data,
  resubmit: async (kind: ApprovalKind, id: string) => (await apiClient().post("approvalResubmit", { kind, id })).data,
  myPermissions: async () => (await apiClient().get("userConfigMe")).data,
};
