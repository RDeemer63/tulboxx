import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key"
});

export interface AIEstimateRequest {
  serviceType?: string;
  propertySize?: string;
  location?: string;
  additionalNotes?: string;
  pricingMethod?: string;
  projectDescription?: string;
  complexity?: string;
  customerType?: string;
  additionalRequirements?: string;
}

export async function generateAIEstimate(request: AIEstimateRequest) {
  try {
    const workDetails = request.additionalNotes || request.serviceType || "Service project";
    
    const prompt = `Create a professional estimate title and description for this project:

${workDetails}

Requirements:
- Focus ONLY on the specific work described above
- Write professional, confident content that builds trust
- Explain what will be accomplished and its value
- NO pricing, costs, rates, line items, or dollar amounts
- Return only title and description in JSON format

{
  "title": "Professional project title",
  "description": "Detailed explanation of the work and its value"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 600,
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.title || !result.description) {
      throw new Error("Invalid AI response");
    }

    return {
      title: result.title,
      description: result.description
    };

  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error("Failed to generate estimate content");
  }
}

export async function generateSocialContent(request: any) {
  // Placeholder for social content generation
  return { content: "Social content generation not implemented" };
}

export async function polishText(text: string, fieldType: string, businessType: string, businessName: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: `Polish this ${fieldType} text for a ${businessType} business called ${businessName}:

${text}

Make it professional and engaging while keeping the core meaning.`
      }],
      max_tokens: 300,
      temperature: 0.5
    });

    return response.choices[0].message.content || text;
  } catch (error) {
    console.error("Polish text error:", error);
    return text;
  }
}