import { z } from 'zod';

const trimmedString = z.string().trim();

export const createItemSchema = z.object({
  itemName: trimmedString
    .min(1, 'Item name must have at least one character')
    .max(30, 'Item name must be up to 30 characters'),
  categoryId: z.number().positive(),
  inventoryId: z.number().positive(),
});
