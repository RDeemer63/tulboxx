import React, { useState, useEffect } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { initializeMockApi } from "@/lib/mock-api";
import { setApiMode } from "@/lib/api-config";

interface AppInitializerProps {
  children: React.ReactNode;
}

/**
 * AppInitializer handles application startup tasks like:
 * - Initializing mock API in development mode
 * - Loading configurations
 * - Any other startup tasks
 * 
 * It renders a loading state while initialization is in progress,
 * an error state if initialization fails, and the children once ready.
 */
export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize mock API in development mode
        if (import.meta.env.DEV) {
          try {
            await initializeMockApi();
            console.log("Mock API initialized successfully");
          } catch (error) {
            console.warn("Failed to initialize mock API:", error);
            // Ensure we fall back to real API
            setApiMode("live");
          }
        }
        
        // Any other app initialization can go here
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize application:", error);
        setInitError(error as Error);
      }
    };

    initializeApp();
  }, []);

  if (initError) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-md dark:border-red-900/30 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold text-red-600 dark:text-red-400">
            Application Initialization Failed
          </h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            We encountered an error while loading the application:
          </p>
          <div className="mb-4 overflow-auto rounded bg-gray-50 p-3 text-sm dark:bg-gray-800">
            <pre className="text-red-600 dark:text-red-400">{initError.message}</pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded bg-primary py-2 text-white hover:bg-primary/80"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return <LoadingSpinner variant="fullPage" size="lg" text="Initializing application..." />;
  }

  return <>{children}</>;
};

export default AppInitializer;
