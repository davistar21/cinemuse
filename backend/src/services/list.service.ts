import prisma from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import type {
  CreateListInput,
  UpdateListInput,
  AddListItemInput,
} from "../validations/list.validation.js";

export interface ListWithItems {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  userId: string;
  createdAt: Date;
  items: {
    id: string;
    order: number;
    note: string | null;
    media: {
      id: string;
      type: string;
      title: string;
      posterUrl: string | null;
    };
  }[];
}

/**
 * Create a new list
 */
export async function createList(
  userId: string,
  input: CreateListInput,
): Promise<ListWithItems> {
  const list = await prisma.list.create({
    data: {
      ...input,
      userId,
    },
    include: {
      items: {
        include: {
          media: {
            select: {
              id: true,
              type: true,
              title: true,
              posterUrl: true,
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  return list;
}

/**
 * Get a list by ID
 */
export async function getListById(
  listId: string,
  requestingUserId?: string,
): Promise<ListWithItems> {
  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: {
      items: {
        include: {
          media: {
            select: {
              id: true,
              type: true,
              title: true,
              posterUrl: true,
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!list) {
    throw ApiError.notFound("List not found");
  }

  // Check access
  if (!list.isPublic && list.userId !== requestingUserId) {
    throw ApiError.forbidden("This list is private");
  }

  return list;
}

/**
 * Update a list
 */
export async function updateList(
  listId: string,
  userId: string,
  input: UpdateListInput,
): Promise<ListWithItems> {
  // Check ownership
  const existing = await prisma.list.findUnique({ where: { id: listId } });

  if (!existing) {
    throw ApiError.notFound("List not found");
  }

  if (existing.userId !== userId) {
    throw ApiError.forbidden("You can only update your own lists");
  }

  const list = await prisma.list.update({
    where: { id: listId },
    data: input,
    include: {
      items: {
        include: {
          media: {
            select: {
              id: true,
              type: true,
              title: true,
              posterUrl: true,
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  return list;
}

/**
 * Delete a list
 */
export async function deleteList(
  listId: string,
  userId: string,
): Promise<void> {
  const existing = await prisma.list.findUnique({ where: { id: listId } });

  if (!existing) {
    throw ApiError.notFound("List not found");
  }

  if (existing.userId !== userId) {
    throw ApiError.forbidden("You can only delete your own lists");
  }

  await prisma.list.delete({ where: { id: listId } });
}

/**
 * Add an item to a list
 */
export async function addItemToList(
  listId: string,
  userId: string,
  input: AddListItemInput,
): Promise<ListWithItems> {
  // Check ownership
  const list = await prisma.list.findUnique({ where: { id: listId } });

  if (!list) {
    throw ApiError.notFound("List not found");
  }

  if (list.userId !== userId) {
    throw ApiError.forbidden("You can only add items to your own lists");
  }

  // Check if media exists
  const media = await prisma.mediaItem.findUnique({
    where: { id: input.mediaId },
  });

  if (!media) {
    throw ApiError.notFound("Media item not found");
  }

  // Get current max order
  const maxOrder = await prisma.listItem.aggregate({
    where: { listId },
    _max: { order: true },
  });

  // Add item
  await prisma.listItem.create({
    data: {
      listId,
      mediaId: input.mediaId,
      note: input.note,
      order: (maxOrder._max.order || 0) + 1,
    },
  });

  // Return updated list
  return getListById(listId, userId);
}

/**
 * Remove an item from a list
 */
export async function removeItemFromList(
  listId: string,
  itemId: string,
  userId: string,
): Promise<ListWithItems> {
  // Check ownership
  const list = await prisma.list.findUnique({ where: { id: listId } });

  if (!list) {
    throw ApiError.notFound("List not found");
  }

  if (list.userId !== userId) {
    throw ApiError.forbidden("You can only remove items from your own lists");
  }

  // Check if item exists
  const item = await prisma.listItem.findUnique({ where: { id: itemId } });

  if (!item || item.listId !== listId) {
    throw ApiError.notFound("List item not found");
  }

  await prisma.listItem.delete({ where: { id: itemId } });

  return getListById(listId, userId);
}

/**
 * Get lists for a user
 */
export async function getUserLists(
  targetUserId: string,
  requestingUserId?: string,
): Promise<ListWithItems[]> {
  const where = {
    userId: targetUserId,
    ...(targetUserId === requestingUserId ? {} : { isPublic: true }),
  };

  const lists = await prisma.list.findMany({
    where,
    include: {
      items: {
        include: {
          media: {
            select: {
              id: true,
              type: true,
              title: true,
              posterUrl: true,
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return lists;
}

export default {
  createList,
  getListById,
  updateList,
  deleteList,
  addItemToList,
  removeItemFromList,
  getUserLists,
};
