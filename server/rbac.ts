import { type Request, type Response, type NextFunction } from 'express';
import { type permissions as PermissionsTableType } from '../shared/schema';
import { db } from './db'; // Actual db instance
import { eq } from 'drizzle-orm';
import { permissions as dbPermissionsSchema } from '../shared/schema';

// 1. Define Roles
export enum Role {
  OWNER = 'owner',
  MANAGER = 'manager',
  FIELD_TECH = 'field_tech',
  BOOKKEEPER = 'bookkeeper',
}

// 2. Define Permissions
// These permissions directly correspond to the boolean columns in the `permissions` table
// from `shared/schema.ts` (excluding metadata columns).
export type Permission = keyof Omit<PermissionsTableType.$inferSelect, 'id' | 'employeeId' | 'createdAt' | 'updatedAt'>;

// User context expected on req.user, populated by authentication middleware
export interface UserContext {
  id: string; // User's unique ID (from users.id)
  role: Role; // User's primary role
  employeeId?: number; // Link to employees table for granular permissions (if applicable)
  // Granular permissions loaded from the `permissions` table (dbPermissionsSchema)
  dbPermissions?: Partial<PermissionsTableType.$inferSelect>;
}

// 3. Default Role-Based Grants
// These are baseline grants for each role. Owner has all permissions implicitly.
// Specific denials or further grants for a user come from their record in the `permissions` table.
const defaultRoleGrants: Record<Exclude<Role, Role.OWNER>, Partial<Record<Permission, boolean>>> = {
  [Role.MANAGER]: {
    // Financial Access
    canViewRevenue: false, // Managers typically don't see full company revenue unless overridden
    canViewProfitMargins: false, // Sensitive, usually Owner only unless overridden
    canViewEmployeeWages: false, // Sensitive
    canViewJobCosts: true, // Essential for managing jobs
    canEditPricing: true, // For estimates and job adjustments
    canAccessFinancialReports: false, // Access to operational reports, not full financials unless overridden

    // Employee Management
    canViewAllEmployees: true,
    canEditEmployeeInfo: true,
    canManageSchedules: true,
    canApproveTimeEntries: true,
    canViewPerformanceMetrics: true, // Team/operational metrics

    // Customer & Job Management
    canViewAllCustomers: true,
    canEditCustomerInfo: true,
    canCreateAssignJobs: true,
    canAccessPaymentHistory: true, // For customer service and job management
    canManageEstimatesInvoices: true, // CRUD operations

    // System Administration
    canManageUserRoles: false, // Cannot change roles (especially to Owner) or manage permissions table
    canAccessSystemSettings: false, // Limited to operational settings they manage
    canExportData: true, // Operational data like job lists, customer lists
    canManageIntegrations: false, // Typically Owner
  },
  [Role.FIELD_TECH]: {
    // Field techs have very limited access by default. Most permissions are false.
    // Their access is primarily to *their assigned* jobs, handled by business logic + role check.
    canViewRevenue: false,
    canViewProfitMargins: false,
    canViewEmployeeWages: false,
    canViewJobCosts: false,
    canEditPricing: false,
    canAccessFinancialReports: false,
    canViewAllEmployees: false, // Should only see their own info or team members on a job
    canEditEmployeeInfo: false, // Can edit their own profile basics
    canManageSchedules: false, // Views their own schedule
    canApproveTimeEntries: false, // Submits their own time entries
    canViewPerformanceMetrics: false, // Perhaps their own individual metrics if implemented
    canViewAllCustomers: false, // Only customers related to their assigned jobs
    canEditCustomerInfo: false,
    canCreateAssignJobs: false,
    canAccessPaymentHistory: false,
    canManageEstimatesInvoices: false,
    canManageUserRoles: false,
    canAccessSystemSettings: false,
    canExportData: false,
    canManageIntegrations: false,
  },
  [Role.BOOKKEEPER]: {
    // Financial Access
    canViewRevenue: true,
    canViewProfitMargins: true, // Essential for financial reconciliation
    canViewEmployeeWages: true, // For payroll processing
    canViewJobCosts: true, // For accurate bookkeeping
    canEditPricing: false, // Bookkeepers don't set prices
    canAccessFinancialReports: true, // Core function

    // Employee Management (Limited)
    canViewAllEmployees: false, // Only data needed for payroll, not full employee management
    canEditEmployeeInfo: false,
    canManageSchedules: false,
    canApproveTimeEntries: false, // Processes approved time entries
    canViewPerformanceMetrics: false,

    // Customer & Job Management (View for context)
    canViewAllCustomers: true, // For invoicing and payment context
    canEditCustomerInfo: false, // View-only usually
    canCreateAssignJobs: false,
    canAccessPaymentHistory: true, // Core function
    canManageEstimatesInvoices: true, // Primarily managing invoices, viewing estimates

    // System Administration
    canManageUserRoles: false,
    canAccessSystemSettings: false,
    canExportData: true, // Financial data exports for accounting software
    canManageIntegrations: false, // Typically not
  },
};

// 4. Permission Checking Logic
/**
 * Checks if a user has a specific permission.
 * Logic:
 * 1. If user is Owner, always true.
 * 2. Check explicit grant/deny from user's `dbPermissions` record.
 * 3. If no explicit setting, check default grant for the user's role.
 * 4. If not found in defaults, permission is denied.
 * @param userContext The user context object from req.user.
 * @param permissionKey The permission (column name from `permissions` table) to check.
 * @returns True if the user has the permission, false otherwise.
 */
export async function userHasPermission(
  userContext: UserContext | undefined,
  permissionKey: Permission
): Promise<boolean> {
  if (!userContext) {
    console.warn('RBAC: userHasPermission called with undefined userContext.');
    return false;
  }

  if (userContext.role === Role.OWNER) {
    return true;
  }

  // Check for explicit user-specific permission from their loaded dbPermissions
  if (userContext.dbPermissions && userContext.dbPermissions[permissionKey] !== undefined) {
    return !!userContext.dbPermissions[permissionKey]; // Use explicit grant/deny
  }

  // Fallback to default grants for the role
  const roleDefaultPermissions = defaultRoleGrants[userContext.role as Exclude<Role, Role.OWNER>];
  if (roleDefaultPermissions && roleDefaultPermissions[permissionKey] !== undefined) {
    return !!roleDefaultPermissions[permissionKey]; // Use role default
  }

  // Default to deny if no explicit or role-based grant defined for this permission
  // This means if a permission is not listed in defaultRoleGrants for a role, it's implicitly false for that role.
  return false;
}

// 5. Middleware
/**
 * Express middleware to authorize a user based on required granular permission(s).
 * If an array of permissions is provided, the user must have AT LEAST ONE of them (OR logic).
 * @param requiredPermissions A single permission or an array of permissions.
 */
export function authorize(requiredPermissions: Permission | Permission[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserContext | undefined;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: No user session.' });
    }

    const permissionsToCheck = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

    if (permissionsToCheck.length === 0) { // Should not happen if used correctly
        console.warn('RBAC: authorize middleware called with empty permissions array.');
        return next(); // Or forbid, depending on policy
    }
    
    for (const perm of permissionsToCheck) {
      if (await userHasPermission(user, perm)) {
        return next(); // Authorized if any one permission is met
      }
    }
    
    // If loop completes, user does not have any of the required permissions
    return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
  };
}

/**
 * Express middleware to authorize a user based on their role.
 * @param requiredRoles A single role or an array of roles. User must have one of these roles.
 */
export function authorizeRole(requiredRoles: Role | Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserContext | undefined;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: No user session.' });
    }

    const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (rolesToCheck.includes(user.role)) {
      return next();
    }

    return res.status(403).json({ message: `Forbidden: Role '${user.role}' is not authorized for this resource.` });
  };
}

// 6. Permission Management Functions (for Admin/Owner UI to call)

/**
 * Loads granular permissions for a user (employee).
 * This should ideally be called during authentication and permissions attached to req.user.
 * @param employeeId The ID of the employee from the `employees` table.
 */
export async function loadUserGranularPermissions(employeeId: number): Promise<Partial<PermissionsTableType.$inferSelect>> {
  if (isNaN(employeeId) || employeeId <= 0) {
    console.warn(`RBAC: Invalid employeeId ('${employeeId}') passed to loadUserGranularPermissions.`);
    return {}; // Return empty object, effectively no specific overrides
  }
  try {
    const result = await db
      .select()
      .from(dbPermissionsSchema)
      .where(eq(dbPermissionsSchema.employeeId, employeeId))
      .limit(1);
    return result.length > 0 ? result[0] : {}; // Return fetched or empty object
  } catch (error) {
    console.error(`RBAC: Error loading granular permissions for employeeId ${employeeId}:`, error);
    return {}; // Return empty on error to prevent blocking access, rely on role defaults
  }
}

/**
 * Updates or inserts a user's granular permissions in the database.
 * Only Owners should typically be able to call this.
 * @param employeeId The employee's ID.
 * @param newPermissions A partial object of permissions to set (e.g., { canViewRevenue: true }).
 */
export async function updateUserGranularPermissions(
  employeeId: number,
  newPermissions: Partial<Omit<PermissionsTableType.$inferSelect, 'id' | 'employeeId' | 'createdAt' | 'updatedAt'>>
): Promise<PermissionsTableType.$inferSelect | null> {
  if (isNaN(employeeId) || employeeId <= 0) {
    console.error(`RBAC: Invalid employeeId ('${employeeId}') for updateUserGranularPermissions.`);
    throw new Error("Invalid employeeId provided.");
  }
  try {
    const existing = await db
      .select({ id: dbPermissionsSchema.id })
      .from(dbPermissionsSchema)
      .where(eq(dbPermissionsSchema.employeeId, employeeId))
      .limit(1);

    let result: PermissionsTableType.$inferSelect[];
    if (existing.length > 0) {
      result = await db
        .update(dbPermissionsSchema)
        .set({ ...newPermissions, updatedAt: new Date() })
        .where(eq(dbPermissionsSchema.employeeId, employeeId))
        .returning();
    } else {
      // Ensure all non-nullable fields in `permissions` table (not in newPermissions) have defaults in schema
      // or are explicitly set here if they don't have DB defaults.
      // Drizzle requires all non-nullable fields for insert.
      const insertData: PermissionsTableType.$inferInsert = {
        employeeId,
        // Spread newPermissions, then ensure all other boolean fields default to false if not provided
        // This requires knowing all boolean fields in PermissionsTableType.$inferInsert
        // A safer way is to fetch schema defaults or define them explicitly here.
        // For now, assuming schema defaults handle undefined booleans or they are explicitly set.
        // Example for explicit defaults if schema doesn't have them for all:
        // canViewRevenue: newPermissions.canViewRevenue ?? false, ... etc for all boolean permission fields
        ...(newPermissions as Partial<PermissionsTableType.$inferInsert>), // Cast might be needed if types don't align perfectly
      };
      result = await db.insert(dbPermissionsSchema).values(insertData).returning();
    }
    console.log(`RBAC: Updated granular permissions for employeeId ${employeeId}`);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(`RBAC: Error updating granular permissions for employeeId ${employeeId}:`, error);
    throw error;
  }
}

// Example of how an authentication middleware might populate req.user:
//
// import * as jwt from 'jsonwebtoken'; // Assuming JWTs
// import { users as usersSchema } from '@/shared/schema';
//
// export async function authenticationMiddleware(req: Request, res: Response, next: NextFunction) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ message: 'Unauthorized: Missing or malformed token.' });
//   }
//   const token = authHeader.split(' ')[1];
//
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string, employeeId?: number }; // Adjust payload type
//
//     const userRecord = await db.query.users.findFirst({ where: eq(usersSchema.id, decoded.userId) });
//
//     if (!userRecord || !userRecord.isActive) {
//       return res.status(401).json({ message: 'Unauthorized: User not found or inactive.' });
//     }
//
//     let granularPerms: Partial<PermissionsTableType.$inferSelect> = {};
//     // Assuming userRecord.employeeId is available and correctly links to an employees.id
//     // This employeeId field needs to be present in your users table schema or derived.
//     const employeeIdForPermissions = userRecord.employeeId; // Placeholder for actual employeeId
//
//     if (typeof employeeIdForPermissions === 'number' && !isNaN(employeeIdForPermissions)) {
//       granularPerms = await loadUserGranularPermissions(employeeIdForPermissions);
//     } else if (userRecord.role !== Role.OWNER) {
//        console.warn(`RBAC: employeeId not found or invalid for user ${userRecord.id}, role ${userRecord.role}. Granular permissions may not apply.`);
//     }
//
//     req.user = {
//       id: userRecord.id,
//       role: userRecord.role as Role, // Ensure role in DB matches Role enum values
//       employeeId: employeeIdForPermissions,
//       dbPermissions: granularPerms,
//     } as UserContext;
//
//     next();
//   } catch (error) {
//     console.error('RBAC Auth Error:', error);
//     return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
//   }
// }
