import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as estimateService from '../services/estimateService';
import { authenticateUser } from '../middleware/auth-middleware'; 
import { handleServiceError } from '../utils/error-handler'; 
import { 
  insertModernEstimateSchema, 
  updateModernEstimateSchema,
  insertEstimateLineItemSchema,
  updateEstimateLineItemSchema,
  insertEstimateTemplateSchema,
  updateEstimateTemplateSchema,
  // These will be removed from here
} from '../../shared/schema';
import {
  EstimateStatusEnum,
  EstimateTypeEnum,
  TemplateVisibilityEnum,
} from '../../shared/estimates-schema'; // New import path for enums
import { pdfService } from '../services/pdf-service'; // PDF generation service

const estimateRouter = express.Router();
const templateRouter = express.Router();

// Middleware to extract userId and attach to req
const extractUserId = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.id) {
    // Changed to send response and return, to prevent further execution
    return res.status(401).json({ message: 'User not authenticated or user ID missing' });
  }
  // Attach userId to req for easier access in handlers
  (req as any).userId = req.user.id;
  next();
};

estimateRouter.use(authenticateUser);
estimateRouter.use(extractUserId);

templateRouter.use(authenticateUser);
templateRouter.use(extractUserId);


// --- Zod Schemas for Request Validation ---

const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

const estimateIdParamSchema = z.object({
  estimateId: z.string().uuid(),
});

const itemIdParamSchema = z.object({
  itemId: z.string().uuid(),
});

const listEstimatesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  status: EstimateStatusEnum.optional(),
  leadId: z.string().uuid().optional(),
  customerId: z.coerce.number().int().optional(), // Assuming customerId is integer from Contact table
  jobId: z.string().uuid().optional(), // Assuming jobId is UUID
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z.string().optional().default('updatedAt'), 
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});

const listTemplatesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  visibility: TemplateVisibilityEnum.optional(),
  industryTag: z.string().optional(), 
  sortBy: z.string().optional().default('updatedAt'),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});

const approveEstimatePayloadSchema = z.object({
  signatureData: z.string().optional(), 
  signedBy: z.string().min(1).optional(),
});

const declineEstimatePayloadSchema = z.object({
  reason: z.string().optional(),
});

const convertToJobPayloadSchema = z.object({
  jobTitle: z.string().optional(),
  startDate: z.coerce.date().optional(),
});

const reorderLineItemsPayloadSchema = z.array(
  z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int(),
  })
);

const bulkLineItemsPayloadSchema = z.object({
  create: z.array(insertEstimateLineItemSchema.omit({ estimateId: true, sortOrder: true })).optional(),
  update: z.array(updateEstimateLineItemSchema.extend({ id: z.string().uuid() }).omit({ estimateId: true })).optional(),
  delete: z.array(z.string().uuid()).optional(),
});

const saveAsTemplatePayloadSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  visibility: TemplateVisibilityEnum.optional(),
  industryTag: z.array(z.string()).optional(),
});

const createFromTemplatePayloadSchema = z.object({
  leadId: z.string().uuid().optional(),
  customerId: z.number().int().optional(),
  title: z.string().optional(),
});

const aiDraftPayloadSchema = z.object({
  prompt: z.string().min(1),
  context: z.string().optional(), 
});


// --- Estimate Routes ---

estimateRouter.post('/', async (req: Request, res: Response) => {
  try {
    const payload = insertModernEstimateSchema.parse(req.body);
    const estimate = await estimateService.createEstimate((req as any).userId, payload);
    res.status(201).json(estimate);
  } catch (error) {
    handleServiceError(error, res);
  }
});

estimateRouter.get('/', async (req: Request, res: Response) => {
  try {
    const queryParams = listEstimatesQuerySchema.parse(req.query);
    const result = await estimateService.getEstimates((req as any).userId, queryParams);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(error, res);
  }
});

estimateRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await estimateService.getEstimateStats((req as any).userId);
    res.status(200).json(stats);
  } catch (error) {
    handleServiceError(error, res);
  }
});

estimateRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    const estimate = await estimateService.getEstimateById((req as any).userId, id);
    res.status(200).json(estimate);
  } catch (error) {
    handleServiceError(error, res);
  }
});

estimateRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    const payload = updateModernEstimateSchema.parse(req.body);
    const estimate = await estimateService.updateEstimate((req as any).userId, id, payload);
    res.status(200).json(estimate);
  } catch (error) {
    handleServiceError(error, res);
  }
});

estimateRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    await estimateService.deleteEstimate((req as any).userId, id);
    res.status(204).send();
  } catch (error) {
    handleServiceError(error, res);
  }
});

// ---------------------------------------------------------------------------
// PDF Generation Route
// ---------------------------------------------------------------------------

estimateRouter.get('/:id/pdf', async (req: Request, res: Response) => {
  try {
    const { id } = uuidParamSchema.parse(req.params);

    // 1. Fetch estimate
    const estimate = await estimateService.getEstimateById(
      (req as any).userId,
      id
    );
    if (!estimate) {
      return res.status(404).json({ message: 'Estimate not found.' });
    }

    // 2. Retrieve related data (customer & business profile)
    // NOTE: In a full implementation these would come from dedicated services.
    // For now we use placeholders; pdf-service handles undefined gracefully.
    const customer = undefined; // TODO: Fetch customer contact by estimate.customerId
    const businessProfile = undefined; // TODO: Fetch business profile for this user/org

    // 3. Generate PDF buffer
    const pdfBuffer = await pdfService.generateEstimatePDF(
      estimate as any,
      customer as any,
      businessProfile as any
    );

    // 4. Send PDF to client
    const filename = `estimate-${estimate.estimateNumber || estimate.id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );
    res.status(200).send(pdfBuffer);
  } catch (error) {
    handleServiceError(error, res);
  }
});

// Workflow actions
estimateRouter.post('/:id/send', async (req: Request, res: Response) => {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    const estimate = await estimateService.sendEstimate((req as any).userId, id);
    res.status(200).json(estimate);
  } catch (error) {
    handleServiceError(error, res);
  }
});

estimateRouter.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    const payload = approveEstimatePayloadSchema.parse(req.body);
    const estimate = await estimateService.approveEstimate((req as any).userId, id, payload);
    res.status(200).json(estimate);
  } catch (error) {
    handleServiceError(error, res);
  }
});

estimateRouter.post('/:id/decline', async (req: Request, res: Response) => {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    const payload = declineEstimatePayloadSchema.parse(req.body);
    const estimate = await estimateService.declineEstimate((req as any).userId, id, payload);
    res.status(200).json(estimate);
  } catch (error) {
    handleServiceError(error, res);
  }
});

estimateRouter.post('/:id/archive', async (req: Request, res: Response) => {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    const estimate = await estimateService.archiveEstimate((req as any).userId, id);
    res.status(200).json(estimate);
  } catch (error) {
    handleServiceError(error, res);
  }
});

estimateRouter.post('/:id/convert-to-job', async (req: Request, res: Response) => {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    const payload = convertToJobPayloadSchema.parse(req.body);
    const result = await estimateService.convertToJob((req as any).userId, id, payload);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(error, res);
  }
});

estimateRouter.post('/:id/version', async (req: Request, res: Response) => {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    const newVersion = await estimateService.createNewVersion((req as any).userId, id);
    res.status(201).json(newVersion);
  } catch (error) {
    handleServiceError(error, res);
  }
});

estimateRouter.post('/:id/save-as-template', async (req: Request, res: Response) => {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    const payload = saveAsTemplatePayloadSchema.parse(req.body);
    const template = await estimateService.saveAsTemplate((req as any).userId, id, payload);
    res.status(201).json(template);
  } catch (error) {
    handleServiceError(error, res);
  }
});

// AI Draft (Placeholder)
estimateRouter.post('/:id/ai-draft', async (req: Request, res: Response) => {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    const payload = aiDraftPayloadSchema.parse(req.body);
    // const lineItems = await estimateService.generateAIDraftLineItems((req as any).userId, id, payload.prompt, payload.context);
    // res.status(200).json(lineItems);
    res.status(501).json({ message: 'AI draft generation not yet implemented.' });
  } catch (error) {
    handleServiceError(error, res);
  }
});

// Estimate Events
estimateRouter.get('/:id/events', async (req: Request, res: Response) => {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    const events = await estimateService.getEstimateEvents((req as any).userId, id);
    res.status(200).json(events);
  } catch (error) {
    handleServiceError(error, res);
  }
});


// --- Line Item Routes ---

estimateRouter.post('/:estimateId/line-items', async (req: Request, res: Response) => {
  try {
    const { estimateId } = estimateIdParamSchema.parse(req.params);
    const payload = insertEstimateLineItemSchema.omit({ estimateId: true, sortOrder: true }).parse(req.body);
    const lineItem = await estimateService.addLineItem((req as any).userId, estimateId, payload);
    res.status(201).json(lineItem);
  } catch (error) {
    handleServiceError(error, res);
  }
});

estimateRouter.put('/:estimateId/line-items/:itemId', async (req: Request, res: Response) => {
  try {
    const { estimateId } = estimateIdParamSchema.parse(req.params);
    const { itemId } = itemIdParamSchema.parse(req.params);
    const payload = updateEstimateLineItemSchema.omit({ estimateId: true, id: true }).parse(req.body);
    const lineItem = await estimateService.updateLineItem((req as any).userId, estimateId, itemId, payload);
    res.status(200).json(lineItem);
  } catch (error) {
    handleServiceError(error, res);
  }
});

estimateRouter.delete('/:estimateId/line-items/:itemId', async (req: Request, res: Response) => {
  try {
    const { estimateId } = estimateIdParamSchema.parse(req.params);
    const { itemId } = itemIdParamSchema.parse(req.params);
    await estimateService.deleteLineItem((req as any).userId, estimateId, itemId);
    res.status(204).send();
  } catch (error) {
    handleServiceError(error, res);
  }
});

estimateRouter.put('/:estimateId/line-items/order', async (req: Request, res: Response) => {
  try {
    const { estimateId } = estimateIdParamSchema.parse(req.params);
    const payload = reorderLineItemsPayloadSchema.parse(req.body);
    await estimateService.updateLineItemOrder((req as any).userId, estimateId, payload);
    res.status(200).json({ message: 'Line item order updated successfully.' });
  } catch (error) {
    handleServiceError(error, res);
  }
});

estimateRouter.patch('/:estimateId/line-items', async (req: Request, res: Response) => {
  try {
    const { estimateId } = estimateIdParamSchema.parse(req.params);
    const payload = bulkLineItemsPayloadSchema.parse(req.body);
    const result = await estimateService.updateLineItems((req as any).userId, estimateId, payload);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(error, res);
  }
});


// --- Estimate Template Routes ---

templateRouter.post('/', async (req: Request, res: Response) => {
  try {
    const payload = insertEstimateTemplateSchema.parse(req.body);
    const template = await estimateService.createEstimateTemplate((req as any).userId, payload);
    res.status(201).json(template);
  } catch (error) {
    handleServiceError(error, res);
  }
});

templateRouter.get('/', async (req: Request, res: Response) => {
  try {
    const queryParams = listTemplatesQuerySchema.parse(req.query);
    const result = await estimateService.getEstimateTemplates((req as any).userId, queryParams);
    res.status(200).json(result);
  } catch (error) {
    handleServiceError(error, res);
  }
});

templateRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    const template = await estimateService.getEstimateTemplateById((req as any).userId, id);
    res.status(200).json(template);
  } catch (error) {
    handleServiceError(error, res);
  }
});

templateRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    const payload = updateEstimateTemplateSchema.parse(req.body);
    const template = await estimateService.updateEstimateTemplate((req as any).userId, id, payload);
    res.status(200).json(template);
  } catch (error) {
    handleServiceError(error, res);
  }
});

templateRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    await estimateService.deleteEstimateTemplate((req as any).userId, id);
    res.status(204).send();
  } catch (error) {
    handleServiceError(error, res);
  }
});

templateRouter.post('/:templateId/create-estimate', async (req: Request, res: Response) => {
  try {
    const { templateId } = z.object({ templateId: z.string().uuid() }).parse(req.params);
    const payload = createFromTemplatePayloadSchema.parse(req.body);
    const estimate = await estimateService.createEstimateFromTemplate((req as any).userId, templateId, payload);
    res.status(201).json(estimate);
  } catch (error) {
    handleServiceError(error, res);
  }
});

export { estimateRouter, templateRouter };
