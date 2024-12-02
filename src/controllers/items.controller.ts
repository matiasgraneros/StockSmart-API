import { NextFunction, Request, Response } from 'express';
import { isUserInInventory } from '../services/users.service';
import { prisma } from '../lib/prisma';

export async function createItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.user?.userId);
    const { itemName, categoryId, inventoryId } = req.body;

    const hasAccess = await isUserInInventory(userId, inventoryId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const categoryExistsInInventory = await prisma.category.findUnique({
      where: { id: categoryId, inventoryId: inventoryId },
    });
    if (!categoryExistsInInventory) {
      res
        .status(404)
        .json({ message: 'Category does not exist in this inventory' });
      return;
    }

    const existingItem = await prisma.item.findFirst({
      where: { name: itemName, inventoryId: inventoryId },
    });
    if (existingItem) {
      res.status(409).json({
        message: 'An item with this name already exists in the inventory',
      });
      return;
    }

    const newItem = await prisma.item.create({
      data: {
        name: itemName,
        categoryId: categoryId,
        inventoryId: inventoryId,
      },
    });

    res.status(201).json({ message: 'Item created', data: newItem });
  } catch (error) {
    next(error);
  }
}

export async function deleteItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.user?.userId);
    const itemId = Number(req.params.itemId);
    if (!Number(itemId) || Number(itemId) < 1) {
      res.status(400).json({ message: 'The item ID is not valid' });
      return;
    }

    const inventoryId = await prisma.item.findUnique({
      where: { id: itemId },
      select: { inventoryId: true },
    });
    if (!inventoryId?.inventoryId) {
      res.status(404).json({ message: 'The item does not exist' });
      return;
    }

    const hasAccess = await isUserInInventory(userId, inventoryId.inventoryId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const itemDeleted = await prisma.item.delete({
      where: { id: itemId },
    });

    res.status(200).json({ message: 'Item deleted', data: itemDeleted });
  } catch (error) {
    next(error);
  }
}
