import { z } from "zod";
import type { InferSchemaType } from "./type";

export type LoginFormValues = InferSchemaType<typeof loginSchema>;

// Zod validation schema for Community Admin
export const loginSchema = z.object({
  orgId: z.string().min(1, { message: "Please enter a valid Organization ID" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});
