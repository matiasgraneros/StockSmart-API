import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export function validateSchema(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json(error);
      return;
    }
  };
}

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ message: 'Only admins can access this resource' });
    return;
  }
  next();
}
