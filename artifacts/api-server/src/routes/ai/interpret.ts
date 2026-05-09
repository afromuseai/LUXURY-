import { Router, type IRouter } from "express";
import { z } from "zod";
import { interpretPrompt } from "../../lib/ai/promptInterpreterService";
import { logger } from "../../lib/logger";

const router: IRouter = Router();

const InterpretBody = z.object({
  prompt: z.string().min(5).max(1000),
});

router.post("/ai/interpret", async (req, res): Promise<void> => {
  const parsed = InterpretBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  req.log.info({ prompt: parsed.data.prompt.slice(0, 80) }, "Interpreting prompt");

  try {
    await interpretPrompt(parsed.data.prompt, res);
  } catch (err) {
    logger.error({ err }, "Interpret route error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Interpretation failed" });
    }
  }
});

export default router;
