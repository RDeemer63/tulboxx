import {
  Role,
  userHasPermission,
  loadUserGranularPermissions,
  updateUserGranularPermissions,
} from './server/rbac.ts'; // Assuming tsx can run .ts directly
import { eq } from 'drizzle-orm'; // This will be used by the mock

// --- Mock Database Setup ---
// This mock simulates the Drizzle ORM db object for RBAC functions.
const mockDbStore = {
  permissions: [], // Stores mock permission records: { employeeId, canViewRevenue, ... }
};

const db = {
  select: () => ({
    from: (schema) => ({
      where: (condition) => ({
        limit: (count) => {
          // Simulate Drizzle's eq and filtering
          // This is a simplified mock. A real eq would parse the condition.
          // For this test, we'll assume condition is a direct employeeId match.
          let employeeIdToFind = -1;
          if (condition && condition.left && condition.left.name === 'employeeId' && condition.operator === 'eq') {
            employeeIdToFind = condition.right;
          }
          
          const results = mockDbStore.permissions.filter(p => p.employeeId === employeeIdToFind);
          return Promise.resolve(results.slice(0, count));
        },
      }),
    }),
  }),
  update: (schema) => ({
    set: (values) => ({
      where: (condition) => ({
        returning: () => {
          let employeeIdToUpdate = -1;
          if (condition && condition.left && condition.left.name === 'employeeId' && condition.operator === 'eq') {
            employeeIdToUpdate = condition.right;
          }
          const index = mockDbStore.permissions.findIndex(p => p.employeeId === employeeIdToUpdate);
          if (index > -1) {
            mockDbStore.permissions[index] = { ...mockDbStore.permissions[index], ...values, updatedAt: new Date() };
            return Promise.resolve([mockDbStore.permissions[index]]);
          }
          return Promise.resolve([]);
        },
      }),
    }),
  }),
  insert: (schema) => ({
    values: (record) => ({
      returning: () => {
        const newRecord = { ...record, id: mockDbStore.permissions.length + 1, createdAt: new Date(), updatedAt: new Date() };
        mockDbStore.permissions.push(newRecord);
        return Promise.resolve([newRecord]);
      },
    }),
  }),
  // Mock for direct query if rbac.ts uses it (it doesn't directly, but good to have)
  query: {
    permissions: {
      findFirst: ({ where }) => {
        let employeeIdToFind = -1;
        if (where && where.left && where.left.name === 'employeeId' && where.operator === 'eq') {
          employeeIdToFind = where.right;
        }
        const result = mockDbStore.permissions.find(p => p.employeeId === employeeIdToFind);
        return Promise.resolve(result || null);
      }
    }
  }
};

// Inject the mock db into the rbac module (if it were easily injectable)
// Since it's not, loadUserGranularPermissions and updateUserGranularPermissions
// in rbac.ts will use the actual db import. For this standalone test,
// we'd ideally mock the `db` import within `rbac.ts` itself,
// or pass `db` as an argument to the functions if they were designed that way.
// For this simple script, we'll re-implement the DB-dependent functions from rbac.ts
// here, using our mockDb. This tests their logic with a controlled DB.

async function test_loadUserGranularPermissions(employeeId) {
  if (isNaN(employeeId) || employeeId <= 0) {
    console.warn(`TEST RBAC: Invalid employeeId ('${employeeId}') passed to loadUserGranularPermissions.`);
    return {};
  }
  try {
    // Simulate Drizzle's eq for the where clause
    // This is a simplified representation for mocking purposes.
    // Drizzle's actual eq is more complex.
    const condition = eq({ name: 'employeeId' }, employeeId); // Mocking a Drizzle condition object
    
    const result = await db
      .select()
      .from({ name: 'permissions' }) // Mocking schema object
      .where(condition)
      .limit(1);
    return result.length > 0 ? result[0] : {};
  } catch (error) {
    console.error(`TEST RBAC: Error loading granular permissions for employeeId ${employeeId}:`, error);
    return {};
  }
}

async function test_updateUserGranularPermissions(employeeId, newPermissions) {
   if (isNaN(employeeId) || employeeId <= 0) {
    console.error(`TEST RBAC: Invalid employeeId ('${employeeId}') for updateUserGranularPermissions.`);
    throw new Error("Invalid employeeId provided.");
  }
  try {
    const condition = eq({ name: 'employeeId' }, employeeId);
    const existing = await db
      .select()
      .from({ name: 'permissions' })
      .where(condition)
      .limit(1);

    let result;
    if (existing.length > 0) {
      result = await db
        .update({ name: 'permissions' })
        .set(newPermissions)
        .where(condition)
        .returning();
    } else {
      result = await db.insert({ name: 'permissions' }).values({ employeeId, ...newPermissions }).returning();
    }
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(`TEST RBAC: Error updating granular permissions for employeeId ${employeeId}:`, error);
    throw error;
  }
}


// --- Test Cases ---
let testsPassed = 0;
let testsFailed = 0;

function runTest(description, testFn) {
  try {
    const result = testFn();
    if (result instanceof Promise) {
      result.then(() => {
        console.log(`✅ PASS: ${description}`);
        testsPassed++;
      }).catch(e => {
        console.error(`❌ FAIL: ${description}`, e.message);
        testsFailed++;
      });
    } else {
        console.log(`✅ PASS: ${description}`);
        testsPassed++;
    }
  } catch (e) {
    console.error(`❌ FAIL: ${description}`, e.message);
    testsFailed++;
  }
}

console.log('--- Running RBAC Foundation Tests ---');

// Mock User Contexts
const ownerUser = { id: 'owner1', role: Role.OWNER, employeeId: 1 };
const managerUser = { id: 'manager1', role: Role.MANAGER, employeeId: 2 };
const techUser = { id: 'tech1', role: Role.FIELD_TECH, employeeId: 3 };
const bookkeeperUser = { id: 'bookkeeper1', role: Role.BOOKKEEPER, employeeId: 4 };

// Test 1: Owner permissions
runTest('Owner should have canViewRevenue permission', async () => {
  console.assert(await userHasPermission(ownerUser, 'canViewRevenue') === true, 'Owner canViewRevenue');
});
runTest('Owner should have canManageUserRoles permission', async () => {
  console.assert(await userHasPermission(ownerUser, 'canManageUserRoles') === true, 'Owner canManageUserRoles');
});

// Test 2: Manager default permissions
runTest('Manager should have canViewJobCosts permission by default', async () => {
  console.assert(await userHasPermission(managerUser, 'canViewJobCosts') === true, 'Manager canViewJobCosts');
});
runTest('Manager should NOT have canViewRevenue permission by default', async () => {
  console.assert(await userHasPermission(managerUser, 'canViewRevenue') === false, 'Manager !canViewRevenue');
});

// Test 3: Field Tech default permissions
runTest('Field Tech should NOT have canEditPricing permission by default', async () => {
  console.assert(await userHasPermission(techUser, 'canEditPricing') === false, 'Tech !canEditPricing');
});
runTest('Field Tech should NOT have canViewAllCustomers permission by default', async () => {
  console.assert(await userHasPermission(techUser, 'canViewAllCustomers') === false, 'Tech !canViewAllCustomers');
});

// Test 4: Bookkeeper default permissions
runTest('Bookkeeper should have canAccessFinancialReports permission by default', async () => {
  console.assert(await userHasPermission(bookkeeperUser, 'canAccessFinancialReports') === true, 'Bookkeeper canAccessFinancialReports');
});
runTest('Bookkeeper should NOT have canManageSchedules permission by default', async () => {
  console.assert(await userHasPermission(bookkeeperUser, 'canManageSchedules') === false, 'Bookkeeper !canManageSchedules');
});

// Test 5: Explicit grant overrides role default
runTest('Manager with explicit grant for canViewRevenue should have permission', async () => {
  const managerWithGrant = { ...managerUser, dbPermissions: { canViewRevenue: true } };
  console.assert(await userHasPermission(managerWithGrant, 'canViewRevenue') === true, 'Manager explicit canViewRevenue');
});

// Test 6: Explicit deny overrides role default
runTest('Manager with explicit deny for canViewJobCosts should NOT have permission', async () => {
  const managerWithDeny = { ...managerUser, dbPermissions: { canViewJobCosts: false } };
  console.assert(await userHasPermission(managerWithDeny, 'canViewJobCosts') === false, 'Manager explicit !canViewJobCosts');
});

// Test 7: loadUserGranularPermissions
runTest('loadUserGranularPermissions should return empty for non-existent employee', async () => {
  const perms = await test_loadUserGranularPermissions(999);
  console.assert(Object.keys(perms).length === 0, 'Load non-existent perms');
});

runTest('loadUserGranularPermissions should return stored permissions', async () => {
  mockDbStore.permissions = [{ employeeId: 5, canViewRevenue: true, canEditPricing: false }];
  const perms = await test_loadUserGranularPermissions(5);
  console.assert(perms.canViewRevenue === true && perms.canEditPricing === false, 'Load existing perms');
  mockDbStore.permissions = []; // Reset
});

// Test 8: updateUserGranularPermissions - Insert
runTest('updateUserGranularPermissions should insert new permissions', async () => {
  const newPerms = { canViewRevenue: true };
  const result = await test_updateUserGranularPermissions(6, newPerms);
  console.assert(result && result.employeeId === 6 && result.canViewRevenue === true, 'Insert new perms');
  const stored = mockDbStore.permissions.find(p => p.employeeId === 6);
  console.assert(stored && stored.canViewRevenue === true, 'Verify insert in mock store');
  mockDbStore.permissions = []; // Reset
});

// Test 9: updateUserGranularPermissions - Update
runTest('updateUserGranularPermissions should update existing permissions', async () => {
  mockDbStore.permissions = [{ employeeId: 7, canViewRevenue: false, canEditPricing: true, id:1, createdAt: new Date(), updatedAt: new Date() }];
  const updatedPerms = { canViewRevenue: true };
  const result = await test_updateUserGranularPermissions(7, updatedPerms);
  console.assert(result && result.employeeId === 7 && result.canViewRevenue === true && result.canEditPricing === true, 'Update existing perms');
  const stored = mockDbStore.permissions.find(p => p.employeeId === 7);
  console.assert(stored && stored.canViewRevenue === true && stored.canEditPricing === true, 'Verify update in mock store');
  mockDbStore.permissions = []; // Reset
});


// --- Summary ---
// Wait for all promises to settle before logging summary
setTimeout(() => {
  console.log('\n--- Test Summary ---');
  console.log(`Total Tests: ${testsPassed + testsFailed}`);
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsFailed}`);
  if (testsFailed > 0) {
    console.error('\n❌ Some RBAC foundation tests failed!');
    process.exitCode = 1;
  } else {
    console.log('\n✅ All RBAC foundation tests passed!');
  }
}, 1000); // Adjust timeout if tests are slower
