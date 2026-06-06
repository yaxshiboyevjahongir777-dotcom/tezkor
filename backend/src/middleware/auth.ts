import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface JwtPayload {
  id: string;
  role: "PASSENGER" | "DRIVER" | "ADMIN";
}

// Request typini kengaytirish
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token topilmadi" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Token yaroqsiz yoki muddati o'tgan" });
  }
}

// Rol tekshiruvi middleware
export function requireRole(...roles: JwtPayload["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Ruxsat yo'q" });
    }
    next();
  };
}
