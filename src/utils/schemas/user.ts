import { z } from "zod";
import type { InferSchemaType } from "./type";

export type AddUserFormValues = InferSchemaType<typeof addUserSchema>;

export const addUserSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  mobile: z.string().trim().min(1, { message: "Mobile number is required" }),
  password: z.string().trim().min(6, { message: "Password must be at least 6 characters" }),
  type: z.enum(["admin", "team"]),
  gender: z.string().trim().optional(),
  age: z.string().or(z.number()).optional(),
  address: z.string().trim().optional(),
  status: z.enum(["active", "inactive", "deleted"]),
});

export type EditUserFormValues = InferSchemaType<typeof editUserSchema>;

export const editUserSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  mobile: z.string().trim().min(1, { message: "Mobile number is required" }),
  type: z.enum(["admin", "team"]),
  gender: z.string().trim().optional(),
  age: z.string().or(z.number()).optional(),
  address: z.string().trim().optional(),
  status: z.enum(["active", "inactive", "deleted"]),
});
