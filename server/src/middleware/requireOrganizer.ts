import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const requireOrganizer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.org_token;

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      orgId: string;
    };

    (req as any).orgId = decoded.orgId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
