import express from 'express';

import { authenticate } from '../middlewares/auth.middleware';

import { modifyRelationSchema } from '../schemas/users.schemas';
import { adminOnly, validateSchema } from '../middlewares/sharedMiddlewares';
import { modifyUserInventoryRelation } from '../controllers/users.controller';

const router = express.Router();

router.use(authenticate);
router.patch(
  '/inventories',
  adminOnly,
  validateSchema(modifyRelationSchema),
  modifyUserInventoryRelation
);

export default router;
