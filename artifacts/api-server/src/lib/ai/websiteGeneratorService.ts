import { nvidiaClient, NVIDIA_MODELS } from "./nvidia";
import type { Response } from "express";
import type OpenAI from "openai";

export interface WebsiteGeneratorParams {
  businessName: string;
  industry: string;
  brandTone: string;
  services: string;
  targetAudience?: string;
}

export interface WebsiteGeneratorResult {
  headline: string;
  subheadline: string;
  cta: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    label: string;
  };
  sections: Array<{
    title: string;
    content: string;
    type: string;
  }>;
  brandPositioning: string;
  tagline: string;
  model: string;
}

const WEBSITE_SYSTEM_PROMPT = `You are STAGEONE's elite landing page strategist and brand architect. You generate complete, conversion-optimized landing page concepts for businesses.

You output structured JSON with real, compelling, professional copy — never placeholder text. Every word should feel premium and industry-specific.

Always respond with valid JSON in this exact structure:
{
  "headline": "Powerful main hero headline (6-12 words, bold statement)",
  "subheadline": "Supporting subheadline that clarifies the value (15-25 words)",
  "cta": "Action-oriented CTA button text (3-6 words)",
  "tagline": "Short brand tagline (4-8 words)",
  "colorPalette": {
    "primary": "#hexcode",
    "secondary": "#hexcode", 
    "accent": "#hexcode",
    "background": "#hexcode",
    "text": "#hexcode",
    "label": "palette name (e.g. Midnight Luxe, Ocean Depth, etc.)"
  },
  "brandPositioning": "2-3 sentence brand positioning statement",
  "sections": [
    {
      "type": "hero",
      "title": "Hero Section",
      "content": "Brief description of hero section content and messaging"
    },
    {
      "type": "problem",
      "title": "Problem/Pain Point",
      "content": "What pain point this business solves"
    },
    {
      "type": "solution",
      "title": "The Solution",
      "content": "How the business solves it"
    },
    {
      "type": "features",
      "title": "Key Features/Benefits",
      "content": "3 core benefits or features with brief descriptions"
    },
    {
      "type": "social_proof",
      "title": "Trust & Results",
      "content": "Credibility and social proof messaging"
    },
    {
      "type": "cta_section",
      "title": "Final CTA",
      "content": "Closing conversion section messaging"
    }
  ]
}`;

export async function generateWebsiteConcept(
  params: WebsiteGeneratorParams,
  res: Response
): Promise<void> {
  const { businessName, industry, brandTone, services, targetAudience } = params;

  const userPrompt = `Generate a complete landing page concept for this business:

Business Name: ${businessName}
Industry: ${industry}
Brand Tone: ${brandTone}
Services/Products: ${services}
${targetAudience ? `Target Audience: ${targetAudience}` : ""}

Create a premium, conversion-optimized landing page concept. Make it specific, compelling, and tailored to their exact business. Never use generic copy.`;

  const messagesWithSystem: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: WEBSITE_SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const stream = await nvidiaClient.chat.completions.create({
    model: NVIDIA_MODELS.content,
    messages: messagesWithSystem,
    max_tokens: 3000,
    temperature: 0.75,
    stream: true,
  });

  let fullContent = "";

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      fullContent += delta;
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    }
    if (chunk.choices[0]?.finish_reason === "stop") {
      try {
        const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as WebsiteGeneratorResult;
          res.write(`data: ${JSON.stringify({ done: true, result: parsed })}\n\n`);
        } else {
          res.write(`data: ${JSON.stringify({ done: true, error: "Could not parse result" })}\n\n`);
        }
      } catch {
        res.write(`data: ${JSON.stringify({ done: true, error: "Parse error" })}\n\n`);
      }
    }
  }

  res.end();
}
