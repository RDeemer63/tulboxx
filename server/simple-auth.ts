import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "./db";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "tulboxx-dev-secret-key";
const SALT_ROUNDS = 12;

// Simple user table for beta testing (separate from existing schema)
export interface BetaUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  businessName: string;
  createdAt: Date;
}

// In-memory storage for beta users (can be moved to database later)
const betaUsers: Map<string, BetaUser> = new Map();

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName: string;
  isDemo: boolean;
}

// Demo user constant
export const DEMO_USER: AuthUser = {
  id: "demo",
  email: "demo@tulboxx.com",
  firstName: "Demo",
  lastName: "User", 
  businessName: "Demo Excavating Co.",
  isDemo: true,
};

// Simple authentication middleware
export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Handle demo token
    if (token === 'demo-token') {
      (req as any).user = DEMO_USER;
      return next();
    }

    // Handle real JWT tokens
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = betaUsers.get(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid authentication" });
    }

    (req as any).user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      businessName: user.businessName,
      isDemo: false,
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid authentication" });
  }
}

// Register new beta user
export async function registerUser(email: string, password: string, firstName: string, lastName: string, businessName: string) {
  try {
    // Check if user already exists
    for (const user of betaUsers.values()) {
      if (user.email === email) {
        throw new Error("User already exists");
      }
    }

    // Create user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const newUser: BetaUser = {
      id: userId,
      email,
      passwordHash,
      firstName,
      lastName,
      businessName,
      createdAt: new Date(),
    };

    betaUsers.set(userId, newUser);

    // Generate JWT token for immediate login
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    return {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        businessName: newUser.businessName,
      }
    };
  } catch (error) {
    throw error;
  }
}

// Login user
export async function loginUser(email: string, password: string) {
  try {
    // Find user by email
    let user: BetaUser | undefined;
    for (const u of betaUsers.values()) {
      if (u.email === email) {
        user = u;
        break;
      }
    }

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        businessName: user.businessName,
      }
    };
  } catch (error) {
    throw error;
  }
}

// Get demo login
export function getDemoLogin() {
  return {
    token: "demo-token",
    user: DEMO_USER
  };
}

// Check if request is from demo user
export function isDemoUser(req: Request): boolean {
  return (req as any).user?.isDemo === true;
}

// Get current user from request
export function getCurrentUser(req: Request): AuthUser | null {
  return (req as any).user || null;
}