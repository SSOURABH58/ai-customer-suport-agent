import { handleAIResponse } from "@/ai/ai-provider";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();

  handleAIResponse(
    messages,
    (chunk) => {
      writer.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    },
    (fullResponse) => {
      // Store full response in DB if needed
      writer.close();
    }
  );

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
