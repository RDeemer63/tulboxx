import OpenAI from 'openai';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

// --- Configuration ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ESTIMATE_GENERATION_MODEL = 'gpt-4o'; // Or 'gpt-3.5-turbo' for faster/cheaper, but gpt-4o recommended
const LINE_ITEM_POLISH_MODEL = 'gpt-4o';

if (!OPENAI_API_KEY) {
  console.warn(
    'OPENAI_API_KEY is not set. AI Estimate Generator will not function.',
  );
}

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// --- Zod Schemas for Input Validation ---

export const BusinessContextSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  serviceType: z.string().min(1, 'Primary service type is required'), // e.g., "Landscaping", "Plumbing", "HVAC Repair"
  specialties: z.array(z.string()).optional().default([]), // e.g., ["Residential Lawn Care", "Commercial Irrigation"]
  defaultWarranty: z.string().optional().default('Standard 1-year warranty on labor.'),
  defaultTerms: z.string().optional().default('Payment due upon completion. 50% deposit required for projects over $1000.'),
  // Potentially add more fields like typical pricing structure (e.g., "per hour", "flat rate")
});
export type BusinessContext = z.infer<typeof BusinessContextSchema>;

export const CustomerContextSchema = z.object({
  customerType: z.enum(['residential', 'commercial']),
  customerName: z.string().optional(),
  propertyInfo: z.string().optional(), // e.g., "Single-family home, 2000 sq ft", "Office building, 3 floors"
  specificRequests: z.string().optional(), // Any specific requests from the customer mentioned in notes
});
export type CustomerContext = z.infer<typeof CustomerContextSchema>;

export const GenerateDraftEstimateRequestSchema = z.object({
  fieldNotes: z.string().min(20, 'Field notes must be at least 20 characters long'),
  businessContext: BusinessContextSchema,
  customerContext: CustomerContextSchema,
});
export type GenerateDraftEstimateRequest = z.infer<typeof GenerateDraftEstimateRequestSchema>;

export const PolishLineItemRequestSchema = z.object({
  lineItemDescription: z.string().min(5, 'Line item description is too short'),
  customerType: z.enum(['residential', 'commercial']),
  serviceType: z.string().min(1, 'Service type is required'),
});
export type PolishLineItemRequest = z.infer<typeof PolishLineItemRequestSchema>;


// --- Output Structure for Structured Estimate ---
export interface EstimateLineItem {
  id: string; // UUID generated client-side or here
  description: string;
  quantity: number;
  unit: string; // e.g., 'hours', 'sq ft', 'item', 'job'
  rate: number; // Placeholder, to be filled manually
  amount: number; // Placeholder, calculated as quantity * rate
}

export interface StructuredEstimate {
  estimateNumber?: string; // Placeholder, generated later
  datePrepared: string; // YYYY-MM-DD
  validUntil?: string; // YYYY-MM-DD, e.g., 30 days from preparation
  customerInfo?: { // Optional, can be added later
    name?: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  businessInfo: { // Pre-filled from Business Profile
    name: string;
    // Potentially add address, phone, email, logoUrl from BusinessContext
  };
  executiveSummary: string;
  scopeOfWork: string[]; // Array of scope items
  lineItems: EstimateLineItem[];
  pricingSummary?: { // Structure for manual input
    subtotal: number;
    taxRate?: number; // e.g., 0.08 for 8%
    taxAmount?: number;
    totalAmount: number;
    depositRequired?: number;
  };
  projectTimeline?: string; // e.g., "Estimated 2-3 days completion"
  warrantyInformation?: string;
  termsAndConditions?: string;
  notesForCustomer?: string;
  aiConfidenceScore?: number; // 0-1, how confident AI is in the generation
  rawAiResponse?: string; // For debugging
}

// --- Helper Functions ---

function getToneGuide(customerType: 'residential' | 'commercial'): string {
  if (customerType === 'residential') {
    return 'Warm, empathetic, and trust-building. Focus on peace-of-mind, safety, and convenience. Avoid overly technical jargon. Explain benefits clearly.';
  } else {
    return 'Direct, concise, and professional. Focus on ROI, efficiency, timelines, and compliance. Use clear, professional language. Metrics and quantifiable benefits are valued.';
  }
}

function constructSystemPrompt(serviceType: string, customerType: 'residential' | 'commercial'): string {
  const toneGuide = getToneGuide(customerType);
  return `You are an expert estimator for a ${serviceType} company. Your task is to transform unstructured field notes into a professionally structured estimate.
The target audience is a ${customerType} client.
Adhere to the following tone: ${toneGuide}
You MUST return a valid JSON object matching the specified output format. Do not include any explanatory text before or after the JSON.
The JSON output should include: executiveSummary (string), scopeOfWork (array of strings), lineItems (array of objects with id, description, quantity, unit), projectTimeline (string, optional), warrantyInformation (string, optional), termsAndConditions (string, optional), notesForCustomer (string, optional).
For lineItems, infer quantity and unit if possible from the notes, otherwise default quantity to 1 and unit to 'item' or 'service'. Do NOT invent prices or rates; set rate and amount to 0 for all line items.
Ensure descriptions are clear and action-oriented.
If the notes are too vague or insufficient to create a meaningful estimate, reflect this in the executiveSummary and provide minimal line items.
Generate unique string IDs for each line item (e.g., "li-1", "li-2").
The scopeOfWork should be a list of distinct tasks or service components.
The executiveSummary should be a brief overview of the proposed work, highlighting key benefits for the ${customerType} client.
Base warrantyInformation on common practices for ${serviceType} or the provided default.
Base termsAndConditions on common practices or the provided default.
If a projectTimeline is not clearly inferable, state that it will be confirmed upon project initiation or omit it.
`;
}

function constructUserPrompt(
  fieldNotes: string,
  businessContext: BusinessContext,
  customerContext: CustomerContext,
): string {
  return `
Field Notes:
---
${fieldNotes}
---

Business Context:
- Business Name: ${businessContext.businessName}
- Primary Service: ${businessContext.serviceType}
- Specialties: ${businessContext.specialties.join(', ') || 'N/A'}
- Default Warranty: ${businessContext.defaultWarranty}
- Default Terms: ${businessContext.defaultTerms}

Customer Context:
- Customer Type: ${customerContext.customerType}
- Customer Name (if known): ${customerContext.customerName || 'N/A'}
- Property Info (if known): ${customerContext.propertyInfo || 'N/A'}
- Specific Customer Requests: ${customerContext.specificRequests || 'N/A'}

Output Instructions:
- Generate a structured estimate in the specified JSON format.
- Derive clear line items from the field notes. Maximum of 10-15 line items unless notes are extremely detailed.
- Use present tense action verbs for line item descriptions (e.g., "Install new faucet", "Repair leaking pipe").
- If materials are mentioned, include them in the line item descriptions or as separate line items.
- Ensure executiveSummary is tailored to the customer type.
- Provide a realistic scopeOfWork based on the notes.
- If notes mention phases or distinct parts of a job, try to reflect that in the line items or scope.
- Do not invent information not present or reasonably inferable from the notes.
- All monetary values (rate, amount, subtotal, etc.) in the output JSON must be 0.
`;
}

// --- Main Service Functions ---

export async function generateDraftEstimate(
  request: GenerateDraftEstimateRequest,
): Promise<StructuredEstimate> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. AI features are disabled.');
  }

  try {
    GenerateDraftEstimateRequestSchema.parse(request); // Validate input
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid request for draft estimate: ${fromZodError(error).message}`);
    }
    throw error;
  }

  const { fieldNotes, businessContext, customerContext } = request;

  const systemPrompt = constructSystemPrompt(businessContext.serviceType, customerContext.customerType);
  const userPrompt = constructUserPrompt(fieldNotes, businessContext, customerContext);

  try {
    const completion = await openai.chat.completions.create({
      model: ESTIMATE_GENERATION_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for more factual, less creative output
      max_tokens: 2000, // Adjust as needed based on typical estimate length
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI returned an empty response.');
    }

    let parsedContent: Partial<StructuredEstimate>;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI JSON response:', content);
      throw new Error('AI returned an invalid JSON format. Raw response logged.');
    }
    
    // Post-process and structure the response
    const structuredEstimate: StructuredEstimate = {
      datePrepared: new Date().toISOString().split('T')[0], // Today's date
      businessInfo: {
        name: businessContext.businessName,
      },
      executiveSummary: parsedContent.executiveSummary || 'Summary to be generated.',
      scopeOfWork: Array.isArray(parsedContent.scopeOfWork) ? parsedContent.scopeOfWork : ['Scope to be detailed.'],
      lineItems: (Array.isArray(parsedContent.lineItems) ? parsedContent.lineItems : []).map((item: any, index: number) => ({
        id: item.id || `li-${Date.now()}-${index}`, // Ensure ID exists
        description: item.description || 'Line item description needed.',
        quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
        unit: item.unit || 'item',
        rate: 0, // Always 0 from AI
        amount: 0, // Always 0 from AI
      })),
      projectTimeline: parsedContent.projectTimeline,
      warrantyInformation: parsedContent.warrantyInformation || businessContext.defaultWarranty,
      termsAndConditions: parsedContent.termsAndConditions || businessContext.defaultTerms,
      notesForCustomer: parsedContent.notesForCustomer,
      aiConfidenceScore: completion.choices[0]?.finish_reason === 'stop' ? 0.85 : 0.5, // Basic confidence
      rawAiResponse: process.env.NODE_ENV === 'development' ? content : undefined, // Only include raw in dev
    };
    
    // Add validUntil date (e.g., 30 days from now)
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 30);
    structuredEstimate.validUntil = validUntilDate.toISOString().split('T')[0];

    return structuredEstimate;

  } catch (error: any) {
    console.error('Error calling OpenAI API for estimate generation:', error);
    if (error.response) {
      console.error('OpenAI API Error Details:', error.response.data);
    }
    throw new Error(`AI estimate generation failed: ${error.message}`);
  }
}

export async function polishLineItem(
  request: PolishLineItemRequest,
): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. AI features are disabled.');
  }

  try {
    PolishLineItemRequestSchema.parse(request); // Validate input
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid request for polishing line item: ${fromZodError(error).message}`);
    }
    throw error;
  }
  
  const { lineItemDescription, customerType, serviceType } = request;
  const toneGuide = getToneGuide(customerType);

  const systemPrompt = `You are an expert copywriter specializing in service estimates for ${serviceType} businesses.
Your task is to polish the given line item description to be clear, concise, persuasive, and professional.
The target audience is a ${customerType} client.
Adhere to the following tone: ${toneGuide}
Focus on action verbs and clearly state the service or item. Avoid jargon where possible for residential clients.
Return ONLY the polished line item description as a single string, with no extra formatting or explanation.`;

  const userPrompt = `Original line item description:
---
${lineItemDescription}
---
Polish this description.`;

  try {
    const completion = await openai.chat.completions.create({
      model: LINE_ITEM_POLISH_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5, // Moderate temperature for some creativity but still factual
      max_tokens: 150, // Line items are usually short
    });

    const polishedDescription = completion.choices[0]?.message?.content?.trim();
    if (!polishedDescription) {
      throw new Error('AI returned an empty response for polishing.');
    }
    return polishedDescription;

  } catch (error: any) {
    console.error('Error calling OpenAI API for line item polishing:', error);
    throw new Error(`AI line item polishing failed: ${error.message}`);
  }
}

// Example Usage (for testing purposes, normally called from an API route)
/*
async function testGenerator() {
  if (!OPENAI_API_KEY) return;

  const sampleRequest: GenerateDraftEstimateRequest = {
    fieldNotes: "Customer wants a new privacy fence, about 150 feet long, 6ft high. Wooden, cedar. Gate on the right side. Ground is mostly level, some roots near the old oak tree. Also asked about staining options. Project for residential backyard. Needs it done by end of next month. Client name is Jane Doe, property is typical suburban house.",
    businessContext: {
      businessName: "Tim's Fencing Co.",
      serviceType: "Fence Installation and Repair",
      specialties: ["Wooden Privacy Fences", "Cedar Fencing", "Gate Installation"],
      defaultWarranty: "5-year warranty on workmanship, 1-year on materials.",
      defaultTerms: "50% deposit due upon acceptance, balance due upon completion. Prices valid for 30 days."
    },
    customerContext: {
      customerType: 'residential',
      customerName: 'Jane Doe',
      propertyInfo: 'Typical suburban house with a backyard.',
      specificRequests: 'Wants staining options discussed.'
    }
  };

  try {
    console.log("Generating draft estimate...");
    const estimate = await generateDraftEstimate(sampleRequest);
    console.log("Generated Estimate:", JSON.stringify(estimate, null, 2));

    if (estimate.lineItems.length > 0) {
      console.log("\nPolishing first line item...");
      const polished = await polishLineItem({
        lineItemDescription: estimate.lineItems[0].description,
        customerType: sampleRequest.customerContext.customerType,
        serviceType: sampleRequest.businessContext.serviceType
      });
      console.log("Polished Description:", polished);
    }

  } catch (error) {
    console.error("Test failed:", error);
  }
}

// testGenerator(); // Uncomment to run test if OPENAI_API_KEY is set
*/
