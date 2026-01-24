import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import * as authService from "../services/auth.service.js";
import type {
  RegisterInput,
  LoginInput,
} from "../validations/auth.validation.js";

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const register = catchAsync(async (req: Request, res: Response) => {
  const input: RegisterInput = req.body;
  const result = await authService.register(input);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = catchAsync(async (req: Request, res: Response) => {
  const input: LoginInput = req.body;
  const result = await authService.login(input);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

/**
 * Get current user
 * GET /api/v1/auth/me
 */
export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.getUserById(req.user!.id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

export default { register, login, getMe };
