import { prisma } from '../lib/prisma';

export async function isUserInInventory(userId: number, inventoryId: number) {
  const inventory = await prisma.inventory.findUnique({
    where: {
      id: inventoryId,
      users: {
        some: {
          id: userId,
        },
      },
    },
  });

  return !!inventory;
}
