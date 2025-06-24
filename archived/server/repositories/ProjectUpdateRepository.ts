import { db } from "../db";
import { eq, desc, and, count } from "drizzle-orm";
import { 
  projectUpdates, 
  employees,
  contacts,
  type ProjectUpdate, 
  type InsertProjectUpdate 
} from "@shared/schema";

export interface ProjectUpdateWithEmployee extends ProjectUpdate {
  createdByEmployee?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    role: string;
    hireDate: Date | null;
    createdAt: Date;
    notes: string | null;
    hourlyRate: string | null;
    overtimeRate: string | null;
    isActive: boolean | null;
    isAvailable: boolean | null;
  };
}

export class ProjectUpdateRepository {
  async findByContactId(contactId: number): Promise<ProjectUpdateWithEmployee[]> {
    const updates = await db
      .select({
        id: projectUpdates.id,
        contactId: projectUpdates.contactId,
        updateNumber: projectUpdates.updateNumber,
        updateType: projectUpdates.updateType,
        workNeeded: projectUpdates.workNeeded,
        customerRequests: projectUpdates.customerRequests,
        siteConditions: projectUpdates.siteConditions,
        additionalNotes: projectUpdates.additionalNotes,
        createdBy: projectUpdates.createdBy,
        createdAt: projectUpdates.createdAt,
        createdByEmployee: {
          id: employees.id,
          firstName: employees.firstName,
          lastName: employees.lastName,
          email: employees.email,
          phone: employees.phone,
          role: employees.role,
          hireDate: employees.hireDate,
          createdAt: employees.createdAt,
          notes: employees.notes,
          hourlyRate: employees.hourlyRate,
          overtimeRate: employees.overtimeRate,
          isActive: employees.isActive,
          isAvailable: employees.isAvailable,
        }
      })
      .from(projectUpdates)
      .leftJoin(employees, eq(projectUpdates.createdBy, employees.id))
      .where(eq(projectUpdates.contactId, contactId))
      .orderBy(desc(projectUpdates.updateNumber));

    return updates.map(update => ({
      ...update,
      createdByEmployee: update.createdByEmployee?.id ? update.createdByEmployee : undefined
    }));
  }

  async create(data: InsertProjectUpdate): Promise<ProjectUpdate> {
    // Get the next update number for this contact
    const maxUpdateResult = await db
      .select({ count: count() })
      .from(projectUpdates)
      .where(eq(projectUpdates.contactId, data.contactId));
    
    const updateNumber = (maxUpdateResult[0]?.count || 0) + 1;

    const [created] = await db
      .insert(projectUpdates)
      .values({
        ...data,
        updateNumber,
      })
      .returning();

    return created;
  }

  async findById(id: number): Promise<ProjectUpdate | undefined> {
    const [update] = await db
      .select()
      .from(projectUpdates)
      .where(eq(projectUpdates.id, id))
      .limit(1);

    return update;
  }

  async update(id: number, data: Partial<InsertProjectUpdate>): Promise<ProjectUpdate | undefined> {
    const [updated] = await db
      .update(projectUpdates)
      .set(data)
      .where(eq(projectUpdates.id, id))
      .returning();

    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(projectUpdates)
      .where(eq(projectUpdates.id, id));

    return result.rowCount !== null && result.rowCount > 0;
  }

  async getUpdateCountByContact(contactId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(projectUpdates)
      .where(eq(projectUpdates.contactId, contactId));

    return result?.count || 0;
  }

  async getAllUpdates(): Promise<ProjectUpdateWithEmployee[]> {
    const updates = await db
      .select({
        id: projectUpdates.id,
        contactId: projectUpdates.contactId,
        updateNumber: projectUpdates.updateNumber,
        updateType: projectUpdates.updateType,
        workNeeded: projectUpdates.workNeeded,
        customerRequests: projectUpdates.customerRequests,
        siteConditions: projectUpdates.siteConditions,
        additionalNotes: projectUpdates.additionalNotes,
        createdBy: projectUpdates.createdBy,
        createdAt: projectUpdates.createdAt,
        createdByEmployee: {
          id: employees.id,
          firstName: employees.firstName,
          lastName: employees.lastName,
          email: employees.email,
          phone: employees.phone,
          role: employees.role,
          hireDate: employees.hireDate,
          createdAt: employees.createdAt,
          notes: employees.notes,
          hourlyRate: employees.hourlyRate,
          overtimeRate: employees.overtimeRate,
          isActive: employees.isActive,
          isAvailable: employees.isAvailable,
        }
      })
      .from(projectUpdates)
      .leftJoin(employees, eq(projectUpdates.createdBy, employees.id))
      .orderBy(desc(projectUpdates.createdAt));

    return updates;
  }

  async getRecentUpdates(limit: number = 10): Promise<ProjectUpdateWithEmployee[]> {
    const updates = await db
      .select({
        id: projectUpdates.id,
        contactId: projectUpdates.contactId,
        updateNumber: projectUpdates.updateNumber,
        updateType: projectUpdates.updateType,
        workNeeded: projectUpdates.workNeeded,
        customerRequests: projectUpdates.customerRequests,
        siteConditions: projectUpdates.siteConditions,
        additionalNotes: projectUpdates.additionalNotes,
        createdBy: projectUpdates.createdBy,
        createdAt: projectUpdates.createdAt,
        createdByEmployee: {
          id: employees.id,
          firstName: employees.firstName,
          lastName: employees.lastName,
          email: employees.email,
          phone: employees.phone,
          role: employees.role,
          hireDate: employees.hireDate,
          createdAt: employees.createdAt,
          notes: employees.notes,
          hourlyRate: employees.hourlyRate,
          overtimeRate: employees.overtimeRate,
          isActive: employees.isActive,
          isAvailable: employees.isAvailable,
        },
        contactName: {
          firstName: contacts.firstName,
          lastName: contacts.lastName,
        }
      })
      .from(projectUpdates)
      .leftJoin(employees, eq(projectUpdates.createdBy, employees.id))
      .leftJoin(contacts, eq(projectUpdates.contactId, contacts.id))
      .orderBy(desc(projectUpdates.createdAt))
      .limit(limit);

    return updates.map(update => ({
      ...update,
      createdByEmployee: update.createdByEmployee?.id ? update.createdByEmployee : undefined
    }));
  }
}