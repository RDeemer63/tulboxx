import { useEffect, useState, useCallback, useRef } from 'react';
import { create } from 'zustand';

/**
 * Progress state store
 * Using Zustand for global state management to allow updating progress from anywhere
 */
interface ProgressState {
  /** Current progress value (0-100) */
  progress: number;
  /** Whether the content is fully loaded */
  isLoaded: boolean;
  /** Active operations being tracked */
  operations: Map<string, number>;
  /** Set the progress for a specific operation */
  setOperationProgress: (id: string, value: number) => void;
  /** Remove an operation from tracking */
  completeOperation: (id: string) => void;
  /** Reset all progress */
  reset: () => void;
}

const useProgressStore = create<ProgressState>((set, get) => ({
  progress: 0,
  isLoaded: false,
  operations: new Map(),
  
  setOperationProgress: (id, value) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    const operations = new Map(get().operations);
    operations.set(id, clampedValue);
    
    // Calculate overall progress as average of all operations
    let totalProgress = 0;
    operations.forEach(progress => {
      totalProgress += progress;
    });
    
    const overallProgress = operations.size > 0 
      ? totalProgress / operations.size
      : 100;
    
    const isComplete = Array.from(operations.values())
      .every(progress => progress >= 100);
    
    set({ 
      operations, 
      progress: Math.round(overallProgress),
      isLoaded: isComplete && operations.size > 0
    });
  },
  
  completeOperation: (id) => {
    const operations = new Map(get().operations);
    operations.delete(id);
    
    // If no operations are left, set progress to 100%
    if (operations.size === 0) {
      set({ operations, progress: 100, isLoaded: true });
      return;
    }
    
    // Recalculate average progress
    let totalProgress = 0;
    operations.forEach(progress => {
      totalProgress += progress;
    });
    
    set({ 
      operations, 
      progress: Math.round(operations.size > 0 ? totalProgress / operations.size : 100),
      isLoaded: Array.from(operations.values()).every(progress => progress >= 100)
    });
  },
  
  reset: () => set({ progress: 0, isLoaded: false, operations: new Map() })
}));

/**
 * Hook options for simulated progress
 */
interface UseProgressOptions {
  /** ID for this progress operation */
  id?: string;
  /** Whether to auto-simulate progress */
  autoSimulate?: boolean;
  /** Duration in ms for the simulated progress */
  simulationDuration?: number;
  /** Initial progress value */
  initialProgress?: number;
}

/**
 * Hook for managing progress indication.
 * Can either track real progress or simulate progress for operations without known progress.
 */
export function useProgress(options: UseProgressOptions = {}) {
  const {
    id = `progress-${Math.random().toString(36).substring(2, 9)}`,
    autoSimulate = false,
    simulationDuration = 3000,
    initialProgress = 0
  } = options;
  
  // Get from global store
  const { 
    progress: overallProgress, 
    isLoaded,
    setOperationProgress,
    completeOperation
  } = useProgressStore();
  
  // Local tracking for this instance
  const [localProgress, setLocalProgress] = useState(initialProgress);
  const simulationRef = useRef<number | null>(null);
  
  // Update the global store when local progress changes
  useEffect(() => {
    setOperationProgress(id, localProgress);
    
    if (localProgress >= 100) {
      // Schedule operation cleanup to allow for animation completion
      const timeout = setTimeout(() => {
        completeOperation(id);
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [localProgress, id, setOperationProgress, completeOperation]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        cancelAnimationFrame(simulationRef.current);
      }
      completeOperation(id);
    };
  }, [id, completeOperation]);
  
  /**
   * Set progress value (0-100)
   */
  const setProgress = useCallback((value: number) => {
    // Ensure progress is between 0 and 100
    const clampedValue = Math.max(0, Math.min(100, value));
    setLocalProgress(clampedValue);
  }, []);
  
  /**
   * Complete this progress operation
   */
  const complete = useCallback(() => {
    if (simulationRef.current) {
      cancelAnimationFrame(simulationRef.current);
      simulationRef.current = null;
    }
    setProgress(100);
  }, [setProgress]);
  
  /**
   * Simulate gradual progress
   */
  const simulateProgress = useCallback(() => {
    if (localProgress >= 90) return;
  
    const startTime = Date.now();
    const endTime = startTime + simulationDuration;
    
    const step = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(90, (elapsed / simulationDuration) * 90);
      
      // Use easing function for more realistic progress simulation
      // Slow at start, faster in middle, slow near end
      const easedProgress = -(Math.cos(Math.PI * (progress / 90)) - 1) / 2 * 90;
      
      setLocalProgress(easedProgress);
      
      if (now < endTime && easedProgress < 90) {
        simulationRef.current = requestAnimationFrame(step);
      }
    };
    
    simulationRef.current = requestAnimationFrame(step);
  }, [localProgress, simulationDuration]);
  
  // Start auto-simulation if enabled
  useEffect(() => {
    if (autoSimulate && localProgress < 10) {
      simulateProgress();
    }
  }, [autoSimulate, localProgress, simulateProgress]);
  
  return {
    // Global state
    isLoaded,
    loadingProgress: overallProgress,
    
    // Local state
    progress: localProgress,
    setProgress,
    complete,
    simulateProgress
  };
}

export default useProgress;
