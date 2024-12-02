import express from 'express';

import { login, logout, register } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { userSchema } from '../schemas/auth.schemas';
import { validateSchema } from '../middlewares/sharedMiddlewares';

const router = express.Router();

router.post('/register', validateSchema(userSchema), register);
router.post('/login', login);
router.post('/logout', authenticate, logout);

export default router;
