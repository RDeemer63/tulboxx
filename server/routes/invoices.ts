import { Router, Request } from 'express';
import { z } from 'zod';
import { InvoiceRepository, InvoiceWithCustomer } from '../repositories/InvoiceRepository';
import { EstimateRepository } from '../repositories/EstimateRepository';
import {
  insertInvoiceSchema,
  Invoice,
  ModernEstimate,
  EstimateLineItem,
  Contact,
  BusinessProfile,
  InsertInvoice, // Drizzle's insert type
} from '@shared/schema';
import { validateRequest } from '../middleware/validation-middleware';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth-middleware'; // Updated auth middleware
import { storage } from '../storage'; // For customer/business profile for PDF
import { pdfService } from '../services/pdf-service';
import { asyncHandler } from '../utils/async-handler'; // For error handling
import { NotFoundError, BadRequestError } from '../utils/error-handler'; // Custom error classes

const router = Router();
const invoiceRepository = new InvoiceRepository();
const estimateRepository = new EstimateRepository();

// Apply authentication middleware to all invoice routes
router.use(authenticateUser);

// --- Zod Schemas for Path/Query Parameter Validation ---
const invoiceIdParamSchema = z.object({
  id: z.coerce.number().int().positive("Invoice ID must be a positive integer"),
});

const estimateIdParamSchema = z.object({ // Modern estimates use UUID
  estimateId: z.string().uuid("Invalid Estimate ID format (must be UUID)"),
});

const listInvoicesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  status: z.string().optional(), // Consider using an enum if statuses are fixed
  customerId: z.coerce.number().int().positive().optional(),
});


// --- Routes ---

// Create a new invoice
router.post('/', validateRequest({ body: insertInvoiceSchema }), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const newInvoiceData = req.body as Omit<InsertInvoice, 'id' | 'createdAt' | 'updatedAt'>; // Use Drizzle's InsertInvoice
  const userId = req.user!.id; // User ID from authenticated request

  // Ensure invoiceNumber is generated if not provided
  if (!newInvoiceData.invoiceNumber) {
    newInvoiceData.invoiceNumber = `INV-${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  // Ensure numeric fields are correctly formatted (Drizzle expects strings for decimals)
  const totalAmount = parseFloat(String(newInvoiceData.totalAmount ?? '0'));
  const paidAmount = parseFloat(String(newInvoiceData.paidAmount ?? '0'));
  const subtotal = parseFloat(String(newInvoiceData.subtotal ?? '0'));
  const taxRate = parseFloat(String(newInvoiceData.taxRate ?? '0')); // Assuming taxRate is decimal, e.g., 0.05

  let calculatedSubtotal = subtotal;
  let calculatedTaxAmount = parseFloat(String(newInvoiceData.taxAmount ?? '0'));
  let calculatedTotalAmount = totalAmount;

  if (subtotal > 0 && totalAmount === 0) { // If subtotal is given but total is not, calculate total
    calculatedTaxAmount = subtotal * taxRate;
    calculatedTotalAmount = subtotal + calculatedTaxAmount;
  } else if (totalAmount > 0 && subtotal === 0) { // If total is given but subtotal is not
    calculatedSubtotal = totalAmount / (1 + taxRate);
    calculatedTaxAmount = totalAmount - calculatedSubtotal;
  } else { // Both or neither are given, or explicit tax amount is there
    calculatedSubtotal = subtotal; // Keep provided or 0
    calculatedTaxAmount = parseFloat(String(newInvoiceData.taxAmount ?? (calculatedSubtotal * taxRate)));
    calculatedTotalAmount = totalAmount || (calculatedSubtotal + calculatedTaxAmount);
  }
  
  const balanceDue = calculatedTotalAmount - paidAmount;

  const processedData: InsertInvoice = {
    ...newInvoiceData,
    customerId: Number(newInvoiceData.customerId), // Ensure customerId is number
    jobId: newInvoiceData.jobId ? Number(newInvoiceData.jobId) : null,
    estimateId: newInvoiceData.estimateId ? Number(newInvoiceData.estimateId) : null, // Legacy estimate ID
    modernEstimateId: newInvoiceData.modernEstimateId || null, // Modern estimate ID (UUID string)
    subtotal: calculatedSubtotal.toFixed(2),
    taxRate: taxRate.toFixed(4),
    taxAmount: calculatedTaxAmount.toFixed(2),
    totalAmount: calculatedTotalAmount.toFixed(2),
    paidAmount: paidAmount.toFixed(2),
    balanceDue: balanceDue.toFixed(2),
    // createdBy: userId, // If you have a createdBy field
  };

  const invoice = await invoiceRepository.create(processedData);
  res.status(201).json(invoice);
}));

// Get all invoices (paginated, with search)
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const queryParams = listInvoicesQuerySchema.parse(req.query);
  // const userId = req.user!.id; // If invoices are user-specific
  // Add userId to findPaginated if needed: await invoiceRepository.findPaginated({ ...queryParams, userId });
  const result = await invoiceRepository.findPaginated(queryParams);
  res.json(result);
}));

// Get a single invoice by ID
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = invoiceIdParamSchema.parse(req.params);
  // const userId = req.user!.id; // If invoices are user-specific
  // Add userId to findById if needed: await invoiceRepository.findById(id, userId);
  const invoice = await invoiceRepository.findById(id);
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }
  res.json(invoice);
}));

// Update an invoice
router.patch('/:id', validateRequest({ body: insertInvoiceSchema.partial() }), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = invoiceIdParamSchema.parse(req.params);
  const invoiceDataToUpdate = req.body as Partial<InsertInvoice>;
  const userId = req.user!.id;

  const currentInvoice = await invoiceRepository.findById(id);
  if (!currentInvoice) {
    throw new NotFoundError('Invoice not found for update');
  }

  // Recalculate amounts if relevant fields change
  const newSubtotal = invoiceDataToUpdate.subtotal !== undefined ? parseFloat(String(invoiceDataToUpdate.subtotal)) : parseFloat(currentInvoice.subtotal);
  const newTaxRate = invoiceDataToUpdate.taxRate !== undefined ? parseFloat(String(invoiceDataToUpdate.taxRate)) : parseFloat(currentInvoice.taxRate || "0");
  const newPaidAmount = invoiceDataToUpdate.paidAmount !== undefined ? parseFloat(String(invoiceDataToUpdate.paidAmount)) : parseFloat(currentInvoice.paidAmount || "0");
  
  let newTaxAmount: number;
  let newTotalAmount: number;

  if (invoiceDataToUpdate.totalAmount !== undefined) { // If total is explicitly set, prioritize it
      newTotalAmount = parseFloat(String(invoiceDataToUpdate.totalAmount));
      if (invoiceDataToUpdate.subtotal === undefined) { // if subtotal is not changing, derive it
          const currentSub = parseFloat(currentInvoice.subtotal);
          newTaxAmount = newTotalAmount - currentSub; // This assumes tax is the difference
      } else { // if subtotal IS changing, tax is newTotal - newSubtotal
          newTaxAmount = newTotalAmount - newSubtotal;
      }
  } else { // If total is not explicitly set, calculate from subtotal and taxRate
      newTaxAmount = newSubtotal * newTaxRate;
      newTotalAmount = newSubtotal + newTaxAmount;
  }
  
  const newBalanceDue = newTotalAmount - newPaidAmount;

  const processedUpdateData: Partial<InsertInvoice> = {
    ...invoiceDataToUpdate,
    subtotal: newSubtotal.toFixed(2),
    taxRate: newTaxRate.toFixed(4),
    taxAmount: newTaxAmount.toFixed(2),
    totalAmount: newTotalAmount.toFixed(2),
    paidAmount: newPaidAmount.toFixed(2),
    balanceDue: newBalanceDue.toFixed(2),
    // updatedAt: new Date(), // Drizzle $onUpdate handles this
    // updatedBy: userId, // If you have an updatedBy field
  };
  
  if (invoiceDataToUpdate.customerId !== undefined) {
    processedUpdateData.customerId = Number(invoiceDataToUpdate.customerId);
  }
  if (invoiceDataToUpdate.jobId !== undefined) {
    processedUpdateData.jobId = invoiceDataToUpdate.jobId ? Number(invoiceDataToUpdate.jobId) : null;
  }
   if (invoiceDataToUpdate.estimateId !== undefined) { // Legacy estimate ID
    processedUpdateData.estimateId = invoiceDataToUpdate.estimateId ? Number(invoiceDataToUpdate.estimateId) : null;
  }
  // modernEstimateId is string (UUID), no conversion needed if present

  const updatedInvoice = await invoiceRepository.update(id, processedUpdateData);
  if (!updatedInvoice) {
    // This case should ideally be caught by the findById check or repository should throw
    throw new NotFoundError('Invoice not found or failed to update');
  }
  res.json(updatedInvoice);
}));

// Delete an invoice
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = invoiceIdParamSchema.parse(req.params);
  // const userId = req.user!.id; // If you need to check ownership before delete
  const success = await invoiceRepository.delete(id);
  if (!success) {
    throw new NotFoundError('Invoice not found or failed to delete');
  }
  res.status(204).send();
}));

// Generate PDF for an invoice
router.get('/:id/pdf', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = invoiceIdParamSchema.parse(req.params);
  const invoice = await invoiceRepository.findById(id);

  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  // Fetch related data for PDF
  const customer = invoice.customerId ? await storage.getCustomer(invoice.customerId) : undefined;
  const businessProfile = await storage.getBusinessProfile(); // Assuming this fetches the current user's business profile

  const pdfBuffer = await pdfService.generateInvoicePDF(
    invoice,
    customer,
    businessProfile
  );

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Invoice-${invoice.invoiceNumber || invoice.id}.pdf"`);
  res.send(pdfBuffer);
}));

// Send an invoice (placeholder for email sending)
router.post('/:id/send', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = invoiceIdParamSchema.parse(req.params);
  const userId = req.user!.id;

  const invoice = await invoiceRepository.findById(id);
  if (!invoice) {
    throw new NotFoundError('Invoice not found for sending');
  }

  // TODO: Implement actual email sending logic using a service like Nodemailer or an email API.
  // For now, just update the status.

  const updatedInvoice = await invoiceRepository.update(id, {
    status: 'sent',
    sentAt: new Date().toISOString(),
    // updatedBy: userId, // If tracking updates
  });

  res.json({ message: 'Invoice marked as sent (email sending is a placeholder).', invoice: updatedInvoice });
}));

// Convert a modern estimate to an invoice
router.post('/from-estimate/:estimateId', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { estimateId } = estimateIdParamSchema.parse(req.params); // estimateId is UUID string
  const userId = req.user!.id;

  const estimate = await estimateRepository.findById(estimateId); // ModernEstimate

  if (!estimate) {
    throw new NotFoundError('Estimate not found for conversion');
  }

  if (estimate.status === 'converted' || estimate.status === 'superseded') {
    throw new BadRequestError(`Estimate ${estimate.estimateNumber} has already been ${estimate.status}.`);
  }
  
  if (!estimate.customerId) {
      throw new BadRequestError('Estimate must be associated with a customer to be converted to an invoice.');
  }

  const subtotal = parseFloat(estimate.subtotal?.toString() || '0');
  const taxRate = parseFloat(estimate.taxRate?.toString() || '0');
  // Use total from estimate if available, otherwise calculate
  const totalAmount = parseFloat(estimate.total?.toString() || (subtotal * (1 + taxRate)).toString());
  const taxAmount = totalAmount - subtotal;


  const invoiceData: Omit<InsertInvoice, 'id' | 'createdAt' | 'updatedAt'> = {
    customerId: estimate.customerId, // customerId is number
    jobId: estimate.jobId ? Number(estimate.jobId) : null, // Assuming jobId in modernEstimate is also number, or needs lookup
    modernEstimateId: estimate.id, // Link to the modern estimate
    invoiceNumber: `INV-${Date.now()}${Math.floor(Math.random() * 1000)}`,
    title: estimate.title || `Invoice for Estimate ${estimate.estimateNumber}`,
    description: estimate.notes || `Generated from Estimate ${estimate.estimateNumber}`,
    subtotal: subtotal.toFixed(2),
    taxRate: taxRate.toFixed(4),
    taxAmount: taxAmount.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
    paidAmount: "0.00",
    balanceDue: totalAmount.toFixed(2),
    status: 'draft',
    paymentTerms: (await storage.getBusinessProfile())?.defaultInvoiceTerms || estimate.termsAndConditions || 'Due upon receipt',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default: 30 days from now
    items: estimate.lineItems ? JSON.stringify(
      estimate.lineItems.map((li: EstimateLineItem) => ({ // Ensure li matches structure expected by Invoice.items if it's structured
        title: li.title,
        description: li.description || '',
        quantity: parseFloat(li.quantity.toString()),
        unit: li.unit || '',
        unitPrice: parseFloat(li.unitPrice.toString()),
        markupPct: parseFloat(li.markupPct?.toString() || "0"), // Ensure these fields are part of your line item structure
        category: li.category || '',
        total: parseFloat(li.total.toString()),
      }))
    ) : null,
    notes: `Converted from Estimate #${estimate.estimateNumber}.`,
    // createdBy: userId, // If tracking
  };

  const newInvoice = await invoiceRepository.create(invoiceData as InsertInvoice);

  // Update the estimate status to 'converted'
  await estimateRepository.update(estimateId, { status: 'converted', convertedAt: new Date().toISOString() });

  res.status(201).json(newInvoice);
}));

export default router;
