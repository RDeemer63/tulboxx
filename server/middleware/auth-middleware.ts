import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/error-handler';
import { db } from '../db';
import { users, UserRole } from '../db/schema';
import { eq } from 'drizzle-orm';

// Extended interface for Request with user property
export interface AuthenticatedRequest extends Request {
  user?: UserContext;
}

// User information stored in JWT and available in req.user
export interface UserContext {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  businessId: string | null;
}

// Secret for JWT signing (should be in env variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'tulboxx-development-secret';

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Invalid authentication token format');
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as UserContext;

    // Check if user exists in database (optional additional security)
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.id),
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Set user context on request
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid or expired token'));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware to require admin role
 * Must be used after authenticateUser middleware
 */
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (req.user.role !== UserRole.ADMIN) {
    return next(new ForbiddenError('Admin privileges required'));
  }

  next();
};

/**
 * Generate a JWT token for a user
 * Used for testing and manual token generation
 */
export const generateToken = (user: UserContext): string => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Middleware to verify the session owner
 * Ensures a user can only access their own resources
 */
export const validateSessionOwnership = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const sessionUserId = req.user?.id;
  const requestUserId = req.params.userId || req.body.userId;

  if (!sessionUserId) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (requestUserId && sessionUserId !== requestUserId && req.user?.role !== UserRole.ADMIN) {
    return next(new ForbiddenError('Not authorized to access this resource'));
  }

  next();
};
