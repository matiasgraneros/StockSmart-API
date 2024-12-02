import { z } from 'zod';

export const operationSchema = z.object({
  operationType: z.string(),
  quantity: z.number().positive(),
  inventoryId: z.number().positive(),
  itemId: z.number().positive(),
});
