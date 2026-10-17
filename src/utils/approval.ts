// What each changed field is called on screen (approval.changes holds API names).
const FIELD_LABEL: Record<string, string> = {
  budget: "total budget",
  dailyBudget: "daily budget",
  budgetType: "budget type",
  ctaUrl: "landing URL",
  vtaUrl: "view-through URL",
  startDate: "dates",
  endDate: "dates",
  isScheduling: "schedule",
  eventDetails: "event bids",
  frequencyCaps: "frequency caps",
  advertiserId: "advertiser",
  bundleId: "app",
  appName: "app",
  appOs: "app OS",
  type: "campaign type",
  goal: "goal",
  currency: "currency",
  bidding: "bid",
  targeting: "targeting",
  flights: "flights",
  creatives: "creatives",
  bidModifierId: "bid modifier",
  deliveryModifierId: "delivery modifier",
  format: "format",
  clickUrl: "click URL",
};

export const changeText = (changes?: string[]) =>
  [...new Set((changes || []).map((c) => FIELD_LABEL[c] || c))].join(", ");
