import { nvidiaClient, NVIDIA_MODELS, extractUsage } from "./nvidia";
import type { Response } from "express";
import type OpenAI from "openai";

export interface ChatbotBuilderParams {
  businessType: string;
  faqs: string;
  tone: string;
  businessName?: string;
  industry?: string;
}

export interface ChatbotPersonality {
  name: string;
  greeting: string;
  personality: string;
  expertise: string[];
  sampleResponses: Array<{
    question: string;
    answer: string;
  }>;
  suggestedAutomations: Array<{
    title: string;
    description: string;
    impact: string;
  }>;
  customerSupportFlows: Array<{
    trigger: string;
    flow: string[];
    outcome: string;
  }>;
  systemPrompt: string;
}

const CHATBOT_SYSTEM_PROMPT = `You are STAGEONE's AI chatbot architect. You design sophisticated, personality-rich chatbot systems for businesses.

You create chatbots that feel genuinely intelligent and brand-aligned — not robotic or generic.

Respond with valid JSON in exactly this structure:
{
  "name": "Chatbot name/persona name",
  "greeting": "Initial greeting message (professional, warm, on-brand)",
  "personality": "2-3 sentence description of chatbot personality and communication style",
  "expertise": ["area 1", "area 2", "area 3", "area 4"],
  "sampleResponses": [
    {
      "question": "Common customer question",
      "answer": "How the chatbot would respond (natural, helpful, on-brand)"
    },
    {
      "question": "Another common question",
      "answer": "Response"
    },
    {
      "question": "Follow-up or complex question",
      "answer": "Detailed response"
    }
  ],
  "suggestedAutomations": [
    {
      "title": "Automation name",
      "description": "What it does",
      "impact": "Business impact (e.g. Saves 10 hrs/week)"
    },
    {
      "title": "Automation 2",
      "description": "What it does",
      "impact": "Impact"
    },
    {
      "title": "Automation 3",
      "description": "What it does",
      "impact": "Impact"
    }
  ],
  "customerSupportFlows": [
    {
      "trigger": "Customer issue or entry point",
      "flow": ["Step 1", "Step 2", "Step 3", "Step 4"],
      "outcome": "Resolution or escalation path"
    },
    {
      "trigger": "Another trigger",
      "flow": ["Step 1", "Step 2", "Step 3"],
      "outcome": "Outcome"
    }
  ],
  "systemPrompt": "Complete system prompt to power this chatbot (3-5 paragraphs)"
}`;

export async function buildChatbotPersonality(
  params: ChatbotBuilderParams,
  res: Response
): Promise<void> {
  const { businessType, faqs, tone, businessName, industry } = params;

  const userPrompt = `Design a complete chatbot personality and automation system for:

Business Type: ${businessType}
${businessName ? `Business Name: ${businessName}` : ""}
${industry ? `Industry: ${industry}` : ""}
Desired Tone: ${tone}
FAQ / Key Information:
${faqs}

Create a sophisticated, on-brand chatbot with real sample responses based on the FAQs provided. Design practical automation flows for this specific business type.`;

  const messagesWithSystem: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: CHATBOT_SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const stream = await nvidiaClient.chat.completions.create({
    model: NVIDIA_MODELS.content,
    messages: messagesWithSystem,
    max_tokens: 3000,
    temperature: 0.7,
    stream: true,
  });

  let fullContent = "";

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      fullContent += delta;
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    }
    if (chunk.choices[0]?.finish_reason === "stop") {
      try {
        const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as ChatbotPersonality;
          res.write(`data: ${JSON.stringify({ done: true, result: parsed })}\n\n`);
        } else {
          res.write(`data: ${JSON.stringify({ done: true, error: "Could not parse result" })}\n\n`);
        }
      } catch {
        res.write(`data: ${JSON.stringify({ done: true, error: "Parse error" })}\n\n`);
      }
    }
  }

  res.end();
}

export async function chatWithBot(
  params: ChatbotBuilderParams & { messages: Array<{ role: string; content: string }> },
  res: Response
): Promise<void> {
  const { businessType, tone, businessName, systemPrompt } = params as typeof params & { systemPrompt?: string };

  const botSystemPrompt = systemPrompt ?? `You are a helpful customer service AI assistant for ${businessName ?? businessType}. 
Your tone is ${tone}. Help customers with their questions and guide them toward making a decision.
Be concise, helpful, and professional. Keep responses under 3 sentences unless detail is needed.`;

  const messagesForApi: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: botSystemPrompt },
    ...params.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const stream = await nvidiaClient.chat.completions.create({
    model: NVIDIA_MODELS.chat,
    messages: messagesForApi,
    max_tokens: 512,
    temperature: 0.7,
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
}
