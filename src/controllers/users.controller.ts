import { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { isUserInInventory } from '../services/users.service';

export async function modifyUserInventoryRelation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = Number(req.user?.userId);
    const { userEmail, inventoryId, action } = req.body;

    if (action !== 'connect' && action !== 'disconnect') {
      res.status(403).json({ message: 'The action is incorrect' });
      return;
    }

    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
    });
    if (!inventory) {
      res.status(404).json({ message: 'Inventory not found' });
      return;
    }

    const hasAccess = await isUserInInventory(adminId, inventoryId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const userExists = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });
    if (!userExists) {
      res.status(404).json({ message: 'User does not exist' });
      return;
    }

    const userIsInInventory = await prisma.user.findUnique({
      where: {
        email: userEmail,
        inventories: {
          some: {
            id: inventoryId,
          },
        },
      },
    });
    if (userIsInInventory && action === 'connect') {
      res
        .status(409)
        .json({ message: 'The user is already registered in the inventory' });
      return;
    }
    if (!userIsInInventory && action === 'disconnect') {
      res
        .status(404)
        .json({ message: 'The user is not registered in the inventory' });
      return;
    }

    const updateData =
      action === 'connect'
        ? { connect: { id: inventoryId } }
        : { disconnect: { id: inventoryId } };

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        inventories: updateData,
      },
      select: { id: true, email: true, role: true },
    });

    res.json({
      message: `User updated (${action}ed)`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}
