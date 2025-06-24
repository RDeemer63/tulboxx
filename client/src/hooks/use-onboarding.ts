import { useMemo } from "react";
import {
  useOnboardingStore,
  onboardingSteps,
  type OnboardingStep,
  type OnboardingState,
  type OnboardingActions,
} from "../lib/onboarding/store";

// Re-export the step type so consumers can import it from this hook module.
export type { OnboardingStep };

// --- Type Definitions ---

/**
 * Represents a contextual suggestion to guide the user through onboarding.
 */
export interface OnboardingNudge {
  id: string;
  message: string;
  targetStep: OnboardingStep;
  priority: "high" | "medium" | "low";
}

/**
 * Represents the gating status of the application based on onboarding progress.
 */
export interface OnboardingGatingInfo {
  isGated: boolean;
  reason: string | null;
  requiredStep: OnboardingStep | null;
}

// --- Primary Hook with Selector ---

/**
 * A selector-based hook to access the onboarding store.
 * This is the most optimized way to use the store, as it allows components
 * to subscribe to only the specific slices of state they need.
 *
 * @param selector A function that selects a slice of the state.
 * @returns The selected state slice.
 */
export function useOnboarding<T>(
  selector: (state: OnboardingState & OnboardingActions) => T
): T {
  return useOnboardingStore(selector);
}

// --- Computed Value & Status Hooks ---

/**
 * A hook that provides computed values and overall status of the onboarding process.
 * It's optimized to only re-render when progress or completion status changes.
 *
 * @returns An object with the current progress, completion status, and the next incomplete step.
 */
export function useOnboardingStatus() {
  const { progress, isComplete, steps } = useOnboardingStore(
    (state) => ({
      progress: state.progress,
      isComplete: state.isComplete,
      steps: state.steps,
    })
  );

  const nextIncompleteStep = useMemo(() => {
    if (isComplete) {
      return null;
    }
    // Find the first step in the predefined order that is not complete.
    return onboardingSteps.find((step) => !steps[step]?.isComplete) || null;
  }, [steps, isComplete]);

  return {
    progress,
    isComplete,
    nextIncompleteStep,
  };
}

/**
 * A highly specific hook to check if a single onboarding step is complete.
 *
 * @param step The onboarding step to check.
 * @returns `true` if the step is complete, otherwise `false`.
 */
export function useIsOnboardingStepComplete(step: OnboardingStep): boolean {
  return useOnboardingStore((state) => state.steps[step]?.isComplete ?? false);
}

// --- Contextual & Gating Hooks ---

/**
 * A hook that provides contextual nudges to guide the user.
 * It returns a list of suggestions based on which steps are incomplete.
 *
 * @param maxNudges The maximum number of nudges to return. Defaults to 1.
 * @returns An array of OnboardingNudge objects.
 */
export function useOnboardingNudges(maxNudges: number = 1): OnboardingNudge[] {
  const stepsState = useOnboardingStore((state) => state.steps);
  const isComplete = useOnboardingStore((state) => state.isComplete);

  const nudges = useMemo(() => {
    if (isComplete) {
      return [];
    }

    const incompleteSteps = onboardingSteps.filter(
      (step) => !stepsState[step].isComplete
    );

    const nudgeMap: Record<OnboardingStep, OnboardingNudge> = {
      companyInfo: {
        id: "nudge-companyInfo",
        message: "Let's start with the basics. Add your company details.",
        targetStep: "companyInfo",
        priority: "high",
      },
      branding: {
        id: "nudge-branding",
        message:
          "Make your estimates pop! Upload your logo and set brand colors.",
        targetStep: "branding",
        priority: "medium",
      },
      legal: {
        id: "nudge-legal",
        message: "Protect your business. Set up your terms and legal info.",
        targetStep: "legal",
        priority: "medium",
      },
      aiPreferences: {
        id: "nudge-aiPreferences",
        message: "Supercharge your estimates by telling our AI how you work.",
        targetStep: "aiPreferences",
        priority: "low",
      },
    };

    return incompleteSteps
      .map((step) => nudgeMap[step])
      .filter(Boolean) // Filter out any undefined nudges
      .slice(0, maxNudges);
  }, [stepsState, isComplete, maxNudges]);

  return nudges;
}

/**
 * A hook to determine if the main application routes should be blocked
 * due to an incomplete onboarding process.
 *
 * @returns An object containing gating status and information.
 */
export function useOnboardingGating(): OnboardingGatingInfo {
  const { isComplete, nextIncompleteStep } = useOnboardingStatus();

  return useMemo(() => {
    if (isComplete) {
      return {
        isGated: false,
        reason: null,
        requiredStep: null,
      };
    }

    const stepLabel =
      nextIncompleteStep
        ?.replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase()) || "next";

    return {
      isGated: true,
      reason: `Your business profile is incomplete. Please complete the "${stepLabel}" step to continue.`,
      requiredStep: nextIncompleteStep,
    };
  }, [isComplete, nextIncompleteStep]);
}

// Default export for convenience, allowing `import useOnboarding from ...`
export default useOnboarding;
