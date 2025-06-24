import { v4 as uuidv4 } from 'uuid';
import {
  ModernEstimate,
  EstimateLineItem,
  EstimateTemplate,
  EstimateEvent,
  insertModernEstimateSchema,
  updateModernEstimateSchema,
  insertEstimateLineItemSchema,
  updateEstimateLineItemSchema,
  insertEstimateTemplateSchema,
  updateEstimateTemplateSchema,
} from '../../shared/schema'; // This import remains for table schemas
import { 
  EstimateStatusEnum, 
  EstimateTypeEnum, 
  TemplateVisibilityEnum 
} from '../../shared/estimates-schema'; // Updated import path for enums
import { 
  ListEstimateParams, 
  EstimateStats, 
  PaginatedResponse,
  ApproveEstimatePayload,
  DeclineEstimatePayload,
  ConvertToJobPayload,
  ConvertToJobResult,
  BulkLineItemsPayload,
  BulkLineItemsResult,
  SaveAsTemplatePayload,
  CreateFromTemplatePayload,
  LineItemOrderPayload,
  AIDraftPayload,
  ListTemplatesParams
} from '../api/estimates/apiTypes'; 
import { z } from 'zod';

// --- Mock Data Generators ---
const generateMockId = () => uuidv4();
const getCurrentTimestamp = () => new Date().toISOString();

const createMockLineItem = (overrides: Partial<EstimateLineItem> = {}): EstimateLineItem => ({
  id: generateMockId(),
  estimateId: generateMockId(),
  title: 'Mock Line Item Title', // Added title as it's required in schema
  description: 'Mock Line Item Description',
  category: 'Service',
  quantity: '1.00', // Drizzle schema expects string for decimal
  unitPrice: '75.00', // Drizzle schema expects string for decimal
  markupPct: '10.00', // Drizzle schema expects string for decimal
  total: '82.50', // Drizzle schema expects string for decimal
  sortOrder: 0,
  // createdAt and updatedAt are not in estimateLineItems schema, but good for consistency if added
  ...overrides,
});

const createMockEstimate = (overrides: Partial<ModernEstimate> = {}): ModernEstimate => ({
  id: generateMockId(),
  estimateNumber: `EST-${Math.floor(Math.random() * 10000)}`,
  title: 'Mock Estimate Title',
  status: EstimateStatusEnum.Enum.draft,
  estimateType: EstimateTypeEnum.Enum.detailed,
  // totalPrice: null, // This field is not in modernEstimates schema, estimate total is 'total'
  subtotal: '165.00',
  tax: '13.20', // Added tax field as it's in modernEstimates schema
  total: '178.20',
  taxRate: '8.00',
  notes: 'This is a mock estimate for testing purposes.',
  termsAndConditions: 'Standard terms and conditions apply.',
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  customerId: null,
  customerName: 'Mock Customer Inc.', // Added customerName as it's often needed
  customerAddress: '123 Mockingbird Lane, Testville, USA', // Added customerAddress
  leadId: null,
  leadName: null, // Added leadName
  jobId: null,
  isTemplate: false,
  // templateId: null, // This field is not in modernEstimates schema
  versionOf: null,
  optionGroupId: null,
  sentAt: null,
  approvedAt: null,
  declinedAt: null, // Added declinedAt
  archivedAt: null, // Added archivedAt
  convertedAt: null, // Added convertedAt
  synced: true,
  userId: generateMockId(), // Changed from createdBy to userId to match schema
  createdAt: getCurrentTimestamp(),
  updatedAt: getCurrentTimestamp(),
  lineItems: [createMockLineItem({sortOrder: 0}), createMockLineItem({title: "Another Item Title", description: "Another Item", unitPrice: "90.00", total: "99.00", sortOrder: 1})],
  signature: null, // Added signature
  signatureDate: null, // Added signatureDate
  ...overrides,
});

const createMockEstimateTemplate = (overrides: Partial<EstimateTemplate> = {}): EstimateTemplate => ({
  id: generateMockId(),
  name: 'Mock Template Name',
  description: 'This is a mock estimate template.',
  visibility: TemplateVisibilityEnum.Enum.private,
  industryTag: ['general', 'construction'],
  lineItemsJson: JSON.stringify([createMockLineItem()]),
  userId: generateMockId(), // Changed from createdBy to userId
  // organizationId: generateMockId(), // Not in schema
  defaultTaxRate: '8.00', // Added defaultTaxRate
  defaultNotes: 'Default notes for template', // Added defaultNotes
  defaultTerms: 'Default terms for template', // Added defaultTerms
  createdAt: getCurrentTimestamp(),
  updatedAt: getCurrentTimestamp(),
  ...overrides,
});

const createMockEstimateEvent = (overrides: Partial<EstimateEvent> = {}): EstimateEvent => ({
  id: generateMockId(),
  estimateId: generateMockId(),
  type: 'created', // This should match EstimateEventType from schema if defined
  message: 'Estimate created',
  data: {},
  userId: generateMockId(), // Changed from createdBy to userId
  userName: 'Mock User', // Added userName
  createdAt: getCurrentTimestamp(),
  ...overrides,
});

const logStubWarning = (functionName: string) => {
  if (process.env.MOCK_SERVICES === 'true' && process.env.NODE_ENV !== 'test') {
    console.warn(`⚠️ estimateService.${functionName} is a STUB and using mock data. SET MOCK_SERVICES=false in .env to disable.`);
  }
};

// --- Service Method Stubs ---

export const createEstimate = async (
  userId: string,
  payload: z.infer<typeof insertModernEstimateSchema>
): Promise<ModernEstimate> => {
  logStubWarning('createEstimate');
  // TODO: Implement actual estimate creation logic using EstimateRepository
  // For now, return mock data.
  const newEstimate = createMockEstimate({ 
    userId, 
    title: payload.title || 'New Mock Estimate',
    status: EstimateStatusEnum.Enum.draft,
    ...payload 
  });
  if (payload.lineItems && payload.lineItems.length > 0) {
    newEstimate.lineItems = payload.lineItems.map((li, index) => createMockLineItem({ ...li, estimateId: newEstimate.id, sortOrder: index }));
    // Recalculate totals if line items are provided
    const subtotal = newEstimate.lineItems.reduce((sum, item) => sum + parseFloat(item.total || '0'), 0);
    newEstimate.subtotal = subtotal.toFixed(2);
    const tax = subtotal * (parseFloat(newEstimate.taxRate || '0') / 100);
    newEstimate.tax = tax.toFixed(2);
    newEstimate.total = (subtotal + tax).toFixed(2);
  }
  return newEstimate;
};

export const getEstimates = async (
  userId: string,
  params: ListEstimateParams
): Promise<PaginatedResponse<ModernEstimate>> => {
  logStubWarning('getEstimates');
  // TODO: Implement actual data fetching with filtering, pagination, sorting
  const items = Array.from({ length: params.limit || 10 }).map(() => createMockEstimate({ userId }));
  return {
    items,
    totalItems: 100, // Mock total
    currentPage: params.page || 1,
    totalPages: Math.ceil(100 / (params.limit || 10)),
    limit: params.limit || 10,
  };
};

export const getEstimateStats = async (userId: string): Promise<EstimateStats> => {
  logStubWarning('getEstimateStats');
  // TODO: Implement actual stats calculation
  return {
    totalEstimates: 152,
    draftCount: 23,
    sentCount: 68,
    approvedCount: 45,
    declinedCount: 10,
    archivedCount: 5,
    convertedCount: 1,
    totalValue: 1250800.75, 
    draftValue: 230000.00,
    sentValue: 680500.25,
    approvedValue: 340300.50,
  };
};

export const getEstimateById = async (userId: string, id: string): Promise<ModernEstimate | null> => {
  logStubWarning('getEstimateById');
  // TODO: Implement actual data fetching
  if (id === 'nonexistent-id-for-testing') return null;
  return createMockEstimate({ id, userId });
};

export const updateEstimate = async (
  userId: string,
  id: string,
  payload: z.infer<typeof updateModernEstimateSchema>
): Promise<ModernEstimate> => {
  logStubWarning('updateEstimate');
  // TODO: Implement actual update logic
  const existingEstimate = createMockEstimate({ id, userId });
  const updatedEstimate = { ...existingEstimate, ...payload, updatedAt: getCurrentTimestamp() };
  
  if (payload.lineItems && payload.lineItems.length > 0) {
    updatedEstimate.lineItems = payload.lineItems.map((li, index) => createMockLineItem({ ...li, id: li.id || generateMockId(), estimateId: id, sortOrder: index }));
     // Recalculate totals if line items are provided
    const subtotal = updatedEstimate.lineItems.reduce((sum, item) => sum + parseFloat(item.total || '0'), 0);
    updatedEstimate.subtotal = subtotal.toFixed(2);
    const tax = subtotal * (parseFloat(updatedEstimate.taxRate || '0') / 100);
    updatedEstimate.tax = tax.toFixed(2);
    updatedEstimate.total = (subtotal + tax).toFixed(2);
  } else if (payload.lineItems === null) { // Explicitly set to null to clear
    updatedEstimate.lineItems = [];
  }

  return updatedEstimate;
};

export const deleteEstimate = async (userId: string, id: string): Promise<void> => {
  logStubWarning('deleteEstimate');
  // TODO: Implement actual delete logic
  // No return value for delete
};

// Workflow Actions
export const sendEstimate = async (userId: string, id: string): Promise<ModernEstimate> => {
  logStubWarning('sendEstimate');
  // TODO: Implement actual send logic (update status, log activity, send notification)
  return createMockEstimate({ id, userId, status: EstimateStatusEnum.Enum.sent, sentAt: getCurrentTimestamp() });
};

export const approveEstimate = async (userId: string, id: string, payload?: ApproveEstimatePayload): Promise<ModernEstimate> => {
  logStubWarning('approveEstimate');
  console.log('Approve payload (stub):', payload);
  // TODO: Implement actual approval logic (update status, store signature, log activity)
  return createMockEstimate({ id, userId, status: EstimateStatusEnum.Enum.approved, approvedAt: getCurrentTimestamp(), signature: payload?.signatureData });
};

export const declineEstimate = async (userId: string, id: string, payload?: DeclineEstimatePayload): Promise<ModernEstimate> => {
  logStubWarning('declineEstimate');
  console.log('Decline payload (stub):', payload);
  // TODO: Implement actual decline logic (update status, log activity with reason)
  return createMockEstimate({ id, userId, status: EstimateStatusEnum.Enum.declined, declinedAt: getCurrentTimestamp() });
};

export const archiveEstimate = async (userId: string, id: string): Promise<ModernEstimate> => {
  logStubWarning('archiveEstimate');
  // TODO: Implement actual archive logic
  return createMockEstimate({ id, userId, status: EstimateStatusEnum.Enum.archived, archivedAt: getCurrentTimestamp() });
};

export const convertToJob = async (userId: string, id: string, payload?: ConvertToJobPayload): Promise<ConvertToJobResult> => {
  logStubWarning('convertToJob');
  console.log('Convert to job payload (stub):', payload);
  // TODO: Implement actual job conversion logic (create job, link estimate, update status)
  const estimate = createMockEstimate({ id, userId, status: EstimateStatusEnum.Enum.converted, convertedAt: getCurrentTimestamp(), jobId: generateMockId() });
  return { 
    estimate, 
    job: { id: estimate.jobId, title: payload?.jobTitle || `Job for ${estimate.estimateNumber}`, status: 'pending' } 
  };
};

export const createNewVersion = async (userId: string, id: string): Promise<ModernEstimate> => {
  logStubWarning('createNewVersion');
  // TODO: Implement actual versioning logic (copy estimate & line items, link, update original status)
  const originalEstimate = createMockEstimate({ id, userId });
  return createMockEstimate({ 
    userId, 
    title: `${originalEstimate.title} (v2)`, 
    versionOf: id, 
    status: EstimateStatusEnum.Enum.revision 
  });
};

export const saveAsTemplate = async (userId: string, id: string, payload: SaveAsTemplatePayload): Promise<EstimateTemplate> => {
  logStubWarning('saveAsTemplate');
  // TODO: Implement actual logic to create a template from an estimate
  const estimate = createMockEstimate({ id });
  return createMockEstimateTemplate({
    name: payload.name,
    description: payload.description,
    visibility: payload.visibility || TemplateVisibilityEnum.Enum.private,
    industryTag: payload.industryTag,
    lineItemsJson: JSON.stringify(estimate.lineItems || []),
    userId,
  });
};

export const generateAIDraftLineItems = async (userId: string, estimateId: string, prompt: string, context?: string): Promise<EstimateLineItem[]> => {
  logStubWarning('generateAIDraftLineItems');
  console.warn(`AI Draft for estimate ${estimateId} with prompt "${prompt}" and context "${context}" - returning mock data.`);
  // TODO: Implement actual AI call or return more realistic mock data
  return [
    createMockLineItem({ title: "AI Draft Item 1", description: `AI Draft: ${prompt.substring(0,20)} - Item 1`, estimateId }),
    createMockLineItem({ title: "AI Draft Item 2", description: `AI Draft: ${prompt.substring(0,20)} - Item 2`, estimateId }),
  ];
};

export const getEstimateEvents = async (userId: string, estimateId: string): Promise<EstimateEvent[]> => {
  logStubWarning('getEstimateEvents');
  // TODO: Implement actual event fetching
  return [
    createMockEstimateEvent({ estimateId, type: 'created', message: 'Estimate created by Mock User' }),
    createMockEstimateEvent({ estimateId, type: 'status_changed', message: 'Status changed to Draft', data: { oldStatus: null, newStatus: 'draft' }, createdAt: new Date(Date.now() + 1000).toISOString() }),
  ];
};

// Line Item Services
export const addLineItem = async (userId: string, estimateId: string, payload: z.infer<typeof insertEstimateLineItemSchema.omit<{ estimateId: true, sortOrder: true }>>): Promise<EstimateLineItem> => {
  logStubWarning('addLineItem');
  // TODO: Implement actual line item creation
  return createMockLineItem({ ...payload, estimateId, title: payload.title || "New Line Item" });
};

export const updateLineItem = async (userId: string, estimateId: string, itemId: string, payload: z.infer<typeof updateEstimateLineItemSchema.omit<{ estimateId: true, id: true }>>): Promise<EstimateLineItem> => {
  logStubWarning('updateLineItem');
  // TODO: Implement actual line item update
  return createMockLineItem({ id: itemId, estimateId, ...payload });
};

export const deleteLineItem = async (userId: string, estimateId: string, itemId: string): Promise<void> => {
  logStubWarning('deleteLineItem');
  // TODO: Implement actual line item deletion
  // No return
};

export const updateLineItemOrder = async (userId: string, estimateId: string, payload: LineItemOrderPayload[]): Promise<void> => {
  logStubWarning('updateLineItemOrder');
  console.log('Updating line item order (stub):', payload);
  // TODO: Implement actual line item reordering
  // No return
};

export const updateLineItems = async (userId: string, estimateId: string, payload: BulkLineItemsPayload): Promise<BulkLineItemsResult> => {
  logStubWarning('updateLineItems');
  // TODO: Implement actual bulk line item operations
  const result: BulkLineItemsResult = { created: [], updated: [], deletedIds: [] };
  if (payload.create) {
    result.created = payload.create.map(item => createMockLineItem({ ...item, estimateId, title: item.title || "New Bulk Item" }));
  }
  if (payload.update) {
    result.updated = payload.update.map(item => createMockLineItem({ ...item, estimateId }));
  }
  if (payload.delete) {
    result.deletedIds = payload.delete;
  }
  return result;
};


// Estimate Template Services
export const createEstimateTemplate = async (userId: string, payload: z.infer<typeof insertEstimateTemplateSchema>): Promise<EstimateTemplate> => {
  logStubWarning('createEstimateTemplate');
  // TODO: Implement actual template creation
  return createMockEstimateTemplate({ ...payload, userId });
};

export const getEstimateTemplates = async (userId: string, params: ListTemplatesParams): Promise<PaginatedResponse<EstimateTemplate>> => {
  logStubWarning('getEstimateTemplates');
  // TODO: Implement actual template fetching
  const items = Array.from({ length: params.limit || 10 }).map(() => createMockEstimateTemplate({ userId }));
  return {
    items,
    totalItems: 20,
    currentPage: params.page || 1,
    totalPages: Math.ceil(20 / (params.limit || 10)),
    limit: params.limit || 10,
  };
};

export const getEstimateTemplateById = async (userId: string, id: string): Promise<EstimateTemplate | null> => {
  logStubWarning('getEstimateTemplateById');
  // TODO: Implement actual template fetching
  if (id === 'nonexistent-template-id') return null;
  return createMockEstimateTemplate({ id, userId });
};

export const updateEstimateTemplate = async (userId: string, id: string, payload: z.infer<typeof updateEstimateTemplateSchema>): Promise<EstimateTemplate> => {
  logStubWarning('updateEstimateTemplate');
  // TODO: Implement actual template update
  const existingTemplate = createMockEstimateTemplate({ id, userId });
  return { ...existingTemplate, ...payload, updatedAt: getCurrentTimestamp() };
};

export const deleteEstimateTemplate = async (userId: string, id: string): Promise<void> => {
  logStubWarning('deleteEstimateTemplate');
  // TODO: Implement actual template deletion
  // No return
};

export const createEstimateFromTemplate = async (userId: string, templateId: string, payload: CreateFromTemplatePayload): Promise<ModernEstimate> => {
  logStubWarning('createEstimateFromTemplate');
  // TODO: Implement actual estimate creation from template
  const template = createMockEstimateTemplate({ id: templateId });
  const lineItems = template.lineItemsJson ? JSON.parse(template.lineItemsJson as unknown as string) : [];
  
  return createMockEstimate({
    userId,
    title: payload.title || `Estimate from ${template.name}`,
    leadId: payload.leadId,
    customerId: payload.customerId,
    lineItems: lineItems.map((li: any, index: number) => createMockLineItem({...li, id: generateMockId(), sortOrder: index })), // Ensure new IDs for line items
    templateId: templateId, // This field is not on ModernEstimate, but could be useful for tracking origin
    status: EstimateStatusEnum.Enum.draft,
  });
};
