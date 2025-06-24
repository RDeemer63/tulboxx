import OpenAI from "openai";
import type { FieldNotesToEstimateRequest } from "@shared/schema";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key"
});

export interface AIEstimateContent {
  title: string;
  projectDescription: string;
  scopeOfWork: string;
  warrantiesAndBenefits: string;
  metadata: {
    processingTimestamp: string;
    customerType: string;
    tone: string;
    painPointsIdentified: string[];
    keySellingPoints: string[];
  };
}

export async function generateEstimateFromFieldNotes(request: FieldNotesToEstimateRequest): Promise<AIEstimateContent> {
  try {
    const customerType = request.propertyType;
    const tone = request.estimatePreferences?.tone || "professional";
    const detailLevel = request.estimatePreferences?.detailLevel || "detailed";
    
    // Build comprehensive context for AI
    const contextPrompt = buildContextualPrompt(request, customerType, tone, detailLevel);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: getSystemPrompt(customerType, tone)
        },
        {
          role: "user",
          content: contextPrompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2500,
      temperature: 0.4
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.title || !result.projectDescription || !result.scopeOfWork || !result.warrantiesAndBenefits) {
      throw new Error("Invalid AI response format");
    }

    return {
      title: result.title,
      projectDescription: result.projectDescription,
      scopeOfWork: result.scopeOfWork,
      warrantiesAndBenefits: result.warrantiesAndBenefits,
      metadata: {
        processingTimestamp: new Date().toISOString(),
        customerType,
        tone,
        painPointsIdentified: result.painPointsIdentified || [],
        keySellingPoints: result.keySellingPoints || []
      }
    };

  } catch (error) {
    console.error("AI estimate generation error:", error);
    throw new Error("Failed to generate estimate content from field notes");
  }
}

function getSystemPrompt(customerType: string, tone: string): string {
  const basePrompt = `You are a professional service business expert who transforms technician field notes into compelling, client-ready estimates. Your expertise spans residential and commercial service industries including landscaping, plumbing, electrical, HVAC, cleaning, and construction.`;

  const customerSpecificGuidance = customerType === "residential" 
    ? `RESIDENTIAL CUSTOMER APPROACH:
       - Use emotional intelligence - address homeowner concerns about safety, family, property value
       - Explain benefits in terms of comfort, peace of mind, and home improvement
       - Use accessible language while maintaining professionalism
       - Focus on quality, reliability, and warranty protection
       - Address common homeowner pain points: disruption, mess, timeline, durability`
    : `COMMERCIAL CUSTOMER APPROACH:
       - Use direct, business-focused language emphasizing efficiency and ROI
       - Highlight compliance, productivity gains, and operational benefits
       - Include relevant regulations, codes, and industry standards
       - Focus on minimal business disruption and professional execution
       - Emphasize liability protection and insurance considerations`;

  const toneGuidance = {
    professional: "Use authoritative, expert language that builds confidence and trust",
    friendly: "Use warm, approachable language while maintaining professionalism", 
    technical: "Use precise technical terminology appropriate for knowledgeable clients"
  }[tone];

  return `${basePrompt}

${customerSpecificGuidance}

TONE GUIDANCE: ${toneGuidance}

CORE EXPERTISE:
- Transform rough field observations into polished sales content
- Identify and address customer pain points from context clues
- Build value propositions that justify professional service pricing
- Create clear, actionable scope descriptions that prevent misunderstandings
- Leverage industry knowledge to demonstrate expertise and professionalism`;
}

function buildContextualPrompt(request: FieldNotesToEstimateRequest, customerType: string, tone: string, detailLevel: string): string {
  const painPointGuidance = customerType === "residential"
    ? "Common residential pain points to address: safety concerns, family disruption, property damage risk, aesthetic appearance, long-term durability, maintenance requirements"
    : "Common commercial pain points to address: business disruption, employee safety, regulatory compliance, operational efficiency, cost management, liability exposure";

  return `Transform these field notes into a professional estimate with these sections:

FIELD NOTES TO TRANSFORM:
"${request.fieldNotes}"

PROJECT CONTEXT:
- Service Type: ${request.serviceType}
- Customer: ${request.customerContext.firstName} ${request.customerContext.lastName}
- Property Type: ${customerType}
- Address: ${request.customerContext.address || "Not specified"}
- Additional Customer Notes: ${request.customerContext.notes || "None"}

BUSINESS CONTEXT:
- Company: ${request.businessContext.businessName}
- Specializations: ${request.businessContext.specializations?.join(", ") || "General services"}
- Warranties Available: ${request.businessContext.warranties || "Standard warranty applies"}
- Insurance: ${request.businessContext.insuranceInfo || "Fully licensed and insured"}

PAIN POINT AWARENESS:
${painPointGuidance}

DETAIL LEVEL: ${detailLevel} - ${detailLevel === "basic" ? "concise but complete" : detailLevel === "detailed" ? "thorough explanations" : "comprehensive with technical details"}

Generate a JSON response with this exact structure:
{
  "title": "Professional estimate title that captures the project scope and value",
  "projectDescription": "Compelling paragraph describing the project, its importance, and expected outcomes. Address customer pain points and build confidence in your expertise.",
  "scopeOfWork": "Detailed breakdown of exactly what work will be performed, materials used, and process followed. Use bullet points or numbered lists for clarity. Demonstrate technical knowledge and thoroughness.",
  "warrantiesAndBenefits": "Final paragraph covering warranties, guarantees, insurance coverage, and why choosing your company provides value and peace of mind. Include relevant certifications or special qualifications.",
  "painPointsIdentified": ["list of customer pain points you identified from context"],
  "keySellingPoints": ["list of key value propositions that differentiate this service"]
}

REQUIREMENTS:
- NO pricing, costs, rates, or dollar amounts anywhere
- Use specific technical details from field notes to demonstrate expertise
- Address the identified customer type's primary concerns
- Build trust through professional language and industry knowledge
- Create content that helps win the job by showing value and expertise`;
}

export async function enhanceExistingEstimate(estimateContent: string, customerType: string, businessContext: any): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional service business copywriter. Enhance existing estimate content to be more compelling and professional while maintaining all original information.`
        },
        {
          role: "user",
          content: `Enhance this estimate content for a ${customerType} customer:

Original Content:
${estimateContent}

Business Context:
${JSON.stringify(businessContext, null, 2)}

Make it more professional, compelling, and customer-focused while keeping all technical details intact.`
        }
      ],
      max_tokens: 1500,
      temperature: 0.3
    });

    return response.choices[0].message.content || estimateContent;

  } catch (error) {
    console.error("Estimate enhancement error:", error);
    return estimateContent; // Return original if enhancement fails
  }
}