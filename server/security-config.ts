import type { Express } from "express";
import { authenticateToken, requireRole } from "./auth-middleware";

// Security configuration for API endpoints
export const secureRoutes = {
  // Customer routes
  customers: {
    get: [authenticateToken],
    post: [authenticateToken],
    put: [authenticateToken],
    delete: [authenticateToken, requireRole("admin", "manager")]
  },
  
  // Job routes
  jobs: {
    get: [authenticateToken],
    post: [authenticateToken],
    put: [authenticateToken],
    delete: [authenticateToken, requireRole("admin", "manager")]
  },
  
  // Employee routes
  employees: {
    get: [authenticateToken],
    post: [authenticateToken, requireRole("admin", "manager")],
    put: [authenticateToken, requireRole("admin", "manager")],
    delete: [authenticateToken, requireRole("admin")]
  },
  
  // Invoice routes
  invoices: {
    get: [authenticateToken],
    post: [authenticateToken],
    put: [authenticateToken],
    delete: [authenticateToken, requireRole("admin", "manager")]
  },
  
  // Estimate routes
  estimates: {
    get: [authenticateToken],
    post: [authenticateToken],
    put: [authenticateToken],
    delete: [authenticateToken, requireRole("admin", "manager")]
  },
  
  // Dashboard routes
  dashboard: {
    get: [authenticateToken]
  },
  
  // AI routes
  ai: {
    post: [authenticateToken]
  },
  
  // Time tracking routes
  timeEntries: {
    get: [authenticateToken],
    post: [authenticateToken],
    put: [authenticateToken],
    delete: [authenticateToken, requireRole("admin", "manager")]
  },
  
  // Work order routes
  workOrders: {
    get: [authenticateToken],
    post: [authenticateToken],
    put: [authenticateToken],
    delete: [authenticateToken, requireRole("admin", "manager")]
  }
};

// Apply security middleware to routes
export function applyRouteSecurity(app: Express) {
  // Customer routes
  app.all("/api/customers*", ...secureRoutes.customers.get);
  
  // Job routes
  app.all("/api/jobs*", ...secureRoutes.jobs.get);
  
  // Employee routes
  app.all("/api/employees*", ...secureRoutes.employees.get);
  
  // Invoice routes
  app.all("/api/invoices*", ...secureRoutes.invoices.get);
  
  // Estimate routes
  app.all("/api/estimates*", ...secureRoutes.estimates.get);
  
  // Dashboard routes
  app.all("/api/dashboard*", ...secureRoutes.dashboard.get);
  
  // AI routes
  app.all("/api/ai*", ...secureRoutes.ai.post);
  
  // Time entry routes
  app.all("/api/time-entries*", ...secureRoutes.timeEntries.get);
  
  // Work order routes
  app.all("/api/work-orders*", ...secureRoutes.workOrders.get);
  
  // Business profile routes
  app.all("/api/business-profile*", authenticateToken);
  
  // Document routes
  app.all("/api/documents*", authenticateToken);
  
  // Photo routes
  app.all("/api/photos*", authenticateToken);
  
  // Communication routes
  app.all("/api/communications*", authenticateToken);
  
  // Inventory routes
  app.all("/api/inventory*", authenticateToken);
  
  // Equipment routes
  app.all("/api/equipment*", authenticateToken);
  
  // Schedule routes
  app.all("/api/schedule*", authenticateToken);
}