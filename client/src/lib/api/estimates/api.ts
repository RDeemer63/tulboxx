/**
 * @file Estimates API Client
 * @description This file contains all the functions for making HTTP requests to the
 * backend Estimates API. It covers CRUD operations for estimates, line items, templates,
 * and various workflow actions.
 */

import { apiRequestJson } from "@/lib/queryClient";
/**
 * NOTE:
 * `apiRequestJson` is our single point of truth for network calls.
 * It MUST throw on non-2xx responses so callers can `.catch()` or let
 * React-Query handle failures globally.  All functions below therefore
 * purposefully *do not* wrap their own try/catch; the caller (or
 * react-query) should decide how to surface errors.
 */

// =================================================================
// Constants
// =================================================================

const API_BASE_URL = "/api/estimates";
const TEMPLATE_API_BASE_URL = "/api/estimate-templates";

// =================================================================
// Type Definitions
// =================================================================

// --- Utility Types ---
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- Core Entity Types (mirroring backend/shared schemas) ---
export interface ModernEstimate {
  id: string;
  estimateNumber: string;
  title: string;
  status: 'draft' | 'sent' | 'approved' | 'declined' | 'archived';
  total: string;
  createdAt: string;
  updatedAt: string;
  leadId: string | null;
  customerId: string | null;
  // ... other fields as needed
}

export interface EstimateLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
  sortOrder: number;
}

export interface EstimateTemplate {
  id: string;
  name: string;
  description: string;
  lineItems: EstimateLineItem[];
  // ... other fields
}

export interface EstimateEvent {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  user: { name: string } | null;
}

// --- Response Types ---
export type EstimateDetailResponse = ModernEstimate & {
  lineItems: EstimateLineItem[];
  events: EstimateEvent[];
};

export interface EstimateStatsResponse {
  draftCount: number;
  sentCount: number;
  approvedCount: number;
  declinedCount: number;
  averageValue: number;
  winRate: number;
}

// --- Payload Types ---
export interface ListEstimateParams {
  page?: number;
  limit?: number;
  status?: string;
  sort?: string;
  search?: string;
}

export interface CreateEstimatePayload {
  title: string;
  customerId?: string | null;
  leadId?: string | null;
  lineItems?: Partial<EstimateLineItem>[];
  status?: 'draft' | 'sent';
  // ... other fields
}

export type UpdateEstimatePayload = Partial<Omit<CreateEstimatePayload, 'lineItems'>>;

export interface LineItemPayload {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface LineItemOrderPayload {
  id: string;
  sortOrder: number;
}

export interface BulkLineItemPayload {
  create?: LineItemPayload[];
  update?: { id: string; payload: Partial<LineItemPayload> }[];
  delete?: string[];
}

export interface ApproveEstimatePayload {
  signatureData?: string;
  signerName?: string;
}

export interface DeclineEstimatePayload {
  reason?: string;
}

export interface ConvertToJobPayload {
  startDate?: string;
  // ... other job details
}

export interface TemplatePayload {
  name: string;
  description?: string;
  lineItems: LineItemPayload[];
}

export interface SaveAsTemplatePayload {
  name: string;
  description?: string;
}

export interface CreateFromTemplatePayload {
  leadId?: string | null;
  customerId?: string | null;
  title?: string;
}

export interface AIGeneratePayload {
  prompt: string;
}

// =================================================================
// Core Estimate Functions
// =================================================================

export const getEstimates = (
  params: ListEstimateParams = {}
): Promise<PaginatedResponse<ModernEstimate>> => {
  const query = new URLSearchParams(params as any).toString();
  /* dev-only helper */
  if (import.meta.env.DEV) console.debug("[API] getEstimates →", params);
  return apiRequestJson<PaginatedResponse<ModernEstimate>>(
    "GET",
    `${API_BASE_URL}?${query}`
  );
};

export const getEstimatesByStage = (
  params: Omit<ListEstimateParams, "page" | "limit" | "status"> = {}
): Promise<{ data: Record<string, ModernEstimate[]> }> => {
  const query = new URLSearchParams(params as any).toString();
  return apiRequestJson<{ data: Record<string, ModernEstimate[]> }>(
    "GET",
    `${API_BASE_URL}/by-stage?${query}`
  );
};

export const getEstimateById = (id: string): Promise<EstimateDetailResponse> => {
  return apiRequestJson<EstimateDetailResponse>("GET", `${API_BASE_URL}/${id}`);
};

export const createEstimate = (payload: CreateEstimatePayload): Promise<ModernEstimate> => {
  return apiRequestJson<ModernEstimate>("POST", API_BASE_URL, payload);
};

export const updateEstimate = (id: string, payload: UpdateEstimatePayload): Promise<ModernEstimate> => {
  return apiRequestJson<ModernEstimate>("PUT", `${API_BASE_URL}/${id}`, payload);
};

export const deleteEstimate = (id: string): Promise<void> => {
  return apiRequestJson<void>("DELETE", `${API_BASE_URL}/${id}`);
};

// =================================================================
// Estimate Workflow Functions
// =================================================================

export const sendEstimate = (id: string): Promise<ModernEstimate> => {
  return apiRequestJson<ModernEstimate>("POST", `${API_BASE_URL}/${id}/send`);
};

export const approveEstimate = (id: string, payload?: ApproveEstimatePayload): Promise<ModernEstimate> => {
  return apiRequestJson<ModernEstimate>("POST", `${API_BASE_URL}/${id}/approve`, payload);
};

export const declineEstimate = (id: string, payload?: DeclineEstimatePayload): Promise<ModernEstimate> => {
  return apiRequestJson<ModernEstimate>("POST", `${API_BASE_URL}/${id}/decline`, payload);
};

export const archiveEstimate = (id: string): Promise<ModernEstimate> => {
  return apiRequestJson<ModernEstimate>("POST", `${API_BASE_URL}/${id}/archive`);
};

export const convertToJob = (id: string, payload?: ConvertToJobPayload): Promise<{ estimate: ModernEstimate; job: any }> => {
  return apiRequestJson<{ estimate: ModernEstimate; job: any }>("POST", `${API_BASE_URL}/${id}/convert-to-job`, payload);
};

export const versionEstimate = (id: string): Promise<ModernEstimate> => {
  return apiRequestJson<ModernEstimate>("POST", `${API_BASE_URL}/${id}/version`);
};

export const getEstimateEvents = (id: string): Promise<EstimateEvent[]> => {
    return apiRequestJson<EstimateEvent[]>("GET", `${API_BASE_URL}/${id}/events`);
};

// =================================================================
// Line Item Functions
// =================================================================

export const addLineItem = (estimateId: string, payload: LineItemPayload): Promise<EstimateLineItem> => {
  return apiRequestJson<EstimateLineItem>("POST", `${API_BASE_URL}/${estimateId}/line-items`, payload);
};

export const updateLineItem = (estimateId: string, itemId: string, payload: Partial<LineItemPayload>): Promise<EstimateLineItem> => {
  return apiRequestJson<EstimateLineItem>("PUT", `${API_BASE_URL}/${estimateId}/line-items/${itemId}`, payload);
};

export const deleteLineItem = (estimateId: string, itemId: string): Promise<void> => {
  return apiRequestJson<void>("DELETE", `${API_BASE_URL}/${estimateId}/line-items/${itemId}`);
};

export const reorderLineItems = (estimateId: string, items: LineItemOrderPayload[]): Promise<void> => {
  return apiRequestJson<void>("PUT", `${API_BASE_URL}/${estimateId}/line-items/order`, { items });
};

export const bulkUpdateLineItems = (estimateId: string, payload: BulkLineItemPayload): Promise<{ created: EstimateLineItem[]; updated: EstimateLineItem[]; deleted: string[] }> => {
  return apiRequestJson("PATCH", `${API_BASE_URL}/${estimateId}/line-items`, payload);
};

// =================================================================
// Template Functions
// =================================================================

export const getTemplates = (params: ListEstimateParams = {}): Promise<PaginatedResponse<EstimateTemplate>> => {
  const query = new URLSearchParams(params as any).toString();
  return apiRequestJson<PaginatedResponse<EstimateTemplate>>("GET", `${TEMPLATE_API_BASE_URL}?${query}`);
};

export const getTemplateById = (id: string): Promise<EstimateTemplate> => {
  return apiRequestJson<EstimateTemplate>("GET", `${TEMPLATE_API_BASE_URL}/${id}`);
};

export const createTemplate = (payload: TemplatePayload): Promise<EstimateTemplate> => {
  return apiRequestJson<EstimateTemplate>("POST", TEMPLATE_API_BASE_URL, payload);
};

export const updateTemplate = (id: string, payload: Partial<TemplatePayload>): Promise<EstimateTemplate> => {
  return apiRequestJson<EstimateTemplate>("PUT", `${TEMPLATE_API_BASE_URL}/${id}`, payload);
};

export const deleteTemplate = (id: string): Promise<void> => {
  return apiRequestJson<void>("DELETE", `${TEMPLATE_API_BASE_URL}/${id}`);
};

export const saveEstimateAsTemplate = (estimateId: string, payload: SaveAsTemplatePayload): Promise<EstimateTemplate> => {
  return apiRequestJson<EstimateTemplate>("POST", `${API_BASE_URL}/${estimateId}/save-as-template`, payload);
};

export const createEstimateFromTemplate = (templateId: string, payload: CreateFromTemplatePayload): Promise<ModernEstimate> => {
  return apiRequestJson<ModernEstimate>("POST", `${TEMPLATE_API_BASE_URL}/${templateId}/create-estimate`, payload);
};

// =================================================================
// Statistics & AI Functions
// =================================================================

export const getEstimateStats = (): Promise<EstimateStatsResponse> => {
  return apiRequestJson<EstimateStatsResponse>("GET", `${API_BASE_URL}/stats`);
};

export const generateAIDraftLineItems = (estimateId: string, payload: AIGeneratePayload): Promise<EstimateLineItem[]> => {
  if (import.meta.env.DEV) {
    console.debug("[API] generateAIDraftLineItems →", estimateId, payload);
  }
  return apiRequestJson<EstimateLineItem[]>(
    "POST",
    `${API_BASE_URL}/${estimateId}/ai-draft`,
    payload
  );
};

// =================================================================
// Offline Support Functions (Placeholders)
// =================================================================

// These are simplified placeholders. Real offline support would be more complex.
export const getUnsyncedEstimates = async (): Promise<ModernEstimate[]> => {
  console.warn("Offline mode: getUnsyncedEstimates is not fully implemented.");
  return Promise.resolve([]);
};

export const saveEstimateOffline = async (estimate: ModernEstimate): Promise<void> => {
  console.warn("Offline mode: saveEstimateOffline is not fully implemented.", estimate);
  return Promise.resolve();
};

export const markEstimateSynced = async (estimateId: string): Promise<void> => {
  console.warn("Offline mode: markEstimateSynced is not fully implemented.", estimateId);
  return Promise.resolve();
};
