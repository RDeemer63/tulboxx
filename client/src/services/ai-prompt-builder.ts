/**
 * A modular service for building dynamic, context-aware prompts for the OpenAI API.
 * This class centralizes prompt engineering logic, making it easy to maintain and extend.
 */

// =================================================================
// Type Definitions
// =================================================================

/**
 * Defines the contextual information that can be passed to the prompt builder
 * to generate more accurate and relevant AI prompts.
 */
export interface PromptContext {
  serviceType?: string;
  propertyType?: 'residential' | 'commercial';
  customerName?: string;
  existingScope?: string; // The current text in the scope field
  existingLineItemDescription?: string; // The current text for a line item
  lineItems?: { description: string; category?: string }[]; // For context from other items
  businessName?: string; // From Business Profile
  brandVoice?: 'professional' | 'friendly' | 'technical'; // From Business Profile
}

/**
 * Defines the types of actions that can be performed on the main "Scope of Work".
 */
export type ScopePromptType = 'generate' | 'improve' | 'addExclusions' | 'clarifyTimeline';

/**
 * Defines the types of actions that can be performed on a single line item.
 */
export type LineItemPromptType = 'expand' | 'addMaterials' | 'addLabor';

// =================================================================
// PromptBuilder Class
// =================================================================

export class PromptBuilder {
  /**
   * Builds a prompt for generating or refining the main "Scope of Work".
   * @param type - The type of scope modification requested.
   * @param context - The contextual information about the job and business.
   * @returns A string representing the full prompt to be sent to the AI.
   */
  static buildScopePrompt(type: ScopePromptType, context: PromptContext): string {
    const basePersona = `You are an expert estimator for a ${context.serviceType || 'trade service'} company called "${context.businessName || 'a local business'}". Your tone should be ${context.brandVoice || 'professional and friendly'}.`;

    switch (type) {
      case 'generate':
        return `${basePersona}
        Generate a detailed, client-facing scope of work for a ${context.serviceType} job at a ${context.propertyType || ''} property for a client named ${context.customerName || 'the client'}.
        The scope should be clear, comprehensive, and easy for a homeowner to understand. Include sections for materials, labor, and key deliverables.`;

      case 'improve':
        return `${basePersona}
        Review the following scope of work and improve its clarity, professionalism, and structure. Ensure it is client-friendly. Do not add new items, only refine the existing text.
        
        Existing Scope:
        ---
        ${context.existingScope || ''}
        ---`;

      case 'addExclusions':
        return `${basePersona}
        Based on the following scope of work for a ${context.serviceType} job, add a new section at the end titled "Exclusions" that clearly lists common items or tasks that are NOT included in this estimate.
        
        Existing Scope:
        ---
        ${context.existingScope || ''}
        ---`;

      case 'clarifyTimeline':
        return `${basePersona}
        Based on the following scope of work for a ${context.serviceType} job, add a detailed "Timeline" section. Add estimated start and completion dates, including permitting or material lead times if relevant.
        
        Existing Scope:
        ---
        ${context.existingScope || ''}
        ---`;
    }
  }

  /**
   * Builds a prompt for generating or refining a single line item description.
   * @param type - The type of line item modification requested.
   * @param context - The contextual information, including the existing line item text.
   * @returns A string representing the full prompt.
   */
  static buildLineItemPrompt(type: LineItemPromptType, context: PromptContext): string {
    const basePersona = `You are an expert at writing clear and concise descriptions for estimate line items in the ${context.serviceType || 'trade service'} industry. Your tone is ${context.brandVoice || 'professional'}.`;

    switch (type) {
      case 'expand':
        return `${basePersona}
        Expand the following brief line item description into a more detailed, professional one that clearly explains the value to the client.
        
        Original Description:
        ---
        ${context.existingLineItemDescription || ''}
        ---`;

      case 'addMaterials':
        return `${basePersona}
        For the following task, add a bulleted list of the specific materials that are typically included.
        
        Task Description:
        ---
        ${context.existingLineItemDescription || ''}
        ---`;

      case 'addLabor':
        return `${basePersona}
        For the following task, add a brief, client-friendly breakdown of the labor involved.
        
        Task Description:
        ---
        ${context.existingLineItemDescription || ''}
        ---`;
    }
  }

  /**
   * Provides a list of suggested, pre-canned prompts based on common trade services.
   * These can be used to populate a "quick start" menu for users.
   * @param serviceType - The primary service type of the job.
   * @returns An array of suggested prompt strings.
   */
  static getSuggestedScopePrompts(serviceType?: string): { label: string; prompt: string }[] {
    const suggestions = [
      {
        label: 'Describe a tree removal job...',
        prompt: 'Describe a complete tree removal job for a residential client, including stump grinding, debris hauling, and site cleanup.',
      },
      {
        label: 'Explain erosion control scope...',
        prompt: 'Explain what’s included in a standard erosion control project, mentioning silt fences, grading, and seeding.',
      },
      {
        label: 'Summarize a trenching job...',
        prompt: 'Summarize a trenching job for a driveway runoff fix, including excavation, pipe installation, and backfilling.',
      },
    ];

    // Example of context-aware prompt suggestion
    if (serviceType === 'plumbing') {
      suggestions.unshift({
        label: 'Outline a water heater replacement...',
        prompt: 'Outline the scope for a standard tank water heater replacement, including draining the old unit, new connections, and disposal.',
      });
    }

    return suggestions;
  }
}
