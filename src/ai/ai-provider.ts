import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export async function getFreeOpenRouterModel(): Promise<string | null> {
  try {
    const res = await fetch("/api/free-model");
    const data = await res.json();
    if (!res.ok || !data.success) return null;
    return (data?.modelId as string | undefined) || null;
  } catch {
    return null;
  }
}

export async function handleAIResponse(
  messages: Array<{ role: string; content: string }>,
  onChunk: (content: string) => void,
  onComplete: (fullResponse: string) => void,
  modelOverride?: string
) {
  const model = modelOverride || (await getFreeOpenRouterModel()) || "openrouter/auto";

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const stream = await openai.chat.completions.create({
    model,
    messages: messages as ChatCompletionMessageParam[],
    stream: true,
  });

  let fullContent = "";
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    fullContent += content;
    onChunk(content);
  }

  onComplete(fullContent);
  return fullContent;
}
