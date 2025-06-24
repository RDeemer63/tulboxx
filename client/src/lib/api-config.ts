// client/src/lib/api-config.ts

const USE_MOCK_API_LOCAL_STORAGE_KEY = 'tulboxx_use_mock_api';
const API_MODE_QUERY_PARAM = 'use_mock_api'; // e.g., /?use_mock_api=true or /?use_mock_api=false

/**
 * Determines if the mock API should be used based on environment variables,
 * URL query parameters, and localStorage settings.
 *
 * Priority:
 * 1. URL Query Parameter (`use_mock_api=true|false`) - Overrides all and persists to localStorage.
 * 2. localStorage (`tulboxx_use_mock_api`) - Developer's persistent choice.
 * 3. Vite Environment Variable (`VITE_USE_MOCK_API`) - Build-time default.
 * 4. Default: true in development, false in production.
 *
 * @returns {boolean} True if mock API should be used, false otherwise.
 */
export function isMockApiEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.has(API_MODE_QUERY_PARAM)) {
      const paramValue = params.get(API_MODE_QUERY_PARAM);
      const useMock = paramValue === 'true';
      localStorage.setItem(USE_MOCK_API_LOCAL_STORAGE_KEY, JSON.stringify(useMock));
      // Clean the URL parameter after processing it
      params.delete(API_MODE_QUERY_PARAM);
      const newSearch = params.toString();
      try {
        // history.replaceState can fail in some sandboxed environments or during initial load.
        window.history.replaceState({}, '', `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`);
      } catch (e) {
        console.warn('Could not clean URL query parameter for API mode:', e);
      }
      return useMock;
    }

    const storedPreference = localStorage.getItem(USE_MOCK_API_LOCAL_STORAGE_KEY);
    if (storedPreference !== null) {
      try {
        return JSON.parse(storedPreference);
      } catch (e) {
        console.error('Error parsing mock API preference from localStorage:', e);
        // Fallback if localStorage value is corrupted
      }
    }
  }

  // Vite environment variable (boolean or string 'true'/'false')
  const envVar = import.meta.env.VITE_USE_MOCK_API;
  if (typeof envVar === 'boolean') {
    return envVar;
  }
  if (typeof envVar === 'string') {
    if (envVar.toLowerCase() === 'true') return true;
    if (envVar.toLowerCase() === 'false') return false;
  }

  // Default based on NODE_ENV
  // In a Vite project, import.meta.env.DEV is true for development server, false for production build
  return import.meta.env.DEV; // True in dev, false in prod
}

/**
 * Sets the API mode preference in localStorage and reloads the page to apply the change.
 * @param {boolean} useMock - True to enable mock API, false to use real API.
 */
export function setApiMode(useMock: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USE_MOCK_API_LOCAL_STORAGE_KEY, JSON.stringify(useMock));
    // Remove query param if it exists, as localStorage now takes precedence until next query param override
    const params = new URLSearchParams(window.location.search);
    params.delete(API_MODE_QUERY_PARAM);
    const newSearch = params.toString();
    // Reload to ensure all modules pick up the new setting
    window.location.href = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
  } else {
    console.warn('setApiMode called in non-browser environment. Preference not saved.');
  }
}

/**
 * A simple component to render a toggle for the API mode.
 * This is for development/testing convenience.
 */
// This component would typically be in a .tsx file and imported where needed.
// For simplicity of this file, it's commented out.
/*
import React, { useState, useEffect } from 'react';

export const ApiModeToggle: React.FC = () => {
  const [mockEnabled, setMockEnabled] = useState(isMockApiEnabled());

  useEffect(() => {
    setMockEnabled(isMockApiEnabled());
  }, []); // Re-check on mount if URL param was used

  const handleToggle = () => {
    setApiMode(!mockEnabled); // This will cause a page reload
  };

  return (
    <div style={{ position: 'fixed', bottom: '10px', right: '10px', padding: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', borderRadius: '5px', zIndex: 9999 }}>
      <label>
        <input type="checkbox" checked={mockEnabled} onChange={handleToggle} />
        Use Mock API
      </label>
      <p style={{fontSize: '0.8em', margin: '5px 0 0'}}> (Page will reload)</p>
    </div>
  );
};
*/

// Example usage in another file (e.g., mock-api.ts or App.tsx):
// import { isMockApiEnabled } from './api-config';
// if (isMockApiEnabled()) { /* initialize mock API */ }
