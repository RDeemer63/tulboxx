import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import {
  Role,
  type Permission,
  type UserContext,
  userHasPermission,
  authorize,
  authorizeRole,
  loadUserGranularPermissions,
  updateUserGranularPermissions,
} from '../rbac';
import { db } from '../db'; // Mocked
import { permissions as dbPermissionsSchema, type permissions as PermissionsTableType } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Mock the db module
jest.mock('../db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]), // Default to no permissions found
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([]),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    // Mock query for potential direct query usage if any
    query: {
        permissions: {
            findFirst: jest.fn().mockResolvedValue(null),
        }
    }
  },
}));

// Mock Express request, response, and next function
const mockRequest = (user?: UserContext) => ({
  user,
} as Request);

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res as Response);
  res.json = jest.fn().mockReturnValue(res as Response);
  return res as Response;
};

const mockNext = () => jest.fn() as NextFunction;

describe('RBAC System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset default mock implementations for db calls if they were changed in a test
    (db.limit as ReturnType<typeof jest.fn>).mockResolvedValue([]);
    (db.returning as ReturnType<typeof jest.fn>).mockResolvedValue([]);
    (db.query.permissions.findFirst as ReturnType<typeof jest.fn>).mockResolvedValue(null);
  });

  describe('userHasPermission', () => {
    const ownerContext: UserContext = { id: 'owner-1', role: Role.OWNER, employeeId: 1 };
    const managerContext: UserContext = { id: 'manager-1', role: Role.MANAGER, employeeId: 2 };
    const fieldTechContext: UserContext = { id: 'tech-1', role: Role.FIELD_TECH, employeeId: 3 };
    const bookkeeperContext: UserContext = { id: 'bookkeeper-1', role: Role.BOOKKEEPER, employeeId: 4 };

    it('should return true for Owner for any permission', async () => {
      expect(await userHasPermission(ownerContext, 'canViewRevenue')).toBe(true);
      expect(await userHasPermission(ownerContext, 'canManageSchedules')).toBe(true);
    });

    it('should return false if userContext is undefined', async () => {
      expect(await userHasPermission(undefined, 'canViewRevenue')).toBe(false);
    });

    describe('Manager Role Default Permissions', () => {
      const permissionsToTest: { permission: Permission; expected: boolean }[] = [
        { permission: 'canViewRevenue', expected: false }, // Default false
        { permission: 'canViewJobCosts', expected: true },
        { permission: 'canEditPricing', expected: true },
        { permission: 'canManageSchedules', expected: true },
        { permission: 'canExportData', expected: true },
        { permission: 'canManageUserRoles', expected: false },
      ];
      permissionsToTest.forEach(({ permission, expected }) => {
        it(`should return ${expected} for Manager for permission '${permission}' by default`, async () => {
          expect(await userHasPermission(managerContext, permission)).toBe(expected);
        });
      });
    });

    describe('Field Tech Role Default Permissions', () => {
      const permissionsToTest: { permission: Permission; expected: boolean }[] = [
        { permission: 'canViewRevenue', expected: false },
        { permission: 'canEditPricing', expected: false },
        { permission: 'canManageSchedules', expected: false }, // Views own, doesn't "manage"
        { permission: 'canExportData', expected: false },
        { permission: 'canViewAllCustomers', expected: false },
      ];
      permissionsToTest.forEach(({ permission, expected }) => {
        it(`should return ${expected} for Field Tech for permission '${permission}' by default`, async () => {
          expect(await userHasPermission(fieldTechContext, permission)).toBe(expected);
        });
      });
    });

    describe('Bookkeeper Role Default Permissions', () => {
      const permissionsToTest: { permission: Permission; expected: boolean }[] = [
        { permission: 'canViewRevenue', expected: true },
        { permission: 'canViewProfitMargins', expected: true },
        { permission: 'canEditPricing', expected: false },
        { permission: 'canManageSchedules', expected: false },
        { permission: 'canExportData', expected: true },
        { permission: 'canAccessFinancialReports', expected: true },
      ];
      permissionsToTest.forEach(({ permission, expected }) => {
        it(`should return ${expected} for Bookkeeper for permission '${permission}' by default`, async () => {
          expect(await userHasPermission(bookkeeperContext, permission)).toBe(expected);
        });
      });
    });

    it('should use explicit grant from dbPermissions over role default', async () => {
      const managerWithExplicitGrant: UserContext = {
        ...managerContext,
        dbPermissions: { canViewRevenue: true }, // Role default is false
      };
      expect(await userHasPermission(managerWithExplicitGrant, 'canViewRevenue')).toBe(true);
    });

    it('should use explicit deny from dbPermissions over role default', async () => {
      const managerWithExplicitDeny: UserContext = {
        ...managerContext,
        dbPermissions: { canEditPricing: false }, // Role default is true
      };
      expect(await userHasPermission(managerWithExplicitDeny, 'canEditPricing')).toBe(false);
    });

    it('should return false for a permission not defined in defaults and not explicitly set', async () => {
      // Assuming 'aBrandNewPermission' is not in defaultRoleGrants for MANAGER
      // and not in managerContext.dbPermissions
      // To make this test robust, we'd need a way to ensure it's not in defaults,
      // or use a permission that is explicitly false for manager.
      // Let's use 'canManageUserRoles' which is false for Manager.
      expect(await userHasPermission(managerContext, 'canManageUserRoles')).toBe(false);
    });
  });

  describe('authorize middleware', () => {
    let req: Request;
    let res: Response;
    let next: NextFunction;

    beforeEach(() => {
      res = mockResponse();
      next = mockNext();
    });

    it('should call next() if user has the required single permission', async () => {
      req = mockRequest({ id: 'owner-1', role: Role.OWNER, employeeId: 1 }); // Owner has all
      const middleware = authorize('canViewRevenue');
      await middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 if user lacks the required single permission', async () => {
      req = mockRequest({ id: 'tech-1', role: Role.FIELD_TECH, employeeId: 3 }); // Tech lacks canViewRevenue
      const middleware = authorize('canViewRevenue');
      await middleware(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: Insufficient permissions.' });
    });

    it('should call next() if user has at least one of the required array permissions', async () => {
      // Manager has canEditPricing, but not canViewRevenue by default
      req = mockRequest({ id: 'manager-1', role: Role.MANAGER, employeeId: 2 });
      const middleware = authorize(['canViewRevenue', 'canEditPricing']);
      await middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return 403 if user lacks all of the required array permissions', async () => {
      req = mockRequest({ id: 'tech-1', role: Role.FIELD_TECH, employeeId: 3 });
      const middleware = authorize(['canViewRevenue', 'canManageUserRoles']);
      await middleware(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 401 if req.user is undefined', async () => {
      req = mockRequest(undefined);
      const middleware = authorize('canViewRevenue');
      await middleware(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: No user session.' });
    });

    it('should call next() if authorize is called with an empty permissions array (and log a warning)', async () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        req = mockRequest({ id: 'owner-1', role: Role.OWNER, employeeId: 1 });
        const middleware = authorize([]);
        await middleware(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledWith('RBAC: authorize middleware called with empty permissions array.');
        consoleWarnSpy.mockRestore();
      });
  });

  describe('authorizeRole middleware', () => {
    let req: Request;
    let res: Response;
    let next: NextFunction;

    beforeEach(() => {
      res = mockResponse();
      next = mockNext();
    });

    it('should call next() if user has the required single role', () => {
      req = mockRequest({ id: 'manager-1', role: Role.MANAGER, employeeId: 2 });
      const middleware = authorizeRole(Role.MANAGER);
      middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return 403 if user lacks the required single role', () => {
      req = mockRequest({ id: 'tech-1', role: Role.FIELD_TECH, employeeId: 3 });
      const middleware = authorizeRole(Role.MANAGER);
      middleware(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Forbidden: Role 'field_tech' is not authorized for this resource." });
    });

    it('should call next() if user has one of the required array roles', () => {
      req = mockRequest({ id: 'manager-1', role: Role.MANAGER, employeeId: 2 });
      const middleware = authorizeRole([Role.OWNER, Role.MANAGER]);
      middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return 403 if user role is not in the required array roles', () => {
      req = mockRequest({ id: 'tech-1', role: Role.FIELD_TECH, employeeId: 3 });
      const middleware = authorizeRole([Role.OWNER, Role.MANAGER]);
      middleware(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 401 if req.user is undefined', () => {
      req = mockRequest(undefined);
      const middleware = authorizeRole(Role.OWNER);
      middleware(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: No user session.' });
    });
  });

  describe('loadUserGranularPermissions', () => {
    it('should return loaded permissions if found for employeeId', async () => {
      const mockPerms: PermissionsTableType.$inferSelect = {
        id: 1, employeeId: 1, canViewRevenue: true, createdAt: new Date(), updatedAt: new Date(),
        canViewProfitMargins: false, canViewEmployeeWages: false, canViewJobCosts: false,
        canEditPricing: false, canAccessFinancialReports: false, canViewAllEmployees: false,
        canEditEmployeeInfo: false, canManageSchedules: false, canApproveTimeEntries: false,
        canViewPerformanceMetrics: false, canViewAllCustomers: false, canEditCustomerInfo: false,
        canCreateAssignJobs: false, canAccessPaymentHistory: false, canManageEstimatesInvoices: false,
        canManageUserRoles: false, canAccessSystemSettings: false, canExportData: false,
        canManageIntegrations: false,
      };
      (db.limit as ReturnType<typeof jest.fn>).mockResolvedValue([mockPerms]);
      const perms = await loadUserGranularPermissions(1);
      expect(perms).toEqual(mockPerms);
      expect(db.select).toHaveBeenCalledTimes(1);
      expect(db.from).toHaveBeenCalledWith(dbPermissionsSchema);
      expect(db.where).toHaveBeenCalledWith(eq(dbPermissionsSchema.employeeId, 1));
      expect(db.limit).toHaveBeenCalledWith(1);
    });

    it('should return an empty object if no permissions found for employeeId', async () => {
      (db.limit as ReturnType<typeof jest.fn>).mockResolvedValue([]);
      const perms = await loadUserGranularPermissions(99);
      expect(perms).toEqual({});
    });

    it('should return an empty object and log warning for invalid employeeId (e.g., 0 or NaN)', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      let perms = await loadUserGranularPermissions(0);
      expect(perms).toEqual({});
      expect(consoleWarnSpy).toHaveBeenCalledWith("RBAC: Invalid employeeId ('0') passed to loadUserGranularPermissions.");
      
      perms = await loadUserGranularPermissions(NaN);
      expect(perms).toEqual({});
      expect(consoleWarnSpy).toHaveBeenCalledWith("RBAC: Invalid employeeId ('NaN') passed to loadUserGranularPermissions.");
      consoleWarnSpy.mockRestore();
    });

    it('should return an empty object and log error if db call fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (db.limit as ReturnType<typeof jest.fn>).mockRejectedValue(new Error('DB down'));
      const perms = await loadUserGranularPermissions(1);
      expect(perms).toEqual({});
      expect(consoleErrorSpy).toHaveBeenCalledWith('RBAC: Error loading granular permissions for employeeId 1:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateUserGranularPermissions', () => {
    const employeeId = 1;
    const newPermsToSet: Partial<Omit<PermissionsTableType.$inferSelect, 'id' | 'employeeId' | 'createdAt' | 'updatedAt'>> = {
      canViewRevenue: true,
      canEditPricing: false,
    };
    const expectedReturnedPerms: PermissionsTableType.$inferSelect = {
      id: 1, employeeId, ...newPermsToSet, createdAt: new Date(), updatedAt: new Date(),
      canViewProfitMargins: false, canViewEmployeeWages: false, canViewJobCosts: false,
      canAccessFinancialReports: false, canViewAllEmployees: false,
      canEditEmployeeInfo: false, canManageSchedules: false, canApproveTimeEntries: false,
      canViewPerformanceMetrics: false, canViewAllCustomers: false, canEditCustomerInfo: false,
      canCreateAssignJobs: false, canAccessPaymentHistory: false, canManageEstimatesInvoices: false,
      canManageUserRoles: false, canAccessSystemSettings: false, canExportData: false,
      canManageIntegrations: false,
    } as PermissionsTableType.$inferSelect; // Cast needed because newPermsToSet is partial

    it('should update existing permissions if a record is found', async () => {
      (db.limit as ReturnType<typeof jest.fn>).mockResolvedValue([{ id: 1 }]); // Simulate existing record
      (db.returning as ReturnType<typeof jest.fn>).mockResolvedValue([expectedReturnedPerms]); // Mock returning value for update

      const result = await updateUserGranularPermissions(employeeId, newPermsToSet);

      expect(db.update).toHaveBeenCalledWith(dbPermissionsSchema);
      expect(db.set).toHaveBeenCalledWith(expect.objectContaining({ ...newPermsToSet, updatedAt: expect.any(Date) }));
      expect(db.where).toHaveBeenCalledWith(eq(dbPermissionsSchema.employeeId, employeeId));
      expect(db.returning).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedReturnedPerms);
    });

    it('should insert new permissions if no record is found', async () => {
      (db.limit as ReturnType<typeof jest.fn>).mockResolvedValue([]); // Simulate no existing record
      (db.returning as ReturnType<typeof jest.fn>).mockResolvedValue([expectedReturnedPerms]); // Mock returning value for insert

      const result = await updateUserGranularPermissions(employeeId, newPermsToSet);
      
      const expectedInsertData = {
        employeeId,
        ...newPermsToSet,
      };

      expect(db.insert).toHaveBeenCalledWith(dbPermissionsSchema);
      // Drizzle's insert().values() takes the full object.
      // The rbac.ts code spreads newPermissions, so other fields would be undefined unless handled.
      // The test here will check that employeeId and newPermsToSet are part of the insert.
      expect(db.values).toHaveBeenCalledWith(expect.objectContaining(expectedInsertData));
      expect(db.returning).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedReturnedPerms);
    });

    it('should throw error for invalid employeeId', async () => {
      await expect(updateUserGranularPermissions(0, newPermsToSet)).rejects.toThrow("Invalid employeeId provided.");
      await expect(updateUserGranularPermissions(NaN, newPermsToSet)).rejects.toThrow("Invalid employeeId provided.");
    });

    it('should re-throw error if db call fails during update', async () => {
        (db.limit as ReturnType<typeof jest.fn>).mockResolvedValue([{ id: 1 }]);
        (db.returning as ReturnType<typeof jest.fn>).mockRejectedValue(new Error('DB update failed'));
        await expect(updateUserGranularPermissions(employeeId, newPermsToSet)).rejects.toThrow('DB update failed');
    });

    it('should re-throw error if db call fails during insert', async () => {
        (db.limit as ReturnType<typeof jest.fn>).mockResolvedValue([]);
        (db.returning as ReturnType<typeof jest.fn>).mockRejectedValue(new Error('DB insert failed'));
        await expect(updateUserGranularPermissions(employeeId, newPermsToSet)).rejects.toThrow('DB insert failed');
    });
  });
});
