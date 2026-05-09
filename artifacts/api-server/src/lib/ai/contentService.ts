import { nvidiaClient, NVIDIA_MODELS, extractUsage } from "./nvidia";

export type ContentType =
  | "blog_post"
  | "social_media"
  | "email_campaign"
  | "landing_page_copy"
  | "ad_copy"
  | "case_study";

export type ContentTone =
  | "professional"
  | "conversational"
  | "authoritative"
  | "inspiring";

export interface ContentGenerationParams {
  type: ContentType;
  topic: string;
  tone?: ContentTone;
  keywords?: string[];
  targetAudience?: string;
  additionalContext?: string;
}

export interface ContentResult {
  content: string;
  title?: string;
  type: ContentType;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const CONTENT_INSTRUCTIONS: Record<ContentType, string> = {
  blog_post:
    "Write a compelling, well-structured blog post with a headline, introduction, 3-5 sections with subheadings, and a conclusion with a CTA.",
  social_media:
    "Write engaging social media content. Include 3 variations: one for LinkedIn (professional), one for Twitter/X (punchy, under 280 chars), one for Instagram (visual-focused with hashtags).",
  email_campaign:
    "Write a professional email campaign with a compelling subject line, preview text, body content with clear value proposition, and a strong CTA button text.",
  landing_page_copy:
    "Write conversion-optimized landing page copy including: hero headline, subheadline, 3 key benefits, social proof section, and CTA.",
  ad_copy:
    "Write 3 variations of ad copy each with a headline (max 30 chars), description (max 90 chars), and CTA. Optimize for click-through rates.",
  case_study:
    "Write a professional case study with: client challenge, STAGEONE solution, implementation process, measurable results, and client testimonial (placeholder).",
};

const CONTENT_SYSTEM_PROMPT = `You are an elite content strategist and copywriter for STAGEONE, a premium AI digital agency. 
You create high-converting, premium content that positions businesses as industry leaders.
Your writing is sharp, authoritative, and drives action. Never use clichés or generic phrases.
Always tie content back to AI transformation, competitive advantage, and measurable business outcomes.
Format your output cleanly with proper structure. Include a "Title:" line at the start when appropriate.`;

export async function generateContent(
  params: ContentGenerationParams
): Promise<ContentResult> {
  const {
    type,
    topic,
    tone = "professional",
    keywords = [],
    targetAudience,
    additionalContext,
  } = params;

  const instructions = CONTENT_INSTRUCTIONS[type];
  const keywordStr =
    keywords.length > 0 ? `\nTarget keywords: ${keywords.join(", ")}` : "";
  const audienceStr = targetAudience
    ? `\nTarget audience: ${targetAudience}`
    : "";
  const contextStr = additionalContext
    ? `\nAdditional context: ${additionalContext}`
    : "";

  const userPrompt = `Create ${type.replace("_", " ")} content about: "${topic}"
Tone: ${tone}${keywordStr}${audienceStr}${contextStr}

Instructions: ${instructions}`;

  const completion = await nvidiaClient.chat.completions.create({
    model: NVIDIA_MODELS.content,
    messages: [
      { role: "system", content: CONTENT_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 2048,
    temperature: 0.8,
    stream: false,
  });

  const raw = completion.choices[0]?.message?.content ?? "";

  // Extract title if present
  const titleMatch = raw.match(/^Title:\s*(.+)$/m);
  const title = titleMatch?.[1]?.trim();
  const content = titleMatch ? raw.replace(/^Title:\s*.+\n?/m, "").trim() : raw;

  return {
    content,
    title,
    type,
    model: NVIDIA_MODELS.content,
    usage: extractUsage(completion.usage),
  };
}
