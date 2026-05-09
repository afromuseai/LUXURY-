import { Router, type IRouter } from "express";
import { z } from "zod";
import { generateCode } from "../../lib/ai/codeGeneratorService";
import { logger } from "../../lib/logger";

const router: IRouter = Router();

const GenerateCodeBody = z.object({
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

router.post("/ai/generate-code", async (req, res): Promise<void> => {
  const parsed = GenerateCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  req.log.info({ productType: parsed.data.plan.productType }, "Generating UI code");

  try {
    await generateCode(parsed.data.plan as any, res);
  } catch (err) {
    logger.error({ err }, "Code generation route error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Code generation failed" });
    }
  }
});

export default router;
