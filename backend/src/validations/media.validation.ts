import { z } from "zod";

export const mediaTypeEnum = z.enum(["MOVIE", "BOOK", "SHOW", "GAME"]);
export const tagCategoryEnum = z.enum(["MOOD", "THEME", "GENRE", "TROPE"]);

export const createMediaSchema = z.object({
  body: z.object({
    type: mediaTypeEnum,
    title: z.string().min(1, "Title is required").max(500),
    description: z.string().max(5000).optional(),
    releaseYear: z.number().int().min(1800).max(2100).optional(),
    language: z.string().max(50).optional(),
    posterUrl: z.string().url().optional(),
    externalId: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateMediaSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    title: z.string().min(1).max(500).optional(),
    description: z.string().max(5000).optional(),
    releaseYear: z.number().int().min(1800).max(2100).optional(),
    language: z.string().max(50).optional(),
    posterUrl: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const getMediaSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const searchMediaSchema = z.object({
  query: z.object({
    q: z.string().min(1, "Search query is required"),
    type: mediaTypeEnum.optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    offset: z.coerce.number().int().min(0).default(0),
  }),
});

export type CreateMediaInput = z.infer<typeof createMediaSchema>["body"];
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>["body"];
export type SearchMediaQuery = z.infer<typeof searchMediaSchema>["query"];
