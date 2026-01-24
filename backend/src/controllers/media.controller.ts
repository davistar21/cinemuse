import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import * as mediaService from "../services/media.service.js";
import * as searchService from "../services/search.service.js";
import { MediaType } from "@prisma/client";

/**
 * Create a new media item (Admin only)
 * POST /api/v1/media
 */
export const createMedia = catchAsync(async (req: Request, res: Response) => {
  const media = await mediaService.createMedia(req.body);

  res.status(201).json({
    success: true,
    message: "Media item created successfully",
    data: { media },
  });
});

/**
 * Get media item by ID
 * GET /api/v1/media/:id
 */
export const getMedia = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const media = await mediaService.getMediaById(id);

  res.status(200).json({
    success: true,
    data: { media },
  });
});

/**
 * Update a media item (Admin only)
 * PATCH /api/v1/media/:id
 */
export const updateMedia = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const media = await mediaService.updateMedia(id, req.body);

  res.status(200).json({
    success: true,
    message: "Media item updated successfully",
    data: { media },
  });
});

/**
 * Delete a media item (Admin only)
 * DELETE /api/v1/media/:id
 */
export const deleteMedia = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await mediaService.deleteMedia(id);

  res.status(200).json({
    success: true,
    message: "Media item deleted successfully",
  });
});

/**
 * Search media items by keyword
 * GET /api/v1/media/search
 */
export const searchMedia = catchAsync(async (req: Request, res: Response) => {
  const q = req.query.q as string;
  const type = req.query.type as MediaType | undefined;
  const limit = req.query.limit as string | undefined;
  const offset = req.query.offset as string | undefined;

  const result = await mediaService.searchMedia({
    query: q,
    type,
    limit: parseInt(limit || "20", 10),
    offset: parseInt(offset || "0", 10),
  });

  res.status(200).json({
    success: true,
    data: {
      items: result.items,
      total: result.total,
      limit: parseInt(limit || "20", 10),
      offset: parseInt(offset || "0", 10),
    },
  });
});

/**
 * Get all media items
 * GET /api/v1/media
 */
export const getAllMedia = catchAsync(async (req: Request, res: Response) => {
  const type = req.query.type as MediaType | undefined;
  const limit = req.query.limit as string | undefined;
  const offset = req.query.offset as string | undefined;

  const result = await mediaService.getAllMedia({
    type,
    limit: parseInt(limit || "20", 10),
    offset: parseInt(offset || "0", 10),
  });

  res.status(200).json({
    success: true,
    data: {
      items: result.items,
      total: result.total,
      limit: parseInt(limit || "20", 10),
      offset: parseInt(offset || "0", 10),
    },
  });
});

/**
 * Get similar items to a media item
 * GET /api/v1/media/:id/similar
 */
export const getSimilarMedia = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const limit = req.query.limit as string | undefined;
    const crossMedia = req.query.crossMedia as string | undefined;

    const similar = await searchService.getSimilarItems(id, {
      limit: parseInt(limit || "5", 10),
      crossMedia: crossMedia !== "false",
    });

    res.status(200).json({
      success: true,
      data: { similar },
    });
  },
);

export default {
  createMedia,
  getMedia,
  updateMedia,
  deleteMedia,
  searchMedia,
  getAllMedia,
  getSimilarMedia,
};
