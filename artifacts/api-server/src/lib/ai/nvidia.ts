import OpenAI from "openai";
import { logger } from "../logger";

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

function createNvidiaClient(): OpenAI {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    logger.warn("NVIDIA_API_KEY is not set — AI features will not work");
  }
  return new OpenAI({
    apiKey: apiKey ?? "missing",
    baseURL: NVIDIA_BASE_URL,
  });
}

// Singleton client
export const nvidiaClient = createNvidiaClient();

// Models mapped to use cases
export const NVIDIA_MODELS = {
  chat: "meta/llama-3.1-70b-instruct",
  content: "mistralai/mistral-large-2-instruct",
  business: "nvidia/llama-3.1-nemotron-70b-instruct",
} as const;

export type NvidiaModel = (typeof NVIDIA_MODELS)[keyof typeof NVIDIA_MODELS];

export interface TokenUsageResult {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export function extractUsage(
  usage: OpenAI.CompletionUsage | undefined
): TokenUsageResult {
  return {
    promptTokens: usage?.prompt_tokens ?? 0,
    completionTokens: usage?.completion_tokens ?? 0,
    totalTokens: usage?.total_tokens ?? 0,
  };
}
