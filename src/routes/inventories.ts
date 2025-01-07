import express from 'express';

import {
  createInventory,
  getInventories,
  getInventory,
  getItems,
  getUsers,
} from '../controllers/inventories.controller';

import { inventorySchema } from '../schemas/inventories.schemas';
import { authenticate } from '../middlewares/auth.middleware';
import { adminOnly, validateSchema } from '../middlewares/sharedMiddlewares';

const router = express.Router();

router.use(authenticate);

router.get('/', getInventories);
router.get('/:inventoryId/users', adminOnly, getUsers);
router.get('/:inventoryId', adminOnly, getInventory);
router.get('/:inventoryId/items', getItems);
router.post('/', adminOnly, validateSchema(inventorySchema), createInventory);

export default router;
