import { leadRepository } from '../repositories/leadRepository';
import { 
  logLeadActivity, 
  logLeadCall, 
  logLeadEmail, 
  logLeadText, 
  logLeadNote,
  logLeadMeeting,
  logEstimateSent,
  logStageChange,
  logLeadAssigned,
  LeadActivityType
} from '../utils/leadActivityLogger';
import { z } from 'zod';
import { insertLeadSchema, leads } from '../../shared/schema';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/errors';
import { eq, or } from 'drizzle-orm';
import { db } from '../db';
import { jobService } from './jobService';

// Validation schema for creating a lead
const createLeadSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(7, "Valid phone number is required"),
  email: z.string().email("Valid email is required").optional().nullable(),
  serviceType: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  stage: z.enum(['new', 'contacted', 'estimate_sent', 'won', 'lost']).default('new'),
  followUpDate: z.date().optional().nullable(),
  assignedTo: z.string().uuid().optional().nullable(),
});

// Validation schema for updating a lead
const updateLeadSchema = createLeadSchema.partial();

/**
 * Service layer for lead management
 */
export class LeadService {
  /**
   * Get leads with pagination, filtering and search
   */
  async getLeads(params: {
    page?: number;
    limit?: number;
    search?: string;
    stage?: string | string[];
    source?: string | string[];
    serviceType?: string | string[];
    assignedTo?: string;
    hasFollowUp?: boolean;
    sortBy?: keyof typeof leads.$inferSelect;
    sortDirection?: 'asc' | 'desc';
  }) {
    return leadRepository.getLeads(params);
  }

  /**
   * Get leads grouped by stage for Kanban view
   */
  async getLeadsByStage(params: {
    search?: string;
    source?: string | string[];
    serviceType?: string | string[];
    assignedTo?: string;
  }) {
    return leadRepository.getLeadsByStage(params);
  }

  /**
   * Get a single lead by ID with events
   */
  async getLead(id: string) {
    const lead = await leadRepository.getLead(id);
    const events = await leadRepository.getLeadEvents(id);
    return { lead, events };
  }

  /**
   * Find potential duplicate leads based on phone or email
   */
  async findPotentialDuplicates(phone: string, email?: string) {
    const whereConditions = [];
    
    if (phone) {
      whereConditions.push(eq(leads.phone, phone));
    }
    
    if (email) {
      whereConditions.push(eq(leads.email, email));
    }
    
    if (whereConditions.length === 0) {
      return [];
    }
    
    return db.select().from(leads).where(or(...whereConditions));
  }

  /**
   * Create a new lead with validation and duplicate checking
   */
  async createLead(data: any, userId?: string) {
    // Validate lead data
    const validatedData = createLeadSchema.parse(data);
    
    // Check for duplicates
    const duplicates = await this.findPotentialDuplicates(
      validatedData.phone, 
      validatedData.email || undefined
    );
    
    // If duplicates found, return them but don't block creation
    // This allows the UI to show a warning but still proceed if needed
    const hasDuplicates = duplicates.length > 0;
    
    // Create the lead
    const lead = await leadRepository.createLead(validatedData);
    
    // Log the creation activity
    await logLeadActivity(
      lead.id,
      LeadActivityType.CREATED,
      `Lead created: ${lead.fullName}`,
      userId
    );
    
    return {
      lead,
      hasDuplicates,
      duplicates: hasDuplicates ? duplicates : undefined
    };
  }

  /**
   * Update a lead with validation
   */
  async updateLead(id: string, data: any, userId?: string) {
    // Validate update data
    const validatedData = updateLeadSchema.parse(data);
    
    // Check if the lead exists
    await leadRepository.getLead(id);
    
    // If changing phone or email, check for duplicates
    if (validatedData.phone || validatedData.email) {
      const duplicateCheckData = {
        phone: validatedData.phone,
        email: validatedData.email
      };
      
      const duplicates = await this.findPotentialDuplicates(
        duplicateCheckData.phone || '', 
        duplicateCheckData.email || undefined
      );
      
      // Filter out the current lead from duplicates
      const otherDuplicates = duplicates.filter(dupe => dupe.id !== id);
      
      if (otherDuplicates.length > 0) {
        // Return warning about duplicates but don't block update
        const lead = await leadRepository.updateLead(id, validatedData);
        
        // Log the update activity
        await logLeadActivity(
          id,
          'updated',
          `Lead updated: ${JSON.stringify(Object.keys(validatedData))}`,
          userId
        );
        
        return {
          lead,
          hasDuplicates: true,
          duplicates: otherDuplicates
        };
      }
    }
    
    // Update the lead
    const lead = await leadRepository.updateLead(id, validatedData);
    
    // Log the update activity
    await logLeadActivity(
      id,
      'updated',
      `Lead updated: ${JSON.stringify(Object.keys(validatedData))}`,
      userId
    );
    
    return { lead };
  }

  /**
   * Delete a lead
   */
  async deleteLead(id: string, userId?: string) {
    // Check if the lead exists
    await leadRepository.getLead(id);
    
    // Log deletion activity before actually deleting
    if (userId) {
      await logLeadActivity(
        id,
        'deleted',
        'Lead deleted',
        userId
      );
    }
    
    // Delete the lead
    return leadRepository.deleteLead(id);
  }

  /**
   * Add a note to a lead
   */
  async addNote(id: string, note: string, userId: string) {
    // Check if the lead exists
    await leadRepository.getLead(id);
    
    // Log the note activity
    await logLeadNote(id, note, userId);
    
    return { success: true };
  }

  /**
   * Log a call with a lead
   */
  async logCall(
    id: string, 
    notes: string, 
    userId: string, 
    duration?: number, 
    outcome?: string
  ) {
    // Check if the lead exists
    await leadRepository.getLead(id);
    
    // Log the call activity
    await logLeadCall(id, notes, userId, duration, outcome);
    
    // If this is the first call, move lead to 'contacted' stage
    const lead = await leadRepository.getLead(id);
    if (lead.stage === 'new') {
      await this.moveToStage(id, 'contacted', userId, 'Automatically moved after call');
    }
    
    return { success: true };
  }

  /**
   * Log an email with a lead
   */
  async logEmail(
    id: string,
    direction: 'sent' | 'received',
    subject: string,
    userId: string,
    emailContent?: string
  ) {
    // Check if the lead exists
    await leadRepository.getLead(id);
    
    // Log the email activity
    await logLeadEmail(id, direction, subject, userId, emailContent);
    
    // If this is the first contact and email was sent, move lead to 'contacted' stage
    if (direction === 'sent') {
      const lead = await leadRepository.getLead(id);
      if (lead.stage === 'new') {
        await this.moveToStage(id, 'contacted', userId, 'Automatically moved after email');
      }
    }
    
    return { success: true };
  }

  /**
   * Log a text message with a lead
   */
  async logText(
    id: string,
    direction: 'sent' | 'received',
    message: string,
    userId: string
  ) {
    // Check if the lead exists
    await leadRepository.getLead(id);
    
    // Log the text activity
    await logLeadText(id, direction, message, userId);
    
    // If this is the first contact and text was sent, move lead to 'contacted' stage
    if (direction === 'sent') {
      const lead = await leadRepository.getLead(id);
      if (lead.stage === 'new') {
        await this.moveToStage(id, 'contacted', userId, 'Automatically moved after text');
      }
    }
    
    return { success: true };
  }

  /**
   * Log a meeting with a lead
   */
  async logMeeting(
    id: string,
    summary: string,
    userId: string,
    date: Date,
    duration?: number,
    attendees?: string[]
  ) {
    // Check if the lead exists
    await leadRepository.getLead(id);
    
    // Log the meeting activity
    await logLeadMeeting(id, summary, userId, date, duration, attendees);
    
    // If this is the first contact, move lead to 'contacted' stage
    const lead = await leadRepository.getLead(id);
    if (lead.stage === 'new') {
      await this.moveToStage(id, 'contacted', userId, 'Automatically moved after meeting');
    }
    
    return { success: true };
  }

  /**
   * Log an estimate sent to a lead
   */
  async logEstimate(
    id: string,
    estimateId: string | number,
    amount: number,
    userId: string
  ) {
    // Check if the lead exists
    await leadRepository.getLead(id);
    
    // Log the estimate activity
    await logEstimateSent(id, estimateId, amount, userId);
    
    // Move lead to 'estimate_sent' stage
    await this.moveToStage(id, 'estimate_sent', userId, 'Automatically moved after estimate sent');
    
    return { success: true };
  }

  /**
   * Set or update follow-up date
   */
  async setFollowUp(id: string, followUpDate: Date, userId: string) {
    // Check if the lead exists
    await leadRepository.getLead(id);
    
    // Set the follow-up date
    const lead = await leadRepository.setFollowUp(id, followUpDate);
    
    return lead;
  }

  /**
   * Clear follow-up date
   */
  async clearFollowUp(id: string, userId: string) {
    // Check if the lead exists
    await leadRepository.getLead(id);
    
    // Clear the follow-up date
    const lead = await leadRepository.clearFollowUp(id);
    
    return lead;
  }

  /**
   * Get leads with upcoming follow-ups
   */
  async getUpcomingFollowUps(days: number = 7) {
    return leadRepository.getUpcomingFollowUps(days);
  }

  /**
   * Get leads that need follow-up (past due)
   */
  async getOverdueFollowUps() {
    return leadRepository.getOverdueFollowUps();
  }

  /**
   * Move a lead to a different stage
   */
  async moveToStage(id: string, stage: string, userId: string, notes?: string) {
    // Check if the lead exists
    const lead = await leadRepository.getLead(id);
    
    // If stage is the same, do nothing
    if (lead.stage === stage) {
      return lead;
    }
    
    // Log stage change activity
    await logStageChange(id, lead.stage, stage, userId, notes);
    
    // Move the lead to the new stage
    return leadRepository.moveToStage(id, stage, notes);
  }

  /**
   * Assign a lead to a user
   */
  async assignLead(id: string, assignedToUserId: string, assignedByUserId: string) {
    // Check if the lead exists
    await leadRepository.getLead(id);
    
    // Log assignment activity
    await logLeadAssigned(id, assignedToUserId, assignedByUserId);
    
    // Update the lead
    const lead = await leadRepository.updateLead(id, { assignedTo: assignedToUserId });
    
    return lead;
  }

  /**
   * Mark a lead as won and optionally convert to a job
   */
  async markAsWon(id: string, userId: string, convertToJob: boolean = true, jobData: any = {}) {
    // Check if the lead exists
    const lead = await leadRepository.getLead(id);
    
    let jobId: string | undefined = undefined;
    
    // If converting to job, create the job
    if (convertToJob) {
      // Create job data from lead
      const newJobData = {
        ...jobData,
        title: jobData.title || `Job for ${lead.fullName}`,
        description: jobData.description || lead.notes || '',
        serviceType: jobData.serviceType || lead.serviceType || 'general',
        // Other job fields can be added here
      };
      
      // Create the job
      const job = await jobService.createJob(newJobData, userId);
      jobId = job.id;
    }
    
    // Mark the lead as won
    const updatedLead = await leadRepository.markLeadAsWon(id, jobId);
    
    return { 
      lead: updatedLead, 
      jobId, 
      convertedToJob: convertToJob && jobId !== undefined
    };
  }

  /**
   * Mark a lead as lost with optional reason
   */
  async markAsLost(id: string, userId: string, reason?: string) {
    // Check if the lead exists
    await leadRepository.getLead(id);
    
    // Mark the lead as lost
    const lead = await leadRepository.markLeadAsLost(id, reason);
    
    return lead;
  }

  /**
   * Perform bulk actions on multiple leads
   */
  async bulkUpdateStage(ids: string[], stage: string, userId: string, notes?: string) {
    const results = [];
    const errors = [];
    
    for (const id of ids) {
      try {
        const result = await this.moveToStage(id, stage, userId, notes);
        results.push({ id, success: true, result });
      } catch (error) {
        errors.push({ id, success: false, error: error.message });
      }
    }
    
    return { results, errors };
  }

  /**
   * Bulk assign leads to a user
   */
  async bulkAssign(ids: string[], assignedToUserId: string, assignedByUserId: string) {
    const results = [];
    const errors = [];
    
    for (const id of ids) {
      try {
        const result = await this.assignLead(id, assignedToUserId, assignedByUserId);
        results.push({ id, success: true, result });
      } catch (error) {
        errors.push({ id, success: false, error: error.message });
      }
    }
    
    return { results, errors };
  }

  /**
   * Bulk delete leads
   */
  async bulkDelete(ids: string[], userId: string) {
    const results = [];
    const errors = [];
    
    for (const id of ids) {
      try {
        const result = await this.deleteLead(id, userId);
        results.push({ id, success: true, result });
      } catch (error) {
        errors.push({ id, success: false, error: error.message });
      }
    }
    
    return { results, errors };
  }

  /**
   * Get lead statistics
   */
  async getLeadStats() {
    // Count leads by stage
    const leadsByStage = await db.select({
      stage: leads.stage,
      count: sql`count(*)`,
    }).from(leads).groupBy(leads.stage);
    
    // Count leads by source
    const leadsBySource = await db.select({
      source: leads.source,
      count: sql`count(*)`,
    }).from(leads).groupBy(leads.source);
    
    // Count leads by service type
    const leadsByServiceType = await db.select({
      serviceType: leads.serviceType,
      count: sql`count(*)`,
    }).from(leads).groupBy(leads.serviceType);
    
    return {
      byStage: leadsByStage,
      bySource: leadsBySource,
      byServiceType: leadsByServiceType,
    };
  }
}

// Create a singleton instance
export const leadService = new LeadService();
