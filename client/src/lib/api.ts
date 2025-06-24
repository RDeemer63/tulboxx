import { apiRequest } from "./queryClient";

export const api = {
  // Customer methods
  customers: {
    getAll: () => fetch("/api/customers", { credentials: "include" }).then(res => res.json()),
    getById: (id: number) => fetch(`/api/customers/${id}`, { credentials: "include" }).then(res => res.json()),
    create: (data: any) => apiRequest("POST", "/api/customers", data),
    update: (id: number, data: any) => apiRequest("PUT", `/api/customers/${id}`, data),
    delete: (id: number) => apiRequest("DELETE", `/api/customers/${id}`),
  },

  // Job methods
  jobs: {
    getAll: () => fetch("/api/jobs", { credentials: "include" }).then(res => res.json()),
    getById: (id: number) => fetch(`/api/jobs/${id}`, { credentials: "include" }).then(res => res.json()),
    create: (data: any) => apiRequest("POST", "/api/jobs", data),
    update: (id: number, data: any) => apiRequest("PUT", `/api/jobs/${id}`, data),
    delete: (id: number) => apiRequest("DELETE", `/api/jobs/${id}`),
  },

  // Estimate methods
  estimates: {
    getAll: () => fetch("/api/estimates", { credentials: "include" }).then(res => res.json()),
    getById: (id: number) => fetch(`/api/estimates/${id}`, { credentials: "include" }).then(res => res.json()),
    create: (data: any) => apiRequest("POST", "/api/estimates", data),
    update: (id: number, data: any) => apiRequest("PUT", `/api/estimates/${id}`, data),
    delete: (id: number) => apiRequest("DELETE", `/api/estimates/${id}`),
  },

  // Invoice methods
  invoices: {
    getAll: () => fetch("/api/invoices", { credentials: "include" }).then(res => res.json()),
    getById: (id: number) => fetch(`/api/invoices/${id}`, { credentials: "include" }).then(res => res.json()),
    create: (data: any) => apiRequest("POST", "/api/invoices", data),
    update: (id: number, data: any) => apiRequest("PUT", `/api/invoices/${id}`, data),
    delete: (id: number) => apiRequest("DELETE", `/api/invoices/${id}`),
  },

  // Dashboard methods
  dashboard: {
    getStats: () => fetch("/api/dashboard/stats", { credentials: "include" }).then(res => res.json()),
    getRecentJobs: (limit?: number) => {
      const url = limit ? `/api/dashboard/recent-jobs?limit=${limit}` : "/api/dashboard/recent-jobs";
      return fetch(url, { credentials: "include" }).then(res => res.json());
    },
    getTodaySchedule: () => fetch("/api/dashboard/today-schedule", { credentials: "include" }).then(res => res.json()),
  },

  // AI methods
  ai: {
    generateEstimate: (data: any) => apiRequest("POST", "/api/ai/estimate", data).then(res => res.json()),
    generateSocialContent: (data: any) => apiRequest("POST", "/api/ai/social-content", data).then(res => res.json()),
  },
};
