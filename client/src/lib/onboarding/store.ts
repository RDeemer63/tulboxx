import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// --- Configuration ---

/**
 * Defines the required sections for the business profile onboarding process.
 * This array is the single source of truth for all onboarding steps.
 */
export const onboardingSteps = [
  "companyInfo",
  "branding",
  "legal",
  "aiPreferences",
] as const;

export type OnboardingStep = (typeof onboardingSteps)[number];

// --- State & Action Types ---

interface StepState {
  isComplete: boolean;
  completedAt: string | null;
}

interface OnboardingState {
  steps: Record<OnboardingStep, StepState>;
  activeStep: OnboardingStep | null;
  progress: number; // Percentage (0-100)
  isComplete: boolean;
}

interface OnboardingActions {
  /**
   * Marks a specific onboarding step as complete or incomplete.
   * @param step The step to update.
   * @param isComplete The new completion status.
   */
  setStepComplete: (step: OnboardingStep, isComplete: boolean) => void;

  /**
   * Sets the currently active step in the UI.
   * @param step The step that the user is currently viewing.
   */
  setActiveStep: (step: OnboardingStep | null) => void;

  /**
   * Initializes the onboarding state based on existing data (e.g., from a fetched business profile).
   * This ensures that if a user has partially completed their profile, the onboarding state reflects that.
   * @param completionStatus A record of which steps are already complete.
   */
  initializeOnboarding: (
    completionStatus: Partial<Record<OnboardingStep, boolean>>
  ) => void;

  /**
   * Resets the entire onboarding process to its initial state.
   */
  resetOnboarding: () => void;
}

// --- Initial State ---

const createInitialStepState = (): StepState => ({
  isComplete: false,
  completedAt: null,
});

const getInitialState = (): OnboardingState => {
  const initialSteps = onboardingSteps.reduce((acc, step) => {
    acc[step] = createInitialStepState();
    return acc;
  }, {} as Record<OnboardingStep, StepState>);

  return {
    steps: initialSteps,
    activeStep: onboardingSteps[0], // Start with the first step
    progress: 0,
    isComplete: false,
  };
};

// --- Helper Functions ---

/**
 * Recalculates the overall progress and completion status based on the current step states.
 * @param steps The current state of all onboarding steps.
 * @returns An object with the new `progress` and `isComplete` values.
 */
const calculateProgress = (steps: Record<OnboardingStep, StepState>) => {
  const totalSteps = onboardingSteps.length;
  if (totalSteps === 0) {
    return { progress: 100, isComplete: true };
  }

  const completedSteps = onboardingSteps.filter(
    (step) => steps[step]?.isComplete
  ).length;

  const progress = Math.round((completedSteps / totalSteps) * 100);
  const isComplete = progress === 100;

  return { progress, isComplete };
};

// --- Zustand Store ---

/**
 * `useOnboardingStore`
 *
 * A Zustand store to manage the state of the user onboarding process for the Business Profile.
 * It persists state to localStorage to maintain progress across sessions.
 */
export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    immer((set) => ({
      ...getInitialState(),

      setStepComplete: (step, isComplete) =>
        set((state) => {
          if (state.steps[step]) {
            state.steps[step].isComplete = isComplete;
            state.steps[step].completedAt = isComplete
              ? new Date().toISOString()
              : null;

            // Recalculate progress
            const { progress, isComplete: overallComplete } = calculateProgress(
              state.steps
            );
            state.progress = progress;
            state.isComplete = overallComplete;
          }
        }),

      setActiveStep: (step) =>
        set((state) => {
          state.activeStep = step;
        }),

      initializeOnboarding: (completionStatus) =>
        set((state) => {
          let needsRecalculation = false;
          for (const step of onboardingSteps) {
            if (completionStatus[step] !== undefined) {
              const isComplete = !!completionStatus[step];
              if (state.steps[step].isComplete !== isComplete) {
                state.steps[step].isComplete = isComplete;
                state.steps[step].completedAt = isComplete
                  ? new Date().toISOString()
                  : null;
                needsRecalculation = true;
              }
            }
          }

          if (needsRecalculation) {
            const { progress, isComplete } = calculateProgress(state.steps);
            state.progress = progress;
            state.isComplete = isComplete;
          }
        }),

      resetOnboarding: () => set(getInitialState()),
    })),
    {
      name: "tulboxx-onboarding-status", // LocalStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);
