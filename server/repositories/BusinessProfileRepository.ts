import { db } from '../db';
import { eq, sql } from 'drizzle-orm';
import {
  businessProfiles,
  insertBusinessProfileSchema,
  type BusinessProfile,
  type InsertBusinessProfile,
} from '../../shared/business-profile-schema';
import { users } from '../../shared/schema';
import { BaseRepository } from './BaseRepository';

/**
 * Repository for managing business profiles in the database.
 * 
 * This repository handles all database operations related to business profiles,
 * including CRUD operations and user associations.
 */
export class BusinessProfileRepository extends BaseRepository {
  /**
   * Create a new business profile.
   * 
   * @param data The business profile data to insert
   * @returns The newly created business profile
   */
  async create(data: InsertBusinessProfile): Promise<BusinessProfile> {
    try {
      // Validate the input data against the schema
      const validatedData = insertBusinessProfileSchema.parse(data);
      
      // Insert the business profile
      const [result] = await db
        .insert(businessProfiles)
        .values(validatedData)
        .returning();
      
      return result;
    } catch (error) {
      this.handleError(error, 'Failed to create business profile');
    }
  }

  /**
   * Get a business profile by ID.
   * 
   * @param id The business profile ID
   * @returns The business profile, or null if not found
   */
  async getById(id: number): Promise<BusinessProfile | null> {
    try {
      const [result] = await db
        .select()
        .from(businessProfiles)
        .where(eq(businessProfiles.id, id))
        .limit(1);
      
      return result || null;
    } catch (error) {
      this.handleError(error, 'Failed to get business profile');
    }
  }

  /**
   * Get a business profile by email.
   * 
   * @param email The business email address
   * @returns The business profile, or null if not found
   */
  async getByEmail(email: string): Promise<BusinessProfile | null> {
    try {
      const [result] = await db
        .select()
        .from(businessProfiles)
        .where(eq(businessProfiles.email, email))
        .limit(1);
      
      return result || null;
    } catch (error) {
      this.handleError(error, 'Failed to get business profile by email');
    }
  }

  /**
   * Get a business profile associated with a specific user.
   * 
   * @param userId The user ID
   * @returns The business profile, or null if not found
   */
  async getByUserId(userId: number): Promise<BusinessProfile | null> {
    try {
      const [result] = await db
        .select({
          businessProfile: businessProfiles,
        })
        .from(users)
        .where(eq(users.id, userId))
        .innerJoin(
          businessProfiles,
          eq(users.businessProfileId, businessProfiles.id)
        )
        .limit(1);
      
      return result?.businessProfile || null;
    } catch (error) {
      this.handleError(error, 'Failed to get business profile by user ID');
    }
  }

  /**
   * Update a business profile.
   * 
   * @param id The business profile ID
   * @param data The updated business profile data
   * @returns The updated business profile
   */
  async update(id: number, data: Partial<InsertBusinessProfile>): Promise<BusinessProfile> {
    try {
      // Update the business profile
      const [result] = await db
        .update(businessProfiles)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(businessProfiles.id, id))
        .returning();
      
      if (!result) {
        throw new Error(`Business profile with ID ${id} not found`);
      }
      
      return result;
    } catch (error) {
      this.handleError(error, 'Failed to update business profile');
    }
  }

  /**
   * Delete a business profile.
   * 
   * @param id The business profile ID
   * @returns True if the business profile was deleted, false otherwise
   */
  async delete(id: number): Promise<boolean> {
    try {
      // Remove business profile associations from users
      await db
        .update(users)
        .set({ businessProfileId: null })
        .where(eq(users.businessProfileId, id));
      
      // Delete the business profile
      const result = await db
        .delete(businessProfiles)
        .where(eq(businessProfiles.id, id));
      
      return !!result;
    } catch (error) {
      this.handleError(error, 'Failed to delete business profile');
    }
  }

  /**
   * Associate a user with a business profile.
   * 
   * @param userId The user ID
   * @param businessProfileId The business profile ID
   * @returns True if the association was successful
   */
  async associateUser(userId: number, businessProfileId: number): Promise<boolean> {
    try {
      // Verify the business profile exists
      const profileExists = await this.getById(businessProfileId);
      if (!profileExists) {
        throw new Error(`Business profile with ID ${businessProfileId} not found`);
      }
      
      // Update the user's business profile association
      await db
        .update(users)
        .set({ businessProfileId })
        .where(eq(users.id, userId));
      
      return true;
    } catch (error) {
      this.handleError(error, 'Failed to associate user with business profile');
    }
  }

  /**
   * Check if a business profile has completed all required sections.
   * 
   * @param id The business profile ID
   * @returns An object with the completion status of each section
   */
  async getCompletionStatus(id: number): Promise<{
    companyInfo: boolean;
    branding: boolean;
    legal: boolean;
    aiPreferences: boolean;
    isComplete: boolean;
  }> {
    try {
      const profile = await this.getById(id);
      if (!profile) {
        throw new Error(`Business profile with ID ${id} not found`);
      }
      
      // Check completion status of each section
      const companyInfo = !!(
        profile.businessName &&
        profile.email &&
        profile.phone &&
        profile.address
      );
      
      const branding = !!(
        profile.logoUrl ||
        profile.primaryColor
      );
      
      const legal = !!(
        profile.defaultEstimateTerms ||
        profile.defaultInvoiceTerms
      );
      
      const aiPreferences = !!(
        profile.brandVoice &&
        profile.communicationStyle
      );
      
      const isComplete = companyInfo && branding && legal && aiPreferences;
      
      return {
        companyInfo,
        branding,
        legal,
        aiPreferences,
        isComplete,
      };
    } catch (error) {
      this.handleError(error, 'Failed to get business profile completion status');
    }
  }
}

export const businessProfileRepository = new BusinessProfileRepository();
