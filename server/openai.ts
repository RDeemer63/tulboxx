import OpenAI from "openai";
import type { AIEstimateRequest, AISocialContentRequest } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key"
});

export async function generateAIEstimate(request: AIEstimateRequest) {
  try {
    const workDetails = request.additionalNotes || request.serviceType || "Service project";
    
    const prompt = `Create a professional estimate title and description for this specific project:

${workDetails}

Requirements:
- Write a compelling title and description based ONLY on the project details above
- Use professional, confident language that builds trust
- Focus on the specific work described, not generic business categories  
- Explain what will be accomplished and why it matters
- NO pricing, costs, rates, line items, or dollar amounts
- Return ONLY title and description in JSON format

{
  "title": "Professional project title",
  "description": "Detailed explanation of the work and its value"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.5
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.title || !result.description) {
      throw new Error("Invalid AI response format");
    }

    // Ensure we only return title and description - no pricing data
    return {
      title: result.title,
      description: result.description
    };

  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error("Failed to generate estimate content");
  }
}

async function generateDetailedEstimate(request: AIEstimateRequest) {
  try {
    const customerTypeContext = request.customerType === 'commercial' 
      ? "Commercial project with higher quality standards, potential licensing requirements, and business-focused language"
      : "Residential project with homeowner considerations and friendly, accessible language";

    const toneGuidance = request.customerType === 'residential' 
      ? "Use friendly, reassuring language that homeowners can easily understand. Explain benefits and value."
      : "Use professional, industry-standard terminology. Focus on specifications, compliance, and business value.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional service business copywriter who creates compelling estimate descriptions that help win jobs. Your role is to transform technical work descriptions into clear, confidence-building sales content.

          CRITICAL: NEVER include any pricing, costs, rates, dollar amounts, or line item pricing in your response.
          
          Your task: Create professional estimate content that serves as a sales tool by:
          1. CLARITY: Explain what's being done in terms any customer understands
          2. CONFIDENCE: Use authoritative language that builds trust
          3. VALUE: Highlight benefits and quality without being pushy
          4. PROFESSIONALISM: Sound like an established, reliable business
          
          Always return valid JSON with this exact structure:
          {
            "title": "Professional estimate title (no pricing)",
            "description": "Detailed project explanation that builds trust and demonstrates value (no pricing)"
          }`
        },
        {
          role: "user",
          content: `Create a professional estimate description for:
          
          SERVICE: ${request.serviceType}
          PROJECT: ${request.projectDescription}
          
          CONTEXT:
          - ${customerTypeContext}
          - Property size: ${request.propertySize || "Not specified"}
          - Location: ${request.location || "General area"}
          - Additional requirements: ${request.additionalRequirements || "None specified"}
          
          TONE & LANGUAGE: ${toneGuidance}
          
          REQUIREMENTS:
          1. Create a compelling project title and description that serves as a sales tool
          2. Explain what will be accomplished in clear, confident terms
          3. Highlight the value and benefits to the customer
          4. Use professional language that builds trust
          5. Focus on quality, expertise, and customer satisfaction
          6. Do NOT include any pricing, costs, or financial information
          
          Return only valid JSON with no additional text.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate the response structure
    if (!result.title || !result.description) {
      throw new Error("Invalid response format from AI");
    }

    return {
      title: result.title,
      description: result.description
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate detailed estimate. Please ensure your OpenAI API key is configured correctly.");
  }
}

export async function generateSocialContent(request: AISocialContentRequest) {
  try {
    const businessTypeMap: Record<string, string> = {
      "lawn_care": "Lawn Care & Landscaping",
      "plumbing": "Plumbing Services", 
      "electrical": "Electrical Services",
      "excavating": "Excavating & Construction",
      "hvac": "HVAC Services",
      "cleaning": "Cleaning Services",
      "roofing": "Roofing Services"
    };

    const themeMap: Record<string, string> = {
      "seasonal_services": "seasonal services and maintenance tips",
      "customer_testimonials": "customer success stories and testimonials", 
      "before_after": "before and after project showcases",
      "tips_maintenance": "helpful tips and maintenance advice",
      "community_involvement": "community involvement and local partnerships",
      "promotional": "promotional offers and special deals",
      "educational": "educational content about your services"
    };

    const businessType = businessTypeMap[request.businessType] || request.businessType;
    const contentTheme = themeMap[request.contentTheme] || request.contentTheme;

    const prompt = `Create engaging social media content for a ${businessType} business focused on ${contentTheme}.

Generate content for these platforms: ${request.platforms.join(", ")}

For each platform, create:
- Engaging, professional content appropriate for the platform
- Platform-specific formatting and tone
- Relevant hashtags (3-8 per post)
- Content that builds trust and showcases expertise
- Call-to-action when appropriate

Respond with JSON in this exact format:
{
  "content": [
    {
      "platform": "string (facebook/instagram/linkedin)",
      "content": "string (the actual post content)", 
      "hashtags": ["array", "of", "hashtags"]
    }
  ]
}

Make the content authentic, professional, and engaging for a local service business.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a social media expert specializing in content creation for local service businesses. Create authentic, engaging content that builds trust and drives customer engagement."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.8
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate the response structure
    if (!result.content || !Array.isArray(result.content)) {
      throw new Error("Invalid response format from AI");
    }

    // Ensure all requested platforms are included
    const generatedPlatforms = result.content.map((item: any) => item.platform);
    const missingPlatforms = request.platforms.filter(platform => 
      !generatedPlatforms.includes(platform)
    );

    // Add missing platforms if any
    for (const platform of missingPlatforms) {
      result.content.push({
        platform,
        content: `Great content for ${businessType}! Contact us today for professional ${request.contentTheme.replace('_', ' ')} services. We're here to help with all your ${businessType.toLowerCase()} needs.`,
        hashtags: [`#${businessType.replace(/\s+/g, '')}`, "#LocalBusiness", "#ProfessionalService"]
      });
    }

    return {
      content: result.content.map((item: any) => ({
        platform: item.platform,
        content: item.content,
        hashtags: Array.isArray(item.hashtags) ? item.hashtags : []
      }))
    };

  } catch (error) {
    console.error("AI Social Content Generation Error:", error);
    throw new Error(`Failed to generate social content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function polishText(text: string, fieldType: string, businessType: string, businessName: string) {
  try {
    // Different prompts based on field type
    let prompt = "";
    
    if (fieldType === "title") {
      prompt = `Please polish this ${fieldType} for ${businessName}, a ${businessType}:

"${text}"

Requirements:
- Keep it concise (under 10 words if possible)
- Make it clear and professional
- Maintain the original meaning
- Use proper capitalization
- Make it sound professional but not overly verbose

Return only the polished title, no quotes or additional formatting.`;
    } else {
      prompt = `Please polish and improve this ${fieldType} for ${businessName}, a ${businessType}:

"${text}"

Requirements:
- Keep the original meaning and key points
- Fix grammar and improve clarity
- Make it sound professional but natural
- Don't add excessive marketing language
- Keep it straightforward and easy to understand
- Maintain the original tone and length
- Only make necessary improvements

Return only the polished text, no additional formatting or explanation.`;
    }

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional business writing assistant. Your job is to improve and polish text while maintaining the original meaning and authentic voice. Make the text more professional, clear, and compelling while keeping it natural and genuine.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
    });

    const result = response.choices[0].message.content;
    // Remove any wrapping quotes that the AI might add
    return result?.replace(/^["']|["']$/g, '') || result;
  } catch (error) {
    console.error("AI Text Polish Error:", error);
    throw new Error(`Failed to polish text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
