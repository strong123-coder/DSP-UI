import { z } from "zod";
import type { InferSchemaType } from "./type";

export type AddCampaignFormValues = InferSchemaType<typeof addCampaignSchema>;

// Nested Event schema
const eventDetailSchema = z.object({
  name: z.string().trim().min(1, { message: "Event name is required" }),
  bidPrice: z.string().trim().optional(),
  currency: z.string().trim().optional(),
});

// Nested Targeting schema
const customTargatingSchema = z.object({
  country: z.string().trim().optional(),
  state: z.string().trim().optional(),
  city: z.string().trim().optional(),
});

// Nested Media schema
const mediaObjectSchema = z.object({
  id: z.string().trim().optional(),
  link: z.string().trim().optional(),
  type: z.string().trim().optional(),
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
    bundleId: z.string().trim().min(1, {
      message: "App Bundle ID is required",
    }),
    budget: z.string().trim().min(1, {
      message: "Campaign Budget is required",
    }),
    dailyBudget: z.string().trim().min(1, {
      message: "Daily Budget is required",
    }),
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
    vtaUrl: z.string().trim().min(1, { message: "VTA URL is required" }),
    eventDetails: z.array(eventDetailSchema).optional(),
    geo: z.array(z.string().trim()).optional(),
    isCustomTargating: z.boolean().optional(),
    customTargating: z.array(customTargatingSchema).optional(),
    audienceTarget: z.enum(["all", "custom"]).optional(),
    customAudienceIds: z.array(z.string().trim()).optional(),
    inventoryType: z.enum(["programmatic", "oem_premium_partners"]).optional(),
    oemPremiumPartners: z.array(z.string().trim()).optional(),
    media: z.array(mediaObjectSchema).optional(),
  })
  .superRefine((data, ctx) => {
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
  });

export type EditCampaignFormValues = InferSchemaType<typeof editCampaignSchema>;
export const editCampaignSchema = addCampaignSchema;

