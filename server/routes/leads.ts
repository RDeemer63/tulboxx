import express from "express";
import { z } from "zod";
import { leadRepository } from "../repositories/LeadRepository";
import {
  insertLeadSchema,
  insertLeadEventSchema,
  leadStageEnum,
  leadSourceEnum,
} from "../../shared/leads-schema";
import { authenticateUser } from "../middleware/auth-middleware";
import { asyncHandler } from "../utils/async-handler";
import { validateRequest } from "../middleware/validation-middleware";

const leadsRouter = express.Router();

// Apply authentication middleware to all routes in this file
leadsRouter.use(authenticateUser);

// =================================================================
// Zod Schemas for Request Validation
// =================================================================

const uuidParamSchema = z.object({
  id: z.string().uuid({ message: "Invalid lead ID format." }),
});

const listLeadsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  searchTerm: z.string().optional(),
  stage: leadStageEnum.optional(),
  source: leadSourceEnum.optional(),
  assignedTo: z.string().uuid().optional(),
});

const updateStageSchema = z.object({
  stage: leadStageEnum,
});

// =================================================================
// API Endpoints
// =================================================================

/**
 * @route GET /api/leads
 * @description Retrieves a paginated and filtered list of leads.
 * @access Private (requires authentication)
 * @queryParam {number} [page=1] - The page number for pagination.
 * @queryParam {number} [limit=20] - The number of leads per page.
 * @queryParam {string} [searchTerm] - A search term to filter leads by name, email, or phone.
 * @queryParam {LeadStage} [stage] - Filter leads by a specific stage.
 * @queryParam {LeadSource} [source] - Filter leads by a specific source.
 * @queryParam {string} [assignedTo] - Filter leads by the assigned user's ID.
 * @returns {object} 200 - An object containing the list of leads and the total count.
 * @returns {object} 400 - If query parameters are invalid.
 */
leadsRouter.get(
  "/",
  validateRequest({ query: listLeadsQuerySchema }),
  asyncHandler(async (req, res) => {
    const result = await leadRepository.getAll(req.query);
    res.status(200).json(result);
  })
);

/**
 * @route POST /api/leads
 * @description Creates a new lead.
 * @access Private (requires authentication)
 * @body {InsertLead} The lead data to create.
 * @returns {object} 201 - The newly created lead object.
 * @returns {object} 400 - If the request body is invalid.
 */
leadsRouter.post(
  "/",
  validateRequest({ body: insertLeadSchema }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id; // `authenticateUser` middleware ensures user is present
    const newLead = await leadRepository.create(req.body, userId);
    res.status(201).json(newLead);
  })
);

/**
 * @route GET /api/leads/:id
 * @description Retrieves a single lead by its ID, including its timeline events.
 * @access Private (requires authentication)
 * @param {string} id - The UUID of the lead.
 * @returns {object} 200 - The lead object with its events.
 * @returns {object} 404 - If the lead is not found.
 */
leadsRouter.get(
  "/:id",
  validateRequest({ params: uuidParamSchema }),
  asyncHandler(async (req, res) => {
    const lead = await leadRepository.getById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found." });
    }
    res.status(200).json(lead);
  })
);

/**
 * @route PUT /api/leads/:id
 * @description Updates an existing lead's information.
 * @access Private (requires authentication)
 * @param {string} id - The UUID of the lead to update.
 * @body {Partial<InsertLead>} The fields to update.
 * @returns {object} 200 - The updated lead object.
 * @returns {object} 404 - If the lead is not found.
 */
leadsRouter.put(
  "/:id",
  validateRequest({
    params: uuidParamSchema,
    body: insertLeadSchema.partial(),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const updatedLead = await leadRepository.update(
      req.params.id,
      req.body,
      userId
    );
    res.status(200).json(updatedLead);
  })
);

/**
 * @route DELETE /api/leads/:id
 * @description Deletes a lead.
 * @access Private (requires authentication)
 * @param {string} id - The UUID of the lead to delete.
 * @returns {object} 204 - No content, indicating successful deletion.
 * @returns {object} 404 - If the lead is not found.
 */
leadsRouter.delete(
  "/:id",
  validateRequest({ params: uuidParamSchema }),
  asyncHandler(async (req, res) => {
    const success = await leadRepository.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Lead not found." });
    }
    res.status(204).send();
  })
);

/**
 * @route PATCH /api/leads/:id/stage
 * @description Updates the stage of a lead (e.g., from a Kanban drag-and-drop).
 * @access Private (requires authentication)
 * @param {string} id - The UUID of the lead.
 * @body {object} { stage: LeadStage } - The new stage for the lead.
 * @returns {object} 200 - The updated lead object.
 */
leadsRouter.patch(
  "/:id/stage",
  validateRequest({ params: uuidParamSchema, body: updateStageSchema }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { stage } = req.body;
    const updatedLead = await leadRepository.update(
      req.params.id,
      { stage },
      userId
    );
    res.status(200).json(updatedLead);
  })
);

/**
 * @route POST /api/leads/:id/events
 * @description Adds a new event (e.g., a note) to a lead's timeline.
 * @access Private (requires authentication)
 * @param {string} id - The UUID of the lead.
 * @body {Omit<InsertLeadEvent, 'leadId'>} The event data.
 * @returns {object} 201 - The newly created lead event object.
 */
leadsRouter.post(
  "/:id/events",
  validateRequest({
    params: uuidParamSchema,
    body: insertLeadEventSchema.omit({ leadId: true }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    // Create the timeline event and persist it via the repository
    const newEvent = await leadRepository.addEvent(req.params.id, {
      ...req.body,
      createdBy: userId,
    });

    res.status(201).json(newEvent);
  })
);

export default leadsRouter;
