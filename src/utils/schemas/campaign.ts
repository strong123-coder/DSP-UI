import { z } from "zod";
import type { InferSchemaType } from "./type";

export type AddCampaignFormValues = InferSchemaType<typeof addCampaignSchema>;

// Nested Event schema
const eventDetailSchema = z.object({
  name: z.string().trim().min(1, { message: "Event name is required" }),
  bidPrice: z
    .string()
    .trim()
    .min(1, { message: "Bid price is required" })
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num > 0;
      },
      {
        message: "Bid price must be greater than 0",
      },
    ),
  currency: z.string().trim().min(1, { message: "Currency is required" }),
});

// Nested Targeting schema
const customTargatingSchema = z.object({
  country: z.string().trim().optional(),
  state: z.string().trim().optional(),
  city: z.string().trim().optional(),
});

// Nested Media schema. Fields are .nullish(), not .optional(): the backend
// stores null for fields a creative doesn't use (e.g. an image has no
// duration/vastTag/mime), and .optional() rejects null — which blocked the
// whole Edit Campaign form for any campaign with such a creative.
const mediaObjectSchema = z.object({
  id: z.string().trim().nullish(),
  link: z.string().trim().nullish(),
  type: z.string().trim().nullish(),
  w: z.number().nullish(),
  h: z.number().nullish(),
  // Video / CTV creative fields.
  duration: z.number().nullish(),
  vastTag: z.string().trim().nullish(),
  mime: z.string().trim().nullish(),
});

// Root Add Campaign schema
export const addCampaignSchema = z
  .object({
    title: z.string().trim().min(1, { message: "Campaign name is required" }),
    type: z.enum(["mobile", "ctv", "web"], {
      message: "Platform type is required",
    }),
    goal: z.string().trim().min(1, {
      message: "Campaign goal is required",
    }),
    status: z.enum(["active", "paused"]).default("paused").optional(),
    currency: z.string().trim().optional(),
    // App-install fields are required for Mobile campaigns only (enforced in
    // superRefine); CTV / Web campaigns don't have an app OS / bundle.
    bundleId: z.string().trim().optional(),
    appName: z.string().trim().optional(),
    appOs: z.enum(["android", "ios"]).optional(),
    appIconLink: z.string().trim().optional(),
    budget: z
      .string()
      .trim()
      .min(1, {
        message: "Campaign Budget is required",
      })
      .refine(
        (val) => {
          const num = Number(val);
          return !isNaN(num) && num > 0;
        },
        {
          message: "Campaign Budget must be greater than 0",
        },
      ),
    dailyBudget: z
      .string()
      .trim()
      .min(1, {
        message: "Daily Budget is required",
      })
      .refine(
        (val) => {
          const num = Number(val);
          return !isNaN(num) && num > 0;
        },
        {
          message: "Daily Budget must be greater than 0",
        },
      ),
    kpi: z.string().trim().min(1, { message: "KPI is required" }),
    isScheduling: z.boolean().optional(),
    startDate: z.string().trim().optional(),
    endDate: z.string().trim().optional(),
    mmpPlatform: z
      .enum([
        "appsflyer",
        "adjust",
        "branch",
        "singular",
        "apptrove",
        "kochawa",
        "appmetrica",
        "affise",
      ])
      .optional(),
    ctaUrl: z.string().trim().min(1, { message: "CTA URL is required" }),
    vtaUrl: z.string().trim().optional(),
    eventDetails: z.array(eventDetailSchema).optional(),
    geo: z.array(z.string().trim()).min(1, { message: "Geo is required" }),
    isCustomTargating: z.boolean().optional(),
    customTargating: z.array(customTargatingSchema).optional(),
    audienceTarget: z.enum(["all", "custom"]).optional(),
    customAudienceIds: z.array(z.string().trim()).optional(),
    inventoryType: z.enum(["programmatic", "oem_premium_partners"]).optional(),
    oemPremiumPartners: z.array(z.string().trim()).optional(),
    media: z.array(mediaObjectSchema).optional(),
  })
  .superRefine((data, ctx) => {
    // Mobile campaigns must specify the app OS + bundle (app-install targeting).
    if (data.type === "mobile") {
      if (!data.appOs) {
        ctx.addIssue({ code: "custom", message: "App OS is required", path: ["appOs"] });
      }
      if (!data.bundleId || data.bundleId.trim() === "") {
        ctx.addIssue({ code: "custom", message: "App Bundle ID is required", path: ["bundleId"] });
      }
      if (!data.appName || data.appName.trim() === "") {
        ctx.addIssue({ code: "custom", message: "Correct OS Name and Bundle ID required", path: ["appName"] });
      }
    }

    if (data.isScheduling) {
      if (!data.startDate || data.startDate.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "Start date is required when scheduling is enabled",
          path: ["startDate"],
        });
      }
      if (!data.endDate || data.endDate.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "End date is required when scheduling is enabled",
          path: ["endDate"],
        });
      }
    }

    if (data.dailyBudget && data.budget) {
      const daily = Number(data.dailyBudget);
      const total = Number(data.budget);

      if (!isNaN(daily) && !isNaN(total) && daily > total) {
        ctx.addIssue({
          code: "custom",
          message: "Daily budget cannot exceed total budget",
          path: ["dailyBudget"],
        });
      }
    }
  });

export type EditCampaignFormValues = InferSchemaType<typeof editCampaignSchema>;
export const editCampaignSchema = addCampaignSchema;
