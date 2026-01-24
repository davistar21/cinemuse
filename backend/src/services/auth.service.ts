import bcrypt from "bcryptjs";
import prisma from "../config/database.js";
import { generateToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";
import type {
  RegisterInput,
  LoginInput,
} from "../validations/auth.validation.js";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  token: string;
}

/**
 * Register a new user
 */
export async function register(input: RegisterInput): Promise<AuthResponse> {
  const { email, password, username } = input;

  // Check if email already exists
  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    throw ApiError.conflict("Email already registered");
  }

  // Check if username already exists
  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUsername) {
    throw ApiError.conflict("Username already taken");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
    },
  });

  // Generate token
  const token = generateToken({ userId: user.id, role: user.role });

  return { user, token };
}

/**
 * Login an existing user
 */
export async function login(input: LoginInput): Promise<AuthResponse> {
  const { email, password } = input;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  // Generate token
  const token = generateToken({ userId: user.id, role: user.role });

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    token,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return user;
}

export default { register, login, getUserById };
