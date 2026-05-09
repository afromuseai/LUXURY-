import { nvidiaClient, NVIDIA_MODELS, extractUsage } from "./nvidia";

export type BusinessDomain =
  | "automation"
  | "marketing"
  | "operations"
  | "growth_strategy"
  | "ai_integration"
  | "brand_positioning";

export interface BusinessAssistantParams {
  question: string;
  domain?: BusinessDomain;
  businessContext?: string;
  industry?: string;
}

export interface BusinessResult {
  answer: string;
  recommendations: string[];
  nextSteps: string[];
  domain?: BusinessDomain;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const DOMAIN_CONTEXT: Record<BusinessDomain, string> = {
  automation:
    "Focus on workflow automation, process optimization, eliminating manual tasks, and ROI from automation initiatives.",
  marketing:
    "Focus on AI-powered marketing, personalization, lead generation, conversion optimization, and growth marketing strategies.",
  operations:
    "Focus on operational efficiency, team productivity, systems design, scalability, and reducing operational overhead.",
  growth_strategy:
    "Focus on market expansion, competitive positioning, revenue scaling, product-market fit, and sustainable growth.",
  ai_integration:
    "Focus on AI tool selection, implementation roadmaps, team adoption, cost-benefit analysis, and AI-first workflows.",
  brand_positioning:
    "Focus on brand differentiation, market positioning, visual identity strategy, messaging frameworks, and premium brand building.",
};

const BUSINESS_SYSTEM_PROMPT = `You are STAGEONE's Senior AI Business Strategist — an expert in helping modern businesses leverage AI and digital systems to scale rapidly.

You have deep expertise in:
- AI automation and workflow optimization
- Digital transformation strategies  
- Growth marketing and lead generation
- Operational efficiency and systems design
- Brand positioning and premium market entry
- AI tool selection and implementation

Your advice is:
1. Specific and actionable — not generic platitudes
2. Data-driven — cite relevant trends or metrics when applicable
3. Structured — use clear frameworks and prioritization
4. ROI-focused — always tie recommendations to business outcomes

Format your response as structured JSON with these exact fields:
{
  "answer": "Your comprehensive answer (2-3 paragraphs)",
  "recommendations": ["3-5 specific, actionable recommendations"],
  "nextSteps": ["3 immediate next steps the business should take"]
}`;

export async function businessAssistant(
  params: BusinessAssistantParams
): Promise<BusinessResult> {
  const { question, domain, businessContext, industry } = params;

  const domainContext = domain ? DOMAIN_CONTEXT[domain] : "";
  const contextStr = businessContext
    ? `\nBusiness context: ${businessContext}`
    : "";
  const industryStr = industry ? `\nIndustry: ${industry}` : "";
  const domainStr = domain ? `\nFocus domain: ${domain.replace("_", " ")} — ${domainContext}` : "";

  const userPrompt = `Business question: "${question}"${domainStr}${contextStr}${industryStr}

Provide strategic advice following the JSON format specified.`;

  const completion = await nvidiaClient.chat.completions.create({
    model: NVIDIA_MODELS.business,
    messages: [
      { role: "system", content: BUSINESS_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 2048,
    temperature: 0.6,
    stream: false,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  // Parse JSON response — fall back gracefully if model doesn't return valid JSON
  let parsed: { answer?: string; recommendations?: string[]; nextSteps?: string[] } = {};
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Fallback: treat entire response as the answer
    parsed = { answer: raw, recommendations: [], nextSteps: [] };
  }

  return {
    answer: parsed.answer ?? raw,
    recommendations: parsed.recommendations ?? [],
    nextSteps: parsed.nextSteps ?? [],
    domain,
    model: NVIDIA_MODELS.business,
    usage: extractUsage(completion.usage),
  };
}
