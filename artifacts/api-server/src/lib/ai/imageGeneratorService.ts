import { logger } from "../logger";
import { nvidiaClient, NVIDIA_MODELS } from "./nvidia";
import type { GenerationPlan } from "./promptInterpreterService";

const PROMPT_ENHANCER_SYSTEM = `You are a world-class text-to-image prompt engineer specialising in UI design mockups.
Given a UI design plan, write a single detailed image generation prompt that produces a photorealistic UI screenshot.
Output ONLY the prompt — no labels, no preamble, no explanation.
Max 120 words.
End with: professional UI screenshot, Dribbble-quality, ultra-sharp, 4K, no text blur.`;

function basePrompt(plan: GenerationPlan): string {
  if (plan.imagePrompt && plan.imagePrompt.length > 30) return plan.imagePrompt;
  return (
    `Photorealistic ${plan.productType} UI screenshot. ${plan.visualStyle} design. ` +
    `${plan.colorPalette.background} background, ${plan.colorPalette.primary} primary, ${plan.colorPalette.accent} accent. ` +
    `Sections: ${plan.layoutSections.slice(0, 4).join(", ")}. ` +
    `Components: ${plan.uiComponents.slice(0, 5).join(", ")}. ` +
    `${plan.designMood} mood. ${plan.industry} industry. ` +
    `Professional UI screenshot, Dribbble-quality, ultra-sharp, 4K, no text blur.`
  );
}

export interface ImageGenerationResult {
  imageUrl: string | null;
  imageBase64: string | null;
  error: string | null;
  fallback: boolean;
  promptUsed?: string;
}

export async function generateUIImage(plan: GenerationPlan): Promise<ImageGenerationResult> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return { imageUrl: null, imageBase64: null, error: "NVIDIA_API_KEY not set", fallback: true };
  }

  // ── Step 1: Enhance prompt via LLM ───────────────────────────────────────
  let imagePrompt = basePrompt(plan);

  try {
    const resp = await nvidiaClient.chat.completions.create({
      model: NVIDIA_MODELS.content,
      messages: [
        { role: "system", content: PROMPT_ENHANCER_SYSTEM },
        {
          role: "user",
          content:
            `Product: ${plan.productType} | Industry: ${plan.industry}\n` +
            `Style: ${plan.visualStyle} | Mood: ${plan.designMood}\n` +
            `Colors — bg: ${plan.colorPalette.background}, primary: ${plan.colorPalette.primary}, accent: ${plan.colorPalette.accent}\n` +
            `Sections: ${plan.layoutSections.join(", ")}\n` +
            `Components: ${plan.uiComponents.slice(0, 6).join(", ")}`,
        },
      ],
      max_tokens: 180,
      temperature: 0.6,
    });
    const enhanced = resp.choices[0]?.message?.content?.trim();
    if (enhanced && enhanced.length > 30) {
      imagePrompt = enhanced;
      logger.info({ chars: enhanced.length }, "Prompt enhanced for image generation");
    }
  } catch (err) {
    logger.warn({ err }, "Prompt enhancement failed — using base prompt");
  }

  // ── Step 2: Generate image via NVIDIA ────────────────────────────────────
  // Try OpenAI-compatible images endpoint first
  const endpoints = [
    {
      url: "https://integrate.api.nvidia.com/v1/images/generations",
      body: {
        model: "black-forest-labs/flux-schnell",
        prompt: imagePrompt,
        n: 1,
        size: "1024x640",
        response_format: "b64_json",
      },
      parseB64: (d: unknown) => {
        const r = d as { data?: Array<{ b64_json?: string; url?: string }> };
        return { b64: r.data?.[0]?.b64_json, url: r.data?.[0]?.url };
      },
    },
    {
      url: "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux-schnell",
      body: {
        prompt: imagePrompt,
        width: 1024,
        height: 640,
        num_inference_steps: 20,
        guidance: 3.5,
        seed: Math.floor(Math.random() * 1_000_000),
      },
      parseB64: (d: unknown) => {
        const r = d as { artifacts?: Array<{ base64?: string }> };
        return { b64: r.artifacts?.[0]?.base64, url: undefined };
      },
    },
  ];

  for (const ep of endpoints) {
    try {
      const response = await fetch(ep.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(ep.body),
        signal: AbortSignal.timeout(90_000),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => response.statusText);
        logger.warn({ status: response.status, url: ep.url, errText }, "Image endpoint failed");
        continue; // try next endpoint
      }

      const data = await response.json();
      const { b64, url } = ep.parseB64(data);

      if (b64) {
        logger.info({ url: ep.url }, "Image generated successfully");
        return {
          imageUrl: null,
          imageBase64: `data:image/jpeg;base64,${b64}`,
          error: null,
          fallback: false,
          promptUsed: imagePrompt,
        };
      }
      if (url) {
        return { imageUrl: url, imageBase64: null, error: null, fallback: false, promptUsed: imagePrompt };
      }

      logger.warn({ url: ep.url, data }, "Unexpected image response format");
    } catch (err) {
      logger.warn({ err, url: ep.url }, "Image endpoint exception");
    }
  }

  // All endpoints failed — return fallback signal (ConceptPreview shown on frontend)
  return {
    imageUrl: null,
    imageBase64: null,
    error: "Image generation unavailable — Flux model access may need to be enabled at build.nvidia.com",
    fallback: true,
    promptUsed: imagePrompt,
  };
}
