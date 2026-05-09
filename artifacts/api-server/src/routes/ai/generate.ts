import { Router, type IRouter } from "express";
import { z } from "zod";
import { generateUIConcept } from "../../lib/ai";
import { logger } from "../../lib/logger";

const router: IRouter = Router();

const GenerateBody = z.object({
  prompt: z.string().min(3).max(500),
  type: z.enum(["landing", "dashboard"]).default("landing"),
});

router.post("/ai/generate", async (req, res): Promise<void> => {
  const parsed = GenerateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  req.log.info({ prompt: parsed.data.prompt, type: parsed.data.type }, "Generating UI concept");

  try {
    await generateUIConcept(parsed.data, res);
  } catch (err) {
    logger.error({ err }, "Generate route error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Generation failed" });
    }
  }
});

export default router;
