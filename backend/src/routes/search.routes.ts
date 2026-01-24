import { Router } from "express";
import * as searchController from "../controllers/search.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { memorySearchSchema } from "../validations/search.validation.js";

const router = Router();

/**
 * @route   POST /api/v1/search/memory
 * @desc    Semantic search - describe a movie/book/show from memory
 * @access  Public
 *
 * @example
 * POST /api/v1/search/memory
 * {
 *   "query": "A movie where a guy keeps reliving the same day over and over until he becomes a better person",
 *   "type": "MOVIE",
 *   "limit": 5
 * }
 */
router.post(
  "/memory",
  validate(memorySearchSchema),
  searchController.memorySearch,
);

export default router;
