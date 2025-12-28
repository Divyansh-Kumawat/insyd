import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export type Category = 'HOT' | 'WARM' | 'COLD' | 'PENDING';

export interface CategorizationResult {
  category: Category;
  confidence: number;
  reasoning: string;
}

export async function categorizeLead(
  name: string,
  email: string,
  phone: string,
  company: string | null,
  productInterest: string,
  message: string
): Promise<CategorizationResult> {
  const prompt = `You are an AI assistant helping a material brand (flooring, laminates, lighting) categorize sales leads.

Analyze this inquiry and categorize it as HOT, WARM, or COLD:

Lead Details:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}
- Company: ${company || 'Not provided'}
- Product Interest: ${productInterest}
- Message: ${message}

Categorization Guidelines:
- HOT: Urgent need, mentions budget/timeline, commercial project, bulk order, ready to buy
- WARM: Specific product questions, comparing options, planning phase, genuine interest
- COLD: General browsing, "just looking", vague inquiry, no clear timeline

Respond in JSON format with:
{
  "category": "HOT" | "WARM" | "COLD",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation (max 50 words)"
}`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      // Fallback to rule-based categorization if no API key
      console.warn('GEMINI_API_KEY not found, using rule-based categorization');
      return ruleBasedCategorizeLead(message);
    }

    // Set the API key for Google AI SDK
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt,
      maxOutputTokens: 200,
    });

    // Parse the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    return {
      category: result.category as Category,
      confidence: result.confidence,
      reasoning: result.reasoning,
    };
  } catch (error) {
    console.error('AI categorization failed:', error);
    // Fallback to rule-based
    return ruleBasedCategorizeLead(message);
  }
}

// Fallback rule-based categorization
function ruleBasedCategorizeLead(message: string): CategorizationResult {
  const lowerMessage = message.toLowerCase();
  
  // HOT signals
  const hotKeywords = ['urgent', 'asap', 'immediately', 'budget', 'timeline', 'commercial', 'bulk', 'project', 'contractor'];
  const hotCount = hotKeywords.filter(kw => lowerMessage.includes(kw)).length;
  
  // COLD signals
  const coldKeywords = ['browsing', 'just looking', 'maybe', 'thinking', 'someday'];
  const coldCount = coldKeywords.filter(kw => lowerMessage.includes(kw)).length;
  
  if (hotCount >= 2) {
    return {
      category: 'HOT',
      confidence: 0.75,
      reasoning: `Message contains ${hotCount} urgency/commitment signals`,
    };
  }
  
  if (coldCount >= 1) {
    return {
      category: 'COLD',
      confidence: 0.7,
      reasoning: `Message indicates browsing/no immediate need`,
    };
  }
  
  // Default to WARM
  return {
    category: 'WARM',
    confidence: 0.6,
    reasoning: 'No strong HOT or COLD signals detected',
  };
}
