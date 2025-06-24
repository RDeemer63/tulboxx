import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthHeaders, logout } from "./auth";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Handle authentication errors
    if (res.status === 401) {
      logout();
      return;
    }
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeaders()
  };

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

/**
 * Typed JSON helper that wraps {@link apiRequest} and automatically
 * parses the JSON response body.  
 *
 * Usage:
 * ```ts
 * const lead = await apiRequestJson<Lead>('GET', '/api/contacts/1');
 * ```
 *
 * If the server returns **204 No Content** this helper resolves to
 * `undefined` (cast to the generic type) so callers can still `await`
 * without catching a JSON parse error.
 */
export async function apiRequestJson<T>(
  method: string,
  url: string,
  data?: unknown,
): Promise<T> {
  const res = await apiRequest(method, url, data);

  // 204 No-Content shortcut
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return (await res.json()) as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// FIXED: Proper cache configuration to prevent memory leaks
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      // CRITICAL FIX: Replace Infinity with reasonable cache times
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection
      retry: 1, // Retry failed requests once
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Add query invalidation helpers
export const queryKeys = {
  customers: ['customers'],
  contacts: ['contacts'],   // all contacts (leads + customers)
  jobs: ['jobs'], 
  estimates: ['estimates'],
  invoices: ['invoices'],
  leads: ['leads'],         // lead-only subset of contacts
  dashboard: {
    stats: ['dashboard', 'stats'],
    recentJobs: (limit?: number) => ['dashboard', 'recent-jobs', limit],
    todaySchedule: ['dashboard', 'today-schedule'],
  },
} as const;

// Helper to invalidate related queries after mutations
export const invalidateQueries = {
  customer: (customerId: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.customers });
    queryClient.invalidateQueries({ queryKey: ['customers', customerId] });
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
  },
  job: (jobId: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
    queryClient.invalidateQueries({ queryKey: ['jobs', jobId] });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.recentJobs() });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.todaySchedule });
  },
  estimate: (estimateId: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.estimates });
    queryClient.invalidateQueries({ queryKey: ['estimates', estimateId] });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
  },
  // New helpers
  contact: (contactId: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
    queryClient.invalidateQueries({ queryKey: ['contacts', contactId] });
  },
  lead: (leadId?: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.leads });
    // Leads are a subset of contacts – invalidate them too
    queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
    if (leadId) {
      queryClient.invalidateQueries({ queryKey: ['leads', leadId] });
      queryClient.invalidateQueries({ queryKey: ['contacts', leadId] });
    }
    // Dashboard stats often include lead counts
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
  },
  invoice: (invoiceId: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
  },
};
