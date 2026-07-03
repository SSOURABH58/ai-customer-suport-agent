import { NextResponse } from "next/server";
import OpenAI from "openai";

interface OpenRouterModel {
  id: string;
  pricing?: {
    prompt?: string | number;
    completion?: string | number;
  };
}

export async function GET() {
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  try {
    const models = await openai.models.list();

    const free = (models.data as unknown as OpenRouterModel[])
      .filter((m) => String(m.id).endsWith(":free"))
      .map((m) => {
        const pricing = m.pricing || {};
        const prompt = parseFloat(String(pricing.prompt || "0"));
        const completion = parseFloat(String(pricing.completion || "0"));
        return { id: m.id, prompt, completion };
      })
      .filter((m) => Number.isFinite(m.prompt) && Number.isFinite(m.completion));

    free.sort((a, b) => {
      if (a.prompt === b.completion) return 0;
      if (a.prompt === 0 && a.completion === 0) return -1;
      if (b.prompt === 0 && b.completion === 0) return 1;
      return (a.prompt + a.completion) - (b.prompt + b.completion);
    });

    const selected = free[0]?.id || null;
    return NextResponse.json({ selected, count: free.length });
  } catch (e: unknown) {
    return NextResponse.json({ selected: null, error: (e as Error).message }, { status: 200 });
  }
}
