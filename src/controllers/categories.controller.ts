import { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { isUserInInventory } from '../services/users.service';

export async function getCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const inventoryId = Number(req.params.inventoryId);
    const userId = Number(req.user?.userId);

    if (!inventoryId || typeof inventoryId !== 'number') {
      res.status(400).json({ message: 'The inventory ID is not valid' });
      return;
    }

    const hasAccess = await isUserInInventory(userId, inventoryId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Acces denied' });
      return;
    }

    const categories = await prisma.category.findMany({
      where: {
        inventoryId: inventoryId,
      },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
}

export async function createCategorie(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { categoryName, inventoryId } = req.body;
    const userId = Number(req.user?.userId);

    const hasAccess = await isUserInInventory(userId, inventoryId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const existingCategory = await prisma.category.findFirst({
      where: { name: categoryName, inventoryId: inventoryId },
    });
    if (existingCategory) {
      res.status(409).json({
        message: 'A category with this name already exists in the inventory',
      });
      return;
    }

    const newCategory = await prisma.category.create({
      data: {
        name: categoryName,
        inventoryId: inventoryId,
      },
    });

    res.status(201).json({ message: 'Category created', data: newCategory });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.user?.userId);
    const categoryId = Number(req.params.categoryId);

    if (!Number(categoryId) || Number(categoryId) < 1) {
      res.status(400).json({ message: 'The category ID is not valid' });
      return;
    }

    const inventoryId = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      select: {
        inventoryId: true,
      },
    });
    if (!inventoryId?.inventoryId) {
      res.status(404).json({ message: 'The category does not exist' });
      return;
    }

    const hasAccess = await isUserInInventory(userId, inventoryId.inventoryId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const categoryDeleted = await prisma.category.delete({
      where: { id: categoryId },
    });

    res
      .status(200)
      .json({ message: 'Category deleted', data: categoryDeleted });
    return;
  } catch (error) {
    next(error);
  }
}
