export type SortDirection = "asc" | "desc";

export interface ReportDataRow {
  campaign?: string;
  campaignTitle?: string;
  campaignStatus?: string;
  clicks: number;
  installs: number;
  impressions?: number;
  spent: number;
  ctr: number;
  [key: string]: any;
}

export interface ReportTotals {
  clicks: number;
  installs: number;
  impressions?: number;
  spent: number;
  ctr: number;
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
