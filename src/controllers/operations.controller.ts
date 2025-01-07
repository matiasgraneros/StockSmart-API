import { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { isUserInInventory } from '../services/users.service';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export async function createOperation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.user?.userId);
    const { operationType, quantity, inventoryId, itemId } = req.body;

    if (!['ADD', 'REMOVE'].includes(operationType)) {
      res.status(400).json({ message: 'The operation type is not valid' });
      return;
    }

    const hasAccess = await isUserInInventory(userId, inventoryId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Acces denied' });
      return;
    }

    const item = await prisma.item.findUnique({
      where: {
        id: itemId,
        inventoryId: inventoryId,
      },
      select: { quantity: true },
    });
    if (!item) {
      res
        .status(404)
        .json({ message: 'Item does not exist in this inventory' });
      return;
    }

    if (operationType === 'REMOVE' && item.quantity < quantity) {
      res.status(400).json({ message: 'Not enough items in stock' });
      return;
    }

    const operation = await prisma.$transaction(async (tx) => {
      const updatedItem = await tx.item.update({
        where: { id: itemId },
        data: {
          quantity: {
            [operationType === 'ADD' ? 'increment' : 'decrement']: quantity,
          },
        },
      });

      const newOperation = await tx.operation.create({
        data: {
          type: operationType,
          quantity: quantity,
          inventoryId: inventoryId,
          itemId: itemId,
          userId: userId,
        },
      });
      return { newOperation, updatedQuantity: updatedItem.quantity };
    });

    res.status(201).json({
      message: 'Operation created',
      operation,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOperationsByInventory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.user?.userId);
    const inventoryId = Number(req.params.inventoryId);
    const page = Number(req.query.page) || DEFAULT_PAGE;
    const limit = Math.min(Number(req.query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
    const order: 'asc' | 'desc' = req.query.order === 'asc' ? 'asc' : 'desc';

    if (!inventoryId || inventoryId < 1) {
      res.status(400).json({ message: 'The inventory ID is not valid' });
      return;
    }
    if (page < 1 || limit < 1) {
      res
        .status(400)
        .json({ message: 'Page and limit must be positive numbers' });
      return;
    }

    const hasAccess = await isUserInInventory(userId, inventoryId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Acces denied' });
      return;
    }

    const totalOperations = await prisma.operation.count({
      where: { inventoryId: inventoryId },
    });

    const totalPages = Math.ceil(totalOperations / limit);

    const operations = await prisma.operation.findMany({
      where: {
        inventoryId: inventoryId,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        item: {
          select: {
            name: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: order,
      },
    });

    res.status(200).json({
      data: operations,
      pagination: {
        totalOperations,
        currentPage: page,
        totalPages,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
}

export async function getOperationsByItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.user?.userId);
    const inventoryId = Number(req.params.inventoryId);
    const itemId = Number(req.params.itemId);
    const page = Number(req.query.page) || DEFAULT_PAGE;
    const limit = Math.min(Number(req.query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
    const order: 'asc' | 'desc' = req.query.order === 'asc' ? 'asc' : 'desc';

    if (!inventoryId || inventoryId < 1) {
      res.status(400).json({ message: 'The inventory ID is not valid' });
      return;
    }
    if (!itemId || itemId < 1) {
      res.status(400).json({ message: 'The item ID is not valid' });
      return;
    }
    if (page < 1 || limit < 1) {
      res
        .status(400)
        .json({ message: 'Page and limit must be positive numbers' });
      return;
    }

    const hasAccess = await isUserInInventory(userId, inventoryId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Acces denied' });
      return;
    }

    const isItemInInventory = await prisma.item.findFirst({
      where: { id: itemId, inventoryId: inventoryId },
    });
    if (!isItemInInventory) {
      res
        .status(404)
        .json({ message: 'The item does not exist in the inventory' });
      return;
    }

    const totalOperations = await prisma.operation.count({
      where: { itemId: itemId, inventoryId: inventoryId },
    });

    const totalPages = Math.ceil(totalOperations / limit);

    const operations = await prisma.operation.findMany({
      where: {
        inventoryId: inventoryId,
        itemId: itemId,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: order,
      },
    });

    res.status(200).json({
      data: operations,
      pagination: {
        totalOperations,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getOperationsByUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.user?.userId);
    const inventoryId = Number(req.params.inventoryId);
    const targetUserId = Number(req.params.targetUserId);
    const page = Number(req.query.page) || DEFAULT_PAGE;
    const limit = Math.min(Number(req.query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
    const order: 'asc' | 'desc' = req.query.order === 'asc' ? 'asc' : 'desc';

    if (!inventoryId || inventoryId < 1) {
      res.status(400).json({ message: 'The inventory ID is not valid' });
      return;
    }
    if (!targetUserId || targetUserId < 1) {
      res.status(400).json({ message: 'The user ID is not valid' });
      return;
    }
    if (page < 1 || limit < 1) {
      res
        .status(400)
        .json({ message: 'Page and limit must be positive numbers' });
      return;
    }

    const hasAccess = await isUserInInventory(userId, inventoryId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Acces denied' });
      return;
    }

    const isTargetUserInInventory = await isUserInInventory(
      targetUserId,
      inventoryId
    );

    if (!isTargetUserInInventory) {
      res
        .status(404)
        .json({ message: 'The target user does not exist in the inventory' });
      return;
    }

    const totalOperations = await prisma.operation.count({
      where: { userId: targetUserId, inventoryId: inventoryId },
    });

    const totalPages = Math.ceil(totalOperations / limit);

    const operations = await prisma.operation.findMany({
      where: {
        userId: targetUserId,
        inventoryId: inventoryId,
      },
      include: {
        item: {
          select: {
            name: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: order,
      },
    });

    res.status(200).json({
      data: operations,
      pagination: {
        totalOperations,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getOperationsByCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.user?.userId);
    const inventoryId = Number(req.params.inventoryId);
    const categoryId = Number(req.params.categoryId);
    const page = Number(req.query.page) || DEFAULT_PAGE;
    const limit = Math.min(Number(req.query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
    const order: 'asc' | 'desc' = req.query.order === 'asc' ? 'asc' : 'desc';

    if (!inventoryId || inventoryId < 1) {
      res.status(400).json({ message: 'The inventory ID is not valid' });
      return;
    }
    if (!categoryId || categoryId < 1) {
      res.status(400).json({ message: 'The category ID is not valid' });
      return;
    }
    if (page < 1 || limit < 1) {
      res
        .status(400)
        .json({ message: 'Page and limit must be positive numbers' });
      return;
    }

    const hasAccess = await isUserInInventory(userId, inventoryId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Acces denied' });
      return;
    }

    const isCategoryInInventory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        inventoryId: inventoryId,
      },
    });
    if (!isCategoryInInventory) {
      res
        .status(404)
        .json({ message: 'The category does not exist in the inventory' });
      return;
    }

    const totalOperations = await prisma.operation.count({
      where: {
        item: {
          categoryId: categoryId,
        },
        inventoryId: inventoryId,
      },
    });

    const totalPages = Math.ceil(totalOperations / limit);

    const operations = await prisma.operation.findMany({
      where: {
        item: {
          categoryId: categoryId,
        },
        inventoryId: inventoryId,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        item: {
          select: {
            name: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: order,
      },
    });

    res.status(200).json({
      data: operations,
      pagination: {
        totalOperations,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}
