import { z } from 'zod';

export const inventorySchema = z.object({
  inventoryName: z
    .string()
    .min(5, 'The inventory name must be at least 5 characters')
    .max(50, 'The inventory name must be up to 50 characters'),
});
