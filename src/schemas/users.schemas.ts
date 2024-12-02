import { z } from 'zod';

export const modifyRelationSchema = z.object({
  userEmail: z.string().email(),
  inventoryId: z.number().positive(),
  action: z.string(),
});
