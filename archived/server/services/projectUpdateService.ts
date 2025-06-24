import { projectUpdateRepository } from "../repositories";
import type { ProjectUpdate, InsertProjectUpdate } from "@shared/schema";
import type { ProjectUpdateWithEmployee } from "../repositories/ProjectUpdateRepository";

export class ProjectUpdateService {
  async getProjectUpdatesForContact(contactId: number): Promise<ProjectUpdateWithEmployee[]> {
    return await projectUpdateRepository.findByContactId(contactId);
  }

  async createProjectUpdate(data: InsertProjectUpdate): Promise<ProjectUpdate> {
    // Validate that at least one field has content
    const hasContent = data.workNeeded || data.customerRequests || 
                      data.siteConditions || data.additionalNotes;
    
    if (!hasContent) {
      throw new Error("At least one field must contain content");
    }

    return await projectUpdateRepository.create(data);
  }

  async updateProjectUpdate(id: number, data: Partial<InsertProjectUpdate>): Promise<ProjectUpdate> {
    const existing = await projectUpdateRepository.findById(id);
    if (!existing) {
      throw new Error("Project update not found");
    }

    const updated = await projectUpdateRepository.update(id, data);
    if (!updated) {
      throw new Error("Failed to update project update");
    }

    return updated;
  }

  async deleteProjectUpdate(id: number): Promise<void> {
    const existing = await projectUpdateRepository.findById(id);
    if (!existing) {
      throw new Error("Project update not found");
    }

    const success = await projectUpdateRepository.delete(id);
    if (!success) {
      throw new Error("Failed to delete project update");
    }
  }

  async getUpdateCount(contactId: number): Promise<number> {
    return await projectUpdateRepository.getUpdateCountByContact(contactId);
  }

  async getRecentUpdates(limit: number = 10): Promise<ProjectUpdateWithEmployee[]> {
    return await projectUpdateRepository.getRecentUpdates(limit);
  }

  async getAllProjectUpdates(): Promise<ProjectUpdateWithEmployee[]> {
    return await projectUpdateRepository.getAllUpdates();
  }
}

export const projectUpdateService = new ProjectUpdateService();