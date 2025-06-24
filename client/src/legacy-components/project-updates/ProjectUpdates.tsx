// client/src/legacy-components/project-updates/ProjectUpdates.tsx
import { FC } from "react";
import { AlertCircle, Info } from "lucide-react";

/**
 * @deprecated Legacy Project Updates Component
 * @version 1.0.0 - 2025-06-20
 *
 * -----------------------------------------------------------------------------
 * !! DEPRECATION NOTICE !!
 * -----------------------------------------------------------------------------
 * This `ProjectUpdates` component and the underlying "Project Notes" feature
 * it represents are **DEPRECATED** and scheduled for complete removal.
 *
 * It is retained temporarily in the `legacy-components` directory only to prevent
 * breaking existing pages that might still import it.
 *
 * **DO NOT USE THIS COMPONENT FOR NEW DEVELOPMENT.**
 *
 * Please migrate all usages to the new "Activity Feed" or "Timeline" feature,
 * which provides a more comprehensive and modern way to track project progress,
 * customer interactions, and internal notes.
 *
 * If you encounter this component in the UI, please report it or create a task
 * to refactor the consuming page/component to use the modern activity tracking system.
 *
 * For questions, contact the Tulboxx development team.
 * -----------------------------------------------------------------------------
 */

interface LegacyProjectUpdatesProps {
  contactId?: number; // Kept for prop compatibility if old code passes it
  contactName?: string; // Kept for prop compatibility
}

export const ProjectUpdates: FC<LegacyProjectUpdatesProps> = ({ contactName }) => {
  return (
    <div className="p-4 border border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 rounded-md shadow-sm">
      <div className="flex items-start">
        <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-md font-semibold text-yellow-800 dark:text-yellow-300">
            Legacy "Project Notes" Module - Deprecated
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            The "Project Notes" feature previously shown here for{" "}
            {contactName ? <strong>{contactName}</strong> : "this contact"}{" "}
            has been deprecated and is no longer actively supported.
          </p>
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
            <div className="flex items-center">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Please use the new **Activity Feed** or **Timeline** feature for
                up-to-date project tracking, notes, and communication logs.
              </p>
            </div>
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-3">
            This placeholder message indicates that the page or section you are
            viewing still references the old "Project Notes" system. This part of
            the interface will be updated or removed soon.
          </p>
        </div>
      </div>
    </div>
  );
};

// Exporting the component with its original name for backward compatibility
// during the transition period.
export default ProjectUpdates;
