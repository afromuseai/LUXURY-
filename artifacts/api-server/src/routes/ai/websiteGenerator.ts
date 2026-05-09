import { Router, type IRouter } from "express";
import { z } from "zod";
import { generateWebsiteConcept } from "../../lib/ai";
import { logger } from "../../lib/logger";

const router: IRouter = Router();

const WebsiteGeneratorBody = z.object({
  businessName: z.string().min(1),
  industry: z.string().min(1),
  brandTone: z.string().min(1),
  services: z.string().min(1),
  targetAudience: z.string().optional(),
  email: z.string().optional(),
});

router.post("/ai/website-generator", async (req, res): Promise<void> => {
  const parsed = WebsiteGeneratorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  req.log.info({ businessName: parsed.data.businessName }, "Generating website concept");

  try {
    await generateWebsiteConcept(parsed.data, res);
  } catch (err) {
    logger.error({ err }, "Website generator error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Generation failed" });
    }
  }
});

export default router;
