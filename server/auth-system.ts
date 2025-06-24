import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, businessProfiles } from "@shared/schema";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-for-development";
const SALT_ROUNDS = 12;

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  businessProfileId?: number;
}

// Add demo token validation function
export function validateDemoToken(token: string): AuthUser | null {
  if (token === 'demo-token') {
    return DEMO_USER;
  }
  return null;
}

// Simple authentication middleware
export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Handle demo token FIRST
    if (token === 'demo-token') {
      (req as any).user = DEMO_USER;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid authentication" });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid authentication" });
  }
}

// Register new user with persistent database storage
export async function registerUser(email: string, password: string, firstName: string, lastName: string, businessName: string) {
  try {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      throw new Error("User already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user with sequential ID
    const userResult = await db.insert(users).values({
      id: `user_${Date.now()}`, // Generate unique string ID
      email,
      passwordHash,
      firstName,
      lastName,
      role: "owner",
      isActive: true,
    }).returning();

    const newUser = userResult[0];

    // Create business profile
    const businessResult = await db.insert(businessProfiles).values({
      businessName,
      ownerName: `${firstName} ${lastName}`,
      email,
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      businessType: "service",
    }).returning();

    // Update user with business profile ID
    await db.update(users)
      .set({ businessProfileId: businessResult[0].id })
      .where(eq(users.id, newUser.id));

    return {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      businessProfileId: businessResult[0].id,
    };
  } catch (error) {
    throw error;
  }
}

// Login user
export async function loginUser(email: string, password: string) {
  try {
    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (userResult.length === 0) {
      throw new Error("Invalid credentials");
    }

    const user = userResult[0];
    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Update last login
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        businessProfileId: user.businessProfileId,
      }
    };
  } catch (error) {
    throw error;
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<AuthUser | null> {
  try {
    const userResult = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (userResult.length === 0) {
      return null;
    }

    const user = userResult[0];
    return {
      id: user.id,
      email: user.email || "",
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      businessProfileId: user.businessProfileId || undefined,
    };
  } catch (error) {
    return null;
  }
}

// Demo user for testing (optional)
export const DEMO_USER = {
  id: "demo",
  email: "demo@tulboxx.com",
  firstName: "Demo",
  lastName: "User",
  businessProfileId: 1,
};

// Check if request is from demo user
export function isDemoUser(req: Request): boolean {
  return (req as any).user?.id === "demo";
}