import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// --- Sentry Error Tracking ---------------------------------------------
// Initialize Sentry *before* any React rendering so that startup/runtime
// errors are captured and correlated with subsequent events.
import { initializeSentry, ErrorBoundary } from "./lib/sentry";
initializeSentry();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary fallback={<p>Something went wrong.</p>}>
    <App />
  </ErrorBoundary>,
);
