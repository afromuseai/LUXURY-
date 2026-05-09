import { Router, type IRouter } from "express";
import { z } from "zod";
import { buildChatbotPersonality, chatWithBot } from "../../lib/ai";
import { logger } from "../../lib/logger";

const router: IRouter = Router();

const ChatbotBuilderBody = z.object({
  businessType: z.string().min(1),
  faqs: z.string().min(1),
  tone: z.string().min(1),
  businessName: z.string().optional(),
  industry: z.string().optional(),
  email: z.string().optional(),
});

const ChatWithBotBody = z.object({
  businessType: z.string().min(1),
  tone: z.string().min(1),
  businessName: z.string().optional(),
  systemPrompt: z.string().optional(),
  messages: z.array(
    z.object({
      role: z.string(),
      content: z.string(),
    })
  ).min(1),
});

router.post("/ai/chatbot-builder", async (req, res): Promise<void> => {
  const parsed = ChatbotBuilderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  req.log.info({ businessType: parsed.data.businessType }, "Building chatbot personality");

  try {
    await buildChatbotPersonality(parsed.data, res);
  } catch (err) {
    logger.error({ err }, "Chatbot builder error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Chatbot build failed" });
    }
  }
});

router.post("/ai/chatbot-builder/chat", async (req, res): Promise<void> => {
  const parsed = ChatWithBotBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    await chatWithBot(parsed.data as Parameters<typeof chatWithBot>[0], res);
  } catch (err) {
    logger.error({ err }, "Chatbot chat error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Chat failed" });
    }
  }
});

export default router;
