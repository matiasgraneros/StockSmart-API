import { Application } from 'express';
import usersRouter from './users';
import authRouter from './auth';
import invetoriesRouter from './inventories';
import categoriesRouter from './categories';
import itemsRouter from './items';
import operationsRouter from './operations';
import { errorHandler } from '../middlewares/errorHandler';

export function routerApi(app: Application) {
  app.use('/users', usersRouter);
  app.use('/auth', authRouter);
  app.use('/inventories', invetoriesRouter);
  app.use('/categories', categoriesRouter);
  app.use('/items', itemsRouter);
  app.use('/operations', operationsRouter);

  app.use(errorHandler);
}
