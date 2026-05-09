import { Router, type IRouter } from "express";
import { BusinessAssistantBody } from "@workspace/api-zod";
import { businessAssistant } from "../../lib/ai";

const router: IRouter = Router();

router.post("/ai/business", async (req, res): Promise<void> => {
  const parsed = BusinessAssistantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const result = await businessAssistant(parsed.data);
  res.json(result);
});

export default router;
