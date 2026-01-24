import { z } from "zod";
import { mediaTypeEnum } from "./media.validation.js";

export const memorySearchSchema = z.object({
  body: z.object({
    query: z
      .string()
      .min(10, "Please describe in more detail (at least 10 characters)")
      .max(1000, "Description too long"),
    type: mediaTypeEnum.optional(),
    limit: z.number().int().min(1).max(20).default(10),
  }),
});

export const similarItemsSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  query: z.object({
    limit: z.coerce.number().int().min(1).max(20).default(5),
    crossMedia: z.coerce.boolean().default(true),
  }),
});

export type MemorySearchInput = z.infer<typeof memorySearchSchema>["body"];
export type SimilarItemsQuery = z.infer<typeof similarItemsSchema>["query"];
