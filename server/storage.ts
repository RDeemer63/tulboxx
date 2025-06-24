import { 
  contacts as customers, 
  jobs, 
  estimates, 
  invoices,
  payments,
  recurringBilling,
  communications,
  businessProfiles,
  documents,
  employees,
  employeePermissions,
  employeeAvailability,
  permissions,
  workOrders,
  workOrderTasks,
  timeEntries,
  inventoryItems,
  suppliers,
  workOrderMaterials,
  equipment,
  equipmentMaintenance,
  users,
  notifications,
  leadPipelineStages,
  leadPipelineEntries,
  leadNotes,
  contacts,
  projectUpdates,
  type Customer, 
  type InsertCustomer,
  type Job,
  type InsertJob,
  type Estimate,
  type InsertEstimate,
  type Invoice,
  type InsertInvoice,
  type Payment,
  type InsertPayment,
  type RecurringBilling,
  type InsertRecurringBilling,
  type Communication,
  type InsertCommunication,
  type BusinessProfile,
  type InsertBusinessProfile,
  type Document,
  type InsertDocument,
  type Employee,
  type InsertEmployee,
  type EmployeePermissions,
  type InsertEmployeePermissions,
  type EmployeeAvailability,
  type InsertEmployeeAvailability,
  type WorkOrder,
  type InsertWorkOrder,
  type WorkOrderTask,
  type InsertWorkOrderTask,
  type TimeEntry,
  type InsertTimeEntry,
  type InventoryItem,
  type InsertInventoryItem,
  type Supplier,
  type InsertSupplier,
  type WorkOrderMaterial,
  type InsertWorkOrderMaterial,
  type Equipment,
  type InsertEquipment,
  type EquipmentMaintenance,
  type InsertEquipmentMaintenance,
  type Permission,
  type InsertPermission,
  type Notification,
  type InsertNotification,
  type LeadPipelineStage,
  type InsertLeadPipelineStage,
  type LeadPipelineEntry,
  type InsertLeadPipelineEntry,
  type LeadNote,
  type InsertLeadNote,
  type ProjectUpdate,
  type InsertProjectUpdate
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, and, gte, lte, count, sum, not, inArray, or } from "drizzle-orm";
import { 
  customerRepository, 
  jobRepository, 
  estimateRepository, 
  invoiceRepository,
  projectUpdateRepository,
  type JobWithCustomer,
  type EstimateWithCustomer,
  type InvoiceWithCustomer,
  type ProjectUpdateWithEmployee
} from "./repositories";

export interface IStorage {
  // User authentication methods
  getUserByEmail(email: string): Promise<any | undefined>;
  getUserById(id: string): Promise<any | undefined>;
  createUser(userData: any): Promise<any>;
  updateUser(id: string, userData: any): Promise<any | undefined>;
  updateUserLastLogin(id: string): Promise<void>;

  // Customer methods
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;

  // Job methods
  getJobs(): Promise<(Job & { customer: Customer })[]>;
  getJob(id: number): Promise<(Job & { customer: Customer }) | undefined>;
  getJobsByCustomer(customerId: number): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: number): Promise<boolean>;

  // Estimate methods
  getEstimates(): Promise<(Estimate & { customer: Customer })[]>;
  getEstimate(id: number): Promise<(Estimate & { customer: Customer }) | undefined>;
  getEstimatesByCustomer(customerId: number): Promise<Estimate[]>;
  createEstimate(estimate: InsertEstimate): Promise<Estimate>;
  updateEstimate(id: number, estimate: Partial<InsertEstimate>): Promise<Estimate | undefined>;
  deleteEstimate(id: number): Promise<boolean>;

  // Invoice methods
  getInvoices(): Promise<(Invoice & { customer: Customer })[]>;
  getInvoice(id: number): Promise<(Invoice & { customer: Customer }) | undefined>;
  getInvoicesByCustomer(customerId: number): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;

  // Communication methods
  getCommunications(): Promise<(Communication & { customer: Customer })[]>;
  getCommunicationsByCustomer(customerId: number): Promise<Communication[]>;
  createCommunication(communication: InsertCommunication): Promise<Communication>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalRevenue: number;
    activeJobs: number;
    newCustomers: number;
    pendingEstimates: number;
  }>;

  // Recent activity
  getRecentJobs(limit?: number): Promise<(Job & { customer: Customer })[]>;
  getTodaySchedule(): Promise<(Job & { customer: Customer })[]>;

  // Business profile methods
  getBusinessProfile(): Promise<BusinessProfile | undefined>;
  createBusinessProfile(profile: InsertBusinessProfile): Promise<BusinessProfile>;
  updateBusinessProfile(profile: Partial<InsertBusinessProfile>): Promise<BusinessProfile | undefined>;



  // Document methods
  getDocuments(): Promise<Document[]>;
  getDocumentsByCustomer(customerId: number): Promise<Document[]>;
  getDocumentsByJob(jobId: number): Promise<Document[]>;
  getDocumentsByEstimate(estimateId: number): Promise<Document[]>;
  getDocumentsByInvoice(invoiceId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;

  // Employee methods
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;

  // Work Order methods
  getWorkOrders(): Promise<(WorkOrder & { customer: Customer; job: Job; assignedTechnician?: Employee })[]>;
  getWorkOrder(id: number): Promise<(WorkOrder & { customer: Customer; job: Job; assignedTechnician?: Employee; tasks: WorkOrderTask[] }) | undefined>;
  getWorkOrdersByJob(jobId: number): Promise<WorkOrder[]>;
  createWorkOrder(workOrder: InsertWorkOrder): Promise<WorkOrder>;
  updateWorkOrder(id: number, workOrder: Partial<InsertWorkOrder>): Promise<WorkOrder | undefined>;
  deleteWorkOrder(id: number): Promise<boolean>;
  createWorkOrderFromEstimate(estimateId: number): Promise<WorkOrder>;

  // Work Order Task methods
  getWorkOrderTasks(workOrderId: number): Promise<WorkOrderTask[]>;
  createWorkOrderTask(task: InsertWorkOrderTask): Promise<WorkOrderTask>;
  updateWorkOrderTask(id: number, task: Partial<InsertWorkOrderTask>): Promise<WorkOrderTask | undefined>;
  deleteWorkOrderTask(id: number): Promise<boolean>;

  // Time Entry methods
  getTimeEntries(): Promise<(TimeEntry & { employee: Employee; workOrder?: WorkOrder; job?: Job })[]>;
  getTimeEntriesByEmployee(employeeId: number): Promise<TimeEntry[]>;
  getTimeEntriesByWorkOrder(workOrderId: number): Promise<TimeEntry[]>;
  createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: number, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined>;
  deleteTimeEntry(id: number): Promise<boolean>;

  // Inventory methods
  getInventoryItems(): Promise<(InventoryItem & { supplier?: Supplier })[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
  getLowStockItems(): Promise<InventoryItem[]>;

  // Supplier methods
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;

  // Equipment methods
  getEquipment(): Promise<(Equipment & { assignedToEmployee?: Employee })[]>;
  getEquipmentItem(id: number): Promise<Equipment | undefined>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, equipment: Partial<InsertEquipment>): Promise<Equipment | undefined>;
  deleteEquipment(id: number): Promise<boolean>;

  // Employee Permission methods
  getEmployeePermissions(employeeId: number): Promise<EmployeePermissions | undefined>;
  createEmployeePermissions(permissions: InsertEmployeePermissions): Promise<EmployeePermissions>;
  updateEmployeePermissions(employeeId: number, permissions: Partial<InsertEmployeePermissions>): Promise<EmployeePermissions | undefined>;
  deleteEmployeePermissions(employeeId: number): Promise<boolean>;

  // Notification methods
  getNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
  generateBusinessNotifications(): Promise<Notification[]>;

  // Lead pipeline methods
  getLeadPipelineStages(): Promise<LeadPipelineStage[]>;
  createLeadPipelineStage(stage: InsertLeadPipelineStage): Promise<LeadPipelineStage>;
  updateLeadPipelineStage(id: number, stage: Partial<InsertLeadPipelineStage>): Promise<LeadPipelineStage | undefined>;
  deleteLeadPipelineStage(id: number): Promise<boolean>;
  
  getLeadPipelineEntries(): Promise<(LeadPipelineEntry & { contact: Customer; stage: LeadPipelineStage })[]>;
  createLeadPipelineEntry(entry: InsertLeadPipelineEntry): Promise<LeadPipelineEntry>;
  updateLeadPipelineEntry(id: number, entry: Partial<InsertLeadPipelineEntry>): Promise<LeadPipelineEntry | undefined>;
  deleteLeadPipelineEntry(id: number): Promise<boolean>;

  // Lead Notes methods
  getLeadNotes(leadPipelineEntryId: number): Promise<LeadNote[]>;
  createLeadNote(note: InsertLeadNote): Promise<LeadNote>;
  updateLeadNote(id: number, note: Partial<InsertLeadNote>): Promise<LeadNote | undefined>;
  deleteLeadNote(id: number): Promise<boolean>;
  getLeadNotesCount(): Promise<Record<number, number>>;

  // Project Updates methods
  getProjectUpdates(contactId: number): Promise<ProjectUpdateWithEmployee[]>;
  createProjectUpdate(update: InsertProjectUpdate): Promise<ProjectUpdate>;
  updateProjectUpdate(id: number, update: Partial<InsertProjectUpdate>): Promise<ProjectUpdate | undefined>;
  deleteProjectUpdate(id: number): Promise<boolean>;

  // Optimized dashboard statistics using repositories
  getDashboardStatsOptimized(): Promise<{
    totalCustomers: number;
    activeJobs: number;
    pendingEstimates: number;
    totalRevenue: number;
  }>;
  getRecentCustomers(limit?: number): Promise<Customer[]>;
  getRecentJobs(limit?: number): Promise<JobWithCustomer[]>;
  getRecentEstimates(limit?: number): Promise<EstimateWithCustomer[]>;
  getRecentInvoices(limit?: number): Promise<InvoiceWithCustomer[]>;
}

export class DatabaseStorage implements IStorage {
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db
      .insert(customers)
      .values(customer)
      .returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updatedCustomer] = await db
      .update(customers)
      .set(customer)
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer || undefined;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getJobs(): Promise<(Job & { customer: Customer })[]> {
    const rows = await db
      .select()
      .from(jobs)
      .leftJoin(customers, eq(jobs.customerId, customers.id))
      .orderBy(desc(jobs.createdAt));
    
    return rows
      .filter(row => row.contacts !== null)
      .map(row => ({ 
        ...row.jobs, 
        customer: row.contacts!
      }));
  }

  async getJob(id: number): Promise<(Job & { customer: Customer }) | undefined> {
    const [result] = await db
      .select()
      .from(jobs)
      .leftJoin(customers, eq(jobs.customerId, customers.id))
      .where(eq(jobs.id, id));
    
    return result && result.contacts ? { ...result.jobs, customer: result.contacts } : undefined;
  }

  async getJobsByCustomer(customerId: number): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.customerId, customerId));
  }

  async createJob(job: InsertJob): Promise<Job> {
    const processedJob: any = { ...job };
    if (processedJob.scheduledDate && typeof processedJob.scheduledDate === 'string') {
      processedJob.scheduledDate = new Date(processedJob.scheduledDate);
    }
    
    const [newJob] = await db
      .insert(jobs)
      .values([processedJob])
      .returning();
    return newJob;
  }

  async updateJob(id: number, job: Partial<InsertJob>): Promise<Job | undefined> {
    const updateData: any = { ...job };
    if (updateData.scheduledDate && typeof updateData.scheduledDate === 'string') {
      updateData.scheduledDate = new Date(updateData.scheduledDate);
    }
    const [updatedJob] = await db
      .update(jobs)
      .set(updateData)
      .where(eq(jobs.id, id))
      .returning();
    return updatedJob || undefined;
  }

  async deleteJob(id: number): Promise<boolean> {
    const result = await db.delete(jobs).where(eq(jobs.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getEstimates(): Promise<(Estimate & { customer: Customer })[]> {
    return await db
      .select()
      .from(estimates)
      .leftJoin(customers, eq(estimates.customerId, customers.id))
      .orderBy(desc(estimates.createdAt))
      .then(rows => rows.map(row => ({ ...row.estimates, customer: row.contacts! })));
  }

  async getEstimate(id: number): Promise<(Estimate & { customer: Customer }) | undefined> {
    const [result] = await db
      .select()
      .from(estimates)
      .leftJoin(customers, eq(estimates.customerId, customers.id))
      .where(eq(estimates.id, id));
    
    return result ? { ...result.estimates, customer: result.contacts! } : undefined;
  }

  async getEstimatesByCustomer(customerId: number): Promise<Estimate[]> {
    return await db.select().from(estimates).where(eq(estimates.customerId, customerId));
  }

  async createEstimate(estimate: InsertEstimate): Promise<Estimate> {
    const estimateData = {
      ...estimate,
      validUntil: estimate.validUntil ? new Date(estimate.validUntil) : null,
      sentAt: estimate.sentAt ? new Date(estimate.sentAt) : null,
      respondedAt: estimate.respondedAt ? new Date(estimate.respondedAt) : null,
    };
    const [newEstimate] = await db
      .insert(estimates)
      .values(estimateData)
      .returning();
    return newEstimate;
  }

  async updateEstimate(id: number, estimate: Partial<InsertEstimate>): Promise<Estimate | undefined> {
    const estimateData: any = { ...estimate };
    if (estimate.validUntil) estimateData.validUntil = new Date(estimate.validUntil);
    if (estimate.sentAt) estimateData.sentAt = new Date(estimate.sentAt);
    if (estimate.respondedAt) estimateData.respondedAt = new Date(estimate.respondedAt);
    
    const [updatedEstimate] = await db
      .update(estimates)
      .set(estimateData)
      .where(eq(estimates.id, id))
      .returning();
    return updatedEstimate || undefined;
  }

  async deleteEstimate(id: number): Promise<boolean> {
    const result = await db.delete(estimates).where(eq(estimates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getInvoices(): Promise<(Invoice & { customer: Customer })[]> {
    return await db
      .select()
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .orderBy(desc(invoices.createdAt))
      .then(rows => rows.map(row => ({ ...row.invoices, customer: row.contacts! })));
  }

  async getInvoice(id: number): Promise<(Invoice & { customer: Customer }) | undefined> {
    const [result] = await db
      .select()
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(eq(invoices.id, id));
    
    return result ? { ...result.invoices, customer: result.contacts! } : undefined;
  }

  async getInvoicesByCustomer(customerId: number): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.customerId, customerId));
  }

  async generateInvoiceNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const yearStr = currentYear.toString();
    
    // Get the count of invoices created this year
    const startOfYear = new Date(currentYear, 0, 1);
    const [result] = await db
      .select({ count: count() })
      .from(invoices)
      .where(gte(invoices.createdAt, startOfYear));
    
    const nextNumber = (result?.count || 0) + 1;
    const paddedNumber = nextNumber.toString().padStart(3, '0');
    
    return `INV-${yearStr}-${paddedNumber}`;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    // Generate invoice number if not provided
    const invoiceNumber = invoice.invoiceNumber || await this.generateInvoiceNumber();
    
    // Calculate required fields
    const totalAmount = parseFloat(invoice.totalAmount.toString());
    const subtotal = invoice.subtotal ? parseFloat(invoice.subtotal.toString()) : totalAmount;
    const taxAmount = invoice.taxAmount ? parseFloat(invoice.taxAmount.toString()) : 0;
    const paidAmount = invoice.paidAmount ? parseFloat(invoice.paidAmount.toString()) : 0;
    const balanceDue = totalAmount - paidAmount;
    
    // Convert date strings to Date objects
    // Create invoice with all required database columns
    const processedInvoice: any = {
      customerId: invoice.customerId,
      jobId: invoice.jobId || null,
      estimateId: invoice.estimateId || null,
      invoiceNumber,
      title: invoice.title || "Invoice",
      description: invoice.description || "",
      subtotal: subtotal.toFixed(2),
      taxRate: invoice.taxRate ? parseFloat(invoice.taxRate.toString()) : 0,
      taxAmount: taxAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      paidAmount: paidAmount.toFixed(2),
      balanceDue: balanceDue.toFixed(2),
      status: invoice.status || "draft",
      paymentTerms: invoice.paymentTerms || "net_30",
      isRecurring: invoice.isRecurring || false,
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
      sentAt: invoice.sentAt ? new Date(invoice.sentAt) : null,
      paidAt: invoice.paidAt ? new Date(invoice.paidAt) : null,
      items: invoice.items || "",
      notes: invoice.notes || "",
      internalNotes: invoice.internalNotes || "",
    };

    // Add new fields if they exist
    if (invoice.title) processedInvoice.title = invoice.title;
    if (invoice.description) processedInvoice.description = invoice.description;
    if (invoice.subtotal) processedInvoice.subtotal = invoice.subtotal;
    if (invoice.taxRate !== undefined) processedInvoice.taxRate = invoice.taxRate;
    if (invoice.taxAmount !== undefined) processedInvoice.taxAmount = invoice.taxAmount;
    if (invoice.balanceDue !== undefined) processedInvoice.balanceDue = invoice.balanceDue;
    if (invoice.paymentTerms) processedInvoice.paymentTerms = invoice.paymentTerms;
    if (invoice.isRecurring !== undefined) processedInvoice.isRecurring = invoice.isRecurring;
    if (invoice.recurringInterval) processedInvoice.recurringInterval = invoice.recurringInterval;
    
    const [newInvoice] = await db
      .insert(invoices)
      .values([processedInvoice])
      .returning();
    return newInvoice;
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    // Only update fields that exist in the schema
    const processedInvoice: any = {};
    
    if (invoice.title !== undefined) processedInvoice.title = invoice.title;
    if (invoice.description !== undefined) processedInvoice.description = invoice.description;
    if (invoice.invoiceNumber !== undefined) processedInvoice.invoiceNumber = invoice.invoiceNumber;
    if (invoice.subtotal !== undefined) processedInvoice.subtotal = invoice.subtotal;
    if (invoice.taxRate !== undefined) processedInvoice.taxRate = invoice.taxRate;
    if (invoice.taxAmount !== undefined) processedInvoice.taxAmount = invoice.taxAmount;
    // Note: Advanced invoice fields not yet in schema
    if (invoice.totalAmount !== undefined) processedInvoice.totalAmount = invoice.totalAmount;
    if (invoice.internalNotes !== undefined) processedInvoice.internalNotes = invoice.internalNotes;
    
    // Handle date fields
    if (invoice.sentAt !== undefined) {
      processedInvoice.sentAt = invoice.sentAt ? (typeof invoice.sentAt === 'string' ? new Date(invoice.sentAt) : invoice.sentAt) : null;
    }
    if (invoice.dueDate !== undefined) {
      processedInvoice.dueDate = invoice.dueDate ? (typeof invoice.dueDate === 'string' ? new Date(invoice.dueDate) : invoice.dueDate) : null;
    }
    if (invoice.paidAt !== undefined) {
      processedInvoice.paidAt = invoice.paidAt ? (typeof invoice.paidAt === 'string' ? new Date(invoice.paidAt) : invoice.paidAt) : null;
    }
    if (invoice.lastReminderSent !== undefined) {
      processedInvoice.lastReminderSent = invoice.lastReminderSent ? (typeof invoice.lastReminderSent === 'string' ? new Date(invoice.lastReminderSent) : invoice.lastReminderSent) : null;
    }
    
    processedInvoice.updatedAt = new Date();
    
    const [updatedInvoice] = await db
      .update(invoices)
      .set(processedInvoice)
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice || undefined;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    const result = await db.delete(invoices).where(eq(invoices.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Payment methods - simplified implementation
  async getPayments(): Promise<any[]> {
    try {
      return await db.select().from(payments).orderBy(desc(payments.createdAt));
    } catch (error) {
      console.log("Payments table not ready, returning empty array");
      return [];
    }
  }

  async getPaymentsByInvoice(invoiceId: number): Promise<any[]> {
    try {
      return await db.select().from(payments).where(eq(payments.invoiceId, invoiceId));
    } catch (error) {
      console.log("Payments table not ready, returning empty array");
      return [];
    }
  }

  async createPayment(payment: any): Promise<any> {
    try {
      const processedPayment = {
        ...payment,
        paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : new Date(),
      };

      const [newPayment] = await db
        .insert(payments)
        .values(processedPayment)
        .returning();

      // Update invoice balance after payment
      if (newPayment) {
        await this.updateInvoiceBalance(newPayment.invoiceId);
      }

      return newPayment;
    } catch (error) {
      console.log("Payment creation failed, table may not be ready:", error);
      throw error;
    }
  }

  async updateInvoiceBalance(invoiceId: number): Promise<void> {
    // Get total payments for this invoice
    const invoicePayments = await db
      .select({ amount: payments.amount })
      .from(payments)
      .where(eq(payments.invoiceId, invoiceId));

    const totalPaid = invoicePayments.reduce((sum, payment) => 
      sum + parseFloat(payment.amount.toString()), 0);

    // Get invoice total
    const [invoice] = await db
      .select({ totalAmount: invoices.totalAmount })
      .from(invoices)
      .where(eq(invoices.id, invoiceId));

    if (invoice) {
      const totalAmount = parseFloat(invoice.totalAmount.toString());
      const balanceDue = totalAmount - totalPaid;
      
      // Determine new status
      let status = 'sent';
      if (balanceDue <= 0) {
        status = 'paid';
      } else if (totalPaid > 0) {
        status = 'partial_paid';
      }

      // Update invoice
      await db
        .update(invoices)
        .set({ 
          paidAmount: totalPaid.toString(),
          balanceDue: Math.max(0, balanceDue).toString(),
          status,
          paidAt: balanceDue <= 0 ? new Date() : null
        })
        .where(eq(invoices.id, invoiceId));
    }
  }

  // Recurring billing methods
  async getRecurringBilling(): Promise<RecurringBilling[]> {
    return await db.select().from(recurringBilling).orderBy(desc(recurringBilling.createdAt));
  }

  async getRecurringBillingByCustomer(customerId: number): Promise<RecurringBilling[]> {
    return await db.select().from(recurringBilling)
      .where(eq(recurringBilling.customerId, customerId));
  }

  async createRecurringBilling(billing: InsertRecurringBilling): Promise<RecurringBilling> {
    const processedBilling = {
      ...billing,
      startDate: billing.startDate ? new Date(billing.startDate) : new Date(),
      endDate: billing.endDate ? new Date(billing.endDate) : null,
      nextBillDate: billing.nextBillDate ? new Date(billing.nextBillDate) : new Date(),
      lastInvoiceDate: billing.lastInvoiceDate ? new Date(billing.lastInvoiceDate) : null,
    };

    const [newBilling] = await db
      .insert(recurringBilling)
      .values(processedBilling)
      .returning();
    return newBilling;
  }

  async updateRecurringBilling(id: number, billing: Partial<InsertRecurringBilling>): Promise<RecurringBilling | undefined> {
    const processedBilling: any = { ...billing };
    if (processedBilling.startDate && typeof processedBilling.startDate === 'string') {
      processedBilling.startDate = new Date(processedBilling.startDate);
    }
    if (processedBilling.endDate && typeof processedBilling.endDate === 'string') {
      processedBilling.endDate = new Date(processedBilling.endDate);
    }
    if (processedBilling.nextBillDate && typeof processedBilling.nextBillDate === 'string') {
      processedBilling.nextBillDate = new Date(processedBilling.nextBillDate);
    }
    if (processedBilling.lastInvoiceDate && typeof processedBilling.lastInvoiceDate === 'string') {
      processedBilling.lastInvoiceDate = new Date(processedBilling.lastInvoiceDate);
    }

    const [updatedBilling] = await db
      .update(recurringBilling)
      .set(processedBilling)
      .where(eq(recurringBilling.id, id))
      .returning();
    return updatedBilling || undefined;
  }

  // User authentication methods for persistent storage
  async getUserByEmail(email: string): Promise<any | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user || undefined;
    } catch (error) {
      console.log("User lookup failed, table may not be ready:", error);
      return undefined;
    }
  }

  async getUserById(id: string): Promise<any | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.log("User lookup failed, table may not be ready:", error);
      return undefined;
    }
  }

  async createUser(userData: any): Promise<any> {
    try {
      const [newUser] = await db
        .insert(users)
        .values(userData)
        .returning();
      return newUser;
    } catch (error) {
      console.log("User creation failed, table may not be ready:", error);
      throw error;
    }
  }

  async updateUser(id: string, userData: any): Promise<any | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();
      return updatedUser || undefined;
    } catch (error) {
      console.log("User update failed:", error);
      throw error;
    }
  }

  async updateUserLastLogin(id: string): Promise<void> {
    try {
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, id));
    } catch (error) {
      console.log("User last login update failed:", error);
    }
  }

  async getCommunications(): Promise<(Communication & { customer: Customer })[]> {
    return await db
      .select()
      .from(communications)
      .leftJoin(customers, eq(communications.customerId, customers.id))
      .orderBy(desc(communications.createdAt))
      .then(rows => rows.map(row => ({ ...row.communications, customer: row.contacts! })));
  }

  async getCommunicationsByCustomer(customerId: number): Promise<Communication[]> {
    return await db.select().from(communications).where(eq(communications.customerId, customerId));
  }

  async createCommunication(communication: InsertCommunication): Promise<Communication> {
    const [newCommunication] = await db
      .insert(communications)
      .values(communication)
      .returning();
    return newCommunication;
  }

  async getDashboardStats(): Promise<{
    totalRevenue: number;
    activeJobs: number;
    newCustomers: number;
    pendingEstimates: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total revenue from paid invoices this month
    const paidInvoices = await db
      .select({ totalAmount: invoices.totalAmount })
      .from(invoices)
      .where(and(
        eq(invoices.status, "paid"),
        gte(invoices.createdAt, startOfMonth)
      ));

    const totalRevenue = paidInvoices.reduce((sum, invoice) => {
      const value = parseFloat(invoice.totalAmount || '0');
      return sum + (isNaN(value) ? 0 : value);
    }, 0);

    // Get active jobs count (scheduled + in_progress)
    const [activeJobsResult] = await db
      .select({ count: count() })
      .from(jobs)
      .where(and(
        not(eq(jobs.status, "completed")),
        not(eq(jobs.status, "cancelled"))
      ));

    // Get new customers this month
    const [newCustomersResult] = await db
      .select({ count: count() })
      .from(customers)
      .where(gte(customers.createdAt, startOfMonth));

    // Get pending estimates
    const [pendingEstimatesResult] = await db
      .select({ count: count() })
      .from(estimates)
      .where(eq(estimates.status, "sent"));

    return {
      totalRevenue: totalRevenue,
      activeJobs: activeJobsResult?.count || 0,
      newCustomers: newCustomersResult?.count || 0,
      pendingEstimates: pendingEstimatesResult?.count || 0,
    };
  }

  // Removed duplicate - using repository pattern implementation below

  async getTodaySchedule(): Promise<(Job & { customer: Customer })[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return await db
      .select()
      .from(jobs)
      .leftJoin(customers, eq(jobs.customerId, customers.id))
      .where(and(
        gte(jobs.scheduledDate, startOfDay),
        lte(jobs.scheduledDate, endOfDay)
      ))
      .orderBy(jobs.scheduledDate)
      .then(rows => rows.map(row => ({ ...row.jobs, customer: row.contacts! })));
  }

  async getBusinessProfile(): Promise<BusinessProfile | undefined> {
    const [profile] = await db.select().from(businessProfiles).limit(1);
    return profile || undefined;
  }

  async createBusinessProfile(profile: InsertBusinessProfile): Promise<BusinessProfile> {
    const [created] = await db
      .insert(businessProfiles)
      .values(profile)
      .returning();
    return created;
  }

  async updateBusinessProfile(profile: Partial<InsertBusinessProfile>): Promise<BusinessProfile | undefined> {
    const existing = await this.getBusinessProfile();
    if (!existing) return undefined;

    const [updated] = await db
      .update(businessProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(businessProfiles.id, existing.id))
      .returning();
    return updated || undefined;
  }

  // Document methods implementation
  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async getDocumentsByCustomer(customerId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.customerId, customerId)).orderBy(desc(documents.createdAt));
  }

  async getDocumentsByJob(jobId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.jobId, jobId)).orderBy(desc(documents.createdAt));
  }

  async getDocumentsByEstimate(estimateId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.estimateId, estimateId)).orderBy(desc(documents.createdAt));
  }

  async getDocumentsByInvoice(invoiceId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.invoiceId, invoiceId)).orderBy(desc(documents.createdAt));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [created] = await db.insert(documents).values(document).returning();
    return created;
  }

  async updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined> {
    const [updated] = await db
      .update(documents)
      .set({ ...document, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Employee methods
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).where(eq(employees.isActive, true)).orderBy(employees.firstName, employees.lastName);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [created] = await db.insert(employees).values(employee).returning();
    return created;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updated] = await db
      .update(employees)
      .set(employee)
      .where(eq(employees.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const result = await db.update(employees)
      .set({ isActive: false })
      .where(eq(employees.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Work Order methods
  async getWorkOrders(): Promise<(WorkOrder & { customer: Customer; job: Job; assignedTechnician?: Employee })[]> {
    const results = await db
      .select()
      .from(workOrders)
      .leftJoin(customers, eq(workOrders.customerId, customers.id))
      .leftJoin(jobs, eq(workOrders.jobId, jobs.id))
      .leftJoin(employees, eq(workOrders.assignedTechnicianId, employees.id))
      .orderBy(desc(workOrders.createdAt));

    return results.map(row => ({
      ...row.work_orders,
      customer: row.contacts!,
      job: row.jobs!,
      assignedTechnician: row.employees || undefined,
    }));
  }

  async getWorkOrder(id: number): Promise<(WorkOrder & { customer: Customer; job: Job; assignedTechnician?: Employee; tasks: WorkOrderTask[] }) | undefined> {
    const [workOrder] = await db
      .select()
      .from(workOrders)
      .leftJoin(customers, eq(workOrders.customerId, customers.id))
      .leftJoin(jobs, eq(workOrders.jobId, jobs.id))
      .leftJoin(employees, eq(workOrders.assignedTechnicianId, employees.id))
      .where(eq(workOrders.id, id));
    
    if (!workOrder) return undefined;

    const tasks = await db
      .select()
      .from(workOrderTasks)
      .where(eq(workOrderTasks.workOrderId, id))
      .orderBy(workOrderTasks.orderIndex);

    return { ...workOrder.work_orders, customer: workOrder.contacts!, job: workOrder.jobs!, assignedTechnician: workOrder.employees || undefined, tasks };
  }

  async getWorkOrdersByJob(jobId: number): Promise<WorkOrder[]> {
    return await db.select().from(workOrders).where(eq(workOrders.jobId, jobId)).orderBy(desc(workOrders.createdAt));
  }

  async createWorkOrder(workOrder: any): Promise<WorkOrder> {
    // Generate work order number
    const countResult = await db.select({ count: count() }).from(workOrders);
    const nextNumber = (countResult[0]?.count || 0) + 1;
    const workOrderNumber = `WO-${nextNumber.toString().padStart(6, '0')}`;
    
    // Insert using Drizzle with proper field mapping
    const newWorkOrder = {
      workOrderNumber: workOrderNumber,
      title: workOrder.title,
      description: workOrder.description || null,
      customerId: workOrder.customer_id,
      jobId: workOrder.job_id,
      estimateId: workOrder.estimate_id || null,
      assignedTechnicianId: workOrder.assigned_technician_id || null,
      status: workOrder.status || 'scheduled',
      priority: workOrder.priority || 'normal',
      scheduledStartDate: workOrder.scheduled_start_date || null,
      scheduledEndDate: workOrder.scheduled_end_date || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [created] = await db.insert(workOrders).values(newWorkOrder).returning();
    return created;
  }

  async updateWorkOrder(id: number, workOrder: Partial<InsertWorkOrder>): Promise<WorkOrder | undefined> {
    const processedWorkOrder: any = { ...workOrder };
    if (processedWorkOrder.scheduledStartDate && typeof processedWorkOrder.scheduledStartDate === 'string') {
      processedWorkOrder.scheduledStartDate = new Date(processedWorkOrder.scheduledStartDate);
    }
    if (processedWorkOrder.scheduledEndDate && typeof processedWorkOrder.scheduledEndDate === 'string') {
      processedWorkOrder.scheduledEndDate = new Date(processedWorkOrder.scheduledEndDate);
    }
    
    const [updated] = await db
      .update(workOrders)
      .set({ ...processedWorkOrder, updatedAt: new Date() })
      .where(eq(workOrders.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteWorkOrder(id: number): Promise<boolean> {
    const result = await db.delete(workOrders).where(eq(workOrders.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async createWorkOrderFromEstimate(estimateId: number): Promise<WorkOrder> {
    const estimate = await this.getEstimate(estimateId);
    if (!estimate) {
      throw new Error('Estimate not found');
    }

    const workOrder: InsertWorkOrder = {
      jobId: estimate.jobId || 0, // This should be required
      estimateId: estimateId,
      customerId: estimate.customerId,
      title: estimate.title,
      description: estimate.description,
      status: 'scheduled',
      priority: 'normal'
    };

    return await this.createWorkOrder(workOrder);
  }

  // Work Order Task methods
  async getWorkOrderTasks(workOrderId: number): Promise<WorkOrderTask[]> {
    return await db
      .select()
      .from(workOrderTasks)
      .where(eq(workOrderTasks.workOrderId, workOrderId))
      .orderBy(workOrderTasks.orderIndex);
  }

  async createWorkOrderTask(task: InsertWorkOrderTask): Promise<WorkOrderTask> {
    const [created] = await db.insert(workOrderTasks).values(task).returning();
    return created;
  }

  async updateWorkOrderTask(id: number, task: Partial<InsertWorkOrderTask>): Promise<WorkOrderTask | undefined> {
    const [updated] = await db
      .update(workOrderTasks)
      .set(task)
      .where(eq(workOrderTasks.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteWorkOrderTask(id: number): Promise<boolean> {
    const result = await db.delete(workOrderTasks).where(eq(workOrderTasks.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Time Entry methods
  async getTimeEntries(): Promise<(TimeEntry & { employee: Employee; workOrder?: WorkOrder; job?: (Job & { customer: Customer }) })[]> {
    const results = await db
      .select()
      .from(timeEntries)
      .leftJoin(employees, eq(timeEntries.employeeId, employees.id))
      .leftJoin(workOrders, eq(timeEntries.workOrderId, workOrders.id))
      .leftJoin(jobs, eq(timeEntries.jobId, jobs.id))
      .leftJoin(customers, eq(jobs.customerId, customers.id))
      .orderBy(desc(timeEntries.createdAt));

    return results.map(row => ({
      ...row.time_entries,
      employee: row.employees!,
      workOrder: row.work_orders || undefined,
      job: row.jobs ? { ...row.jobs, customer: row.contacts! } : undefined,
    }));
  }

  async getTimeEntriesByEmployee(employeeId: number): Promise<TimeEntry[]> {
    return await db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.employeeId, employeeId))
      .orderBy(desc(timeEntries.clockInTime));
  }

  async getTimeEntriesByWorkOrder(workOrderId: number): Promise<TimeEntry[]> {
    return await db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.workOrderId, workOrderId))
      .orderBy(desc(timeEntries.clockInTime));
  }

  async createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry> {
    const processedEntry = {
      ...timeEntry,
      clockInTime: typeof timeEntry.clockInTime === 'string' ? new Date(timeEntry.clockInTime) : timeEntry.clockInTime,
      clockOutTime: timeEntry.clockOutTime ? 
        (typeof timeEntry.clockOutTime === 'string' ? new Date(timeEntry.clockOutTime) : timeEntry.clockOutTime) : 
        undefined
    };
    
    const [created] = await db.insert(timeEntries).values(processedEntry).returning();
    return created;
  }

  async updateTimeEntry(id: number, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined> {
    const processedEntry = {
      ...timeEntry,
      clockInTime: timeEntry.clockInTime ? 
        (typeof timeEntry.clockInTime === 'string' ? new Date(timeEntry.clockInTime) : timeEntry.clockInTime) : 
        undefined,
      clockOutTime: timeEntry.clockOutTime ? 
        (typeof timeEntry.clockOutTime === 'string' ? new Date(timeEntry.clockOutTime) : timeEntry.clockOutTime) : 
        undefined
    };
    
    const [updated] = await db
      .update(timeEntries)
      .set(processedEntry)
      .where(eq(timeEntries.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTimeEntry(id: number): Promise<boolean> {
    const result = await db.delete(timeEntries).where(eq(timeEntries.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Inventory methods
  async getInventoryItems(): Promise<(InventoryItem & { supplier?: Supplier })[]> {
    const results = await db
      .select()
      .from(inventoryItems)
      .leftJoin(suppliers, eq(inventoryItems.supplierId, suppliers.id))
      .where(eq(inventoryItems.isActive, true))
      .orderBy(inventoryItems.name);

    return results.map(row => ({
      ...row.inventory_items,
      supplier: row.suppliers || undefined,
    }));
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item || undefined;
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [created] = await db.insert(inventoryItems).values(item).returning();
    return created;
  }

  async updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const [updated] = await db
      .update(inventoryItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(inventoryItems.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    const result = await db.update(inventoryItems)
      .set({ isActive: false })
      .where(eq(inventoryItems.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventoryItems)
      .where(and(
        eq(inventoryItems.isActive, true),
        lte(inventoryItems.currentStock, inventoryItems.minimumStock)
      ))
      .orderBy(inventoryItems.name);
  }

  // Supplier methods
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).where(eq(suppliers.isActive, true)).orderBy(suppliers.name);
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier || undefined;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [created] = await db.insert(suppliers).values(supplier).returning();
    return created;
  }

  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [updated] = await db
      .update(suppliers)
      .set(supplier)
      .where(eq(suppliers.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    const result = await db.update(suppliers)
      .set({ isActive: false })
      .where(eq(suppliers.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Equipment methods
  async getEquipment(): Promise<(Equipment & { assignedToEmployee?: Employee })[]> {
    const results = await db
      .select()
      .from(equipment)
      .leftJoin(employees, eq(equipment.assignedToEmployeeId, employees.id))
      .where(eq(equipment.isActive, true))
      .orderBy(equipment.name);

    return results.map(row => ({
      ...row.equipment,
      assignedToEmployee: row.employees || undefined,
    }));
  }

  async getEquipmentItem(id: number): Promise<Equipment | undefined> {
    const [item] = await db.select().from(equipment).where(eq(equipment.id, id));
    return item || undefined;
  }

  async createEquipment(equipmentItem: InsertEquipment): Promise<Equipment> {
    const processedEquipment: any = { ...equipmentItem };
    if (processedEquipment.purchaseDate && typeof processedEquipment.purchaseDate === 'string') {
      processedEquipment.purchaseDate = new Date(processedEquipment.purchaseDate);
    }
    
    const [created] = await db.insert(equipment).values([processedEquipment]).returning();
    return created;
  }

  async updateEquipment(id: number, equipmentItem: Partial<InsertEquipment>): Promise<Equipment | undefined> {
    const processedEquipment: any = { ...equipmentItem };
    if (processedEquipment.purchaseDate && typeof processedEquipment.purchaseDate === 'string') {
      processedEquipment.purchaseDate = new Date(processedEquipment.purchaseDate);
    }
    if (processedEquipment.nextMaintenanceDate && typeof processedEquipment.nextMaintenanceDate === 'string') {
      processedEquipment.nextMaintenanceDate = new Date(processedEquipment.nextMaintenanceDate);
    }
    
    const [updated] = await db
      .update(equipment)
      .set(processedEquipment as any)
      .where(eq(equipment.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEquipment(id: number): Promise<boolean> {
    const result = await db.update(equipment)
      .set({ isActive: false })
      .where(eq(equipment.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Employee Permission methods
  async getEmployeePermissions(employeeId: number): Promise<EmployeePermissions | undefined> {
    const [permissions] = await db.select()
      .from(employeePermissions)
      .where(eq(employeePermissions.employeeId, employeeId));
    return permissions;
  }

  async createEmployeePermissions(permissions: InsertEmployeePermissions): Promise<EmployeePermissions> {
    const [created] = await db.insert(employeePermissions)
      .values({
        ...permissions,
        updatedAt: new Date()
      })
      .returning();
    return created;
  }

  async updateEmployeePermissions(employeeId: number, permissions: Partial<InsertEmployeePermissions>): Promise<EmployeePermissions | undefined> {
    const [updated] = await db.update(employeePermissions)
      .set({
        ...permissions,
        updatedAt: new Date()
      })
      .where(eq(employeePermissions.employeeId, employeeId))
      .returning();
    return updated;
  }

  async deleteEmployeePermissions(employeeId: number): Promise<boolean> {
    const result = await db.delete(employeePermissions)
      .where(eq(employeePermissions.employeeId, employeeId));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Notification methods
  async getNotifications(): Promise<Notification[]> {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.businessProfileId, 1)) // TODO: Use actual business profile ID
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications)
      .values({
        ...notification,
        businessProfileId: 1, // TODO: Use actual business profile ID
      })
      .returning();
    return created;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [updated] = await db.update(notifications)
      .set({ 
        isRead: true,
        updatedAt: new Date()
      })
      .where(eq(notifications.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db.delete(notifications)
      .where(eq(notifications.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async generateBusinessNotifications(): Promise<Notification[]> {
    const generatedNotifications: Notification[] = [];
    
    // Get business data for notification generation
    const estimates = await this.getEstimates();
    const jobs = await this.getJobs();
    const invoices = await this.getInvoices();
    
    // Clear expired notifications
    await db.delete(notifications)
      .where(and(
        eq(notifications.businessProfileId, 1),
        lte(notifications.expiresAt, new Date())
      ));
    
    // Generate overdue estimate notifications
    const overdueEstimates = estimates.filter(est => {
      const estimateDate = new Date(est.createdAt);
      const daysDiff = (Date.now() - estimateDate.getTime()) / (1000 * 60 * 60 * 24);
      return est.status === 'pending' && daysDiff > 7;
    });
    
    if (overdueEstimates.length > 0) {
      const notification = await this.createNotification({
        type: 'estimate_overdue',
        title: `${overdueEstimates.length} Overdue Estimate${overdueEstimates.length > 1 ? 's' : ''}`,
        message: `Follow up with customers: ${overdueEstimates.map(e => e.customer.firstName + ' ' + e.customer.lastName).join(', ')}`,
        priority: 'high',
        relatedEntityType: 'estimate',
        relatedEntityId: overdueEstimates[0].id,
        actionUrl: '/estimates',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        businessProfileId: 1,
      });
      generatedNotifications.push(notification);
    }
    
    // Generate today's jobs notifications
    const todayJobs = jobs.filter(job => {
      if (!job.scheduledDate) return false;
      const jobDate = new Date(job.scheduledDate).toDateString();
      const today = new Date().toDateString();
      return jobDate === today && job.status !== 'completed';
    });
    
    if (todayJobs.length > 0) {
      const notification = await this.createNotification({
        type: 'job_today',
        title: `${todayJobs.length} Job${todayJobs.length > 1 ? 's' : ''} Scheduled Today`,
        message: `Upcoming work: ${todayJobs.map(j => j.title).join(', ')}`,
        priority: 'medium',
        relatedEntityType: 'job',
        relatedEntityId: todayJobs[0].id,
        actionUrl: '/jobs',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        businessProfileId: 1,
      });
      generatedNotifications.push(notification);
    }
    
    // Generate overdue invoice notifications
    const overdueInvoices = invoices.filter(inv => {
      const invoiceDate = new Date(inv.createdAt);
      const daysDiff = (Date.now() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24);
      return inv.status === 'sent' && daysDiff > 30;
    });
    
    if (overdueInvoices.length > 0) {
      const totalAmount = overdueInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || '0'), 0);
      const notification = await this.createNotification({
        type: 'invoice_overdue',
        title: `${overdueInvoices.length} Overdue Invoice${overdueInvoices.length > 1 ? 's' : ''}`,
        message: `$${totalAmount.toFixed(2)} pending collection from ${overdueInvoices.map(i => i.customer.firstName + ' ' + i.customer.lastName).join(', ')}`,
        priority: 'urgent',
        relatedEntityType: 'invoice',
        relatedEntityId: overdueInvoices[0].id,
        actionUrl: '/invoices',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        businessProfileId: 1,
      });
      generatedNotifications.push(notification);
    }
    
    // Generate completed jobs notifications
    const recentCompletions = jobs.filter(job => {
      if (job.status !== 'completed' || !job.completedDate) return false;
      const completedDate = new Date(job.completedDate);
      const daysDiff = (Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 3;
    });
    
    if (recentCompletions.length > 0) {
      const notification = await this.createNotification({
        type: 'job_completed',
        title: `${recentCompletions.length} Job${recentCompletions.length > 1 ? 's' : ''} Ready for Invoicing`,
        message: `Generate invoices for: ${recentCompletions.map(j => j.title).join(', ')}`,
        priority: 'medium',
        relatedEntityType: 'job',
        relatedEntityId: recentCompletions[0].id,
        actionUrl: '/invoices',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        businessProfileId: 1,
      });
      generatedNotifications.push(notification);
    }
    
    return generatedNotifications;
  }

  // Lead pipeline methods
  async getLeadPipelineStages(): Promise<LeadPipelineStage[]> {
    return await db
      .select()
      .from(leadPipelineStages)
      .where(eq(leadPipelineStages.isActive, true))
      .orderBy(leadPipelineStages.sortOrder);
  }

  async createLeadPipelineStage(stage: InsertLeadPipelineStage): Promise<LeadPipelineStage> {
    const [newStage] = await db
      .insert(leadPipelineStages)
      .values(stage)
      .returning();
    return newStage;
  }

  async updateLeadPipelineStage(id: number, stage: Partial<InsertLeadPipelineStage>): Promise<LeadPipelineStage | undefined> {
    const [updatedStage] = await db
      .update(leadPipelineStages)
      .set({ ...stage, updatedAt: new Date() })
      .where(eq(leadPipelineStages.id, id))
      .returning();
    return updatedStage || undefined;
  }

  async deleteLeadPipelineStage(id: number): Promise<boolean> {
    const result = await db
      .update(leadPipelineStages)
      .set({ isActive: false })
      .where(eq(leadPipelineStages.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getLeadPipelineEntries(): Promise<(LeadPipelineEntry & { contact: Customer; stage: LeadPipelineStage })[]> {
    const results = await db
      .select()
      .from(leadPipelineEntries)
      .leftJoin(customers, eq(leadPipelineEntries.contactId, customers.id))
      .leftJoin(leadPipelineStages, eq(leadPipelineEntries.stageId, leadPipelineStages.id))
      .orderBy(leadPipelineEntries.enteredStageAt);

    return results.map(row => ({
      ...row.lead_pipeline_entries,
      contact: row.contacts as Customer,
      stage: row.lead_pipeline_stages as LeadPipelineStage,
    }));
  }

  async createLeadPipelineEntry(entry: InsertLeadPipelineEntry): Promise<LeadPipelineEntry> {
    // Process the entry data to handle date conversion
    const processedEntry: any = { ...entry };
    if (processedEntry.expectedCloseDate && typeof processedEntry.expectedCloseDate === 'string') {
      processedEntry.expectedCloseDate = new Date(processedEntry.expectedCloseDate);
    }
    
    const [newEntry] = await db
      .insert(leadPipelineEntries)
      .values([processedEntry])
      .returning();
    return newEntry;
  }

  async updateLeadPipelineEntry(id: number, entry: Partial<InsertLeadPipelineEntry>): Promise<LeadPipelineEntry | undefined> {
    // Process the entry data to handle date conversion
    const processedEntry: any = { ...entry };
    if (processedEntry.expectedCloseDate && typeof processedEntry.expectedCloseDate === 'string') {
      processedEntry.expectedCloseDate = new Date(processedEntry.expectedCloseDate);
    }
    
    const [updatedEntry] = await db
      .update(leadPipelineEntries)
      .set({ ...processedEntry, updatedAt: new Date() })
      .where(eq(leadPipelineEntries.id, id))
      .returning();
    return updatedEntry || undefined;
  }

  async deleteLeadPipelineEntry(id: number): Promise<boolean> {
    const result = await db
      .delete(leadPipelineEntries)
      .where(eq(leadPipelineEntries.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Lead Notes methods
  async getLeadNotes(leadPipelineEntryId: number): Promise<LeadNote[]> {
    try {
      return await db
        .select()
        .from(leadNotes)
        .where(and(eq(leadNotes.leadPipelineEntryId, leadPipelineEntryId), eq(leadNotes.isDeleted, false)))
        .orderBy(desc(leadNotes.createdAt));
    } catch (error) {
      // If table doesn't exist yet, return empty array
      console.warn('Lead notes table not yet available:', error);
      return [];
    }
  }

  async createLeadNote(note: InsertLeadNote): Promise<LeadNote> {
    try {
      const [newNote] = await db
        .insert(leadNotes)
        .values(note)
        .returning();
      return newNote;
    } catch (error) {
      console.error('Error creating lead note:', error);
      throw error;
    }
  }

  async updateLeadNote(id: number, note: Partial<InsertLeadNote>): Promise<LeadNote | undefined> {
    try {
      const [updatedNote] = await db
        .update(leadNotes)
        .set({ ...note, updatedAt: new Date() })
        .where(eq(leadNotes.id, id))
        .returning();
      return updatedNote || undefined;
    } catch (error) {
      console.error('Error updating lead note:', error);
      return undefined;
    }
  }

  async deleteLeadNote(id: number): Promise<boolean> {
    try {
      const result = await db
        .update(leadNotes)
        .set({ isDeleted: true, updatedAt: new Date() })
        .where(eq(leadNotes.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting lead note:', error);
      return false;
    }
  }

  async getLeadNotesCount(): Promise<Record<number, number>> {
    try {
      const counts = await db
        .select({
          leadPipelineEntryId: leadNotes.leadPipelineEntryId,
          count: count(leadNotes.id)
        })
        .from(leadNotes)
        .where(eq(leadNotes.isDeleted, false))
        .groupBy(leadNotes.leadPipelineEntryId);
      
      // Convert to object format { leadId: count }
      const result: Record<number, number> = {};
      counts.forEach(item => {
        result[item.leadPipelineEntryId] = Number(item.count);
      });
      return result;
    } catch (error) {
      console.warn('Lead notes count not yet available:', error);
      return {};
    }
  }

  // Bulk operations for lead pipeline entries
  async bulkUpdateLeadStage(leadIds: number[], stageId: number): Promise<LeadPipelineEntry[]> {
    const updatedEntries = await db
      .update(leadPipelineEntries)
      .set({ 
        stageId: stageId,
        enteredStageAt: new Date(),
        updatedAt: new Date()
      })
      .where(inArray(leadPipelineEntries.id, leadIds))
      .returning();
    return updatedEntries;
  }

  async bulkDeleteLeads(leadIds: number[]): Promise<number> {
    const result = await db
      .delete(leadPipelineEntries)
      .where(eq(leadPipelineEntries.id, leadIds[0])); // Simplified for now
    return result.rowCount || 0;
  }

  // Employee Scheduling Methods
  async getEmployeeSchedule(employeeId: number, startDate: Date, endDate: Date): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(and(
        eq(jobs.assignedTechnicianId, employeeId),
        gte(jobs.scheduledDate, startDate),
        lte(jobs.scheduledDate, endDate)
      ))
      .orderBy(jobs.scheduledDate, jobs.scheduledStartTime);
  }

  async getAvailableEmployees(date: Date, startTime?: string, endTime?: string): Promise<Employee[]> {
    // Get all active employees
    const allEmployees = await db
      .select()
      .from(employees)
      .where(and(
        eq(employees.isActive, true),
        eq(employees.isAvailable, true)
      ));

    // Filter out employees with scheduling conflicts
    const availableEmployees = [];
    for (const employee of allEmployees) {
      const conflicts = await db
        .select()
        .from(jobs)
        .where(and(
          eq(jobs.assignedTechnicianId, employee.id),
          eq(jobs.scheduledDate, date),
          inArray(jobs.status, ['scheduled', 'in_progress'])
        ));

      // Simple availability check - no time conflicts for now
      if (conflicts.length === 0) {
        availableEmployees.push(employee);
      }
    }

    return availableEmployees;
  }

  async assignJobToEmployee(jobId: number, employeeId: number, assignedBy?: number): Promise<Job | undefined> {
    // Validate employee exists and is active
    const employee = await this.getEmployee(employeeId);
    if (!employee || !employee.isActive) {
      throw new Error('Employee not found or inactive');
    }

    // Update job assignment
    const [updatedJob] = await db
      .update(jobs)
      .set({ 
        assignedTechnicianId: employeeId,
        status: 'scheduled'
      })
      .where(eq(jobs.id, jobId))
      .returning();

    return updatedJob;
  }

  async setEmployeeAvailability(employeeId: number, date: Date, availability: InsertEmployeeAvailability): Promise<EmployeeAvailability> {
    // Check if availability record exists for this date
    const [existing] = await db
      .select()
      .from(employeeAvailability)
      .where(and(
        eq(employeeAvailability.employeeId, employeeId),
        eq(employeeAvailability.date, date)
      ));

    if (existing) {
      // Update existing record
      const [updated] = await db
        .update(employeeAvailability)
        .set({
          ...availability,
          updatedAt: new Date()
        })
        .where(eq(employeeAvailability.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new record
      const [created] = await db
        .insert(employeeAvailability)
        .values(availability)
        .returning();
      return created;
    }
  }

  async getEmployeeAvailability(employeeId: number, startDate: Date, endDate: Date): Promise<EmployeeAvailability[]> {
    return await db
      .select()
      .from(employeeAvailability)
      .where(and(
        eq(employeeAvailability.employeeId, employeeId),
        gte(employeeAvailability.date, startDate),
        lte(employeeAvailability.date, endDate)
      ))
      .orderBy(employeeAvailability.date);
  }

  async updateEmployeeAvailabilityStatus(employeeId: number, isAvailable: boolean): Promise<Employee | undefined> {
    const [updated] = await db
      .update(employees)
      .set({ isAvailable })
      .where(eq(employees.id, employeeId))
      .returning();
    return updated;
  }

  // Role-based permission check for job assignment
  async canEmployeeAssignJobs(employeeId: number): Promise<boolean> {
    const employee = await this.getEmployee(employeeId);
    if (!employee) return false;

    // Admin and manager roles can assign jobs
    if (employee.role === 'admin' || employee.role === 'manager') {
      return true;
    }

    // Check specific permissions
    const permissions = await this.getEmployeePermissions(employeeId);
    return permissions?.canCreateAssignJobs || false;
  }

  // Optimized dashboard statistics using repositories
  async getDashboardStatsOptimized(): Promise<{
    totalCustomers: number;
    activeJobs: number;
    pendingEstimates: number;
    totalRevenue: number;
  }> {
    const [totalCustomers, activeJobs, pendingEstimates, totalRevenue] = await Promise.all([
      customerRepository.getTotalCount(),
      jobRepository.getActiveJobsCount(),
      estimateRepository.getPendingEstimatesCount(),
      invoiceRepository.getTotalRevenue()
    ]);

    return {
      totalCustomers,
      activeJobs,
      pendingEstimates,
      totalRevenue
    };
  }

  async getRecentCustomers(limit: number = 10): Promise<Customer[]> {
    return await customerRepository.getRecentCustomers(limit);
  }

  async getRecentJobs(limit: number = 10): Promise<JobWithCustomer[]> {
    return await jobRepository.getRecentJobs(limit);
  }

  async getRecentEstimates(limit: number = 10): Promise<EstimateWithCustomer[]> {
    return await estimateRepository.getRecentEstimates(limit);
  }

  async getRecentInvoices(limit: number = 10): Promise<InvoiceWithCustomer[]> {
    return await invoiceRepository.getRecentInvoices(limit);
  }

  // Project Updates methods implementation using repository pattern
  async getProjectUpdates(contactId: number): Promise<ProjectUpdateWithEmployee[]> {
    return await projectUpdateRepository.findByContactId(contactId);
  }

  async createProjectUpdate(update: InsertProjectUpdate): Promise<ProjectUpdate> {
    return await projectUpdateRepository.create(update);
  }

  async updateProjectUpdate(id: number, update: Partial<InsertProjectUpdate>): Promise<ProjectUpdate | undefined> {
    return await projectUpdateRepository.update(id, update);
  }

  async deleteProjectUpdate(id: number): Promise<boolean> {
    return await projectUpdateRepository.delete(id);
  }
}

export const storage = new DatabaseStorage();
