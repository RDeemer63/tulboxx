import React, { useState, useEffect } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { initializeMockApi } from "@/lib/mock-api";
import { setApiMode } from "@/lib/api-config";
import { featureFlags as defaultFlags } from "@/shared/featureFlags";
import NetworkStatusIndicator from "@/components/shared/NetworkStatusIndicator";

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
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [unsupportedBrowser, setUnsupportedBrowser] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        /* ---------------------------------------------------------- */
        /* 1. Network connectivity                                    */
        /* ---------------------------------------------------------- */
        setIsOnline(navigator.onLine);

        /* ---------------------------------------------------------- */
        /* 2. Feature-flag bootstrap                                  */
        /* ---------------------------------------------------------- */
        try {
          const raw = localStorage.getItem("tulboxx_feature_flags");
          if (raw) {
            const overrides = JSON.parse(raw);
            Object.assign(defaultFlags, overrides);
          }
        } catch {
          /* ignore parse errors */
        }

        /* ---------------------------------------------------------- */
        /* 3. Mock API (dev only)                                     */
        /* ---------------------------------------------------------- */
        if (import.meta.env.DEV) {
          try {
            await initializeMockApi();
            console.log("Mock API initialized successfully");
          } catch (error) {
            console.warn("Failed to initialize mock API:", error);
            setApiMode("live");
          }
        }

        /* ---------------------------------------------------------- */
        /* 4. Persisted user data                                     */
        /* ---------------------------------------------------------- */
        try {
          const persisted = localStorage.getItem("tulboxx_user_profile");
          if (persisted) {
            // no-op for now – future providers will read this
            console.debug("Loaded persisted user profile");
          }
        } catch {
          /* ignore */
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

  /* -------------------------------------------------------------- */
  /* Browser capability check                                       */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    const checkBrowserSupport = () => {
      const hasFetch = typeof fetch !== "undefined";
      const hasSW = "serviceWorker" in navigator;
      return hasFetch && hasSW;
    };
    setUnsupportedBrowser(!checkBrowserSupport());
  }, []);

  /* -------------------------------------------------------------- */
  /* Online / offline listener                                      */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (initError) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-md dark:border-red-900/30 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold text-red-600 dark:text-red-400">
            Application Initialization Failed
          </h2>
          <NetworkStatusIndicator variant="badge" className="mb-2" />
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
    return (
      <>
        {/* Network / offline status */}
        <NetworkStatusIndicator
          variant="prominent"
          showOfflineOnly
          className="fixed bottom-2 left-2 z-50"
        />

        {/* Unsupported browser banner */}
        {unsupportedBrowser && (
          <div className="fixed top-0 inset-x-0 z-50 bg-yellow-400 py-2 text-center text-xs font-semibold text-black">
            Your browser is missing some features required for the best Tulboxx
            experience. Please update your browser.
          </div>
        )}

        <LoadingSpinner
          variant="fullPage"
          size="lg"
          text="Initializing application..."
        />
      </>
    );
  }

  return (
    <>
      {unsupportedBrowser && (
        <div className="fixed top-0 inset-x-0 z-50 bg-yellow-400 py-2 text-center text-xs font-semibold text-black">
          Your browser is missing some features required for the best Tulboxx
          experience. Please update your browser.
        </div>
      )}
      {children}
    </>
  );
};

export default AppInitializer;
