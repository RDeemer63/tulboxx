// Authentication utilities for JWT token management

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  businessProfileId: number | null;
  isActive: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

// Token storage
const TOKEN_KEY = 'tulboxx_auth_token';
const USER_KEY = 'tulboxx_user';

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function setAuthUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuthUser(): AuthUser | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const token = getAuthToken();
  const user = getAuthUser();
  return !!(token && user);
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) return {};
  
  return {
    'Authorization': `Bearer ${token}`
  };
}

export function logout(): void {
  removeAuthToken();
  // Optionally redirect to login page
  window.location.href = '/login';
}

// Check if token is expired (basic check)
export function isTokenExpired(): boolean {
  const token = getAuthToken();
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true;
  }
}