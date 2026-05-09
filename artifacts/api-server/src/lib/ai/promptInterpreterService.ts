import type { Response } from "express";
import { runDesignIntelligence } from "./designIntelligenceEngine";
import { logger } from "../logger";

export interface GenerationPlan {
  productType: string;
  industry: string;
  visualStyle: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  layoutSections: string[];
  uiComponents: string[];
  designMood: string;
  targetAudience: string;
  ctaSuggestions: string[];
  imagePrompt: string;
}

export async function interpretPrompt(
  prompt: string,
  res: Response
): Promise<void> {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  if (!process.env.NVIDIA_API_KEY) {
    res.write(
      `data: ${JSON.stringify({
        done: true,
        error:
          "NVIDIA_API_KEY not configured. Add your key at build.nvidia.com (free tier available) and set it as an environment variable.",
      })}\n\n`
    );
    res.end();
    return;
  }

  try {
    // Run the 5-layer Design Intelligence Engine
    // SSE layer events are emitted inside runDesignIntelligence
    const { plan } = await runDesignIntelligence(prompt, res);

    res.write(`data: ${JSON.stringify({ done: true, plan })}\n\n`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ err }, "Design Intelligence Engine error");
    res.write(
      `data: ${JSON.stringify({ done: true, error: `AI API error: ${msg}` })}\n\n`
    );
  }

  res.end();
}
