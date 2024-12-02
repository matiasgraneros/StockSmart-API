import { prisma } from '../lib/prisma';
import { NextFunction, Request, Response } from 'express';
import { isUserInInventory } from '../services/users.service';

export async function createInventory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { inventoryName } = req.body;
    const userId = Number(req.user?.userId);

    const existingInventory = await prisma.inventory.findFirst({
      where: { name: inventoryName },
    });

    if (existingInventory) {
      res
        .status(409)
        .json({ message: 'There is already an inventory with that name' });
      return;
    }

    const newInventory = await prisma.inventory.create({
      data: {
        name: inventoryName,
        users: {
          connect: { id: userId },
        },
      },
    });
    res.status(201).json({ message: 'Inventory created', data: newInventory });
  } catch (error) {
    next(error);
  }
}

export async function getInventory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.user?.userId);
    const inventoryId = Number(req.params.inventoryId);

    if (!inventoryId || inventoryId < 1) {
      res.status(400).json({ message: 'The inventory ID is not valid' });
      return;
    }

    const hasAccess = await isUserInInventory(userId, inventoryId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      include: {
        users: true,
        items: true,
        operations: true,
        categories: true,
      },
    });

    res.status(200).json(inventory);
  } catch (error) {
    next(error);
  }
}

export async function getInventories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.user?.userId);
    const inventories = await prisma.inventory.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        users: true,
        items: true,
        operations: true,
        categories: true,
      },
    });

    res.status(200).json(inventories);
  } catch (error) {
    next(error);
  }
}

export async function getItems(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.user?.userId);
    const inventoryId = Number(req.params.inventoryId);
    if (!inventoryId || inventoryId < 1) {
      res.status(400).json({ message: 'The inventory ID is not valid' });
      return;
    }

    const hasAccess = await isUserInInventory(userId, inventoryId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const categoryId = req.query.categoryId
      ? Number(req.query.categoryId)
      : null;

    if (categoryId) {
      const categoryExistsInInventory = await prisma.category.findUnique({
        where: { id: categoryId, inventoryId: inventoryId },
      });
      if (!categoryExistsInInventory) {
        res
          .status(404)
          .json({ message: 'The category does not exist in the inventory' });
        return;
      }
    }

    const items = await prisma.item.findMany({
      where: {
        inventoryId: inventoryId,
        ...(categoryId && { categoryId: categoryId }),
      },
    });

    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
}

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.user?.userId);
    const inventoryId = Number(req.params.inventoryId);

    if (!inventoryId) {
      res.status(400).json({ message: 'The inventory ID is not valid' });
      return;
    }

    const hasAccess = await isUserInInventory(userId, inventoryId);

    if (!hasAccess) {
      res.status(403).json({ message: 'Acces denied' });
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        inventories: {
          some: {
            id: inventoryId,
          },
        },
      },
      include: {
        inventories: true,
      },
    });

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

/* admin:
{
	"email": "matias@gmail.com",
	"password": "123456"
} */

/* employee:
    "email": "matias4@gmail.com",
	 "password": "1234567" */
