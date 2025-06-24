import { db } from "../db";
import { and, desc, eq, ilike, or, count } from "drizzle-orm";
import {
  leads,
  leadEvents,
  insertLeadSchema,
  type Lead,
  type InsertLead,
  type LeadEvent,
  type InsertLeadEvent,
  type LeadStage,
} from "../../shared/leads-schema";
import { BaseRepository } from "./BaseRepository";

interface GetAllLeadsOptions {
  page?: number;
  limit?: number;
  stage?: LeadStage;
  source?: string;
  searchTerm?: string;
  assignedTo?: string;
}

interface GetAllLeadsResult {
  data: Lead[];
  totalCount: number;
}

/**
 * Repository for managing leads and their timeline events in the database.
 *
 * This class encapsulates all database operations for the Leads module,
 * including CRUD operations, stage transitions, and activity logging.
 */
export class LeadRepository extends BaseRepository {
  /**
   * Creates a new lead and logs the creation event in its timeline.
   * @param data - The data for the new lead.
   * @param createdBy - The ID of the user creating the lead.
   * @returns The newly created lead object.
   */
  async create(data: InsertLead, createdBy: string): Promise<Lead> {
    try {
      const validatedData = insertLeadSchema.parse(data);
      const [newLead] = await db.insert(leads).values(validatedData).returning();

      // Automatically add a "Lead Created" event to the timeline.
      await this._addTimelineEvent(newLead.id, {
        type: "status_change",
        content: `Lead created and moved to '${newLead.stage}' stage.`,
        meta: { toStage: newLead.stage },
        createdBy,
      });

      return newLead;
    } catch (error) {
      this.handleError(error, "Failed to create lead");
    }
  }

  /**
   * Retrieves a single lead by its ID, including all its timeline events.
   * @param id - The UUID of the lead to retrieve.
   * @returns The lead object with its events, or null if not found.
   */
  async getById(id: string): Promise<(Lead & { events: LeadEvent[] }) | null> {
    try {
      const [result] = await db.query.leads.findMany({
        where: eq(leads.id, id),
        with: {
          events: {
            orderBy: [desc(leadEvents.createdAt)],
          },
        },
        limit: 1,
      });
      return result || null;
    } catch (error) {
      this.handleError(error, "Failed to retrieve lead by ID");
    }
  }

  /**
   * Retrieves a paginated and filtered list of leads.
   * @param options - Filtering and pagination options.
   * @returns An object containing the list of leads and the total count.
   */
  async getAll(options: GetAllLeadsOptions): Promise<GetAllLeadsResult> {
    try {
      const {
        page = 1,
        limit = 10,
        stage,
        source,
        searchTerm,
        assignedTo,
      } = options;
      const offset = (page - 1) * limit;

      const whereClauses = [];
      if (stage) {
        whereClauses.push(eq(leads.stage, stage));
      }
      if (source) {
        whereClauses.push(eq(leads.source, source));
      }
      if (assignedTo) {
        whereClauses.push(eq(leads.assignedTo, assignedTo));
      }
      if (searchTerm) {
        const searchPattern = `%${searchTerm}%`;
        whereClauses.push(
          or(
            ilike(leads.leadName, searchPattern),
            ilike(leads.email, searchPattern),
            ilike(leads.phone, searchPattern)
          )
        );
      }

      const combinedWhere = and(...whereClauses);

      const dataPromise = db.query.leads.findMany({
        where: combinedWhere,
        orderBy: [desc(leads.createdAt)],
        limit,
        offset,
      });

      const totalCountPromise = db
        .select({ value: count() })
        .from(leads)
        .where(combinedWhere);

      const [data, totalCountResult] = await Promise.all([
        dataPromise,
        totalCountPromise,
      ]);

      return {
        data,
        totalCount: totalCountResult[0].value,
      };
    } catch (error) {
      this.handleError(error, "Failed to retrieve leads");
    }
  }

  /**
   * Updates a lead's information. If the stage is changed, it logs a specific timeline event.
   * @param id - The UUID of the lead to update.
   * @param data - The partial data to update.
   * @param updatedBy - The ID of the user performing the update.
   * @returns The updated lead object.
   */
  async update(
    id: string,
    data: Partial<InsertLead>,
    updatedBy: string
  ): Promise<Lead> {
    try {
      const [currentLead] = await db
        .select({ stage: leads.stage })
        .from(leads)
        .where(eq(leads.id, id));

      if (!currentLead) {
        throw new Error("Lead not found");
      }

      // If the stage is being updated, handle it as a special case to log the transition.
      if (data.stage && data.stage !== currentLead.stage) {
        await this._updateStage(id, data.stage, currentLead.stage, updatedBy);
        // Remove stage from the data object so it's not updated twice.
        delete data.stage;
      }

      // If there are other fields to update, perform the update.
      if (Object.keys(data).length > 0) {
        const [updatedLead] = await db
          .update(leads)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(leads.id, id))
          .returning();
        return updatedLead;
      }

      // If only stage was updated, refetch the lead to return the complete object.
      return (await this.getById(id)) as Lead;
    } catch (error) {
      this.handleError(error, "Failed to update lead");
    }
  }

  /**
   * Deletes a lead from the database.
   * @param id - The UUID of the lead to delete.
   * @returns A boolean indicating if the deletion was successful.
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.delete(leads).where(eq(leads.id, id));
      return result.rowCount > 0;
    } catch (error) {
      this.handleError(error, "Failed to delete lead");
    }
  }

  /**
   * Public helper that allows external callers (e.g., API routes) to push a new
   * event into a lead's timeline.  It simply proxies to the internal
   * `_addTimelineEvent` method while providing repository-level error handling.
   *
   * @param leadId  The UUID of the lead to which the event should be attached.
   * @param eventData  The event payload *excluding* the `leadId` (added here).
   * @returns The newly created {@link LeadEvent}.
   */
  async addEvent(
    leadId: string,
    eventData: Omit<InsertLeadEvent, "leadId">
  ): Promise<LeadEvent> {
    try {
      // Optionally verify the lead exists to return a 404-like error earlier.
      const exists = await db
        .select({ id: leads.id })
        .from(leads)
        .where(eq(leads.id, leadId))
        .limit(1);

      if (exists.length === 0) {
        throw new Error("Lead not found");
      }

      return await this._addTimelineEvent(leadId, eventData);
    } catch (error) {
      this.handleError(error, "Failed to add lead timeline event");
    }
  }

  /**
   * Adds a new event to a lead's timeline.
   * @param leadId - The UUID of the lead.
   * @param eventData - The event data to add.
   * @returns The newly created lead event.
   */
  private async _addTimelineEvent(
    leadId: string,
    eventData: Omit<InsertLeadEvent, "leadId">
  ): Promise<LeadEvent> {
    try {
      const [newEvent] = await db
        .insert(leadEvents)
        .values({ ...eventData, leadId })
        .returning();
      return newEvent;
    } catch (error) {
      // Internal method, so we let the caller handle the error via its own try/catch.
      console.error("Failed to add timeline event:", error);
      throw error;
    }
  }

  /**
   * Updates the stage of a lead and logs the change as a timeline event.
   * @param id - The UUID of the lead.
   * @param newStage - The new stage to set.
   * @param oldStage - The previous stage.
   * @param updatedBy - The ID of the user making the change.
   */
  private async _updateStage(
    id: string,
    newStage: LeadStage,
    oldStage: LeadStage,
    updatedBy: string
  ): Promise<void> {
    try {
      await db
        .update(leads)
        .set({ stage: newStage, updatedAt: new Date() })
        .where(eq(leads.id, id));

      await this._addTimelineEvent(id, {
        type: "status_change",
        content: `Stage changed from '${oldStage}' to '${newStage}'.`,
        meta: { fromStage: oldStage, toStage: newStage },
        createdBy: updatedBy,
      });
    } catch (error) {
      console.error("Failed to update lead stage:", error);
      throw error;
    }
  }
}

// Export a singleton instance of the repository
export const leadRepository = new LeadRepository();
