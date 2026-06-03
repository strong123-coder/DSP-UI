import { z, ZodType } from "zod";

export type InferSchemaType<TSchema extends ZodType> = z.infer<TSchema>;
