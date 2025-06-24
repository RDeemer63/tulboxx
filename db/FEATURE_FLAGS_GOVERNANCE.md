# TULBOXX Feature Flag System: Governance Policy

## 1. Introduction

Feature flags (also known as feature toggles) are a powerful tool in the TULBOXX CRM development lifecycle. They allow us to decouple feature deployment from feature release, enabling safer rollouts, A/B testing, targeted releases, and dynamic control over application functionality.

This document outlines the governance policies for creating, managing, and retiring feature flags within TULBOXX to ensure the system remains maintainable, understandable, and effective. Adherence to these guidelines is crucial for all team members involved in feature development and release.

## 2. Naming Conventions

Consistent naming is essential for managing and understanding feature flags. All feature flag keys **must** adhere to the following conventions:

*   **Format**: `SCOPE_FEATURE_DESCRIPTION_STATUS` (e.g., `MODULE_JOBS_ADVANCED_SCHEDULING_BETA`)
*   **Case**: `UPPER_SNAKE_CASE` for all parts of the flag name.
*   **Shared Enum**: All flag keys must be defined in the `FeatureFlagKey` enum in `shared/feature-flags-schema.ts`. The string value of the enum member is the actual key used.

### Scope Prefixes:

*   `MODULE_`: For toggling entire application modules or very large sections of functionality.
    *   Example: `MODULE_JOBS_ENABLED`, `MODULE_BILLING_V2`
*   `FEATURE_`: For specific features or significant enhancements within a module.
    *   Example: `FEATURE_ESTIMATES_AI_SUGGESTIONS`, `FEATURE_LEADS_BULK_ACTIONS`
*   `EXPERIMENT_`: For A/B tests, UX variations, or temporary experimental functionality. These flags should have a defined end date or review cycle.
    *   Example: `EXPERIMENT_NEW_DASHBOARD_LAYOUT_A`, `EXPERIMENT_CHECKOUT_FLOW_SIMPLIFIED`
*   `OPS_`: For operational toggles, often server-side, used to control system behavior, integrations, or resource usage.
    *   Example: `OPS_ENABLE_DETAILED_API_LOGGING`, `OPS_THIRD_PARTY_SERVICE_X_ENABLED`
*   `TEMP_FIX_`: For temporary hotfixes or workarounds that are intended to be removed quickly once a permanent solution is in place.
    *   Example: `TEMP_FIX_DISABLE_REPORT_GENERATION_HIGH_LOAD`

### Feature Description:

*   A clear, concise description of the feature or behavior the flag controls.
*   Use 1-4 words, joined by underscores.
    *   Example: `ADVANCED_SEARCH`, `NEW_USER_ONBOARDING`

### Status Suffix (Optional):

*   `_BETA`: Indicates the feature is in a beta testing phase.
*   `_V2`, `_V3`: Used when a new version of an existing feature is being introduced alongside the old one.
*   `_INTERNAL_ONLY`: For features intended only for internal team testing, not for general users even in beta.
*   `_DEPRECATED`: Indicates the feature (or the "OFF" path of the flag) is planned for removal.

**Examples of Good Flag Names:**

*   `MODULE_INVOICING_ENABLED`
*   `FEATURE_ESTIMATES_MULTI_CURRENCY_SUPPORT`
*   `EXPERIMENT_LEAD_FORM_TWO_COLUMN_LAYOUT`
*   `OPS_BACKGROUND_JOB_SYNC_INTERVAL_REDUCED`
*   `TEMP_FIX_SKIP_IMAGE_OPTIMIZATION_HIGH_CPU`
*   `FEATURE_JOBS_MAP_VIEW_BETA`

## 3. Guidelines for Using Feature Flags

### Use Feature Flags For:

1.  **New Major Modules/Features**: Enabling gradual rollout and testing of significant new functionality (e.g., a new Billing module, advanced Scheduling capabilities).
2.  **Risky or Complex Changes**: Introducing changes that have a higher risk of bugs or unintended consequences, allowing for a quick "kill switch" if problems arise (e.g., integrating a new payment gateway, refactoring a core calculation engine).
3.  **User-Facing Experiments (A/B Tests)**: Testing variations of a feature or UI with different user segments (requires supporting infrastructure for segmentation if not a simple ON/OFF for all).
4.  **Phased Rollouts**: Releasing features to a subset of users before a general release (currently manual toggling, future enhancements could allow percentage-based or targeted rollouts).
5.  **Operational Toggles**: Allowing system administrators or operations teams to control aspects of the system's behavior without a code deployment (e.g., enabling verbose logging, temporarily disabling a non-critical third-party integration).
6.  **Temporary Hotfixes**: Quickly deploying a workaround for a critical issue that can be toggled off once a permanent fix is in place.
7.  **Trunk-Based Development**: Allowing developers to merge incomplete features into the main branch by keeping them disabled in production environments until ready.
8.  **Decoupling Deployment from Release**: Shipping code to production environments in a dormant state, then activating it at a chosen time.

### Avoid Using Feature Flags For:

1.  **Permanent Configuration**: For settings that are intended to be long-term user preferences or application configurations (e.g., theme choice, notification settings, date format). These should be managed via user settings UI or persistent configuration files/database tables.
2.  **Internal Code Refactoring**: For refactoring efforts that do not change user-visible behavior, API contracts, or system integrations. Use branching strategies for these.
3.  **Minor, Low-Risk UI Tweaks**: For very small, easily reversible UI changes where the overhead of a flag is greater than the benefit. A simple code revert might be more efficient.
4.  **Security Controls**: Feature flags should **not** be the primary mechanism for enforcing security or access control. While they can control the visibility of UI elements, server-side authorization checks are mandatory for any sensitive operation or data access.
5.  **Long-Term Product Variations**: If you intend to maintain multiple distinct versions of a feature or product line indefinitely, feature flags can become cumbersome. Consider architectural solutions like plugins, modules, or separate codebases for such scenarios.
6.  **Fixing Bad Architecture**: Flags should not be used as a crutch to avoid addressing underlying architectural problems.

## 4. Flag Lifecycle & Review Process

Effective feature flag management requires a defined lifecycle and regular review to prevent "flag sprawl" and technical debt.

### Flag Lifecycle Stages:

1.  **`DRAFT` / `DEVELOPMENT`**:
    *   **Description**: A new flag is proposed and implemented. The feature it controls is under active development.
    *   **Default State**: OFF in all environments, especially production. May be ON in developer-specific or feature-branch environments.
    *   **Action**: Documented in `FeatureFlagKey` enum and relevant registries.
2.  **`TESTING`**:
    *   **Description**: The feature is deployed to staging or dedicated QA environments.
    *   **Default State**: Typically ON in testing environments, OFF in production.
    *   **Action**: QA team actively tests the feature with the flag ON and OFF.
3.  **`BETA` / `LIMITED_RELEASE`**:
    *   **Description**: The feature is enabled for a subset of production users (e.g., internal team, early adopters) or for a limited time.
    *   **Default State**: OFF for general production users, ON for the beta group (if targeting is supported) or manually toggled ON in production with careful monitoring.
    *   **Action**: Collect feedback, monitor performance and stability.
4.  **`LIVE` / `STABLE`**:
    *   **Description**: The feature is fully rolled out to all intended users and is considered stable.
    *   **Default State**: ON in production.
    *   **Action**: Monitor for any issues. Plan for eventual flag retirement.
5.  **`RETIRED_KEEP_CODE` (Transitional)**:
    *   **Description**: The feature is stable and permanently ON for all users. The flag is still in the code but always evaluates to true for the feature path. The "OFF" path code is still present but no longer actively used.
    *   **Default State**: Effectively always ON. The flag toggle in Admin UI might be disabled or marked as "Retiring".
    *   **Action**: Decision pending on when to schedule the code cleanup. This stage acknowledges the feature is permanent but cleanup is not yet prioritized.
6.  **`RETIRED_CLEANUP_PENDING`**:
    *   **Description**: A decision has been made to remove the feature flag and its associated conditional logic. The feature itself is now part of the baseline application.
    *   **Default State**: The flag is still ON in production to ensure no disruption until code is removed.
    *   **Action**: A technical debt ticket is created and prioritized for removing the flag and the "OFF" state code paths.
7.  **`REMOVED`**:
    *   **Description**: The feature flag, its conditional logic, and any "OFF" state code have been completely removed from the codebase. The flag key is removed from enums and registries.
    *   **Action**: Ticket closed. Database entry for the flag can be archived or deleted.

### Review & Retirement Process:

1.  **Quarterly Flag Review**:
    *   A designated team (e.g., Lead Developer(s), Product Owner, QA Lead) will conduct a review of all active feature flags at least once per quarter.
    *   **Input**: List of all flags from the Admin UI / `serverFeatureFlagsRegistry`, their current state, description, and original purpose/JIRA ticket.
    *   **Agenda**:
        *   Identify flags for `LIVE` features that have been stable for an extended period (e.g., > 60-90 days).
        *   Identify flags for `EXPERIMENT`s that have concluded.
        *   Identify flags for `TEMP_FIX`es where the underlying issue is resolved.
        *   Identify flags for features that were never fully launched or are now deprecated.
        *   Assess if any flags are causing undue complexity or testing overhead.
2.  **Decision & Action**:
    *   For stable, fully rolled-out features: Move flag to `RETIRED_CLEANUP_PENDING`. Create and prioritize a tech debt ticket to remove the flag and associated dead code.
    *   For concluded experiments or resolved temporary fixes: Move flag to `RETIRED_CLEANUP_PENDING` and prioritize removal.
    *   For deprecated features: Move flag to `RETIRED_CLEANUP_PENDING` and plan for removal of both the flag and the feature code.
3.  **Sunset Policy (General Guideline)**:
    *   **Release Toggles**: Aim to remove within 1-2 major release cycles (typically 60-90 days) after a feature is deemed stable and fully adopted by all users.
    *   **Experiment Toggles**: Must have a defined end date or success metric at the time of creation. Remove promptly after the experiment concludes.
    *   **Ops Toggles**: May be long-lived if they control persistent operational aspects. Review their necessity quarterly.
    *   **Temp Fix Toggles**: Must be removed as soon as the permanent fix is deployed and verified.
4.  **Documentation Update**:
    *   When a flag is added, its purpose, expected lifecycle, and owner should be documented (e.g., in the `description` field, linked JIRA ticket).
    *   When a flag is moved to `RETIRED_CLEANUP_PENDING` or `REMOVED`, this governance document and any related technical documentation should be updated.

## 5. Roles and Responsibilities

*   **Developers**:
    *   Proposing new feature flags when developing new features or making significant changes.
    *   Implementing flags according to naming conventions and best practices (client-side and server-side).
    *   Defining flags in `FeatureFlagKey` enum, `CLIENT_FEATURE_FLAG_CONFIG`, and `serverFeatureFlagsRegistry`.
    *   Writing code for both the "ON" and "OFF" states of the feature.
    *   Ensuring robust server-side checks for any security-sensitive features gated by flags.
    *   Writing unit, integration, and potentially E2E tests covering both states of the flag.
    *   Actively participating in flag cleanup by removing retired flags and associated conditional code when assigned.
*   **QA Team / Testers**:
    *   Developing test plans that cover features with flags in both ON and OFF states.
    *   Testing fallback behavior when a feature is disabled.
    *   Verifying the functionality of the Admin UI for toggling flags in test environments.
    *   Reporting any inconsistencies or issues related to feature flags.
*   **Product Owner / Product Manager**:
    *   Defining the business need and strategy for using feature flags for new features, experiments, or phased rollouts.
    *   Collaborating with development on defining flag granularity and behavior.
    *   Making the decision (in consultation with stakeholders) on when to toggle flags ON for users in production.
    *   Communicating feature availability and rollout plans (which may depend on flag states) to users and stakeholders.
    *   Participating in the quarterly flag review process, especially for decisions related to feature lifecycle and retirement.
*   **Lead Developer / Engineering Manager / System Administrator (Designated "Flag Administrator")**:
    *   Overall stewardship of the feature flag system and its health.
    *   Performing the actual toggling of flags in the production environment via the Admin UI (or API if necessary).
    *   Leading and coordinating the quarterly flag review meetings and ensuring follow-up actions (e.g., creation of tech debt tickets for cleanup).
    *   Ensuring adherence to these governance policies by the team.
    *   Monitoring the system for any issues related to feature flags (e.g., performance, errors).
    *   Reviewing and approving the introduction of new, significant, or potentially complex feature flags.
    *   Maintaining the security and integrity of the flag management system (Admin UI, API).

## 6. Tools & Management

*   **Primary Management Interface**: The Admin UI located at `/admin/feature-flags` is the primary tool for viewing and toggling live feature flag states by authorized administrators.
*   **Developer Overrides**: For local development and testing, developers can use browser `localStorage` or `window.TulboxxDev` console helpers to override flag states locally without affecting the backend or other users. (See "Developer Usage Guide" for details).
*   **Configuration Files**:
    *   `shared/feature-flags-schema.ts`: Defines the `FeatureFlagKey` enum (single source of truth for flag names).
    *   `client/src/shared/featureFlags.ts`: Contains `CLIENT_FEATURE_FLAG_CONFIG` for client-side defaults and env var mappings.
    *   `server/routes/feature-flags.ts`: Contains `serverFeatureFlagsRegistry` for server-side defaults, descriptions, and behavior.

## 7. Guiding Principles

*   **Minimize Complexity**: Don't overuse flags. Each flag adds a new dimension to test and maintain.
*   **Short-Lived by Default**: Most feature flags should be temporary tools for release management, not permanent fixtures in the code.
*   **Test Both Paths**: Always ensure that your code works correctly and gracefully when a flag is both ON and OFF.
*   **Security is Paramount**: Feature flags control user experience and feature visibility. They do **not** replace server-side authorization and security checks for sensitive operations.
*   **Clean Up Actively**: Proactively manage the lifecycle of flags. Schedule and execute the removal of retired flags and their associated code to prevent technical debt.

By following this governance policy, TULBOXX can effectively leverage feature flags to enhance agility, reduce risk, and deliver value to users more efficiently. This document should be reviewed and updated periodically as the system and team practices evolve.
