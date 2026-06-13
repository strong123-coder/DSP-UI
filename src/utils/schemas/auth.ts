import { z } from "zod";
import type { InferSchemaType } from "./type";

export type LoginFormValues = InferSchemaType<typeof loginSchema>;
export type SuperAdminLoginFormValues = InferSchemaType<
  typeof superAdminLoginSchema
>;

// Zod validation schema for Community Admin
export const loginSchema = z.object({
  orgId: z.string().min(1, { message: "Please enter a valid Organization ID" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

// Super admin logs in with email + password only (not org-scoped).
export const superAdminLoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});
