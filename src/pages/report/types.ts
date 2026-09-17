export type SortDirection = "asc" | "desc";

export interface ReportDataRow {
  campaign?: string;
  campaignTitle?: string;
  campaignStatus?: string;
  impressions?: number;
  clicks: number;
  installs: number;
  events?: number;
  spent: number;
  ctr: number;
  cpi?: number | null;
  cpc?: number | null;
  [key: string]: any;
}

export interface ReportTotals {
  impressions?: number;
  clicks: number;
  installs: number;
  events?: number;
  spent: number;
  ctr: number;
  cpi?: number | null;
  cpc?: number | null;
}

// ── Campaign drill-down (grouped by supply bundleId) ──────────────────────

export interface BundleRow {
  bundle: string; // "" when the supply sent no bundle/domain
  impressions: number;
  clicks: number;
  installs: number;
  events: number;
  spent: number;
  ctr: number;
  cvr: number; // installs ÷ clicks, %
  ecpm: number | null; // spend per 1000 impressions
  cpi: number | null;
  cpc: number | null;
  spendShare: number; // % of the campaign's total spend
  countries: number;
  placements: number;
  activeDays: number;
  countryList: string[];
  firstSeen: string | null;
  lastSeen: string | null;
  [key: string]: any;
}

export interface BundleTotals extends ReportTotals {
  cvr: number;
  ecpm: number | null;
}

export interface CampaignBundlesResponse {
  campaign: {
    id: string;
    title: string | null;
    status: string | null;
    type: string | null;
    appName: string | null;
    bundleId: string | null;
    appOs: string | null;
    appIconLink: string | null;
  };
  sort: { by: string; order: SortDirection };
  range: { preset: string | null; startDate: string; endDate: string; timezone: string };
  bundleCount: number;
  totals: BundleTotals; // campaign-wide (ignores the bundle search)
  tableTotals: BundleTotals; // what the table is showing
  data: BundleRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ReportResponseData {
  groupBy: string[];
  columns: string[];
  sort: { by: string; order: SortDirection };
  range: { preset: string; startDate: string; endDate: string; timezone: string };
  totals: ReportTotals;
  data: ReportDataRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
