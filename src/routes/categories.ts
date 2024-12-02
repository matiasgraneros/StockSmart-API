import express from 'express';

import { authenticate } from '../middlewares/auth.middleware';
import {
  createCategorie,
  deleteCategory,
  getCategories,
} from '../controllers/categories.controller';

import { createCategorySchema } from '../schemas/categories.schemas';
import { adminOnly, validateSchema } from '../middlewares/sharedMiddlewares';

const router = express.Router();

router.use(authenticate);
router.get('/:inventoryId', adminOnly, getCategories);
router.post(
  '/',
  validateSchema(createCategorySchema),
  adminOnly,
  createCategorie
);
router.delete('/:categoryId', adminOnly, deleteCategory);

export default router;
