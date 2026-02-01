import prisma from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { MediaType, TagCategory } from "@prisma/client";
import type {
  CreateMediaInput,
  UpdateMediaInput,
} from "../validations/media.validation.js";
import * as tmdbService from "./tmdb.service.js";
import * as embeddingService from "./embedding.service.js";
import * as pineconeService from "./pinecone.service.js";

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

  // 1. Data Enrichment (TMDB)
  // If we are missing critical data (poster/description), try to fetch from TMDB
  if (!mediaData.posterUrl || !mediaData.description) {
    try {
      console.log(`🎬 Auto-enriching "${mediaData.title}" via TMDb...`);
      const tmdbResult = await tmdbService.fetchPosterForMedia(
        mediaData.type,
        mediaData.title,
        mediaData.releaseYear ?? undefined,
      );

      // Note: fetchPosterForMedia currently only returns URL, let's use searchMulti for full data
      // or just assume if we got a URL we could also get description.
      // For now, let's do a more robust search if description is missing.
      if (!mediaData.description) {
        let bestMatch: any = null;
        if (mediaData.type === "MOVIE") {
          bestMatch = await tmdbService.searchMovie(
            mediaData.title,
            mediaData.releaseYear ?? undefined,
          );
        } else if (mediaData.type === "SHOW") {
          bestMatch = await tmdbService.searchTvShow(
            mediaData.title,
            mediaData.releaseYear ?? undefined,
          );
        }

        if (bestMatch) {
          mediaData.description = mediaData.description || bestMatch.overview;
          mediaData.posterUrl =
            mediaData.posterUrl ||
            tmdbService.getPosterUrl(bestMatch.poster_path);
          mediaData.releaseYear =
            mediaData.releaseYear ||
            (bestMatch.release_date
              ? parseInt(bestMatch.release_date.split("-")[0])
              : bestMatch.first_air_date
                ? parseInt(bestMatch.first_air_date.split("-")[0])
                : null);
          console.log(`✅ Found match: ${bestMatch.title || bestMatch.name}`);
        }
      } else if (!mediaData.posterUrl) {
        // Just fetch poster if that's all we need
        const posterUrl = await tmdbService.fetchPosterForMedia(
          mediaData.type,
          mediaData.title,
          mediaData.releaseYear ?? undefined,
        );
        if (posterUrl) mediaData.posterUrl = posterUrl;
      }
    } catch (error) {
      console.warn("⚠️ TMDb enrichment failed:", error);
      // Continue without enrichment
    }
  }

  // 2. Generate Embedding
  // Create text representation for vector
  const embeddingText = embeddingService.createMediaEmbeddingText({
    title: mediaData.title,
    description: mediaData.description,
    tags: tagNames,
  });
  const vectorValues =
    await embeddingService.generateQueryEmbedding(embeddingText);

  // 3. Create media with tags & embedding in Postgres
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
      embedding: {
        create: {
          values: JSON.stringify(vectorValues), // SQLite: store as JSON string
          modelVersion: "Xenova/all-MiniLM-L6-v2",
        },
      },
    },
    include: {
      tags: {
        include: { tag: true },
      },
    },
  });

  // 4. Sync to Pinecone (Fire and Forget or Await?)
  // Await to ensure consistency for now.
  try {
    if (await pineconeService.isPineconeAvailable()) {
      await pineconeService.upsertVector({
        id: media.id,
        values: vectorValues,
        metadata: {
          mediaId: media.id,
          type: media.type,
          title: media.title,
          releaseYear: media.releaseYear ?? undefined,
          tags: media.tags.map((t) => t.tag.name),
        },
      });
      console.log(`🌲 Synced "${media.title}" to Pinecone`);
    }
  } catch (error) {
    console.error("⚠️ Pinecone sync failed:", error);
    // Don't fail the request, just log
  }

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
          { title: { contains: query } }, // SQLite: LIKE is case-insensitive by default
          { description: { contains: query } },
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
