import express from 'express';

import { authenticate } from '../middlewares/auth.middleware';

import { adminOnly, validateSchema } from '../middlewares/sharedMiddlewares';
import { createItemSchema } from '../schemas/items.schemas';
import { createItem, deleteItem } from '../controllers/items.controller';

const router = express.Router();

router.use(authenticate);
router.post('/', validateSchema(createItemSchema), adminOnly, createItem);
router.delete('/:itemId',adminOnly, deleteItem)

export default router;
