import { nvidiaClient, NVIDIA_MODELS } from "./nvidia";
import type { Response } from "express";
import type { GenerationPlan } from "./promptInterpreterService";

const CODE_SYSTEM_PROMPT = `You are STAGEONE's expert React + Tailwind CSS engineer. You generate production-quality, beautiful, complete React components from UI design plans.

Rules:
- Output ONLY raw JSX/TSX code — no imports, no exports, no markdown, no explanations
- The component must be named \`GeneratedPage\` and use the function keyword
- Use ONLY Tailwind CSS classes for styling
- Use inline styles ONLY for dynamic color values from the design plan
- Make it realistic with industry-specific content — never use placeholder text
- Every section mentioned in the plan must be present
- Include realistic data: numbers, names, charts (using divs), tables
- Apply the exact color palette given
- Include hover states, transitions, and smooth interactions
- Must look premium and award-winning
- Target 150-200 lines of clean JSX
- Use React.useState for any interactive elements (tabs, toggles, etc.)

Output format: raw JSX starting with \`function GeneratedPage() {\` — nothing before or after.`;

export async function generateCode(plan: GenerationPlan, res: Response): Promise<void> {
  const userPrompt = `Generate a complete React component for this UI design plan:

Product: ${plan.productType}
Industry: ${plan.industry}
Visual Style: ${plan.visualStyle}
Design Mood: ${plan.designMood}
Target Audience: ${plan.targetAudience}

Color Palette:
- Background: ${plan.colorPalette.background}
- Primary: ${plan.colorPalette.primary}
- Secondary: ${plan.colorPalette.secondary}
- Accent: ${plan.colorPalette.accent}
- Text: ${plan.colorPalette.text}

Layout Sections (implement ALL of these):
${plan.layoutSections.map((s, i) => `${i + 1}. ${s}`).join("\n")}

UI Components to include:
${plan.uiComponents.map((c) => `• ${c}`).join("\n")}

CTA text options: ${plan.ctaSuggestions.join(", ")}

Generate the complete, production-quality React component now. Use the exact colors provided via inline styles where needed.`;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  if (!process.env.NVIDIA_API_KEY) {
    res.write(`data: ${JSON.stringify({ done: true, error: "NVIDIA_API_KEY not configured." })}\n\n`);
    res.end();
    return;
  }

  try {
    const stream = await nvidiaClient.chat.completions.create({
      model: NVIDIA_MODELS.content,
      messages: [
        { role: "system", content: CODE_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 4000,
      temperature: 0.6,
      stream: true,
    });

    let fullCode = "";

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullCode += delta;
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
      if (chunk.choices[0]?.finish_reason === "stop") {
        const clean = fullCode
          .replace(/^```(?:tsx?|jsx?|javascript|typescript)?\n?/i, "")
          .replace(/\n?```$/i, "")
          .trim();
        res.write(`data: ${JSON.stringify({ done: true, code: clean })}\n\n`);
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.write(`data: ${JSON.stringify({ done: true, error: `AI API error: ${msg}` })}\n\n`);
  }

  res.end();
}
