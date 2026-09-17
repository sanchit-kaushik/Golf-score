import { Request, Response, NextFunction } from 'express';
import { verifyToken, COOKIE_NAME } from '../utils/jwt.js';
import { userStore } from '../utils/userStore.js';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Try reading token from cookie
    let token = req.cookies?.[COOKIE_NAME];

    // 2. Fallback to Authorization header: "Bearer <token>"
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. No session token provided.',
      });
      return;
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      res.status(401).json({
        success: false,
        error: 'Session expired or invalid token. Please log in again.',
      });
      return;
    }

    // Retrieve user
    const user = await userStore.findById(payload.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authenticated user no longer exists.',
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err: any) {
    console.error('❌ [requireAuth error]:', err?.message || err);
    res.status(401).json({
      success: false,
      error: 'Authentication verification failure. Please log in again.',
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies?.[COOKIE_NAME];
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (token) {
      const payload = verifyToken(token);
      if (payload && payload.userId) {
        const user = await userStore.findById(payload.userId);
        if (user) {
          req.user = user;
        }
      }
    }
  } catch (_e) {
    // optional, ignore errors
  }
  next();
};

/**
 * Middleware strictly enforcing administrative privileges.
 * Returns 403 Forbidden for non-admin users.
 */
export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Access denied: Admin privileges required.',
    });
    return;
  }
  next();
};
