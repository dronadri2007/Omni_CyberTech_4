import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler';
import { authService } from '../services/authService';
import { AppError } from '../utils/AppError';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export const loginUser = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.status(200).json({ message: 'Login successful', user, token });
});

export const registerUser = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({ message: 'Registration successful', user, token });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.auth) throw AppError.unauthorized();
  const user = authService.getById(req.auth.sub) ?? {
    id: req.auth.sub,
    name: req.auth.name,
    email: req.auth.email,
    role: req.auth.role,
    createdAt: new Date(0).toISOString(),
  };
  res.status(200).json({ user });
});
