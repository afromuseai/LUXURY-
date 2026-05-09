import { Router, type IRouter } from "express";
import { z } from "zod";
import { db, leadsTable, aiSessionsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const LeadCaptureBody = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  industry: z.string().optional(),
  message: z.string().optional(),
  source: z.enum([
    "contact_form",
    "ai_website_generator",
    "ai_business_advisor",
    "ai_chatbot_builder",
    "chat_widget",
  ]).default("contact_form"),
  metadata: z.string().optional(),
});

const AiSessionBody = z.object({
  tool: z.enum(["website_generator", "business_advisor", "chatbot_builder", "chat_widget", "content_generator"]),
  email: z.string().email().optional(),
  inputSummary: z.string().optional(),
  outputSummary: z.string().optional(),
  tokensUsed: z.number().optional(),
  durationMs: z.number().optional(),
});

router.post("/leads", async (req, res): Promise<void> => {
  const parsed = LeadCaptureBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [lead] = await db
      .insert(leadsTable)
      .values(parsed.data)
      .returning();

    req.log.info({ leadId: lead?.id, email: lead?.email, source: lead?.source }, "Lead captured");
    res.status(201).json({ success: true, id: lead?.id });
  } catch (err) {
    logger.error({ err }, "Failed to capture lead");
    res.status(500).json({ error: "Failed to save lead" });
  }
});

router.post("/leads/session", async (req, res): Promise<void> => {
  const parsed = AiSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [session] = await db
      .insert(aiSessionsTable)
      .values(parsed.data)
      .returning();

    res.status(201).json({ success: true, id: session?.id });
  } catch (err) {
    logger.error({ err }, "Failed to log AI session");
    res.status(500).json({ error: "Failed to log session" });
  }
});

export default router;
