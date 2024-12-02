import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line
  next: NextFunction
) {
  res.status(500).json({
    message: 'Internal server error',
    details: error instanceof Error ? error.message : 'Unknown error',
  });
  return;
}
