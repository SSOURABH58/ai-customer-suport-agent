import OpenAI from "openai";

interface StreamResult {
  content: string;
  done: boolean;
}

export async function handleAIResponse(
  messages: any[],
  onChunk: (content: string) => void,
  onComplete: (fullResponse: string) => void
) {
  let fullContent = "";

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const stream = await openai.chat.completions.create({
    model: "deepseek/deepseek-chat-v3-0324:free",
    messages,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    fullContent += content;
    onChunk(content); // Pipe each chunk
  }

  onComplete(fullContent); // Pipe complete response
  return fullContent;
}
