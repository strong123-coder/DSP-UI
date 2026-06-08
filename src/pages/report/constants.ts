export const presetOptions = [
  { name: "Today", value: "today" },
  { name: "Yesterday", value: "yesterday" },
  { name: "Last 7 Days", value: "last_7_days" },
  { name: "Last 30 Days", value: "last_30_days" },
];

export const allColHeaders = [
  { key: "campaignTitle", label: "CAMPAIGN NAME", sortable: false, isAlwaysVisible: true },
  { key: "advertiser", label: "ADVERTISER", sortable: false },
  { key: "clicks", label: "CLICKS", sortable: true },
  { key: "installs", label: "INSTALL", sortable: true },
  { key: "ctr", label: "CTR", sortable: true },
  { key: "spent", label: "SPENT", sortable: true },
];

export const groupByOptions = [
  { label: "Campaign", value: "campaign" },
  { label: "Placement", value: "publisher" },
  { label: "Country (GEO)", value: "country" },
  { label: "Region", value: "region" },
  { label: "City", value: "city" },
  { label: "Month", value: "month" },
  { label: "Date", value: "date" },
  { label: "Hour", value: "hour" },
];
