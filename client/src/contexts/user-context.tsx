import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth, User as AuthUser } from "./auth-context";
import { captureException } from "@/lib/sentry";

// Extended user interface with preferences and settings
export interface UserProfile extends AuthUser {
  preferences: {
    notifications: boolean;
    emailAlerts: boolean;
    defaultView: 'card' | 'list' | 'kanban';
    dashboardLayout: string[];
    language: string;
  };
  businessProfile: {
    id?: string;
    companyName?: string;
    logo?: string;
    industry?: string;
    isComplete: boolean;
  };
  lastActive: string;
  offlineMode: boolean;
}

interface UserContextType {
  // Core user data
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  
  // Role and permission helpers
  selectedEmployeeId: number | null;
  setSelectedEmployeeId: (id: number | null) => void;
  canViewAllEmployees: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isTechnician: boolean;
  
  // Team-related
  availableUsers: UserProfile[];
  switchToUser: (userId: number) => void;
  
  // Preference management
  updatePreference: <K extends keyof UserProfile['preferences']>(
    key: K,
    value: UserProfile['preferences'][K]
  ) => void;
  
  // Business profile management
  updateBusinessProfile: (updates: Partial<UserProfile['businessProfile']>) => void;
  isBusinessProfileComplete: boolean;
  
  // Offline mode
  setOfflineMode: (enabled: boolean) => void;
}

// Default values for user preferences
const DEFAULT_PREFERENCES = {
  notifications: true,
  emailAlerts: true,
  defaultView: 'list' as const,
  dashboardLayout: ['stats', 'recent', 'calendar'],
  language: 'en',
};

// Default business profile
const DEFAULT_BUSINESS_PROFILE = {
  isComplete: false,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // Get authenticated user from auth context
  const { user: authUser, isAuthenticated } = useAuth();
  
  // Local state for selected employee and offline mode
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [offlineMode, setOfflineMode] = useState<boolean>(() => {
    // Try to load offline preference from localStorage
    try {
      return localStorage.getItem('tulboxx_offline_mode') === 'true';
    } catch {
      return false;
    }
  });
  
  // Query client for cache management
  const queryClient = useQueryClient();

  // Fetch user profile data with React Query
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user', 'profile', authUser?.id],
    queryFn: async () => {
      if (!isAuthenticated || !authUser) {
        throw new Error('Not authenticated');
      }
      
      try {
        // Try to get from cache first if offline
        if (offlineMode) {
          const cachedProfile = localStorage.getItem('tulboxx_user_profile');
          if (cachedProfile) {
            return JSON.parse(cachedProfile) as UserProfile;
          }
        }
        
        // Otherwise fetch from API
        const response = await fetch(`/api/users/${authUser.id}/profile`);
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        
        const data = await response.json();
        
        // Enhance with default values if missing
        const enhancedProfile: UserProfile = {
          ...authUser,
          preferences: {
            ...DEFAULT_PREFERENCES,
            ...(data.preferences || {}),
          },
          businessProfile: {
            ...DEFAULT_BUSINESS_PROFILE,
            ...(data.businessProfile || {}),
          },
          lastActive: data.lastActive || new Date().toISOString(),
          offlineMode,
        };
        
        // Cache for offline use
        localStorage.setItem('tulboxx_user_profile', JSON.stringify(enhancedProfile));
        
        return enhancedProfile;
      } catch (err) {
        // If network error and we have cached data, use that
        if (offlineMode || !navigator.onLine) {
          const cachedProfile = localStorage.getItem('tulboxx_user_profile');
          if (cachedProfile) {
            return JSON.parse(cachedProfile) as UserProfile;
          }
        }
        
        captureException(err as Error, 'fetchUserProfile');
        throw err;
      }
    },
    enabled: isAuthenticated && !!authUser?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Load available team members
  const { data: availableUsers = [] } = useQuery({
    queryKey: ['users', 'team'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      
      try {
        if (offlineMode) {
          const cached = localStorage.getItem('tulboxx_team_members');
          if (cached) return JSON.parse(cached) as UserProfile[];
        }
        
        const response = await fetch('/api/users/team');
        if (!response.ok) throw new Error('Failed to fetch team members');
        
        const data = await response.json();
        localStorage.setItem('tulboxx_team_members', JSON.stringify(data));
        return data as UserProfile[];
      } catch (err) {
        if (offlineMode || !navigator.onLine) {
          const cached = localStorage.getItem('tulboxx_team_members');
          if (cached) return JSON.parse(cached) as UserProfile[];
        }
        console.error('Failed to load team members', err);
        return [];
      }
    },
    enabled: isAuthenticated && (profile?.isAdmin || profile?.isManager),
  });
  
  // Update user preference mutation
  const { mutate: updatePreferenceMutation } = useMutation({
    mutationFn: async ({ key, value }: { key: keyof UserProfile['preferences'], value: any }) => {
      if (!profile) throw new Error('No user profile');
      
      const response = await fetch(`/api/users/${profile.id}/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      
      if (!response.ok) throw new Error('Failed to update preference');
      return response.json();
    },
    onMutate: ({ key, value }) => {
      // Optimistic update
      if (!profile) return;
      
      // Update cache optimistically
      queryClient.setQueryData(['user', 'profile', profile.id], {
        ...profile,
        preferences: {
          ...profile.preferences,
          [key]: value,
        },
      });
      
      // Update local storage for offline use
      const cachedProfile = localStorage.getItem('tulboxx_user_profile');
      if (cachedProfile) {
        const parsed = JSON.parse(cachedProfile);
        parsed.preferences = {
          ...parsed.preferences,
          [key]: value,
        };
        localStorage.setItem('tulboxx_user_profile', JSON.stringify(parsed));
      }
    },
    onError: (err) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['user', 'profile', profile?.id] });
      captureException(err as Error, 'updatePreference');
    },
  });
  
  // Update business profile mutation
  const { mutate: updateBusinessProfileMutation } = useMutation({
    mutationFn: async (updates: Partial<UserProfile['businessProfile']>) => {
      if (!profile) throw new Error('No user profile');
      
      const response = await fetch(`/api/business-profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update business profile');
      return response.json();
    },
    onMutate: (updates) => {
      // Optimistic update
      if (!profile) return;
      
      queryClient.setQueryData(['user', 'profile', profile.id], {
        ...profile,
        businessProfile: {
          ...profile.businessProfile,
          ...updates,
        },
      });
      
      // Update local storage
      const cachedProfile = localStorage.getItem('tulboxx_user_profile');
      if (cachedProfile) {
        const parsed = JSON.parse(cachedProfile);
        parsed.businessProfile = {
          ...parsed.businessProfile,
          ...updates,
        };
        localStorage.setItem('tulboxx_user_profile', JSON.stringify(parsed));
      }
    },
    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile', profile?.id] });
      captureException(err as Error, 'updateBusinessProfile');
    },
    onSuccess: () => {
      // Force refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['user', 'profile', profile?.id] });
    },
  });
  
  // Set default selected employee to current user if not set
  useEffect(() => {
    if (profile && selectedEmployeeId === null) {
      setSelectedEmployeeId(Number(profile.id));
    }
  }, [profile, selectedEmployeeId]);
  
  // Persist offline mode preference
  useEffect(() => {
    try {
      localStorage.setItem('tulboxx_offline_mode', String(offlineMode));
    } catch (err) {
      console.warn('Could not save offline mode preference', err);
    }
  }, [offlineMode]);
  
  // Helper functions for role checks
  const canViewAllEmployees = profile?.role === 'admin' || profile?.role === 'manager';
  const isAdmin = profile?.role === 'admin';
  const isManager = profile?.role === 'manager';
  const isTechnician = profile?.role === 'user'; // 'user' role in auth context = technician
  
  const switchToUser = (userId: number) => {
    // This is only for impersonation in admin mode, not actual login
    if (!canViewAllEmployees) return;
    
    setSelectedEmployeeId(userId);
    // In a real app, you might want to notify the server or perform additional actions
  };
  
  // Wrapper for updating preferences
  const updatePreference = <K extends keyof UserProfile['preferences']>(
    key: K,
    value: UserProfile['preferences'][K]
  ) => {
    updatePreferenceMutation({ key, value });
  };
  
  // Wrapper for updating business profile
  const updateBusinessProfile = (updates: Partial<UserProfile['businessProfile']>) => {
    updateBusinessProfileMutation(updates);
  };
  
  return (
    <UserContext.Provider
      value={{
        profile,
        isLoading,
        error: error as Error | null,
        selectedEmployeeId,
        setSelectedEmployeeId,
        canViewAllEmployees,
        isAdmin,
        isManager,
        isTechnician,
        switchToUser,
        availableUsers: availableUsers as UserProfile[],
        updatePreference,
        updateBusinessProfile,
        isBusinessProfileComplete: profile?.businessProfile?.isComplete || false,
        setOfflineMode,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;
