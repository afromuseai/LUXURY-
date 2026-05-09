import { nvidiaClient, NVIDIA_MODELS } from "./nvidia";
import type { Response } from "express";

export interface GenerateParams {
  prompt: string;
  type: "landing" | "dashboard";
}

export interface GenerateConcept {
  title: string;
  type: "landing" | "dashboard";
  description: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    label: string;
  };
  sections: string[];
  headline?: string;
  subheadline?: string;
}

export interface GenerateResult {
  concept: GenerateConcept;
  code: string;
}

const GENERATE_SYSTEM_PROMPT = `You are STAGEONE's elite AI UI generation engine. You generate complete, production-quality React + Tailwind CSS components from natural language prompts.

You respond with ONLY valid JSON — no prose, no markdown, no code blocks.

Generate this exact JSON structure:
{
  "concept": {
    "title": "Short descriptive title (4-7 words)",
    "type": "landing or dashboard",
    "description": "One compelling sentence describing this design",
    "headline": "Main headline for the page (for landing pages)",
    "subheadline": "Supporting subheadline (for landing pages)",
    "colorPalette": {
      "primary": "#hexcolor",
      "secondary": "#hexcolor",
      "accent": "#hexcolor",
      "background": "#hexcolor",
      "text": "#hexcolor",
      "label": "Palette name (e.g. Midnight Slate, Ember Dark)"
    },
    "sections": ["List of 4-6 main section names present in this design"]
  },
  "code": "Complete JSX component as a string. Use Tailwind CSS. Use inline styles only for dynamic colors. No imports. Return a single function component called Page. Use realistic placeholder content — never just 'Lorem ipsum'. The component must look professional and premium. Keep under 150 lines."
}

Rules for the code:
- The code value must be valid JSX that can be rendered
- Use self-closing tags where appropriate
- Escape all double quotes inside the code string with backslash
- Use realistic, industry-specific copy
- Apply the colorPalette colors via inline styles where relevant
- Make it visually impressive and polished`;

export async function generateUIConcept(
  params: GenerateParams,
  res: Response
): Promise<void> {
  const { prompt, type } = params;

  const userPrompt = `Generate a premium ${type === "dashboard" ? "dashboard UI" : "landing page"} for this concept:

"${prompt}"

Make it visually stunning, use a sophisticated color palette that matches the concept's industry and mood, and write clean production-quality React JSX code. The design should feel premium and modern.`;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  res.write(`data: ${JSON.stringify({ stage: "understanding" })}\n\n`);

  const stream = await nvidiaClient.chat.completions.create({
    model: NVIDIA_MODELS.content,
    messages: [
      { role: "system", content: GENERATE_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 4000,
    temperature: 0.8,
    stream: true,
  });

  let fullContent = "";
  let charCount = 0;
  let stageSent = { designing: false, generating: false, writing: false, finalizing: false };

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      fullContent += delta;
      charCount += delta.length;
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);

      if (!stageSent.designing && charCount > 80) {
        stageSent.designing = true;
        res.write(`data: ${JSON.stringify({ stage: "designing" })}\n\n`);
      }
      if (!stageSent.generating && charCount > 400) {
        stageSent.generating = true;
        res.write(`data: ${JSON.stringify({ stage: "generating" })}\n\n`);
      }
      if (!stageSent.writing && charCount > 900) {
        stageSent.writing = true;
        res.write(`data: ${JSON.stringify({ stage: "writing" })}\n\n`);
      }
      if (!stageSent.finalizing && charCount > 2000) {
        stageSent.finalizing = true;
        res.write(`data: ${JSON.stringify({ stage: "finalizing" })}\n\n`);
      }
    }

    if (chunk.choices[0]?.finish_reason === "stop") {
      if (!stageSent.finalizing) {
        res.write(`data: ${JSON.stringify({ stage: "finalizing" })}\n\n`);
      }
      try {
        const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as GenerateResult;
          res.write(`data: ${JSON.stringify({ done: true, result: parsed })}\n\n`);
        } else {
          res.write(`data: ${JSON.stringify({ done: true, error: "Could not parse generation result" })}\n\n`);
        }
      } catch {
        res.write(`data: ${JSON.stringify({ done: true, error: "Parse error in generation" })}\n\n`);
      }
    }
  }

  res.end();
}
