# Feature Flag System - Comprehensive Test Plan

## 1. Introduction

This document outlines the comprehensive test plan for the TULBOXX Feature Flag System. The system allows for dynamic enabling/disabling of application features across different environments and user segments. It comprises a database persistence layer, a server-side API for management and resolution, and client-side utilities (React hook and guard component) for consumption, along with an Admin UI for management.

## 2. Testing Objectives

*   Verify the reliability and correctness of feature flag resolution across all layers (DB, Server API, Client, Admin UI).
*   Ensure the security of the feature flag management API and Admin UI, including robust permission and routing protection.
*   Validate that client-side components correctly respond to feature flag state changes.
*   Confirm graceful fallback mechanisms and system resilience when dynamic configurations (DB, API) are unavailable or under stress.
*   Ensure accurate behavior under various configurations (defaults, environment variables, database overrides).
*   Assess performance implications of the feature flag system.
*   Identify and mitigate potential edge cases and security vulnerabilities.

## 3. Scope of Testing

**In Scope:**

*   Database schema and persistence for feature flags (`feature_flags` table).
*   Server-side API endpoints:
    *   `GET /api/feature-flags` (retrieving client-exposable flags)
    *   `PUT /api/feature-flags/:flagKey` (admin-only flag toggling)
*   Server-side flag resolution logic (`isServerFeatureEnabled` function, including caching and precedence: Cache > DB > Env Var > Default).
*   Client-side shared feature flag configuration (`client/src/shared/featureFlags.ts`).
*   Client-side React hook (`useFeatureFlag`), including its interaction with server-fetched states and client-side fallbacks (localStorage > Env Var > Default).
*   Client-side React component (`FeatureFlagGuard`).
*   Admin UI functionality for viewing, searching, and toggling flags, including its "Refresh States" capability.
*   Permission and routing protection for admin-specific functionalities (both API and UI).
*   Integration between client, server, and database for feature flag state propagation.
*   Security aspects of the feature flag API, data exposure, and Admin UI.
*   Basic performance considerations and resilience testing for edge cases.

**Out of Scope (for this specific plan, may be covered elsewhere):**

*   Full-scale performance load testing of the feature flag API under extreme concurrency (focus is on functional correctness and basic performance indicators).
*   In-depth usability testing of the Admin UI beyond functional correctness and responsiveness.
*   End-to-end business workflow testing that *uses* feature-flagged features (focus here is on the flag system itself).
*   Specific A/B testing framework functionality (if built on top of this system).
*   Automated migration script testing beyond ensuring it applies schema and seeds data correctly.

## 4. Testing Strategies

### 4.1. API Testing (Server-Side Functionality)

*   **Tools**: Jest, Supertest (or similar HTTP request library for Node.js).
*   **Environment**: Test database with controlled data, mock environment variables as needed.

**Endpoints & Scenarios:**

#### A. `GET /api/feature-flags`

*   **Authentication & Authorization**:
    1.  **Unauthenticated Access**: Request without a token.
        *   Expected: `401 Unauthorized`.
    2.  **Authenticated Access (Regular User)**: Request with a valid non-admin user token.
        *   Expected: `200 OK`, returns a JSON object of flag states.
*   **Flag Exposure Logic**:
    1.  **Client-Exposable Flags**: Verify that only flags with `config.exposeToClient: true` in `serverFeatureFlagsRegistry` are returned.
        *   Expected: Response keys match only exposable flags.
    2.  **Development Status Flags (Production Env)**: Mock `process.env.NODE_ENV = 'production'`.
        *   Expected: Flags with `config.status: 'development'` (and `exposeToClient: true`) are NOT returned.
    3.  **Development Status Flags (Development Env)**: Set `process.env.NODE_ENV = 'development'`.
        *   Expected: Flags with `config.status: 'development'` (and `exposeToClient: true`) ARE returned (if not filtered by other means).
*   **Flag State Resolution (Server-Side Precedence: Cache > DB > Env Var > Default)**:
    1.  **DB Override**: Flag enabled in DB, disabled by default/env.
        *   Expected: API returns `true` for this flag.
    2.  **Env Var Override (No DB Record)**: Flag disabled by default, enabled via server environment variable, no DB record.
        *   Expected: API returns `true`.
    3.  **Default State (No DB Record, No Env Var)**: Flag uses `defaultEnabledInDev/Prod` from `serverFeatureFlagsRegistry`.
        *   Expected: API returns the correct default state based on `NODE_ENV`.
*   **Cache Behavior**:
    1.  **Initial Fetch**: First request after server start/cache clear.
        *   Expected: Fetches from DB/Env/Default, response is correct, cache is populated.
    2.  **Subsequent Fetch (within TTL)**: Second request shortly after the first.
        *   Expected: Response is identical, served from cache.
    3.  **Fetch After PUT**: Request after a `PUT` updates a flag.
        *   Expected: Response reflects the updated state immediately (cache for that flag is updated/invalidated by PUT).
    4.  **Fetch After TTL Expiry**: (Using time mocking if possible)
        *   Setup: Flag state A in DB, GET request populates cache.
        *   Action: Directly change flag state to B in DB (bypassing API).
        *   Action: Mock time to pass beyond cache TTL.
        *   Expected: Next GET request for the flag returns state B (re-fetched from DB).

#### B. `PUT /api/feature-flags/:flagKey`

*   **Authentication & Authorization (see also Section 4.5)**:
    1.  **Admin User Access**: Request with a valid admin user token.
        *   Expected: `200 OK` (for valid requests).
*   **Successful Updates**:
    1.  **Enable a Flag (New Record)**: `flagKey` exists in registry but not in DB.
        *   Expected: `200 OK`, response shows `newState: true`. DB record created with `enabled: true`, `updatedBy` (admin ID), correct `description` from registry. Cache updated.
    2.  **Enable an Existing Flag (Update)**: Flag exists in DB, currently `false`.
        *   Expected: `200 OK`, response shows `newState: true`. DB record updated. Cache updated.
    3.  **Disable an Existing Flag (Update)**: Flag exists in DB, currently `true`.
        *   Expected: `200 OK`, response shows `newState: false`. DB record updated. Cache updated.
*   **Input Validation & Error Handling**:
    1.  **Invalid `flagKey`**: `flagKey` in URL path is not a member of `ServerFeatureFlagKey`.
        *   Expected: `400 Bad Request` with meaningful error message.
    2.  **Missing `enabled` in Body**: Request body is empty or does not contain `enabled` field.
        *   Expected: `400 Bad Request`.
    3.  **Non-Boolean `enabled` in Body**: `enabled` field is a string, number, etc.
        *   Expected: `400 Bad Request`.
*   **Database Interaction**:
    1.  Verify `updatedBy` field in DB is correctly set to the authenticated admin's user ID (or null if system action).
    2.  Verify `updatedAt` field is updated.
    3.  Verify `description` field is populated from `serverFeatureFlagsRegistry` if the record is new or updated.

**Data Setup/Teardown for API Tests**:

*   Use a dedicated test database or ensure robust cleanup.
*   Before each test suite or relevant test group:
    *   Create necessary test users (e.g., `test-admin`, `test-user`) with appropriate roles and JWT tokens.
    *   Ensure the `feature_flags` table is empty or in a known state.
*   After each test or suite:
    *   Clear the `feature_flags` table.
    *   Remove test users.
*   Mock `process.env.NODE_ENV` as needed to simulate production/development environments.

### 4.2. Component Testing (Client-Side Functionality)

*   **Tools**: Jest, React Testing Library.
*   **Focus**: Test the logic and rendering of `useFeatureFlag` hook and `FeatureFlagGuard` component in isolation, including client-side resolution logic.

#### A. `useFeatureFlag` Hook

*   **Mocking**: Mock the `fetchServerFeatureFlags` API call (used internally by `useServerFeatureFlags`, which `useFeatureFlag` consumes).
*   **Scenarios**:
    1.  **Server Flag Enabled**: Mock API returns `{ "FLAG_A": true }`.
        *   Expected: `useFeatureFlag(FeatureFlagKey.FLAG_A)` returns `true`.
    2.  **Server Flag Disabled**: Mock API returns `{ "FLAG_A": false }`.
        *   Expected: `useFeatureFlag(FeatureFlagKey.FLAG_A)` returns `false`.
    3.  **Flag Not in Server Response (Fallback to Client Config)**: Mock API returns `{}` or a response without `FLAG_A`. Client-side `isFeatureEnabled(FeatureFlagKey.FLAG_A)` (from `client/src/shared/featureFlags.ts`) would resolve to `true` (e.g., via localStorage, env var, or dev default).
        *   Expected: `useFeatureFlag(FeatureFlagKey.FLAG_A)` returns `true`.
    4.  **API Fetch Loading**: Mock `useServerFeatureFlags` to be in `isLoading` state and no cached server data. Client-side `isFeatureEnabled(FeatureFlagKey.FLAG_A)` resolves to `false`.
        *   Expected: `useFeatureFlag(FeatureFlagKey.FLAG_A)` returns `false` (reflecting client-side state while loading).
    5.  **API Fetch Error**: Mock `useServerFeatureFlags` to be in `isError` state. Client-side `isFeatureEnabled(FeatureFlagKey.FLAG_A)` resolves to `true`.
        *   Expected: `useFeatureFlag(FeatureFlagKey.FLAG_A)` returns `true` (reflecting client-side state on error).
    6.  **Client-Side localStorage Override**: Mock `localStorage` to enable a flag (e.g., `ff_FLAG_A` = `true`). Server API mock returns `{ "FLAG_A": false }` or doesn't return `FLAG_A`.
        *   Expected: `useFeatureFlag(FeatureFlagKey.FLAG_A)` returns `true` (verifying localStorage precedence).
    7.  **Client-Side Env Var Override (No localStorage, No Server Value)**: Mock Vite env var `VITE_FEATURE_FLAG_A=true`. Server API mock doesn't return `FLAG_A`. No localStorage override.
        *   Expected: `useFeatureFlag(FeatureFlagKey.FLAG_A)` returns `true`.
    8.  **Client-Side Default (No localStorage, No Env Var, No Server Value)**: No overrides.
        *   Expected: `useFeatureFlag(FeatureFlagKey.FLAG_A)` returns the default from `CLIENT_FEATURE_FLAG_CONFIG`.

#### B. `FeatureFlagGuard` Component

*   **Mocking**: Mock the `useFeatureFlag` hook itself to control its return values for different keys.
*   **Scenarios**:
    1.  **Single `feature` Prop (Enabled)**: Mock `useFeatureFlag` to return `true` for the given feature.
        *   Expected: Renders `children`.
    2.  **Single `feature` Prop (Disabled)**: Mock `useFeatureFlag` to return `false`.
        *   Expected: Renders `fallback` prop content (or `null` if no fallback).
    3.  **Multiple `features` Prop (AND Condition - All Enabled)**: Mock `useFeatureFlag` to return `true` for all specified features.
        *   Expected: Renders `children`.
    4.  **Multiple `features` Prop (AND Condition - Some Disabled)**: Mock `useFeatureFlag` to return `false` for at least one specified feature.
        *   Expected: Renders `fallback`.
    5.  **Multiple `features` Prop (OR Condition - Some Enabled)**: Mock `useFeatureFlag` to return `true` for at least one specified feature.
        *   Expected: Renders `children`.
    6.  **Multiple `features` Prop (OR Condition - All Disabled)**: Mock `useFeatureFlag` to return `false` for all specified features.
        *   Expected: Renders `fallback`.
    7.  **Misconfiguration (No `feature` or `features` prop)**:
        *   Expected: Renders `fallback`, logs a console error in dev mode.
    8.  **Unknown/Misspelled Flag Key**: Pass an invalid key.
        *   Expected: Treats flag as disabled, logs console warning in dev mode.

### 4.3. Admin UI Testing (Manual and/or Automated with Playwright)

*   **Display**:
    1.  Verify all flags from `serverFeatureFlagsRegistry` are listed.
    2.  Verify correct display of Flag Key, Description, Client Defaults (Dev/Prod), and Live Server State.
    3.  Verify loading skeletons are shown during initial data fetch.
*   **Functionality**:
    1.  **Search/Filter**: Test filtering by flag key and description; verify results are accurate. Test with no results.
    2.  **Toggle Flag**:
        *   Click toggle for an enabled flag. Expected: API call made, UI updates to OFF, success message (optional).
        *   Click toggle for a disabled flag. Expected: API call made, UI updates to ON, success message (optional).
        *   Verify loading indicator during toggle operation.
        *   Verify error message display if API call fails.
    3.  **Refresh States Button**:
        *   Manually change a flag state in DB (or via API with another client).
        *   Click "Refresh States". Expected: UI updates to reflect the new live states.
        *   Verify loading indicator on button during refresh.
*   **Responsiveness**: Check UI layout on different screen sizes (desktop, tablet, mobile).

### 4.4. Integration Testing (End-to-End)

*   **Tools**: Playwright for end-to-end scenarios.
*   **Focus**: Verify the end-to-end flow from flag state change (DB/API/Admin UI) to UI update.

**Key Scenarios**:

1.  **Admin UI Toggles Flag -> Client UI Updates**:
    *   Setup: A page with content guarded by `FeatureFlagKey.NEW_REPORTS_DASHBOARD` (initially disabled in DB/default).
    *   Action: As admin, log in, navigate to `/admin/feature-flags` UI, find `NEW_REPORTS_DASHBOARD`, and toggle it to `true`.
    *   Verification: Navigate to the client page (as a regular user). The guarded content should now be visible.
    *   Action: In Admin UI, toggle the flag to `false`.
    *   Verification: Navigate back or refresh client page. Guarded content should be hidden.
2.  **Client-Side localStorage Override -> UI Updates**:
    *   Setup: Server state for `FeatureFlagKey.ADVANCED_LINE_ITEMS` is `false`.
    *   Action: Use browser dev tools (or test script) to set `localStorage.setItem('ff_ADVANCED_LINE_ITEMS', 'true')`.
    *   Verification: Reload client page. Content guarded by `ADVANCED_LINE_ITEMS` should be visible.
    *   Action: Clear localStorage item.
    *   Verification: Reload. Content should reflect server state (hidden).
3.  **Environment Variable Influence (Client-Side Fallback)**:
    *   Setup: No DB record for `FeatureFlagKey.PDF_GENERATION`. Mock server API to not return this flag. Set client-side Vite env var `VITE_FEATURE_PDF_GENERATION=true`.
    *   Verification: Client UI guarded by `PDF_GENERATION` should show the feature.

### 4.5. Security & Permissions Testing

*   **Tools**: API testing tools (Supertest/Postman), Manual UI testing, Playwright.
*   **Focus**: Ensure only authorized users can manage flags and access admin areas.

**Test Cases**:

1.  **Admin UI Access Control (Client-Side Routing & UI)**:
    *   **Non-Admin Logged In**: Attempt to navigate directly to `/admin/feature-flags`.
        *   Expected: Redirected to a default page (e.g., dashboard) or an "Access Denied" page. Admin navigation links should not be visible.
    *   **Unauthenticated User**: Attempt to navigate directly to `/admin/feature-flags`.
        *   Expected: Redirected to the login page.
    *   **Admin Logged In**: Navigate to `/admin/feature-flags`.
        *   Expected: Page loads successfully, all UI elements are interactive.
2.  **API Endpoint Protection (`PUT /api/feature-flags/:flagKey`)**:
    *   **Non-Admin User Token**: Attempt to call `PUT` endpoint with a regular user's JWT.
        *   Expected: `403 Forbidden`.
    *   **Unauthenticated Request**: Attempt to call `PUT` endpoint without JWT.
        *   Expected: `401 Unauthorized`.
    *   **Expired/Invalid Token**: Attempt to call `PUT` endpoint with an expired or malformed JWT.
        *   Expected: `401 Unauthorized`.
    *   **Admin User Token**: Call `PUT` endpoint with an admin's JWT.
        *   Expected: `200 OK` (if request is valid).
3.  **API Endpoint Protection (`GET /api/feature-flags`)**:
    *   **Unauthenticated Request**: Attempt to call `GET` endpoint without JWT.
        *   Expected: `401 Unauthorized`.
    *   **Authenticated Request (Any Role)**: Call `GET` endpoint with any valid user's JWT.
        *   Expected: `200 OK`, returns client-exposable flags.
4.  **Input Validation (API `PUT`)**: (Covered in API Testing, re-verify security implications)
    *   Test with malicious or malformed inputs for `:flagKey` and `enabled` in body.
    *   Expected: `400 Bad Request`, no unintended side effects (e.g., SQL injection, data corruption).
5.  **Data Exposure (API `GET`)**: (Covered in API Testing, re-verify security implications)
    *   Confirm flags with `exposeToClient: false` are never sent.
    *   Confirm flags with `status: 'development'` are not sent in production.
6.  **Client-Side Manipulation**:
    *   Manually enable a flag in `localStorage` that a user should not have access to (e.g., an admin-only feature).
    *   Expected: Client UI might show the feature, but server-side operations related to that feature must still fail due to lack of server-side permissions. This confirms client-side flags are for UX, not security.

### 4.6. Resilience & Edge Case Testing

*   **API Unavailability**:
    *   Action: Simulate `/api/feature-flags` endpoint returning 500 error or timeout.
    *   Expected: Client application remains functional, `useFeatureFlag` falls back to client-side resolution (localStorage > Env Var > Default), console warning logged. Admin UI shows an error message for live states.
*   **Database Connection Issues (Server-Side)**:
    *   Action: Simulate database being unreachable when `isServerFeatureEnabled` attempts a DB lookup.
    *   Expected: Server logs error, `isServerFeatureEnabled` falls back to Env Var/Default, API `GET /api/feature-flags` still serves based on fallbacks. `PUT` operations fail gracefully with 500.
*   **Invalid Data in DB**:
    *   Action: Manually insert a `flagKey` into `feature_flags` table that doesn't exist in `SharedFeatureFlagKey` enum or `serverFeatureFlagsRegistry`.
    *   Expected: Server API (`GET`) should ignore/filter this invalid flag. `isServerFeatureEnabled` for this key should likely return false or default. Admin UI should ideally not display or handle it gracefully.
*   **Large Number of Flags**:
    *   Setup: Configure and seed a large number (e.g., 200+) of flags.
    *   Expected:
        *   `GET /api/feature-flags` response time remains acceptable.
        *   Admin UI (`/admin/feature-flags`) page load time and interactivity (search, toggle) remain acceptable.
        *   Client-side `useFeatureFlag` performance is not noticeably degraded.
*   **Enum Mismatches**:
    *   Manually create a scenario where `ServerFeatureFlagKey` string value differs from `SharedFeatureFlagKey` for the same conceptual flag.
    *   Expected: System should behave predictably (likely treating them as different flags or erroring if casting fails). This highlights importance of keeping enums synced.
*   **Browser `localStorage` Disabled/Full**:
    *   Action: Disable `localStorage` in browser settings or simulate it being full.
    *   Expected: Client-side overrides via `localStorage` do not work. `useFeatureFlag` falls back to Env Var/Default. Developer console helpers for localStorage report errors.
*   **Concurrent Admin Toggles**: (Hard to automate, conceptual)
    *   Two admins attempt to toggle the same flag simultaneously.
    *   Expected: Last write wins. No data corruption. UI for both admins eventually reflects the final state.

### 4.7. Performance Testing Considerations

*   **API Response Times**:
    *   Measure latency of `GET /api/feature-flags` with a small number of flags vs. a large number of flags (e.g., 10 vs. 100).
    *   Measure latency of `PUT /api/feature-flags/:flagKey`.
*   **Database Query Performance**:
    *   Analyze queries generated by Drizzle for fetching all flags and updating a single flag. Ensure they are efficient and use indexes appropriately (especially on `flag_key`).
*   **Server-Side Cache Impact**:
    *   Measure `isServerFeatureEnabled` resolution time with cache hit vs. cache miss (requiring DB lookup).
*   **Client-Side Performance**:
    *   Initial load time of `/api/feature-flags` data via React Query.
    *   Rendering performance on pages with many `FeatureFlagGuard` components or `useFeatureFlag` hook invocations. Profile React component rendering.
    *   Impact of localStorage checks on initial client-side flag resolution.
*   **Admin UI Performance**:
    *   Responsiveness of the Admin UI table and search functionality when displaying a large number of flags.

## 5. Expected Behavior for Key Scenarios (Summary)

| Scenario                                       | Initial State (DB/Env/Default) | Action                                  | Expected Client Outcome (`useFeatureFlag`) | Notes                                                              |
| :--------------------------------------------- | :----------------------------- | :-------------------------------------- | :----------------------------------------- | :----------------------------------------------------------------- |
| Flag Enabled in DB                             | -                              | Admin enables via API/Admin UI          | True                                       | Cache updates, UI reflects.                                        |
| Flag Disabled in DB                            | -                              | Admin disables via API/Admin UI         | False                                      | Cache updates, UI reflects.                                        |
| Flag Not in DB, Server Env Var Enables         | Default: false                 | Server Env Var `FEATURE_X=true` set     | True                                       | Server API sends true.                                             |
| Flag Not in DB/Server Env, Client Env Enables  | Client Default: false          | Client Env `VITE_FEATURE_X=true`        | True                                       | Server API sends default/false, client `isFeatureEnabled` overrides. |
| API Endpoint Down                              | Client Default: true           | `/api/feature-flags` returns 500        | True                                       | `useFeatureFlag` falls back to client logic, logs warning.         |
| Flag `exposeToClient: false`                   | -                              | -                                       | (Depends on client default)                | Server API won't send it; client relies on its own config.         |
| Flag `status: 'development'`, Prod Env (Server)| -                              | `NODE_ENV=production`                   | (Depends on client default)                | Server API won't send it.                                          |

## 6. Test Environment & Data

*   **Database**: A dedicated PostgreSQL test database instance or schema, reset before test runs.
*   **Users**: Predefined test user accounts:
    *   `admin_user` (role: 'admin')
    *   `regular_user` (role: 'user')
*   **Environment Variables**:
    *   Ability to mock `process.env.NODE_ENV` (for server tests) and `import.meta.env.MODE` (for client tests) to simulate 'development' and 'production'.
    *   Ability to set/unset specific `VITE_FEATURE_...` (client) and `FEATURE_...` (server) environment variables.
*   **Feature Flag Initial State**: Tests should explicitly set up the state of flags in the database or rely on clearing the table to test default resolutions.

## 7. Test Execution and Reporting

*   **Automation**: Tests should be fully automated and runnable via `npm test` (or specific Jest/Playwright commands).
*   **CI/CD Integration**: API tests and component tests should be part of the Continuous Integration pipeline.
*   **Reporting**: Test results (pass/fail, coverage) should be clearly reported by the test runner. Coverage reports (e.g., from Jest's coverage tools) should be generated for server and client code related to feature flags.

This test plan provides a solid framework for ensuring the TULBOXX Feature Flag System is robust, secure, and functions as expected.
