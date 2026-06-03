export const PlatformTypeData: { name: string; value: "mobile" | "ctv" | "web" }[] = [
  { name: "Mobile App", value: "mobile" },
  { name: "Connected TV (CTV)", value: "ctv" },
  { name: "Web / Desktop", value: "web" },
];

export const PlatformTypeFilterData = [
  { name: "All Platforms", value: " " },
  ...PlatformTypeData,
];

export const CampaignStatusData: { name: string; value: "active" | "paused" }[] = [
  { name: "Active", value: "active" },
  { name: "Paused", value: "paused" },
];

export const CampaignStatusFilterData = [
  { name: "All Statuses", value: " " },
  ...CampaignStatusData,
];

export const MmpPlatformData: {
  name: string;
  value:
    | "appsflyer"
    | "adjust"
    | "branch"
    | "singular"
    | "apptrove"
    | "kochawa"
    | "appmetrica"
    | "affise";
}[] = [
  { name: "AppsFlyer", value: "appsflyer" },
  { name: "Adjust", value: "adjust" },
  { name: "Branch", value: "branch" },
  { name: "Singular", value: "singular" },
  { name: "AppTrove", value: "apptrove" },
  { name: "Kochawa", value: "kochawa" },
  { name: "AppMetrica", value: "appmetrica" },
  { name: "Affise", value: "affise" },
];

export const InventoryTypeData: {
  icon: string;
  title: string;
  value: "programmatic" | "oem_premium_partners";
  description: string;
}[] = [
  {
    icon: "Download",
    title: "Programmatic",
    value: "programmatic",
    description:
      "Display advertisements using a variety of in-app inventory through an automated system.",
  },
  {
    icon: "Download",
    title: "OEM and Premium Partners",
    value: "oem_premium_partners",
    description:
      "From our list of direct partners below, choose where ads should appear.",
  },
];

export const AudienceTargetData: { name: string; value: "all" | "custom" }[] = [
  { name: "Reach All Eligible Audience", value: "all" },
  { name: "Select Custom Audience", value: "custom" },
];
