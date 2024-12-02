import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email().max(40, 'The email must be up to 40 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(40, 'Password must be up to 40 characters'),
  role: z.string(),
});
