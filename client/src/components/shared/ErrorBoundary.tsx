import React, { Component, ErrorInfo, ReactNode } from "react";
import { captureException } from "@/lib/sentry";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary captures React errors in its children and displays
 * a fallback UI instead of crashing the app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to Sentry
    captureException(error, { extra: errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetErrorBoundary = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Render custom fallback
      if (this.props.fallback) {
        if (typeof this.props.fallback === "function") {
          return this.props.fallback(this.state.error, this.resetErrorBoundary);
        }
        return this.props.fallback;
      }

      // Render default fallback
      return (
        <div className="flex h-full flex-col items-center justify-center p-4 text-center">
          <div className="rounded-lg border border-red-200 bg-white p-6 shadow-md dark:border-red-900 dark:bg-slate-900">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="mb-2 text-lg font-bold dark:text-white">Something went wrong</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              The application encountered an unexpected error.
            </p>
            <div className="mb-4 max-h-32 overflow-auto rounded bg-gray-50 p-2 text-left text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200">
              <pre className="whitespace-pre-wrap break-words">
                {this.state.error.toString()}
              </pre>
            </div>
            <button
              onClick={this.resetErrorBoundary}
              className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:ring-offset-gray-800"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
