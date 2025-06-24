import React from "react";
import { useFormContext } from "react-hook-form";

// Import the fully-implemented views
import { SimpleEstimateView } from "./SimpleEstimateView";
import { DetailedEstimateView } from "./DetailedEstimateView";

// --- Main Component ---

/**
 * ScopePricingTab
 *
 * This component acts as a router for the "Scope & Pricing" tab within the
 * estimate creation form. It uses the `estimateType` field from the form's
 * context to conditionally render either the `SimpleEstimateView` or the
 * `DetailedEstimateView`.
 *
 * This modular approach keeps the logic for each estimate type separate and maintainable.
 */
export const ScopePricingTab: React.FC = () => {
  // Access the global form context provided by the parent <FormProvider>
  const { watch } = useFormContext();

  // Watch the 'estimateType' field to determine which view to display.
  // The default value is set in the main form hook.
  const estimateType = watch("estimateType");

  return (
    <div className="space-y-6">
      {/* Conditionally render the appropriate view based on user selection */}
      {estimateType === "simple" ? (
        <SimpleEstimateView />
      ) : (
        <DetailedEstimateView />
      )}
    </div>
  );
};

export default ScopePricingTab;
