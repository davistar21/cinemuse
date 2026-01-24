import { z } from "zod";

export const createListSchema = z.object({
  body: z.object({
    name: z.string().min(1, "List name is required").max(100),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().default(false),
  }),
});

export const updateListSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().optional(),
  }),
});

export const addListItemSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    mediaId: z.string().cuid("Invalid media ID"),
    note: z.string().max(500).optional(),
  }),
});

export const removeListItemSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
    itemId: z.string().cuid(),
  }),
});

export const getListSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const getUserListsSchema = z.object({
  params: z.object({
    userId: z.string().cuid(),
  }),
});

export type CreateListInput = z.infer<typeof createListSchema>["body"];
export type UpdateListInput = z.infer<typeof updateListSchema>["body"];
export type AddListItemInput = z.infer<typeof addListItemSchema>["body"];
