import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import * as searchService from "../services/search.service.js";
import type { MemorySearchInput } from "../validations/search.validation.js";

/**
 * Memory-based semantic search
 * POST /api/v1/search/memory
 *
 * Allows users to describe a movie/book/show from memory
 * and get matches based on semantic similarity
 */
export const memorySearch = catchAsync(async (req: Request, res: Response) => {
  const input: MemorySearchInput = req.body;

  const results = await searchService.memorySearch({
    query: input.query,
    type: input.type,
    limit: input.limit,
  });

  res.status(200).json({
    success: true,
    data: {
      query: input.query,
      results,
      count: results.length,
    },
  });
});

export default { memorySearch };
