import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'wouter';
import { captureException, setSentryUser, clearSentryUser } from '@/lib/sentry';

// Types
export type Role = 'owner' | 'admin' | 'user' | 'client';
export type Permission = 
  | 'view_leads'
  | 'manage_leads'
  | 'view_estimates'
  | 'manage_estimates' 
  | 'view_jobs'
  | 'manage_jobs'
  | 'view_invoices'
  | 'manage_invoices'
  | 'manage_users'
  | 'view_insights'
  | 'manage_settings';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  permissions: Permission[];
  companyId?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  error?: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  hasPermission: (permission: Permission | Permission[]) => boolean;
  hasRole: (role: Role | Role[]) => boolean;
  clearError: () => void;
}

// Constants
const TOKEN_KEY = 'tulboxx_auth_token';
const USER_KEY = 'tulboxx_auth_user';
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

// Authentication API endpoints
const API_BASE_URL = '/api';
const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  ME: `${API_BASE_URL}/auth/me`,
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// JWT helper functions
const parseJwt = (token: string): { exp: number; user: User } | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT token', error);
    captureException(error as Error, 'parseJwt');
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const parsedToken = parseJwt(token);
  if (!parsedToken) return true;
  
  // Add a buffer to refresh token before it actually expires
  const currentTime = Date.now() / 1000;
  return parsedToken.exp - currentTime < TOKEN_REFRESH_THRESHOLD / 1000;
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
  });
  
  const [, navigate] = useLocation();
  
  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const userJson = localStorage.getItem(USER_KEY);
        
        if (!token || !userJson) {
          setState({ isLoading: false, isAuthenticated: false, user: null });
          return;
        }
        
        const user: User = JSON.parse(userJson);
        
        // Check if token is expired
        if (isTokenExpired(token)) {
          try {
            // Try to refresh the token
            await refreshToken();
          } catch (error) {
            // If refresh fails, clear auth state
            clearAuthState();
            return;
          }
        }
        
        // Set user in Sentry for error reporting
        setSentryUser({ 
          id: user.id, 
          email: user.email, 
          username: `${user.firstName} ${user.lastName}`,
          companyId: user.companyId
        });
        
        setState({
          isLoading: false,
          isAuthenticated: true,
          user,
        });
      } catch (error) {
        console.error('Error initializing auth state', error);
        captureException(error as Error, 'initializeAuth');
        clearAuthState();
      }
    };
    
    initializeAuth();
  }, []);
  
  // API request with auth token
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    // Check if token needs refresh
    if (isTokenExpired(token)) {
      await refreshToken();
    }
    
    // Get (potentially refreshed) token
    const currentToken = localStorage.getItem(TOKEN_KEY);
    
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${currentToken}`,
      'Content-Type': 'application/json',
    };
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP Error: ${response.status}`);
    }
    
    return response.json();
  };
  
  // Refresh token
  const refreshToken = async (): Promise<void> => {
    try {
      const response = await fetch(API_ENDPOINTS.REFRESH_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for refresh token
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const data = await response.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      
      // Also fetch updated user data
      const userResponse = await fetch(API_ENDPOINTS.ME, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        
        // Update Sentry user context
        setSentryUser({ 
          id: userData.id, 
          email: userData.email, 
          username: `${userData.firstName} ${userData.lastName}`,
          companyId: userData.companyId
        });
        
        // Update state with refreshed user data
        setState(prev => ({
          ...prev,
          user: userData,
        }));
      }
    } catch (error) {
      console.error('Failed to refresh token', error);
      captureException(error as Error, 'refreshToken');
      throw error;
    }
  };
  
  // Clear authentication state
  const clearAuthState = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    clearSentryUser();
    setState({
      isLoading: false,
      isAuthenticated: false,
      user: null,
    });
  }, []);
  
  // Login
  const login = async (email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      
      // Set user in Sentry for error reporting
      setSentryUser({ 
        id: data.user.id, 
        email: data.user.email, 
        username: `${data.user.firstName} ${data.user.lastName}`,
        companyId: data.user.companyId
      });
      
      setState({
        isLoading: false,
        isAuthenticated: true,
        user: data.user,
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error', error);
      captureException(error as Error, 'login');
      setState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: error instanceof Error ? error.message : 'Failed to login',
      });
    }
  };
  
  // Register
  const register = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      
      // Set user in Sentry for error reporting
      setSentryUser({ 
        id: data.user.id, 
        email: data.user.email, 
        username: `${data.user.firstName} ${data.user.lastName}`,
        companyId: data.user.companyId
      });
      
      setState({
        isLoading: false,
        isAuthenticated: true,
        user: data.user,
      });
      
      // Redirect to dashboard or onboarding
      navigate('/onboarding');
    } catch (error) {
      console.error('Registration error', error);
      captureException(error as Error, 'register');
      setState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: error instanceof Error ? error.message : 'Failed to register',
      });
    }
  };
  
  // Logout
  const logout = useCallback(async () => {
    try {
      // Call logout API if user is authenticated
      if (state.isAuthenticated) {
        await fetch(API_ENDPOINTS.LOGOUT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error', error);
      captureException(error as Error, 'logout');
    } finally {
      clearAuthState();
      navigate('/login');
    }
  }, [clearAuthState, navigate, state.isAuthenticated]);
  
  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(API_ENDPOINTS.RESET_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP Error: ${response.status}`);
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Reset password error', error);
      captureException(error as Error, 'resetPassword');
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to reset password',
      }));
    }
  };
  
  // Update user
  const updateUser = (userData: Partial<User>): void => {
    if (!state.user) return;
    
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    
    // Update Sentry user context
    setSentryUser({ 
      id: updatedUser.id, 
      email: updatedUser.email, 
      username: `${updatedUser.firstName} ${updatedUser.lastName}`,
      companyId: updatedUser.companyId
    });
    
    setState(prev => ({
      ...prev,
      user: updatedUser,
    }));
  };
  
  // Check if user has a specific permission
  const hasPermission = (permission: Permission | Permission[]): boolean => {
    if (!state.user || !state.user.permissions) return false;
    
    if (Array.isArray(permission)) {
      return permission.some(p => state.user!.permissions.includes(p));
    }
    
    return state.user.permissions.includes(permission);
  };
  
  // Check if user has a specific role
  const hasRole = (role: Role | Role[]): boolean => {
    if (!state.user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(state.user.role);
    }
    
    return state.user.role === role;
  };
  
  // Clear any errors
  const clearError = (): void => {
    setState(prev => ({ ...prev, error: undefined }));
  };
  
  const value = {
    ...state,
    login,
    register,
    logout,
    resetPassword,
    updateUser,
    hasPermission,
    hasRole,
    clearError,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for using the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
