import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../types/express';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: 'Token not provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      'userId' in decoded &&
      'role' in decoded &&
      'iat' in decoded &&
      'exp' in decoded
    ) {
      req.user = decoded as User;
      next();
      return;
    } else {
      res.status(401).json({ message: 'Invalid token payload' });
      return;
    }
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error });
  }
}
