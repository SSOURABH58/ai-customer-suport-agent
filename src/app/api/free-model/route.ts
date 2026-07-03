import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models");
    if (!res.ok) {
      return NextResponse.json({ success: false, message: "Failed to fetch models" }, { status: 502 });
    }

    const data = await res.json();
    const models = (data.data as Array<{ id: string; pricing?: { prompt?: unknown; completion?: unknown } }> | undefined) ?? [];

    const freeModels = models
      .filter((m) => typeof m.id === "string" && m.id.endsWith(":free"))
      .sort((a, b) => {
        const aFree = isFreeOrZero(a.pricing?.prompt) && isFreeOrZero(a.pricing?.completion);
        const bFree = isFreeOrZero(b.pricing?.prompt) && isFreeOrZero(b.pricing?.completion);
        if (aFree !== bFree) return aFree ? -1 : 1;
        return (a.pricing?.prompt ?? 0) > (b.pricing?.prompt ?? 0) ? 1 : -1;
      });

    if (!freeModels.length) {
      return NextResponse.json({ success: false, message: "No free models available" }, { status: 404 });
    }

    const chosen = freeModels[0].id;
    return NextResponse.json({ success: true, modelId: chosen });
  } catch {
    return NextResponse.json({ success: false, message: "Unexpected error" }, { status: 500 });
  }
}

function isFreeOrZero(value: unknown) {
  const n = typeof value === "number" ? value : parseFloat(value as string);
  return Number.isFinite(n) && n === 0;
}
