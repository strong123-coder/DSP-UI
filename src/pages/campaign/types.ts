export type SortDirection = "asc" | "desc";

export interface Campaign {
  _id: string;
  advertiserId?: string | null;
  advertiserName?: string | null;
  networkId?: string | null;
  networkName?: string | null;
  network?: { id: string; name: string } | null;
  approval?: import("@/services/approval").Approval;
  advertiser?: { id: string; name: string; status?: string; category?: string } | null;
  budgetType?: "spend" | "impressions";
  alternativeId?: string | null;
  notes?: string | null;
  lineItems?: { total: number; active: number };
  title: string;
  goal: string;
  type: string;
  status: string;
  currency?: string;
  orgId?: string;
  appOs?: string;
  appName?: string;
  appIconLink?: string;
  bundleId: string;
  budget: string;
  dailyBudget: string;
  kpi?: string;
  isScheduling: boolean;
  startDate?: string;
  endDate?: string;
  mmpPlatform?: string;
  ctaUrl?: string;
  vtaUrl?: string;
  eventDetails?: Array<{ name: string; bidPrice?: string; currency?: string }>;
  geo?: string[];
  isCustomTargating?: boolean;
  customTargating?: Array<{ country?: string; state?: string; city?: string }>;
  audienceTarget?: string;
  customAudienceIds?: string[];
  inventoryType?: string;
  oemPremiumPartners?: string[];
  media?: Array<{
    id?: string;
    link?: string;
    type?: string;
    w?: number;
    h?: number;
  }>;
  // Managed by super admin via bid config (read-only elsewhere).
  enableBidding?: boolean;
  // Advertiser opt-in to the MCP bidder; `mcp` is set by super admin.
  mcpEnabled?: boolean;
  mcp?: { reviewStatus?: "pending" | "approved" | "rejected"; reviewNotes?: string | null };
  createdAt: string;
  updatedAt: string;
}
