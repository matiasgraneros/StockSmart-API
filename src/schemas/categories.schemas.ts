import { z } from 'zod';

export const createCategorySchema = z.object({
  categoryName: z
    .string()
    .min(4, 'The inventory name must be at least 4 characters')
    .max(30, 'The inventory name must be up to 30 characters'),
  inventoryId: z.number().positive(),
});
