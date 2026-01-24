import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import * as listService from "../services/list.service.js";

/**
 * Create a new list
 * POST /api/v1/lists
 */
export const createList = catchAsync(async (req: Request, res: Response) => {
  const list = await listService.createList(req.user!.id, req.body);

  res.status(201).json({
    success: true,
    message: "List created successfully",
    data: { list },
  });
});

/**
 * Get a list by ID
 * GET /api/v1/lists/:id
 */
export const getList = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const list = await listService.getListById(id, req.user?.id);

  res.status(200).json({
    success: true,
    data: { list },
  });
});

/**
 * Update a list
 * PATCH /api/v1/lists/:id
 */
export const updateList = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const list = await listService.updateList(id, req.user!.id, req.body);

  res.status(200).json({
    success: true,
    message: "List updated successfully",
    data: { list },
  });
});

/**
 * Delete a list
 * DELETE /api/v1/lists/:id
 */
export const deleteList = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await listService.deleteList(id, req.user!.id);

  res.status(200).json({
    success: true,
    message: "List deleted successfully",
  });
});

/**
 * Add item to list
 * POST /api/v1/lists/:id/items
 */
export const addItem = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const list = await listService.addItemToList(id, req.user!.id, req.body);

  res.status(201).json({
    success: true,
    message: "Item added to list",
    data: { list },
  });
});

/**
 * Remove item from list
 * DELETE /api/v1/lists/:id/items/:itemId
 */
export const removeItem = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const itemId = req.params.itemId as string;
  const list = await listService.removeItemFromList(id, itemId, req.user!.id);

  res.status(200).json({
    success: true,
    message: "Item removed from list",
    data: { list },
  });
});

/**
 * Get user's lists
 * GET /api/v1/users/:userId/lists
 */
export const getUserLists = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const lists = await listService.getUserLists(userId, req.user?.id);

  res.status(200).json({
    success: true,
    data: { lists },
  });
});

export default {
  createList,
  getList,
  updateList,
  deleteList,
  addItem,
  removeItem,
  getUserLists,
};
