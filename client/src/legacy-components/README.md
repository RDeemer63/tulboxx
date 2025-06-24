# Legacy Client Components

## 1. Purpose of This Directory

This directory, \`client/src/legacy-components/\`, serves as a **temporary holding area** for React components that have been deprecated, superseded by modern alternatives, or are tied to legacy features within the Tulboxx CRM application.

The primary goal is to:
*   Clearly separate outdated components from the active, modern codebase.
*   Facilitate a gradual and safe transition away from legacy code.
*   Provide a clear signal to developers about components that should no longer be used for new development.
*   Allow for a period of coexistence if immediate removal of a legacy component is too risky or complex due to widespread dependencies.

## 2. When to Move Components Here

A component should be moved into this \`legacy-components\` directory when:

*   **Superseded by a Modern Alternative**: A new component has been developed that offers better design, performance, features, or aligns more closely with current architectural patterns (e.g., a new \`ModernEstimateCard\` replacing an old \`LegacyEstimateDisplay\`).
*   **Feature Deprecation/Redesign**: The UI feature or section the component was part of is being significantly redesigned or removed entirely, making the component obsolete.
*   **Architectural Incompatibility**: Changes in frontend architecture (e.g., state management libraries, styling conventions, form handling) render the component difficult to maintain or integrate with new code.
*   **Awaiting Full Removal**: The component is no longer used in most parts of the application, but some residual dependencies or complex edge cases are still being addressed before it can be safely deleted from the project entirely. Moving it here signals its end-of-life status.
*   **Tied to Archived Backend Logic**: If a component primarily interacts with backend services or database tables that have been moved to the \`archived/\` directory (e.g., a component for \`project_updates\`).

**Process for Moving**:
1.  Identify the component to be deprecated.
2.  Ensure a modern replacement or alternative workflow exists and is stable.
3.  Create a corresponding subdirectory within \`legacy-components\` if it doesn't exist (e.g., \`legacy-components/estimates/OldEstimateViewer.tsx\`).
4.  Move the component file(s) into this new location.
5.  Update all remaining import paths in the active codebase to point to the new \`legacy-components\` path. This step is crucial for tracking remaining usages.
6.  Add a prominent deprecation notice at the top of the legacy component's source file, ideally linking to its modern replacement or a task ID for its full removal.

## 3. Handling Imports From This Directory

*   **🚫 NO NEW IMPORTS**: Components within this directory should **NEVER** be imported for use in new features, new UI development, or when refactoring active, modern parts of the application.
*   **TEMPORARY POINTERS ONLY**: Existing imports pointing to \`legacy-components\` are considered "technical debt." They indicate areas of the codebase that still need to be updated to use modern alternatives.
*   **PRIORITIZE REFACTORING**: The goal is to eliminate all imports from this directory over time.

If you encounter an import from \`legacy-components\`, it signals an opportunity to refactor that part of the application to use the modern equivalent.

## 4. Deprecating and Removing Legacy Components

The ultimate goal is to empty this directory. Follow this process:

1.  **Identify a Legacy Component**: Choose a component from this directory to phase out.
2.  **Locate All Usages**:
    *   Use your IDE's "Find Usages" feature.
    *   Perform a codebase-wide search for import statements pointing to the legacy component (e.g., \`grep -r "from '@/legacy-components/your-component'" client/src\`).
3.  **Understand its Functionality & Replacement**:
    *   Review the legacy component's code and any associated documentation or deprecation notices.
    *   Identify its modern replacement or the new workflow that supersedes it. Consult team leads if unsure.
4.  **Refactor Dependent Code**:
    *   For each usage found, update the dependent component or page to use the modern alternative.
    *   This may involve changes to props, state management, or even surrounding UI structure.
5.  **Update Tests**:
    *   Modify existing unit tests and end-to-end (Playwright) tests to reflect the use of the new component and the removal of the legacy one.
    *   Ensure test coverage for the new implementation is adequate.
6.  **Verify Functionality**:
    *   Thoroughly test the refactored areas manually and with automated tests to ensure no regressions and that the new implementation behaves as expected.
    *   Pay attention to edge cases that the legacy component might have handled.
7.  **Remove the Legacy Component**:
    *   Once all import paths have been removed and functionality is verified, delete the legacy component's file(s) from the \`legacy-components\` directory.
    *   Remove any associated Storybook stories or specific test files for the legacy component.
8.  **Commit and Communicate**:
    *   Commit the changes with a clear message detailing the legacy component removed and its replacement.
    *   Update any relevant documentation (e.g., \`LEGACY_CODE_ARCHIVAL_REPORT.md\`, task tickets).

---

By following these guidelines, we can systematically reduce technical debt, improve the maintainability of our frontend, and ensure the Tulboxx CRM stays modern and robust.
