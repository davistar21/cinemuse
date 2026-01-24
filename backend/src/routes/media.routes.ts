import { Router } from "express";
import * as mediaController from "../controllers/media.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createMediaSchema,
  updateMediaSchema,
  getMediaSchema,
  searchMediaSchema,
} from "../validations/media.validation.js";

const router = Router();

/**
 * @route   GET /api/v1/media/search
 * @desc    Search media items by keyword
 * @access  Public
 */
router.get("/search", validate(searchMediaSchema), mediaController.searchMedia);

/**
 * @route   GET /api/v1/media
 * @desc    Get all media items
 * @access  Public
 */
router.get("/", mediaController.getAllMedia);

/**
 * @route   GET /api/v1/media/:id
 * @desc    Get a media item by ID
 * @access  Public
 */
router.get("/:id", validate(getMediaSchema), mediaController.getMedia);

/**
 * @route   GET /api/v1/media/:id/similar
 * @desc    Get similar media items
 * @access  Public
 */
router.get(
  "/:id/similar",
  validate(getMediaSchema),
  mediaController.getSimilarMedia,
);

/**
 * @route   POST /api/v1/media
 * @desc    Create a new media item
 * @access  Admin only
 */
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createMediaSchema),
  mediaController.createMedia,
);

/**
 * @route   PATCH /api/v1/media/:id
 * @desc    Update a media item
 * @access  Admin only
 */
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateMediaSchema),
  mediaController.updateMedia,
);

/**
 * @route   DELETE /api/v1/media/:id
 * @desc    Delete a media item
 * @access  Admin only
 */
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(getMediaSchema),
  mediaController.deleteMedia,
);

export default router;
