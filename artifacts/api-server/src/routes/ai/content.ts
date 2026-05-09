import { Router, type IRouter } from "express";
import { GenerateContentBody } from "@workspace/api-zod";
import { generateContent } from "../../lib/ai";

const router: IRouter = Router();

router.post("/ai/content", async (req, res): Promise<void> => {
  const parsed = GenerateContentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const result = await generateContent(parsed.data);
  res.json(result);
});

export default router;
