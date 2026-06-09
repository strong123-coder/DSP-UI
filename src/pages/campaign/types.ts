export type SortDirection = "asc" | "desc";

export interface Campaign {
  _id: string;
  title: string;
  goal: string;
  type: string;
  status: string;
  currency?: string;
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
  media?: Array<{ id?: string; link?: string; type?: string; w?: number; h?: number }>;
  createdAt: string;
  updatedAt: string;
}
