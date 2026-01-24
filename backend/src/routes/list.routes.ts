import { Router } from "express";
import * as listController from "../controllers/list.controller.js";
import { authenticate, optionalAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createListSchema,
  updateListSchema,
  addListItemSchema,
  removeListItemSchema,
  getListSchema,
  getUserListsSchema,
} from "../validations/list.validation.js";

const router = Router();

/**
 * @route   POST /api/v1/lists
 * @desc    Create a new list
 * @access  Private
 */
router.post(
  "/",
  authenticate,
  validate(createListSchema),
  listController.createList,
);

/**
 * @route   GET /api/v1/lists/:id
 * @desc    Get a list by ID
 * @access  Public (for public lists) / Private (for own lists)
 */
router.get(
  "/:id",
  optionalAuth,
  validate(getListSchema),
  listController.getList,
);

/**
 * @route   PATCH /api/v1/lists/:id
 * @desc    Update a list
 * @access  Private (owner only)
 */
router.patch(
  "/:id",
  authenticate,
  validate(updateListSchema),
  listController.updateList,
);

/**
 * @route   DELETE /api/v1/lists/:id
 * @desc    Delete a list
 * @access  Private (owner only)
 */
router.delete(
  "/:id",
  authenticate,
  validate(getListSchema),
  listController.deleteList,
);

/**
 * @route   POST /api/v1/lists/:id/items
 * @desc    Add item to list
 * @access  Private (owner only)
 */
router.post(
  "/:id/items",
  authenticate,
  validate(addListItemSchema),
  listController.addItem,
);

/**
 * @route   DELETE /api/v1/lists/:id/items/:itemId
 * @desc    Remove item from list
 * @access  Private (owner only)
 */
router.delete(
  "/:id/items/:itemId",
  authenticate,
  validate(removeListItemSchema),
  listController.removeItem,
);

// User lists route (mounted separately from /lists)
// This is accessed via /api/v1/users/:userId/lists
export const userListsRouter = Router({ mergeParams: true });

userListsRouter.get(
  "/",
  optionalAuth,
  validate(getUserListsSchema),
  listController.getUserLists,
);

export default router;
