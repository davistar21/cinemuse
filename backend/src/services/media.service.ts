import prisma from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { MediaType, TagCategory } from "@prisma/client";
import type {
  CreateMediaInput,
  UpdateMediaInput,
} from "../validations/media.validation.js";

export interface MediaWithTags {
  id: string;
  type: MediaType;
  title: string;
  description: string | null;
  releaseYear: number | null;
  language: string | null;
  posterUrl: string | null;
  externalId: string | null;
  createdAt: Date;
  tags: { id: string; name: string; category: TagCategory }[];
}

/**
 * Create a new media item
 */
export async function createMedia(
  input: CreateMediaInput,
): Promise<MediaWithTags> {
  const { tags: tagNames, ...mediaData } = input;

  // Create media with tags
  const media = await prisma.mediaItem.create({
    data: {
      ...mediaData,
      tags: tagNames
        ? {
            create: tagNames.map((tagName) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName.toLowerCase() },
                  create: {
                    name: tagName.toLowerCase(),
                    category: "GENRE" as TagCategory,
                  },
                },
              },
            })),
          }
        : undefined,
    },
    include: {
      tags: {
        include: { tag: true },
      },
    },
  });

  return {
    ...media,
    tags: media.tags.map((mt) => mt.tag),
  };
}

/**
 * Get a media item by ID
 */
export async function getMediaById(id: string): Promise<MediaWithTags> {
  const media = await prisma.mediaItem.findUnique({
    where: { id },
    include: {
      tags: {
        include: { tag: true },
      },
    },
  });

  if (!media) {
    throw ApiError.notFound("Media item not found");
  }

  return {
    ...media,
    tags: media.tags.map((mt) => mt.tag),
  };
}

/**
 * Update a media item
 */
export async function updateMedia(
  id: string,
  input: UpdateMediaInput,
): Promise<MediaWithTags> {
  const { tags: tagNames, ...mediaData } = input;

  // Check if media exists
  const existing = await prisma.mediaItem.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound("Media item not found");
  }

  // Update media
  const media = await prisma.mediaItem.update({
    where: { id },
    data: {
      ...mediaData,
      // If tags provided, replace all tags
      tags: tagNames
        ? {
            deleteMany: {},
            create: tagNames.map((tagName) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName.toLowerCase() },
                  create: {
                    name: tagName.toLowerCase(),
                    category: "GENRE" as TagCategory,
                  },
                },
              },
            })),
          }
        : undefined,
    },
    include: {
      tags: {
        include: { tag: true },
      },
    },
  });

  return {
    ...media,
    tags: media.tags.map((mt) => mt.tag),
  };
}

/**
 * Delete a media item
 */
export async function deleteMedia(id: string): Promise<void> {
  const existing = await prisma.mediaItem.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound("Media item not found");
  }

  await prisma.mediaItem.delete({ where: { id } });
}

/**
 * Search media by keyword (Postgres full-text search)
 */
export async function searchMedia(params: {
  query: string;
  type?: MediaType;
  limit: number;
  offset: number;
}): Promise<{ items: MediaWithTags[]; total: number }> {
  const { query, type, limit, offset } = params;

  const where = {
    AND: [
      {
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
        ],
      },
      type ? { type } : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.mediaItem.findMany({
      where,
      include: {
        tags: {
          include: { tag: true },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { title: "asc" },
    }),
    prisma.mediaItem.count({ where }),
  ]);

  return {
    items: items.map((item) => ({
      ...item,
      tags: item.tags.map((mt) => mt.tag),
    })),
    total,
  };
}

/**
 * Get all media items with pagination
 */
export async function getAllMedia(params: {
  type?: MediaType;
  limit: number;
  offset: number;
}): Promise<{ items: MediaWithTags[]; total: number }> {
  const { type, limit, offset } = params;

  const where = type ? { type } : {};

  const [items, total] = await Promise.all([
    prisma.mediaItem.findMany({
      where,
      include: {
        tags: {
          include: { tag: true },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    }),
    prisma.mediaItem.count({ where }),
  ]);

  return {
    items: items.map((item) => ({
      ...item,
      tags: item.tags.map((mt) => mt.tag),
    })),
    total,
  };
}

export default {
  createMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  searchMedia,
  getAllMedia,
};
