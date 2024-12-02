import express from 'express';

import { authenticate } from '../middlewares/auth.middleware';

import { adminOnly, validateSchema } from '../middlewares/sharedMiddlewares';
import {
  createOperation,
  getOperationsByCategory,
  getOperationsByInventory,
  getOperationsByItem,
  getOperationsByUser,
} from '../controllers/operations.controller';
import { operationSchema } from '../schemas/operations.schema';

const router = express.Router();

router.use(authenticate);
router.get('/inventories/:inventoryId', adminOnly, getOperationsByInventory);
router.get(
  '/inventories/:inventoryId/items/:itemId',
  adminOnly,
  getOperationsByItem
);
router.get(
  '/inventories/:inventoryId/users/:targetUserId',
  adminOnly,
  getOperationsByUser
);
router.get(
  '/inventories/:inventoryId/categories/:categoryId',
  adminOnly,
  getOperationsByCategory
);
router.post('/', validateSchema(operationSchema), createOperation);

export default router;
