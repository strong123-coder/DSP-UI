// Types shared by the mediation-layer services (demand + supply).

export interface PartnerEndpoint {
  label?: string;
  url: string;
  geos: string[];
  tmaxMs?: number;
  priority?: number;
  qps?: number | null;
}

export interface PartnerAuth {
  type: string;
  headerName?: string | null;
  value?: string | null;
}

// The partner's commercial arrangement with us — how our cut is taken.
//   margin   → cut in the bid price (P × (1 − marginPct))
//   revshare → bid passes through; billing-time split by revSharePct
export interface PartnerDeal {
  model: "revshare" | "margin";
  revSharePct?: number | null;
  marginPct?: number;
  minMarginCpm?: number | null;
  bidAdjustPct?: number;
  floorCpm?: number | null; // supply only: partner-level default floor
}

// An OpenRTB PMP deal (imp.pmp.deals[] ↔ bid.dealid).
export interface DealTerm {
  dealId: string;
  name?: string | null;
  type?: "preferred" | "private_auction" | "programmatic_guaranteed";
  status?: "active" | "paused";
  auctionType?: 1 | 2 | 3;
  fixedCpm?: number | null;
  floorCpm?: number | null;
  currency?: string;
  wseat?: string[];
  marginPctOverride?: number | null;
  targeting?: { geos?: string[]; adFormats?: string[] };
  startDate?: string | null;
  endDate?: string | null;
  volumeGoal?: number | null;
}
