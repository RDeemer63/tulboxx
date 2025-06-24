// client/src/components/project-updates.tsx

/**
 * @deprecated Backward Compatibility Re-export
 * @version 2.0.0 - 2025-06-20
 *
 * -----------------------------------------------------------------------------
 * !! IMPORTANT NOTICE !!
 * -----------------------------------------------------------------------------
 * This file, `client/src/components/project-updates.tsx`, now serves ONLY as a
 * backward compatibility layer. The actual `ProjectUpdates` component has been
 * moved to the `legacy-components` directory as part of our codebase modernization
 * and legacy code archival efforts.
 *
 * **DO NOT IMPORT FROM THIS FILE FOR NEW DEVELOPMENT.**
 *
 * All new code should directly import modern alternatives if available, or,
 * if absolutely necessary for interacting with a still-active legacy feature,
 * import directly from the component's new location within `legacy-components`.
 *
 * This re-export exists to prevent breaking existing import paths during the
 * transition period. The goal is to eventually remove all imports pointing to
 * this file and then delete this file entirely.
 *
 * The original component is now located at:
 * `@/legacy-components/project-updates/ProjectUpdates`
 *
 * Please update any existing imports to point to the new location if you are
 * actively working on a module that uses this component, or preferably,
 * refactor to use the modern "Activity Feed" or "Timeline" component.
 * -----------------------------------------------------------------------------
 */

import { ProjectUpdates as LegacyProjectUpdatesComponent } from "@/legacy-components/project-updates/ProjectUpdates";

// Re-export the component with its original name for backward compatibility.
export const ProjectUpdates = LegacyProjectUpdatesComponent;

// It's also good practice to re-export any associated types if they were previously exported from here.
// However, based on the previous content, it seems types were defined within the component or imported directly.
// If there were specific types exported from the old version of this file, they should be re-exported too:
// export type { LegacyProjectUpdatesProps } from "@/legacy-components/project-updates/ProjectUpdates";

export default LegacyProjectUpdatesComponent;
