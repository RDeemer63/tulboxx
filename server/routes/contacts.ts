import express, { type Request, Response, NextFunction } from 'express';
import { db } from '../db';
import {
  contacts,
  contactActivities,
  insertContactSchema,
  insertContactActivitySchema,
  type Contact,
  type ContactActivity,
  type InsertContact,
  type InsertContactActivity,
} from '@shared/schema';
import { eq, and, or, ilike, desc, sql, count } from 'drizzle-orm';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { authorize, authorizeRole, Role, type UserContext, type Permission } from '../rbac';

const router = express.Router();

// Zod schema for PATCH requests (allows partial updates)
const updateContactSchema = insertContactSchema.partial().extend({
  // Ensure certain fields cannot be updated via this general PATCH
  // status: z.undefined().optional(), // Status changes should be through specific actions like convert-to-customer
  // convertedAt: z.undefined().optional(),
});

// Helper to get user ID from request (assuming it's set by auth middleware)
const getUserIdFromRequest = (req: Request): string | undefined => {
  const user = req.user as UserContext | undefined;
  return user?.id;
};

// Helper to get employee ID from request (assuming it's set by auth middleware)
const getEmployeeIdFromRequest = (req: Request): number | undefined => {
  const user = req.user as UserContext | undefined;
  return user?.employeeId;
};


// GET /api/contacts - List contacts (leads or customers) with filtering, search, and pagination
router.get('/', authorize(['canViewAllCustomers']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      contactType, // 'lead', 'customer', or undefined for all
      leadSource,
      page = '1',
      pageSize = '15',
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limit = parseInt(pageSize as string, 10);
    const offset = (pageNumber - 1) * limit;

    const conditions = [];

    if (contactType === 'lead') {
      conditions.push(eq(contacts.status, 'lead'));
    } else if (contactType === 'customer') {
      conditions.push(eq(contacts.status, 'customer'));
    } // If no contactType, all statuses are included (respecting other filters)

    if (leadSource) {
      conditions.push(eq(contacts.leadSource, leadSource as string));
    }

    if (search) {
      const searchString = `%${(search as string).toLowerCase()}%`;
      conditions.push(
        or(
          ilike(contacts.firstName, searchString),
          ilike(contacts.lastName, searchString),
          ilike(contacts.email, searchString),
          ilike(contacts.phone, searchString),
          // A raw SQL way to search concatenated first and last name
          sql`lower(concat(${contacts.firstName}, ' ', ${contacts.lastName})) like ${searchString}`
        )
      );
    }

    const combinedCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(contacts)
      .where(combinedCondition)
      .orderBy(desc(contacts.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ totalCount: count() })
      .from(contacts)
      .where(combinedCondition);
    
    const totalCount = totalResult[0]?.totalCount || 0;

    res.json({ data, totalCount });
  } catch (error) {
    next(error);
  }
});

// POST /api/contacts - Create a new contact (defaults to lead)
router.post('/', authorize(['canEditCustomerInfo', 'canCreateAssignJobs']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ensure status is 'lead' if not provided or if it's a type that should default to lead
    const payload = { ...req.body, status: req.body.status || 'lead' };
    const validatedData = insertContactSchema.parse(payload);
    
    const newContactArray = await db.insert(contacts).values(validatedData).returning();
    if (newContactArray.length === 0) {
      return res.status(500).json({ message: 'Failed to create contact' });
    }
    res.status(201).json(newContactArray[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: fromZodError(error).details });
    }
    next(error);
  }
});

// GET /api/contacts/:id - Get a single contact by ID
router.get('/:id', authorize(['canViewAllCustomers']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid contact ID' });
    }
    const contactArray = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    if (contactArray.length === 0) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(contactArray[0]);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/contacts/:id - Update a contact
router.patch('/:id', authorize(['canEditCustomerInfo']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid contact ID' });
    }

    // Ensure certain sensitive fields are not updatable through this generic patch
    const { status, convertedAt, createdAt, ...restOfBody } = req.body;
    if (status || convertedAt || createdAt) {
        // console.warn(`Attempt to update restricted fields (status, convertedAt, createdAt) for contact ${id} ignored.`);
    }

    const validatedData = updateContactSchema.parse(restOfBody);
    if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.'});
    }

    const updatedContactArray = await db
      .update(contacts)
      .set(validatedData)
      .where(eq(contacts.id, id))
      .returning();

    if (updatedContactArray.length === 0) {
      return res.status(404).json({ message: 'Contact not found or no changes made' });
    }
    res.json(updatedContactArray[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: fromZodError(error).details });
    }
    next(error);
  }
});

// DELETE /api/contacts/:id - Delete a contact
router.delete('/:id', authorizeRole([Role.OWNER, Role.MANAGER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid contact ID' });
    }
    const result = await db.delete(contacts).where(eq(contacts.id, id)).returning({ id: contacts.id });
    if (result.length === 0) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// PATCH /api/contacts/:id/convert-to-customer - Convert a lead to a customer
router.patch('/:id/convert-to-customer', authorize(['canEditCustomerInfo']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid contact ID' });
    }
    const updatedContactArray = await db
      .update(contacts)
      .set({ status: 'customer', convertedAt: new Date() })
      .where(and(eq(contacts.id, id), eq(contacts.status, 'lead'))) // Ensure it's actually a lead
      .returning();

    if (updatedContactArray.length === 0) {
      // Could be not found, or already a customer
      const existing = await db.select({status: contacts.status}).from(contacts).where(eq(contacts.id, id)).limit(1);
      if (existing.length === 0) return res.status(404).json({ message: 'Lead not found' });
      if (existing[0].status === 'customer') return res.status(400).json({ message: 'Contact is already a customer' });
      return res.status(400).json({ message: 'Failed to convert lead. It might not be a lead or does not exist.' });
    }
    res.json(updatedContactArray[0]);
  } catch (error) {
    next(error);
  }
});

// --- Contact Activities ---

// GET /api/contacts/:id/activities - List activities for a contact
router.get('/:id/activities', authorize(['canViewAllCustomers']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contactId = parseInt(req.params.id, 10);
    if (isNaN(contactId)) {
      return res.status(400).json({ message: 'Invalid contact ID' });
    }
    const activities = await db
      .select()
      .from(contactActivities)
      .where(eq(contactActivities.contactId, contactId))
      .orderBy(desc(contactActivities.createdAt));
    res.json(activities);
  } catch (error) {
    next(error);
  }
});

// POST /api/contacts/:id/activities - Create a new activity for a contact
router.post('/:id/activities', authorize(['canEditCustomerInfo']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contactId = parseInt(req.params.id, 10);
    if (isNaN(contactId)) {
      return res.status(400).json({ message: 'Invalid contact ID' });
    }

    // Check if contact exists
    const contactExists = await db.select({id: contacts.id}).from(contacts).where(eq(contacts.id, contactId)).limit(1);
    if(contactExists.length === 0) {
        return res.status(404).json({message: 'Contact not found'});
    }

    const employeeId = getEmployeeIdFromRequest(req); // Get employeeId from authenticated user

    const payload = {
      ...req.body,
      contactId,
      createdBy: employeeId, // Set createdBy if employeeId is available
    };
    
    // Remove createdBy if employeeId is undefined, allowing DB default or nullable behavior
    if (employeeId === undefined) {
      delete payload.createdBy;
    }

    const validatedData = insertContactActivitySchema.parse(payload);
    
    const newActivityArray = await db
      .insert(contactActivities)
      .values(validatedData)
      .returning();

    if (newActivityArray.length === 0) {
        return res.status(500).json({message: 'Failed to create activity'});
    }
    res.status(201).json(newActivityArray[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: fromZodError(error).details });
    }
    next(error);
  }
});

export default router;
