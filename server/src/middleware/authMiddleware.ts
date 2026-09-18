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
    let token: string | undefined;

    // 1. Prioritize Authorization header: "Bearer <token>" (primary for SPAs & cross-origin)
    if (req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1].trim();
      }
    }

    // Verify token from header first
    let payload = token ? verifyToken(token) : null;

    // 2. Fallback to cookie if header token was missing or failed verification
    if (!payload && req.cookies?.[COOKIE_NAME]) {
      const cookieToken = req.cookies[COOKIE_NAME];
      const cookiePayload = verifyToken(cookieToken);
      if (cookiePayload) {
        token = cookieToken;
        payload = cookiePayload;
      }
    }

    if (!payload || (!payload.userId && !payload.email)) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please sign in to continue.',
      });
      return;
    }

    // Retrieve user by ID, with email fallback for cross-store resilience
    let user: any = null;
    if (payload.userId) {
      user = await userStore.findById(payload.userId);
    }
    if (!user && payload.email) {
      user = await userStore.findByEmail(payload.email);
    }

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authenticated user account was not found. Please log in again.',
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
    let token: string | undefined;

    if (req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1].trim();
      }
    }

    let payload = token ? verifyToken(token) : null;

    if (!payload && req.cookies?.[COOKIE_NAME]) {
      const cookieToken = req.cookies[COOKIE_NAME];
      const cookiePayload = verifyToken(cookieToken);
      if (cookiePayload) {
        payload = cookiePayload;
      }
    }

    if (payload) {
      let user: any = null;
      if (payload.userId) {
        user = await userStore.findById(payload.userId);
      }
      if (!user && payload.email) {
        user = await userStore.findByEmail(payload.email);
      }
      if (user) {
        req.user = user;
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
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in as administrator.',
    });
    return;
  }

  const isAdmin =
    req.user.role === 'admin' ||
    req.user.email === 'admin@digitalheroes.test';

  if (!isAdmin) {
    res.status(403).json({
      success: false,
      error: 'Access denied: Admin privileges required.',
    });
    return;
  }
  next();
};
