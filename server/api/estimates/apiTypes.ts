import { ModernEstimate, EstimateLineItem, EstimateTemplate, EstimateStatusEnum, TemplateVisibilityEnum } from '../../../shared/schema';

// --- Common API Structures ---

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

// --- Estimate List & Stats ---

export interface ListEstimateParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: EstimateStatusEnum;
  leadId?: string;
  customerId?: number; // Assuming customerId from Contact table is number
  jobId?: string;
  dateFrom?: string; // ISO Date string
  dateTo?: string;   // ISO Date string
  sortBy?: keyof ModernEstimate | string; // Allow string for flexibility with custom sort fields
  sortDirection?: 'asc' | 'desc';
}

export interface EstimateStats {
  totalEstimates: number;
  draftCount: number;
  sentCount: number;
  approvedCount: number;
  declinedCount: number;
  archivedCount: number;
  convertedCount: number;
  totalValue: number;
  draftValue: number;
  sentValue: number;
  approvedValue: number;
}

// --- Estimate Workflow Payloads & Results ---

export interface ApproveEstimatePayload {
  signatureData?: string; // Base64 encoded image or similar
  signedBy?: string;
}

export interface DeclineEstimatePayload {
  reason?: string;
}

export interface ConvertToJobPayload {
  jobTitle?: string;
  startDate?: string; // ISO Date string
  // Add other necessary fields to create a job
}

export interface ConvertToJobResult {
  estimate: ModernEstimate;
  job: {
    id: string | null; // Assuming job ID might be string or number based on your Job schema
    title?: string | null;
    status?: string; // Example, adjust to your Job model
    // ... other relevant job details
  };
}

// --- Line Item Operations ---

export interface LineItemOrderPayload {
  id: string; // Line item ID
  sortOrder: number;
}

export interface BulkLineItemCreatePayload {
  description: string;
  category?: string | null;
  quantity: string; // Using string for form input flexibility, convert to number in service
  unit?: string | null;
  unitPrice: string;
  markupPct?: string | null;
  // total is calculated
  // sortOrder is managed by the array order or explicitly set later
}

export interface BulkLineItemUpdatePayload {
  id: string; // Required to identify the line item to update
  description?: string;
  category?: string | null;
  quantity?: string;
  unit?: string | null;
  unitPrice?: string;
  markupPct?: string | null;
  // total is calculated
  sortOrder?: number;
}

export interface BulkLineItemsPayload {
  create?: BulkLineItemCreatePayload[];
  update?: BulkLineItemUpdatePayload[];
  delete?: string[]; // Array of line item IDs to delete
}

export interface BulkLineItemsResult {
  created: EstimateLineItem[];
  updated: EstimateLineItem[];
  deletedIds: string[];
}

// --- Template Operations ---

export interface ListTemplatesParams {
  page?: number;
  limit?: number;
  search?: string;
  visibility?: TemplateVisibilityEnum;
  industryTag?: string; // Assuming single tag search for now
  sortBy?: keyof EstimateTemplate | string;
  sortDirection?: 'asc' | 'desc';
}

export interface SaveAsTemplatePayload {
  name: string;
  description?: string | null;
  visibility?: TemplateVisibilityEnum;
  industryTag?: string[] | null;
}

export interface CreateFromTemplatePayload {
  leadId?: string | null;
  customerId?: number | null;
  title?: string | null;
  // Potentially other fields to override from template
}

// --- AI Related Payloads ---
export interface AIDraftPayload {
  prompt: string;
  context?: string; // Additional context for AI, e.g., estimate details
}
