<facThinking><reasoning>The user wants to update the `server/__tests__/routes/feature-flags.test.ts` file.
The goal is to create a *streamlined* version that:
1.  Uses the new test helper (`server/__tests__/utils/testHelper.ts`) for DB connection management and data cleanup.
2.  Has minimal test cases focusing on core API functionality (GET all client flags, PUT to toggle a flag).
3.  Properly cleans up resources (DB connections via test helper, test data).
4.  Avoids complex mocks to reduce memory usage.

**Plan for `server/__tests__/routes/feature-flags.test.ts` (Streamlined Version):**

1.  **Imports**:
    *   `request` from `supertest`.
    *   `app` from `../../../index` (the Express app - correcting path from previous attempts).
    *   `generateToken`, `UserRole` from `../../../middleware/auth-middleware`.
    *   `ServerFeatureFlagKey`, `serverFeatureFlagsRegistry` from `../../feature-flags`.
    *   `db` from `../../../db`.
    *   `usersTable`, `businessProfilesTable`, `featureFlagsTable`, `SharedFeatureFlagKey` from `../../../../shared/schema` and `../../../../shared/feature-flags-schema` (correcting paths).
    *   `v4 as uuidv4` from `uuid`.
    *   `eq` from `drizzle-orm`.
    *   Test helpers: `disconnectDb`, `resetFeatureFlagsTable`, `clearTestUsersAndProfiles`, `ensureTestDatabaseConnection` from `../utils/testHelper`.

2.  **Setup (`beforeAll`, `afterAll`, `beforeEach`)**:
    *   `beforeAll`:
        *   Call `ensureTestDatabaseConnection()` from the test helper.
        *   Create a test admin user and a business profile.
        *   Generate an admin token.
        *   Store created user and profile IDs for cleanup.
    *   `beforeEach`:
        *   Call `resetFeatureFlagsTable()` from the test helper to clear flag states.
        *   (Optional, if needed for specific tests: `primeServerFeatureFlagCache()` - but for minimal tests, might not be needed if we directly verify DB and then API).
    *   `afterAll`:
        *   Call `clearTestUsersAndProfiles()` with stored IDs.
        *   Call `disconnectDb()` from the test helper to close DB pool.

3.  **Minimal Test Cases**:

    *   **`GET /api/feature-flags`**:
        *   **Test 1: Unauthenticated access**: Expect 401.
        *   **Test 2: Authenticated access (Admin or Regular User)**:
            *   Seed one flag in the DB (e.g., `NEW_ESTIMATES_MODULE` set to `true`).
            *   Pick another flag that relies on default (e.g., `JOBS_MODULE`, default `false` in dev).
            *   Make a GET request.
            *   Verify that `NEW_ESTIMATES_MODULE` is `true` (from DB).
            *   Verify that `JOBS_MODULE` is `false` (from default).
            *   Verify that a non-exposeToClient flag (e.g., `SERVER_SIDE_AI_PROCESSING`) is NOT present.
            *   Verify that a `status: 'development'` flag (e.g., `JOBS_MODULE`) IS present if `NODE_ENV` is development, and NOT present if `NODE_ENV` is production (mock `process.env.NODE_ENV` for this).

    *   **`PUT /api/feature-flags/:flagKey`**:
        *   **Test 1: Unauthenticated access**: Expect 401.
        *   **Test 2: Non-admin user access**: Expect 403.
        *   **Test 3: Admin enables a flag**:
            *   Pick a flag (e.g., `MOBILE_OPTIMIZATIONS`).
            *   Call `PUT /api/feature-flags/MOBILE_OPTIMIZATIONS` with admin token and `{"enabled": true}`.
            *   Expect `200 OK`, response body `newState: true`.
            *   Verify DB: `MOBILE_OPTIMIZATIONS` is `true`, `updatedBy` is admin ID.
            *   Verify API (subsequent GET): `MOBILE_OPTIMIZATIONS` is `true`.
        *   **Test 4: Admin disables the same flag**:
            *   Call `PUT /api/feature-flags/MOBILE_OPTIMIZATIONS` with admin token and `{"enabled": false}`.
            *   Expect `200 OK`, response body `newState: false`.
            *   Verify DB: `MOBILE_OPTIMIZATIONS` is `false`.
            *   Verify API (subsequent GET): `MOBILE_OPTIMIZATIONS` is `false`.
        *   **Test 5: Invalid flag key**:
            *   Call `PUT /api/feature-flags/INVALID_KEY_XYZ` with admin token.
            *   Expect `400 Bad Request`.
        *   **Test 6: Invalid body (missing `enabled`)**:
            *   Call `PUT /api/feature-flags/MOBILE_OPTIMIZATIONS` with admin token and `{}`.
            *   Expect `400 Bad Request`.

4.  **Avoid Complex Mocks**:
    *   Rely on actual API calls and DB interactions.
    *   The server-side cache will be tested implicitly by checking if a PUT updates the state reflected in a subsequent GET.
    *   Mock `process.env.NODE_ENV` only for the specific test case that needs it.

**Path Corrections:**
- `app` from `../../../index` (relative to `server/__tests__/routes/`)
- `auth-middleware` from `../../../middleware/auth-middleware`
- `feature-flags` (routes) from `../../feature-flags`
- `db` from `../../../db`
- `shared schemas` from `../../../../shared/`
- `testHelper` from `../utils/testHelper`

**Type Inferences:**
- `InsertUser = typeof usersTable.$inferInsert;`
- `InsertBusinessProfile = typeof businessProfilesTable.$inferInsert;`

This streamlined approach should reduce memory pressure by having fewer, more focused tests and relying on the helper for setup/teardown. The direct DB verification after PUT calls provides strong confidence.
The previous test file had `<facThinking>` tags embedded. I need to ensure the new content does not have these.
The previous test file also had some issues with `InsertUser` and `BusinessProfile` types and missing required fields like `phone`. I will ensure these are correct in the streamlined version.
The import for the Express app should be `import { app as appInstance } from '../../../index';` as noted in the previous successful test runs for other files.
The `UserRole` type will be imported from `auth-middleware`.
The test for `status: 'development'` flags in production vs. development for the GET endpoint is an important core functionality to keep.
The test for `exposeToClient: false` flags not being returned is also core.
The streamlined tests will still cover authentication, authorization, basic GET functionality (including overrides and defaults), basic PUT functionality (enable/disable, DB verification), and essential error cases for PUT.
</reasoning>```typescript
// server/__tests__/routes/feature-flags.test.ts

import request from 'supertest';
import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

import { app as appInstance } from '../../../index'; // Corrected path to import the Express app
import { db } from '../../../db';
import {
  featureFlagsTable,
  FeatureFlagKey as SharedFeatureFlagKey,
} from '../../../../shared/feature-flags-schema'; // Corrected path
import {
  users as usersTable,
  businessProfiles as businessProfilesTable,
  userRoleEnum,
} from '../../../../shared/schema'; // Corrected path

import {
  ServerFeatureFlagKey,
  serverFeatureFlagsRegistry,
  // isServerFeatureEnabled, // Not strictly needed for API tests if verifying via GET / DB
} from '../../feature-flags'; // Corrected path
import { generateToken, UserRole } from '../../../middleware/auth-middleware'; // Corrected path
import {
  disconnectDb,
  resetFeatureFlagsTable,
  clearTestUsersAndProfiles,
  ensureTestDatabaseConnection,
} from '../utils/testHelper'; // Corrected path

// Inferred types for user and business profile insertion
type InsertUser = typeof usersTable.$inferInsert;
type InsertBusinessProfile = typeof businessProfilesTable.$inferInsert;

describe('Feature Flags API - Streamlined Tests', () => {
  let server: Express;
  let adminToken: string;
  let userToken: string; // For testing non-admin access
  const adminUserId = uuidv4();
  const regularUserId = uuidv4();
  let testBusinessProfileId: number;

  const adminUserData: InsertUser = {
    id: adminUserId,
    email: `admin-ff-streamlined@example.com`,
    passwordHash: 'test_hash_admin',
    role: 'admin' as UserRole,
    isActive: true,
    firstName: 'AdminFF',
    lastName: 'Stream',
    phone: '1234567890', // Required field
  };

  const regularUserData: InsertUser = {
    id: regularUserId,
    email: `user-ff-streamlined@example.com`,
    passwordHash: 'test_hash_user',
    role: 'user' as UserRole,
    isActive: true,
    firstName: 'UserFF',
    lastName: 'Stream',
    phone: '0987654321', // Required field
  };

  beforeAll(async () => {
    server = appInstance;
    await ensureTestDatabaseConnection();

    const [profile] = await db
      .insert(businessProfilesTable)
      .values({
        businessName: 'FF Streamlined Test Corp',
        ownerName: 'FF Streamlined Owner',
        email: 'owner-ff-streamlined@example.com',
        phone: '5550009876',
        address: '123 Streamlined St',
        city: 'Streamville',
        state: 'TS',
        zipCode: 'ST987',
        businessType: 'Streamlined Testing',
      } as Omit<InsertBusinessProfile, 'id' | 'createdAt' | 'updatedAt' | 'stripeCustomerId' | 'stripeSubscriptionId' | 'subscriptionStatus' | 'logoUrl' | 'industry' | 'website' | 'notes'>)
      .returning({ id: businessProfilesTable.id });
    testBusinessProfileId = profile.id;

    adminUserData.businessProfileId = testBusinessProfileId;
    regularUserData.businessProfileId = testBusinessProfileId;

    await db.insert(usersTable).values([adminUserData, regularUserData]).onConflictDoNothing();

    adminToken = generateToken({ id: adminUserData.id!, email: adminUserData.email!, role: adminUserData.role!, businessProfileId: adminUserData.businessProfileId! });
    userToken = generateToken({ id: regularUserData.id!, email: regularUserData.email!, role: regularUserData.role!, businessProfileId: regularUserData.businessProfileId! });
  });

  beforeEach(async () => {
    await resetFeatureFlagsTable();
    // No complex cache priming, rely on API/DB state for these streamlined tests
  });

  afterAll(async () => {
    await clearTestUsersAndProfiles([adminUserId, regularUserId], [testBusinessProfileId]);
    await disconnectDb();
  });

  describe('GET /api/feature-flags', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(server).get('/api/feature-flags');
      expect(response.status).toBe(401);
    });

    it('should return client-exposable flags, respecting DB overrides and defaults', async () => {
      const dbOverrideFlag = ServerFeatureFlagKey.NEW_ESTIMATES_MODULE; // exposeToClient: true, dev default: true
      const defaultFlag = ServerFeatureFlagKey.JOBS_MODULE;            // exposeToClient: true, dev default: false
      
      // Set NEW_ESTIMATES_MODULE to false in DB (opposite of its dev default)
      await db.insert(featureFlagsTable).values({
        flagKey: dbOverrideFlag as unknown as SharedFeatureFlagKey,
        enabled: false,
        description: serverFeatureFlagsRegistry[dbOverrideFlag].description,
        updatedBy: adminUserId,
      });

      const response = await request(server)
        .get('/api/feature-flags')
        .set('Authorization', `Bearer ${userToken}`); // Any authenticated user

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);

      // Check DB overridden flag
      expect(response.body).toHaveProperty(dbOverrideFlag);
      expect(response.body[dbOverrideFlag]).toBe(false);

      // Check flag relying on default (JOBS_MODULE dev default is false)
      const jobsConfig = serverFeatureFlagsRegistry[defaultFlag];
      const expectedJobsDefault = process.env.NODE_ENV === 'development' ? jobsConfig.defaultEnabledInDev : jobsConfig.defaultEnabledInProd;
      expect(response.body).toHaveProperty(defaultFlag);
      expect(response.body[defaultFlag]).toBe(expectedJobsDefault);

      // Check non-exposeToClient flag is not present
      const serverOnlyFlag = ServerFeatureFlagKey.SERVER_SIDE_AI_PROCESSING; // exposeToClient: false
      expect(response.body).not.toHaveProperty(serverOnlyFlag);
    });

    it('should filter development-status flags in production but show them in development', async () => {
      const devStatusFlag = ServerFeatureFlagKey.JOBS_MODULE; // status: 'development', exposeToClient: true
      
      // Test in Production
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      await resetFeatureFlagsTable(); // Reset for clean state based on new NODE_ENV default
      // primeServerFeatureFlagCache(); // If using, re-prime with new NODE_ENV for isServerFeatureEnabled

      let responseProd = await request(server)
        .get('/api/feature-flags')
        .set('Authorization', `Bearer ${userToken}`);
      expect(responseProd.status).toBe(200);
      expect(responseProd.body).not.toHaveProperty(devStatusFlag);

      // Test in Development
      process.env.NODE_ENV = 'development';
      await resetFeatureFlagsTable();
      // primeServerFeatureFlagCache();

      let responseDev = await request(server)
        .get('/api/feature-flags')
        .set('Authorization', `Bearer ${userToken}`);
      expect(responseDev.status).toBe(200);
      expect(responseDev.body).toHaveProperty(devStatusFlag);
      // Check its default value in dev
      const devConfig = serverFeatureFlagsRegistry[devStatusFlag];
      expect(responseDev.body[devStatusFlag]).toBe(devConfig.defaultEnabledInDev);

      process.env.NODE_ENV = originalNodeEnv; // Restore
    });
  });

  describe('PUT /api/feature-flags/:flagKey', () => {
    const flagToTest = ServerFeatureFlagKey.MOBILE_OPTIMIZATIONS; // exposeToClient: true

    it('should return 401 for PUT if no token is provided', async () => {
      const response = await request(server)
        .put(`/api/feature-flags/${flagToTest}`)
        .send({ enabled: true });
      expect(response.status).toBe(401);
    });

    it('should return 403 for PUT if a non-admin user tries to update', async () => {
      const response = await request(server)
        .put(`/api/feature-flags/${flagToTest}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: true });
      expect(response.status).toBe(403);
    });

    it('should allow an admin to enable and then disable a flag, verifying DB and API response', async () => {
      // Enable the flag
      const enableResponse = await request(server)
        .put(`/api/feature-flags/${flagToTest}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ enabled: true });
      expect(enableResponse.status).toBe(200);
      expect(enableResponse.body.newState).toBe(true);

      let dbRecord = await db.query.featureFlagsTable.findFirst({
        where: eq(featureFlagsTable.flagKey, flagToTest as unknown as SharedFeatureFlagKey),
      });
      expect(dbRecord?.enabled).toBe(true);
      expect(dbRecord?.updatedBy).toBe(adminUserId);

      let getResponse = await request(server).get('/api/feature-flags').set('Authorization', `Bearer ${adminToken}`);
      expect(getResponse.body[flagToTest]).toBe(true);

      // Disable the flag
      const disableResponse = await request(server)
        .put(`/api/feature-flags/${flagToTest}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ enabled: false });
      expect(disableResponse.status).toBe(200);
      expect(disableResponse.body.newState).toBe(false);

      dbRecord = await db.query.featureFlagsTable.findFirst({
        where: eq(featureFlagsTable.flagKey, flagToTest as unknown as SharedFeatureFlagKey),
      });
      expect(dbRecord?.enabled).toBe(false);

      getResponse = await request(server).get('/api/feature-flags').set('Authorization', `Bearer ${adminToken}`);
      expect(getResponse.body[flagToTest]).toBe(false);
    });

    it('should return 400 for PUT with an invalid flagKey', async () => {
      const response = await request(server)
        .put('/api/feature-flags/INVALID_FLAG_KEY_FOR_SURE')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ enabled: true });
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid feature flag key in URL.');
    });

    it('should return 400 for PUT with a missing "enabled" field in body', async () => {
      const response = await request(server)
        .put(`/api/feature-flags/${flagToTest}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({}); // Missing 'enabled'
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid request body.');
      expect(JSON.stringify(response.body.details)).toContain("The 'enabled' field (boolean) is required");
    });

     it('should return 400 for PUT with a non-boolean "enabled" field', async () => {
      const response = await request(server)
        .put(`/api/feature-flags/${flagToTest}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ enabled: "not-a-boolean" }); 
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid request body.');
      expect(JSON.stringify(response.body.details)).toContain("The 'enabled' field must be a boolean");
    });
  });
});
```</facFileContent>```typescript
// server/__tests__/routes/feature-flags.test.ts

import request from 'supertest';
import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

import { app as appInstance } from '../../../index'; // Corrected path to import the Express app
import { db } from '../../../db';
import {
  featureFlagsTable,
  FeatureFlagKey as SharedFeatureFlagKey,
} from '../../../../shared/feature-flags-schema'; // Corrected path
import {
  users as usersTable,
  businessProfiles as businessProfilesTable,
  userRoleEnum,
} from '../../../../shared/schema'; // Corrected path

import {
  ServerFeatureFlagKey,
  serverFeatureFlagsRegistry,
  // isServerFeatureEnabled, // Not strictly needed for API tests if verifying via GET / DB
} from '../../feature-flags'; // Corrected path
import { generateToken, UserRole } from '../../../middleware/auth-middleware'; // Corrected path
import {
  disconnectDb,
  resetFeatureFlagsTable,
  clearTestUsersAndProfiles,
  ensureTestDatabaseConnection,
} from '../utils/testHelper'; // Corrected path

// Inferred types for user and business profile insertion
type InsertUser = typeof usersTable.$inferInsert;
type InsertBusinessProfile = typeof businessProfilesTable.$inferInsert;

describe('Feature Flags API - Streamlined Tests', () => {
  let server: Express;
  let adminToken: string;
  let userToken: string; // For testing non-admin access
  const adminUserId = uuidv4();
  const regularUserId = uuidv4();
  let testBusinessProfileId: number;

  const adminUserData: InsertUser = {
    id: adminUserId,
    email: `admin-ff-streamlined@example.com`,
    passwordHash: 'test_hash_admin',
    role: 'admin' as UserRole,
    isActive: true,
    firstName: 'AdminFF',
    lastName: 'Stream',
    phone: '1234567890', 
  };

  const regularUserData: InsertUser = {
    id: regularUserId,
    email: `user-ff-streamlined@example.com`,
    passwordHash: 'test_hash_user',
    role: 'user' as UserRole,
    isActive: true,
    firstName: 'UserFF',
    lastName: 'Stream',
    phone: '0987654321', 
  };

  beforeAll(async () => {
    server = appInstance;
    await ensureTestDatabaseConnection();

    const [profile] = await db
      .insert(businessProfilesTable)
      .values({
        businessName: 'FF Streamlined Test Corp',
        ownerName: 'FF Streamlined Owner',
        email: 'owner-ff-streamlined@example.com',
        phone: '5550009876',
        address: '123 Streamlined St',
        city: 'Streamville',
        state: 'TS',
        zipCode: 'ST987',
        businessType: 'Streamlined Testing',
      } as Omit<InsertBusinessProfile, 'id' | 'createdAt' | 'updatedAt' | 'stripeCustomerId' | 'stripeSubscriptionId' | 'subscriptionStatus' | 'logoUrl' | 'industry' | 'website' | 'notes'>)
      .returning({ id: businessProfilesTable.id });
    testBusinessProfileId = profile.id;

    adminUserData.businessProfileId = testBusinessProfileId;
    regularUserData.businessProfileId = testBusinessProfileId;

    await db.insert(usersTable).values([adminUserData, regularUserData]).onConflictDoNothing();

    adminToken = generateToken({ id: adminUserData.id!, email: adminUserData.email!, role: adminUserData.role!, businessProfileId: adminUserData.businessProfileId! });
    userToken = generateToken({ id: regularUserData.id!, email: regularUserData.email!, role: regularUserData.role!, businessProfileId: regularUserData.businessProfileId! });
  });

  beforeEach(async () => {
    await resetFeatureFlagsTable();
    // No complex cache priming, rely on API/DB state for these streamlined tests
  });

  afterAll(async () => {
    await clearTestUsersAndProfiles([adminUserId, regularUserId], [testBusinessProfileId]);
    await disconnectDb();
  });

  describe('GET /api/feature-flags', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(server).get('/api/feature-flags');
      expect(response.status).toBe(401);
    });

    it('should return client-exposable flags, respecting DB overrides and defaults', async () => {
      const dbOverrideFlag = ServerFeatureFlagKey.NEW_ESTIMATES_MODULE; // exposeToClient: true, dev default: true
      const defaultFlag = ServerFeatureFlagKey.JOBS_MODULE;            // exposeToClient: true, dev default: false
      
      // Set NEW_ESTIMATES_MODULE to false in DB (opposite of its dev default)
      await db.insert(featureFlagsTable).values({
        flagKey: dbOverrideFlag as unknown as SharedFeatureFlagKey,
        enabled: false,
        description: serverFeatureFlagsRegistry[dbOverrideFlag].description,
        updatedBy: adminUserId,
      });

      const response = await request(server)
        .get('/api/feature-flags')
        .set('Authorization', `Bearer ${userToken}`); // Any authenticated user

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);

      // Check DB overridden flag
      expect(response.body).toHaveProperty(dbOverrideFlag);
      expect(response.body[dbOverrideFlag]).toBe(false);

      // Check flag relying on default (JOBS_MODULE dev default is false)
      const jobsConfig = serverFeatureFlagsRegistry[defaultFlag];
      const expectedJobsDefault = process.env.NODE_ENV === 'development' ? jobsConfig.defaultEnabledInDev : jobsConfig.defaultEnabledInProd;
      expect(response.body).toHaveProperty(defaultFlag);
      expect(response.body[defaultFlag]).toBe(expectedJobsDefault);

      // Check non-exposeToClient flag is not present
      const serverOnlyFlag = ServerFeatureFlagKey.SERVER_SIDE_AI_PROCESSING; // exposeToClient: false
      expect(response.body).not.toHaveProperty(serverOnlyFlag);
    });

    it('should filter development-status flags in production but show them in development', async () => {
      const devStatusFlag = ServerFeatureFlagKey.JOBS_MODULE; // status: 'development', exposeToClient: true
      
      // Test in Production
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      await resetFeatureFlagsTable(); // Reset for clean state based on new NODE_ENV default
      // primeServerFeatureFlagCache(); // If using, re-prime with new NODE_ENV for isServerFeatureEnabled

      let responseProd = await request(server)
        .get('/api/feature-flags')
        .set('Authorization', `Bearer ${userToken}`);
      expect(responseProd.status).toBe(200);
      expect(responseProd.body).not.toHaveProperty(devStatusFlag);

      // Test in Development
      process.env.NODE_ENV = 'development';
      await resetFeatureFlagsTable();
      // primeServerFeatureFlagCache();

      let responseDev = await request(server)
        .get('/api/feature-flags')
        .set('Authorization', `Bearer ${userToken}`);
      expect(responseDev.status).toBe(200);
      expect(responseDev.body).toHaveProperty(devStatusFlag);
      // Check its default value in dev
      const devConfig = serverFeatureFlagsRegistry[devStatusFlag];
      expect(responseDev.body[devStatusFlag]).toBe(devConfig.defaultEnabledInDev);

      process.env.NODE_ENV = originalNodeEnv; // Restore
    });
  });

  describe('PUT /api/feature-flags/:flagKey', () => {
    const flagToTest = ServerFeatureFlagKey.MOBILE_OPTIMIZATIONS; // exposeToClient: true

    it('should return 401 for PUT if no token is provided', async () => {
      const response = await request(server)
        .put(`/api/feature-flags/${flagToTest}`)
        .send({ enabled: true });
      expect(response.status).toBe(401);
    });

    it('should return 403 for PUT if a non-admin user tries to update', async () => {
      const response = await request(server)
        .put(`/api/feature-flags/${flagToTest}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: true });
      expect(response.status).toBe(403);
    });

    it('should allow an admin to enable and then disable a flag, verifying DB and API response', async () => {
      // Enable the flag
      const enableResponse = await request(server)
        .put(`/api/feature-flags/${flagToTest}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ enabled: true });
      expect(enableResponse.status).toBe(200);
      expect(enableResponse.body.newState).toBe(true);

      let dbRecord = await db.query.featureFlagsTable.findFirst({
        where: eq(featureFlagsTable.flagKey, flagToTest as unknown as SharedFeatureFlagKey),
      });
      expect(dbRecord?.enabled).toBe(true);
      expect(dbRecord?.updatedBy).toBe(adminUserId);

      let getResponse = await request(server).get('/api/feature-flags').set('Authorization', `Bearer ${adminToken}`);
      expect(getResponse.body[flagToTest]).toBe(true);

      // Disable the flag
      const disableResponse = await request(server)
        .put(`/api/feature-flags/${flagToTest}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ enabled: false });
      expect(disableResponse.status).toBe(200);
      expect(disableResponse.body.newState).toBe(false);

      dbRecord = await db.query.featureFlagsTable.findFirst({
        where: eq(featureFlagsTable.flagKey, flagToTest as unknown as SharedFeatureFlagKey),
      });
      expect(dbRecord?.enabled).toBe(false);

      getResponse = await request(server).get('/api/feature-flags').set('Authorization', `Bearer ${adminToken}`);
      expect(getResponse.body[flagToTest]).toBe(false);
    });

    it('should return 400 for PUT with an invalid flagKey', async () => {
      const response = await request(server)
        .put('/api/feature-flags/INVALID_FLAG_KEY_FOR_SURE')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ enabled: true });
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid feature flag key in URL.');
    });

    it('should return 400 for PUT with a missing "enabled" field in body', async () => {
      const response = await request(server)
        .put(`/api/feature-flags/${flagToTest}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({}); // Missing 'enabled'
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid request body.');
      expect(JSON.stringify(response.body.details)).toContain("The 'enabled' field (boolean) is required");
    });

     it('should return 400 for PUT with a non-boolean "enabled" field', async () => {
      const response = await request(server)
        .put(`/api/feature-flags/${flagToTest}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ enabled: "not-a-boolean" }); 
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid request body.');
      expect(JSON.stringify(response.body.details)).toContain("The 'enabled' field must be a boolean");
    });
  });
});
```</facFileContent>