import { Router, type IRouter } from "express";
import { AiChatBody } from "@workspace/api-zod";
import { chatCompletion, chatCompletionStream } from "../../lib/ai";
import { logger } from "../../lib/logger";

const router: IRouter = Router();

// Standard JSON completion
router.post("/ai/chat", async (req, res): Promise<void> => {
  const parsed = AiChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { messages } = parsed.data;
  const result = await chatCompletion(
    messages as Parameters<typeof chatCompletion>[0]
  );
  res.json(result);
});

// Streaming SSE endpoint (used by the live chat widget)
router.post("/ai/chat/stream", async (req, res): Promise<void> => {
  const parsed = AiChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { messages } = parsed.data;

  req.log.info({ messageCount: messages.length }, "Starting AI chat stream");

  try {
    await chatCompletionStream(
      messages as Parameters<typeof chatCompletionStream>[0],
      res
    );
  } catch (err) {
    logger.error({ err }, "AI chat stream error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Stream failed" });
    }
  }
});

export default router;
