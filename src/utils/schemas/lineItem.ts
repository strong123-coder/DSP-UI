import { z } from "zod";
import type { InferSchemaType } from "./type";

// Numeric inputs are kept as strings in the form (like the campaign form) and
// converted on submit. "" means "not set".
const optionalAmount = (label: string) =>
  z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), { message: `${label} must be 0 or more` });

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
      }),
      segments: z.object({
        audienceTarget: z.enum(["all", "custom"]),
        customAudienceIds: z.array(z.string()),
      }),
      exchange: z.object({
        inventoryType: z.enum(["programmatic", "oem_premium_partners"]),
        oemPremiumPartners: z.array(z.string()),
      }),
    }),
    creatives: z.array(z.object({ creativeId: z.string() })),
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
  bidding: {
    strategy: v.bidding.strategy,
    cpm: v.bidding.strategy === "fixed_cpm" ? num(v.bidding.cpm) : null,
    maxCpm: num(v.bidding.maxCpm),
  },
  targeting: v.targeting,
  creatives: v.creatives,
});
