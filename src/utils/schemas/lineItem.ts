import { z } from "zod";
import type { InferSchemaType } from "./type";
import { toFrequencyCaps } from "@/components/targeting/frequency-caps-editor";

// Numeric inputs are kept as strings in the form (like the campaign form) and
// converted on submit. "" means "not set".
const optionalAmount = (label: string) =>
  z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), { message: `${label} must be 0 or more` });

const includeExclude = z.object({ include: z.array(z.string()), exclude: z.array(z.string()) });
const segmentRef = z.object({
  campaignId: z.string().nullable(), // null = this campaign
  segment: z.enum(["clickers", "viewers", "any"]),
});
const flight = z.object({
  startDate: z.string(),
  endDate: z.string(),
  budget: z.string().trim(),
});
const numIncludeExclude = z.object({ include: z.array(z.number()), exclude: z.array(z.number()) });
const frequencyCap = z.object({
  count: z.string().trim(),
  every: z.string().trim(),
  unit: z.enum(["hour", "day", "week"]),
});

const OS_VERSION = /^\d{1,4}(\.\d{1,4}){0,2}$/;
const versionBefore = (a: string, b: string) => {
  const x = a.split(".").map(Number);
  const y = b.split(".").map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) < (y[i] || 0);
  }
  return false;
};
const positiveInt = (v: string) => /^\d+$/.test(v) && Number(v) >= 1;

export const lineItemSchema = z
  .object({
    name: z.string().trim().min(1, { message: "Line item name is required" }).max(200),
    format: z.enum(["banner", "video"]),
    status: z.enum(["active", "paused"]),
    alternativeId: z.string().trim().optional(),
    notes: z.string().trim().max(2000).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    budget: optionalAmount("Budget"),
    dailyBudget: optionalAmount("Daily budget"),
    pacing: z.enum(["asap", "even"]),
    frequencyCaps: z.array(frequencyCap),
    flights: z.array(flight),
    bidModifierId: z.string(), // "" = none
    deliveryModifierId: z.string(), // "" = none
    bidding: z.object({
      strategy: z.enum(["inherit", "fixed_cpm"]),
      cpm: z.string().trim().optional(),
      maxCpm: optionalAmount("Max CPM"),
    }),
    targeting: z.object({
      geo: z.object({
        countries: z.object({
          include: z.array(z.string()),
          exclude: z.array(z.string()),
        }),
        custom: z.array(
          z.object({
            country: z.string().trim().optional(),
            state: z.string().trim().optional(),
            city: z.string().trim().optional(),
          }),
        ),
        metros: includeExclude,
        zips: includeExclude,
        zipLists: includeExclude,
      }),
      inventory: z.object({ bundles: includeExclude, bundleLists: includeExclude, deals: includeExclude, dealLists: includeExclude }),
      content: z.object({ categories: includeExclude, languages: includeExclude }),
      environment: z.object({ channels: z.array(z.enum(["app", "web"])) }),
      platform: z.object({
        deviceTypes: numIncludeExclude,
        connectionTypes: numIncludeExclude,
        makes: includeExclude,
        models: includeExclude,
        carriers: includeExclude,
        osVersion: z.object({ min: z.string().trim(), max: z.string().trim() }),
      }),
      time: z.object({ timezone: z.string(), slots: z.array(z.number()) }),
      segments: z.object({
        audienceTarget: z.enum(["all", "custom"]),
        customAudienceIds: z.array(z.string()),
        retargeting: z.object({ include: z.array(segmentRef), exclude: z.array(segmentRef) }),
        requireDeviceId: z.boolean(),
      }),
      exchange: z.object({
        inventoryType: z.enum(["programmatic", "oem_premium_partners"]),
        oemPremiumPartners: z.array(z.string()),
        supplyPartners: includeExclude,
        zones: includeExclude,
      }),
    }),
    // weight = rotation share among equally good creatives (1–100).
    creatives: z.array(z.object({ creativeId: z.string(), weight: z.number().int().min(1).max(100) })),
  })
  .superRefine((d, ctx) => {
    if (d.bidding.strategy === "fixed_cpm") {
      const cpm = Number(d.bidding.cpm);
      if (!d.bidding.cpm || isNaN(cpm) || cpm <= 0) {
        ctx.addIssue({ code: "custom", message: "Enter a CPM bid greater than 0", path: ["bidding", "cpm"] });
      } else if (d.bidding.maxCpm && Number(d.bidding.maxCpm) > 0 && cpm > Number(d.bidding.maxCpm)) {
        ctx.addIssue({ code: "custom", message: "CPM bid can't be higher than the max CPM", path: ["bidding", "cpm"] });
      }
    }
    if (d.startDate && d.endDate && d.startDate > d.endDate) {
      ctx.addIssue({ code: "custom", message: "End date is before the start date", path: ["endDate"] });
    }
    const osv = d.targeting.platform.osVersion;
    for (const k of ["min", "max"] as const) {
      if (osv[k] && !OS_VERSION.test(osv[k])) {
        ctx.addIssue({ code: "custom", message: "OS version must look like 10, 13.4 or 14.2.1", path: ["targeting", "platform", "osVersion", k] });
      }
    }
    if (osv.min && osv.max && OS_VERSION.test(osv.min) && OS_VERSION.test(osv.max) && versionBefore(osv.max, osv.min)) {
      ctx.addIssue({ code: "custom", message: "Max OS version is lower than the min OS version", path: ["targeting", "platform", "osVersion", "max"] });
    }
    d.frequencyCaps.forEach((c, i) => {
      if (!positiveInt(c.count) || Number(c.count) > 1000) {
        ctx.addIssue({ code: "custom", message: "Cap must be a whole number from 1 to 1000", path: ["frequencyCaps", i, "count"] });
      }
      if (!positiveInt(c.every) || Number(c.every) > 365) {
        ctx.addIssue({ code: "custom", message: "Window must be a whole number from 1 to 365", path: ["frequencyCaps", i, "every"] });
      }
    });
    const sorted = d.flights.map((f, i) => ({ ...f, i })).sort((a, b) => a.startDate.localeCompare(b.startDate));
    sorted.forEach((f, k) => {
      if (!f.startDate || !f.endDate) {
        ctx.addIssue({ code: "custom", message: "Give every flight a start and an end date", path: ["flights", f.i, "startDate"] });
      } else if (f.endDate < f.startDate) {
        ctx.addIssue({ code: "custom", message: "A flight ends before it starts", path: ["flights", f.i, "endDate"] });
      } else if (k > 0 && sorted[k - 1].endDate && f.startDate <= sorted[k - 1].endDate) {
        ctx.addIssue({ code: "custom", message: "Flights can't overlap", path: ["flights", f.i, "startDate"] });
      }
      if (f.budget && (isNaN(Number(f.budget)) || Number(f.budget) <= 0)) {
        ctx.addIssue({ code: "custom", message: "Flight budget must be greater than 0", path: ["flights", f.i, "budget"] });
      }
    });
    if (d.status === "active" && d.creatives.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Attach at least one creative before activating this line item",
        path: ["status"],
      });
    }
  });

export type LineItemFormValues = InferSchemaType<typeof lineItemSchema>;

const num = (v?: string) => (v && v.trim() !== "" ? Number(v) : null);

export const browserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

type IE<T> = { include?: T[]; exclude?: T[] } | null | undefined;
const ie = <T,>(v?: IE<T>) => ({ include: v?.include || [], exclude: v?.exclude || [] });

// Saved targeting (a line item's, or a preset's) → form values. Missing rules
// become empty; timezone falls back to tz.
export const targetingToForm = (t: any, tz: string): LineItemFormValues["targeting"] => ({
  geo: {
    countries: ie(t?.geo?.countries),
    custom: t?.geo?.custom || [],
    metros: ie(t?.geo?.metros),
    zips: ie(t?.geo?.zips),
    zipLists: ie(t?.geo?.zipLists),
  },
  inventory: {
    bundles: ie(t?.inventory?.bundles),
    bundleLists: ie(t?.inventory?.bundleLists),
    deals: ie(t?.inventory?.deals),
    dealLists: ie(t?.inventory?.dealLists),
  },
  content: { categories: ie(t?.content?.categories), languages: ie(t?.content?.languages) },
  environment: { channels: t?.environment?.channels || [] },
  platform: {
    deviceTypes: ie<number>(t?.platform?.deviceTypes),
    connectionTypes: ie<number>(t?.platform?.connectionTypes),
    makes: ie(t?.platform?.makes),
    models: ie(t?.platform?.models),
    carriers: ie(t?.platform?.carriers),
    osVersion: { min: t?.platform?.osVersion?.min || "", max: t?.platform?.osVersion?.max || "" },
  },
  time: { timezone: t?.time?.timezone || tz, slots: t?.time?.slots || [] },
  segments: {
    audienceTarget: t?.segments?.audienceTarget || "all",
    customAudienceIds: t?.segments?.customAudienceIds || [],
    retargeting: {
      include: t?.segments?.retargeting?.include || [],
      exclude: t?.segments?.retargeting?.exclude || [],
    },
    requireDeviceId: !!t?.segments?.requireDeviceId,
  },
  exchange: {
    inventoryType: t?.exchange?.inventoryType || "programmatic",
    oemPremiumPartners: t?.exchange?.oemPremiumPartners || [],
    supplyPartners: ie(t?.exchange?.supplyPartners),
    zones: ie(t?.exchange?.zones),
  },
});

// Form targeting → API targeting.
export const toTargetingPayload = (t: LineItemFormValues["targeting"]) => ({
  ...t,
  platform: {
    ...t.platform,
    osVersion: { min: t.platform.osVersion.min || null, max: t.platform.osVersion.max || null },
  },
  // No hours selected = always on, so the timezone is irrelevant then.
  time: { timezone: t.time.slots.length ? t.time.timezone || null : null, slots: t.time.slots },
});

// Form values → API payload.
export const toLineItemPayload = (v: LineItemFormValues) => ({
  name: v.name,
  format: v.format,
  status: v.status,
  alternativeId: v.alternativeId || null,
  notes: v.notes || null,
  startDate: v.startDate || null,
  endDate: v.endDate || null,
  budget: num(v.budget),
  dailyBudget: num(v.dailyBudget),
  pacing: v.pacing,
  frequencyCaps: toFrequencyCaps(v.frequencyCaps),
  flights: [...v.flights]
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map((f) => ({ startDate: f.startDate, endDate: f.endDate, budget: num(f.budget) })),
  bidModifierId: v.bidModifierId || null,
  deliveryModifierId: v.deliveryModifierId || null,
  bidding: {
    strategy: v.bidding.strategy,
    cpm: v.bidding.strategy === "fixed_cpm" ? num(v.bidding.cpm) : null,
    maxCpm: num(v.bidding.maxCpm),
  },
  targeting: toTargetingPayload(v.targeting),
  creatives: v.creatives,
});
