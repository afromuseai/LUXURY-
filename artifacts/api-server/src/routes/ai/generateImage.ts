import { Router, type IRouter } from "express";
import { z } from "zod";
import { generateUIImage } from "../../lib/ai/imageGeneratorService";
import { logger } from "../../lib/logger";

const router: IRouter = Router();

const GenerateImageBody = z.object({
  plan: z.object({
    productType: z.string(),
    industry: z.string(),
    visualStyle: z.string(),
    colorPalette: z.object({
      primary: z.string(),
      secondary: z.string(),
      accent: z.string(),
      background: z.string(),
      text: z.string(),
    }),
    layoutSections: z.array(z.string()),
    uiComponents: z.array(z.string()),
    designMood: z.string(),
    targetAudience: z.string(),
    ctaSuggestions: z.array(z.string()),
    imagePrompt: z.string().optional().default(""),
  }),
});

router.post("/ai/generate-image", async (req, res): Promise<void> => {
  const parsed = GenerateImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  req.log.info({ productType: parsed.data.plan.productType }, "Generating UI image");

  try {
    const result = await generateUIImage(parsed.data.plan as any);
    res.json(result);
  } catch (err) {
    logger.error({ err }, "Image generation route error");
    res.status(500).json({ error: "Image generation failed", fallback: true });
  }
});

export default router;
