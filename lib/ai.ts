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

Analyze this inquiry and categorize it as HOT, WARM, or COLD.

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

Output ONLY raw JSON (no backticks, no markdown, no prose):
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
    
    // Attempt to parse JSON robustly
    const result = tryParseCategorizationJson(text);
    if (!result || !result.category) {
      console.warn('AI response did not contain parsable JSON. Falling back to rule-based categorization. Raw:', text);
      return ruleBasedCategorizeLead(message);
    }

    return {
      category: result.category as Category,
      confidence: Number(result.confidence ?? 0.7),
      reasoning: String(result.reasoning ?? 'AI reasoning unavailable'),
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

// Helper: Robust JSON extraction from model text
function tryParseCategorizationJson(text: string): any | null {
  const candidates: string[] = [];
  const trimmed = text.trim();
  candidates.push(trimmed);

  // Extract from fenced code blocks ```json ... ``` or ``` ... ```
  const fenceJson = trimmed.match(/```json[\s\S]*?```/i);
  if (fenceJson) {
    candidates.push(fenceJson[0].replace(/```json/i, '').replace(/```$/, '').trim());
  }
  const fenceAny = trimmed.match(/```[\s\S]*?```/);
  if (fenceAny) {
    candidates.push(fenceAny[0].replace(/```/, '').replace(/```$/, '').trim());
  }

  // Extract substring between first '{' and last '}'
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(trimmed.substring(firstBrace, lastBrace + 1));
  }

  for (const c of candidates) {
    try {
      const obj = JSON.parse(c);
      return obj;
    } catch (_) {
      // continue
    }
  }
  return null;
}
