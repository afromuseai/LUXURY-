import { nvidiaClient, NVIDIA_MODELS, extractUsage } from "./nvidia";
import type { Response } from "express";
import type OpenAI from "openai";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResult {
  message: ChatMessage;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const STAGEONE_SYSTEM_PROMPT = `You are the STAGEONE AI Assistant — the intelligent digital advisor for STAGEONE, a premium AI digital agency.

STAGEONE builds cutting-edge AI-powered digital systems for modern businesses. Our services include:
- AI Automation: Automating workflows to reduce overhead and scale operations
- AI Assistants: Custom chatbots trained on business data
- Smart Websites: High-converting, blazing-fast web experiences
- Brand Identity: Strategic visual identities
- Content Systems: AI-powered content pipelines

Your role is to:
1. Help visitors understand STAGEONE's services and value proposition
2. Qualify potential clients by learning about their business needs
3. Guide them toward booking a consultation
4. Answer questions about AI automation, web design, and digital transformation
5. Be concise, professional, and compelling — like a senior consultant

Tone: Confident, insightful, premium. You represent an elite agency. Never be generic or overly salesy. Ask smart questions. Provide real value in every response.

Always end your responses with a relevant follow-up question or a suggestion to book a strategy call at hello@stageone.agency.`;

/**
 * Non-streaming chat completion
 */
export async function chatCompletion(
  messages: ChatMessage[]
): Promise<ChatResult> {
  const messagesWithSystem: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: STAGEONE_SYSTEM_PROMPT },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const completion = await nvidiaClient.chat.completions.create({
    model: NVIDIA_MODELS.chat,
    messages: messagesWithSystem,
    max_tokens: 1024,
    temperature: 0.7,
    stream: false,
  });

  const choice = completion.choices[0];
  const content = choice?.message?.content ?? "";

  return {
    message: { role: "assistant", content },
    model: NVIDIA_MODELS.chat,
    usage: extractUsage(completion.usage),
  };
}

/**
 * Streaming chat completion — writes SSE chunks to the response
 */
export async function chatCompletionStream(
  messages: ChatMessage[],
  res: Response
): Promise<void> {
  const messagesWithSystem: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: STAGEONE_SYSTEM_PROMPT },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const stream = await nvidiaClient.chat.completions.create({
    model: NVIDIA_MODELS.chat,
    messages: messagesWithSystem,
    max_tokens: 1024,
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
