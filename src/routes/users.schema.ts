import { z } from 'zod';

export const getUserParamsSchema = z.object({
  userId: z.string().min(1),
});

export type GetUserParams = z.infer<typeof getUserParamsSchema>;

export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;
