import { Router, type IRouter } from "express";
import { z } from "zod";
import { nvidiaClient, NVIDIA_MODELS } from "../../lib/ai";
import { logger } from "../../lib/logger";
import type OpenAI from "openai";

const router: IRouter = Router();

const PlaygroundBody = z.object({
  tool: z.enum(["website_copy", "brand_names", "marketing_assistant", "automation_ideas", "chatbot_assistant"]),
  prompt: z.string().min(1),
  context: z.string().optional(),
  history: z.array(z.object({ role: z.string(), content: z.string() })).optional(),
});

const SYSTEM_PROMPTS: Record<string, string> = {
  website_copy: `You are STAGEONE's expert conversion copywriter. You write premium, high-converting website copy for modern businesses.

Your copy is:
- Specific to the business, never generic
- Conversion-focused with clear value propositions
- Written with authority and elegance
- Structured with clear sections (Hero, Benefits, Features, CTA, etc.)

Format responses with clear section headers using ## for each section. Write compelling, real copy — not placeholders.`,

  brand_names: `You are STAGEONE's creative director and brand strategist. You generate premium brand names for modern businesses.

For each request, provide:
1. **5 Premium Brand Name Options** — each with a brief rationale
2. **Domain Availability Notes** — potential .com combinations  
3. **Tagline** — one powerful tagline for each name
4. **Brand Voice** — 2-sentence brand personality guide

Format each name clearly with ## headers. Names should feel ownable, memorable, and premium.`,

  marketing_assistant: `You are STAGEONE's AI marketing strategist with expertise in growth marketing, digital advertising, and customer acquisition.

You provide:
- Specific, actionable marketing strategies
- Campaign concepts with hooks and angles
- Target audience insights
- Channel recommendations with rationale
- Copy angles and messaging frameworks

Use ## headers and bullet points. Be specific and tactical, never generic.`,

  automation_ideas: `You are STAGEONE's automation architect. You identify high-ROI automation opportunities for businesses.

For each business/request, provide:

## Quick Wins (implement in < 1 week)
3-5 automations that can be built fast

## Medium-Term Automations (1-4 weeks)
3-5 higher-impact systems

## AI-Powered Automations
3-5 automations that leverage AI/ML

## Estimated ROI
Time and money saved per automation

Be specific — name the actual tools (Zapier, Make, n8n, custom API, etc.) and the exact workflow steps.`,

  chatbot_assistant: `You are a helpful, knowledgeable AI assistant powered by STAGEONE. You help business owners and entrepreneurs with:
- Business strategy and growth
- Marketing and sales questions  
- Technology and AI implementation
- Operations and productivity
- Branding and positioning

Be conversational, insightful, and specific. Ask clarifying questions when needed. Keep responses focused and actionable.`,
};

const MODEL_MAP: Record<string, string> = {
  website_copy: NVIDIA_MODELS.content,
  brand_names: NVIDIA_MODELS.content,
  marketing_assistant: NVIDIA_MODELS.business,
  automation_ideas: NVIDIA_MODELS.business,
  chatbot_assistant: NVIDIA_MODELS.chat,
};

router.post("/ai/playground", async (req, res): Promise<void> => {
  const parsed = PlaygroundBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { tool, prompt, context, history = [] } = parsed.data;
  const systemPrompt = SYSTEM_PROMPTS[tool] ?? SYSTEM_PROMPTS.chatbot_assistant;
  const model = MODEL_MAP[tool] ?? NVIDIA_MODELS.chat;

  const historyMessages: OpenAI.ChatCompletionMessageParam[] = history.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const userContent = context ? `${prompt}\n\nContext: ${context}` : prompt;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...historyMessages,
    { role: "user", content: userContent },
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  req.log.info({ tool }, "AI playground generation");

  try {
    const stream = await nvidiaClient.chat.completions.create({
      model,
      messages,
      max_tokens: 2048,
      temperature: tool === "brand_names" ? 0.9 : tool === "chatbot_assistant" ? 0.7 : 0.75,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      if (chunk.choices[0]?.finish_reason === "stop") {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      }
    }
    res.end();
  } catch (err) {
    logger.error({ err }, "Playground stream error");
    if (!res.headersSent) res.status(500).json({ error: "Generation failed" });
  }
});

export default router;
