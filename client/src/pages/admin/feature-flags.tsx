// client/src/pages/admin/feature-flags.tsx
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FeatureFlagKey } from '../../../shared/feature-flags-schema'; // Shared enum
import { CLIENT_FEATURE_FLAG_CONFIG, type ClientFeatureFlagConfig } from '../../shared/featureFlags'; // Client-side static config

// Shadcn/ui components (assuming these are set up in the project)
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, RefreshCw } from 'lucide-react'; // For Alert icon and Refresh icon

// Type for the data fetched from GET /api/feature-flags
type ServerFlagStates = Partial<Record<FeatureFlagKey, boolean>>;

// Combined type for display in the table
interface DisplayFlag extends ClientFeatureFlagConfig {
  liveState: boolean | undefined; // Undefined if API hasn't returned it or it's not in API response
}

// API function to fetch current live states of flags
const fetchLiveFlagStates = async (): Promise<ServerFlagStates> => {
  const response = await fetch('/api/feature-flags'); // Assumes auth is handled by API client/interceptor
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch feature flags' }));
    throw new Error(errorData.message || `Failed to fetch feature flags. Status: ${response.status}`);
  }
  return response.json();
};

// API function to update a flag's state
const updateFeatureFlag = async ({ flagKey, enabled }: { flagKey: FeatureFlagKey; enabled: boolean }) => {
  const response = await fetch(`/api/feature-flags/${flagKey}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // Assuming Authorization header is handled by a global fetch interceptor or similar
    },
    body: JSON.stringify({ enabled }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to update flag ${flagKey}` }));
    throw new Error(errorData.message || `Failed to update flag ${flagKey}. Status: ${response.status}`);
  }
  return response.json(); // Contains { message, flag, newState }
};

const FeatureFlagsAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [toggleError, setToggleError] = useState<string | null>(null);

  // Fetch live flag states from the server
  const { 
    data: liveFlagStates, 
    isLoading: isLoadingLiveStates, 
    error: liveStatesError,
    refetch: refetchLiveStates,
    isFetching: isFetchingLiveStates, // To show loading state on manual refresh button
  } = useQuery<ServerFlagStates, Error>({
    queryKey: ['featureFlagsAdminLiveStates'],
    queryFn: fetchLiveFlagStates,
    staleTime: 1 * 60 * 1000, // Cache for 1 minute, admin UI might want fresher data
  });

  // Mutation for updating a flag
  const updateFlagMutation = useMutation<unknown, Error, { flagKey: FeatureFlagKey; enabled: boolean }>({
    mutationFn: updateFeatureFlag,
    onSuccess: (data: any, variables) => {
      console.log(`Flag ${variables.flagKey} updated successfully to ${variables.enabled}. Server response:`, data?.message);
      setToggleError(null);
      // Invalidate and refetch the live states to ensure UI consistency
      // Also invalidate the general feature flags query used by useFeatureFlag hook
      queryClient.invalidateQueries({ queryKey: ['featureFlagsAdminLiveStates'] });
      queryClient.invalidateQueries({ queryKey: ['feature-flags', 'server-config'] });
    },
    onError: (error, variables) => {
      console.error(`Error updating flag ${variables.flagKey}:`, error);
      setToggleError(`Failed to update ${variables.flagKey}: ${error.message}`);
      // Optionally refetch to ensure UI reflects actual server state after error
      queryClient.invalidateQueries({ queryKey: ['featureFlagsAdminLiveStates'] });
      queryClient.invalidateQueries({ queryKey: ['feature-flags', 'server-config'] });
    },
  });
  
  const combinedFlagsForDisplay = useMemo(() => {
    const allFlagKeys = Object.values(FeatureFlagKey); // These are string values from enum
    return allFlagKeys
      .map(keyStr => {
        const key = keyStr as FeatureFlagKey; // Cast to enum type
        const clientConfig = CLIENT_FEATURE_FLAG_CONFIG[key];
        if (!clientConfig) {
          if (import.meta.env.DEV) {
            console.warn(`[Admin UI] Missing client-side config for feature flag key: ${key}. This flag will not be displayed.`);
          }
          return null;
        }
        return {
          ...clientConfig,
          liveState: liveFlagStates ? liveFlagStates[key] : undefined,
        };
      })
      .filter(Boolean) as DisplayFlag[];
  }, [liveFlagStates]);

  const handleToggleChange = (flagKey: FeatureFlagKey, currentLiveState: boolean | undefined) => {
    if (currentLiveState === undefined) {
      console.warn(`Cannot toggle flag ${flagKey} as its live state is unknown (not provided by server).`);
      setToggleError(`Cannot toggle flag ${flagKey}: current server state is unknown. Try refreshing.`);
      return;
    }
    setToggleError(null); // Clear previous error
    updateFlagMutation.mutate({ flagKey, enabled: !currentLiveState });
  };

  const filteredFlags = useMemo(() => {
    if (!searchTerm) return combinedFlagsForDisplay;
    return combinedFlagsForDisplay.filter(
      (flag) =>
        flag.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flag.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, combinedFlagsForDisplay]);

  if (isLoadingLiveStates && !liveFlagStates) { // Show skeleton only on initial hard load
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-6">Feature Flag Management</h1>
        <Input placeholder="Search flags..." className="mb-6 max-w-sm" disabled />
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold">Feature Flag Management</h1>
        <Button 
          onClick={() => refetchLiveStates()} 
          variant="outline" 
          size="sm" 
          disabled={isFetchingLiveStates}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetchingLiveStates ? 'animate-spin' : ''}`} />
          {isFetchingLiveStates ? 'Refreshing...' : 'Refresh States'}
        </Button>
      </div>

      {liveStatesError && (
        <Alert variant="destructive" className="mb-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Live Flag States</AlertTitle>
          <AlertDescription>{liveStatesError.message}</AlertDescription>
        </Alert>
      )}

      {toggleError && (
         <Alert variant="destructive" className="mb-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Updating Flag</AlertTitle>
          <AlertDescription>{toggleError}</AlertDescription>
        </Alert>
      )}

      <Input
        type="text"
        placeholder="Search by flag key or description..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 max-w-md"
      />

      {filteredFlags.length === 0 && !isFetchingLiveStates && (
        <div className="text-center py-10 text-slate-500">
          <p className="text-lg">No feature flags found{searchTerm ? " matching your search criteria" : ""}.</p>
          {!searchTerm && <p className="text-sm">Ensure flags are configured in `CLIENT_FEATURE_FLAG_CONFIG`.</p>}
        </div>
      )}

      {filteredFlags.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px] sm:min-w-[250px]">Flag Key</TableHead>
                <TableHead className="min-w-[250px]">Description</TableHead>
                <TableHead className="w-[150px] text-center hidden sm:table-cell">Client Default (Dev)</TableHead>
                <TableHead className="w-[150px] text-center hidden sm:table-cell">Client Default (Prod)</TableHead>
                <TableHead className="w-[180px] text-center">Live Server State</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFlags.map((flag) => {
                const isCurrentFlagMutating = updateFlagMutation.isPending && updateFlagMutation.variables?.flagKey === flag.key;
                return (
                  <TableRow key={flag.key} className={isCurrentFlagMutating ? "opacity-70" : ""}>
                    <TableCell className="font-mono text-sm py-3">{flag.key}</TableCell>
                    <TableCell className="text-sm py-3">{flag.description}</TableCell>
                    <TableCell className="text-center hidden sm:table-cell py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${flag.defaultEnabledInDev ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {flag.defaultEnabledInDev ? 'ON' : 'OFF'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${flag.defaultEnabledInProd ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {flag.defaultEnabledInProd ? 'ON' : 'OFF'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-3">
                      {flag.liveState === undefined && isFetchingLiveStates && <Skeleton className="h-6 w-16 mx-auto" />}
                      {flag.liveState === undefined && !isFetchingLiveStates && <span className="text-xs text-slate-500 dark:text-slate-400">N/A</span>}
                      {flag.liveState !== undefined && (
                        <div className="flex items-center justify-center space-x-2">
                          <Switch
                            id={`switch-${flag.key}`}
                            checked={flag.liveState}
                            onCheckedChange={() => handleToggleChange(flag.key, flag.liveState)}
                            disabled={isCurrentFlagMutating}
                            aria-label={`Toggle flag ${flag.key}`}
                          />
                          {isCurrentFlagMutating && (
                            <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default FeatureFlagsAdminPage;

// Conceptual Admin Route Protection (to be implemented in routing logic e.g. App.tsx or v2-router.tsx)
//
// import { useAuth } from '@/contexts/AuthContext'; // Assuming an AuthContext or similar for user role
// import { Navigate, useLocation } from 'wouter'; // Or your router's equivalent
//
// const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { user, isLoadingAuth } = useAuth(); // Replace with your actual auth hook
//   const [, navigate] = useLocation();
// 
//   if (isLoadingAuth) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p>Loading authentication...</p> {/* Or a spinner component */}
//       </div>
//     );
//   }
//   
//   if (!user || user.role !== 'admin') {
//     // Redirect to login or an unauthorized page
//     // Using navigate('/') or navigate('/login') or navigate('/unauthorized')
//     // For wouter, Navigate component might be <Navigate to="/login" />
//     // Or use navigate hook: useEffect(() => navigate('/login', { replace: true }), [navigate]);
//     console.warn("[Admin Route] Access denied. User not admin or not logged in.");
//     return <Navigate to="/" replace />; 
//   }
//   
//   return <>{children}</>;
// };
// 
// Usage in router:
// <Route path="/admin/feature-flags">
//   <ProtectedAdminRoute>
//     <FeatureFlagsAdminPage />
//   </ProtectedAdminRoute>
// </Route>
// Or if your router supports wrapper components directly:
// <Route path="/admin/feature-flags" component={() => <ProtectedAdminRoute><FeatureFlagsAdminPage /></ProtectedAdminRoute>} />
