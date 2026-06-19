export const presetOptions = [
  { name: "Today", value: "today" },
  { name: "Yesterday", value: "yesterday" },
  { name: "Last 7 Days", value: "last_7_days" },
  { name: "Last 30 Days", value: "last_30_days" },
];

export const allColHeaders = [
  { key: "campaignTitle", label: "CAMPAIGN NAME", sortable: false, isAlwaysVisible: true },
  { key: "advertiser", label: "ADVERTISER", sortable: false },
  { key: "impressions", label: "IMPRESSIONS", sortable: true },
  { key: "clicks", label: "CLICKS", sortable: true },
  { key: "installs", label: "INSTALL", sortable: true },
  { key: "events", label: "EVENTS", sortable: true },
  { key: "ctr", label: "CTR", sortable: true },
  { key: "spent", label: "SPENT", sortable: true },
  { key: "cpi", label: "CPI", sortable: true },
  { key: "cpc", label: "CPC", sortable: true },
];

// Group-by dimensions supported by the aggregate-metrics-backed report
// (daily granularity; region/city/hour are not available).
export const groupByOptions = [
  { label: "Campaign", value: "campaign" },
  { label: "Placement", value: "publisher" },
  { label: "Country (GEO)", value: "country" },
  { label: "Month", value: "month" },
  { label: "Date", value: "date" },
];
