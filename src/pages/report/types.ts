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
