import { Router, type IRouter } from "express";
import { z } from "zod";
import { nvidiaClient, NVIDIA_MODELS } from "../../lib/ai";
import { logger } from "../../lib/logger";
import type OpenAI from "openai";

const router: IRouter = Router();

const BusinessStreamBody = z.object({
  question: z.string().min(1),
  domain: z.enum(["automation", "marketing", "operations", "growth_strategy", "ai_integration", "brand_positioning"]).optional(),
  businessContext: z.string().optional(),
  industry: z.string().optional(),
  history: z.array(z.object({ role: z.string(), content: z.string() })).optional(),
});

const DOMAIN_CONTEXT: Record<string, string> = {
  automation: "Focus on workflow automation, process optimization, eliminating manual tasks, and ROI from automation initiatives.",
  marketing: "Focus on AI-powered marketing, personalization, lead generation, conversion optimization, and growth marketing strategies.",
  operations: "Focus on operational efficiency, team productivity, systems design, scalability, and reducing operational overhead.",
  growth_strategy: "Focus on market expansion, competitive positioning, revenue scaling, product-market fit, and sustainable growth.",
  ai_integration: "Focus on AI tool selection, implementation roadmaps, team adoption, cost-benefit analysis, and AI-first workflows.",
  brand_positioning: "Focus on brand differentiation, market positioning, visual identity strategy, messaging frameworks, and premium brand building.",
};

const ADVISOR_SYSTEM_PROMPT = `You are STAGEONE's Senior AI Business Strategist — an expert in helping modern businesses leverage AI and digital systems to scale rapidly.

You have deep expertise in:
- AI automation and workflow optimization
- Digital transformation strategies
- Growth marketing and lead generation
- Operational efficiency and systems design
- Brand positioning and premium market entry
- AI tool selection and implementation

Your advice is:
1. Specific and actionable — not generic platitudes
2. Data-driven — cite relevant trends or metrics when applicable
3. Structured — use headers, bullet points, and clear prioritization
4. ROI-focused — always tie recommendations to business outcomes
5. Conversational — adapt to the ongoing dialogue

Format your responses with clear sections using markdown-style headers (##) and bullet points (-). Be comprehensive but scannable.`;

router.post("/ai/business/stream", async (req, res): Promise<void> => {
  const parsed = BusinessStreamBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { question, domain, businessContext, industry, history = [] } = parsed.data;

  const domainContext = domain ? DOMAIN_CONTEXT[domain] : "";
  const contextStr = businessContext ? `\nBusiness context: ${businessContext}` : "";
  const industryStr = industry ? `\nIndustry: ${industry}` : "";
  const domainStr = domain ? `\nFocus domain: ${domain.replace("_", " ")} — ${domainContext}` : "";

  const userMessage = `${question}${domainStr}${contextStr}${industryStr}`;

  const historyMessages: OpenAI.ChatCompletionMessageParam[] = history.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: ADVISOR_SYSTEM_PROMPT },
    ...historyMessages,
    { role: "user", content: userMessage },
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  req.log.info({ domain, industry }, "Streaming business advisor response");

  try {
    const stream = await nvidiaClient.chat.completions.create({
      model: NVIDIA_MODELS.business,
      messages,
      max_tokens: 2048,
      temperature: 0.65,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
      if (chunk.choices[0]?.finish_reason === "stop") {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      }
    }
    res.end();
  } catch (err) {
    logger.error({ err }, "Business advisor stream error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Stream failed" });
    }
  }
});

export default router;
