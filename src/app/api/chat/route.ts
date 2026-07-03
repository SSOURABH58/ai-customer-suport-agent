import { handleAIResponse } from "@/ai/ai-provider";
import { initPrompt } from "@/ai/PromptProvider";
import { Chat } from "@/db/models/chat";
import { User } from "@/db/models/user";
import { connectToDB } from "@/db/mongo";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

const MAX_ACCOUNT_CHATS = 3;
const MAX_SESSION_TURNS = 3;

interface OpenRouterModel {
  id: string;
  pricing?: {
    prompt?: string | number;
    completion?: string | number;
  };
}

async function getFreeModel() {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models");
    if (!res.ok) return "openrouter/auto";
    const data = await res.json();
    const free = (data.data as unknown as OpenRouterModel[] || [])
      .filter((m) => typeof m.id === "string" && m.id.endsWith(":free"))
      .sort((a, b) => {
        const aFree = isFreeOrZero(a.pricing?.prompt) && isFreeOrZero(a.pricing?.completion);
        const bFree = isFreeOrZero(b.pricing?.prompt) && isFreeOrZero(b.pricing?.completion);
        if (aFree !== bFree) return aFree ? -1 : 1;
        return Number(a.pricing?.prompt || 0) > Number(b.pricing?.prompt || 0) ? 1 : -1;
      });
    return free[0]?.id || "openrouter/auto";
  } catch {
    return "openrouter/auto";
  }
}

function isFreeOrZero(value: unknown) {
  const n = typeof value === "number" ? value : parseFloat(value as string);
  return Number.isFinite(n) && n === 0;
}

const createNewChat = async (userId: string) => {
  const user = await User.findById(userId) as mongoose.Document & { usedChatCount?: number; chats: mongoose.Types.ObjectId[] };
  if (!user) throw new Error("User not found");
  if ((user.usedChatCount || 0) >= MAX_ACCOUNT_CHATS) {
    return { blocked: true as const, reason: "Limit Reached" };
  }

  const chat = new Chat({
    messages: [...initPrompt],
    userId: new mongoose.Types.ObjectId(userId),
    model: await getFreeModel(),
  });
  await chat.save();

  user.chats.push(chat._id as mongoose.Types.ObjectId);
  user.usedChatCount = (user.usedChatCount || 0) + 1;
  await user.save();

  return { blocked: false as const, chat };
};

const SESSION_COOKIE = "chat_session_id";
const sessionCounts = new Map<string, number>();

function getSessionIdCookie(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setSessionIdCookie(sessionId: string) {
  const maxAge = 60 * 60 * 24 * 365;
  return `SESSION_COOKIE=${SESSION_COOKIE}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Value=${sessionId}`;
}

export async function POST(req: Request) {
  await connectToDB();

  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });
  }

  const user = await User.findById(userId);
  if (!user) {
    return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 401 });
  }

  let sessionId = getSessionIdCookie(req);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }

  const { chatId, message } = await req.json().catch(() => ({ chatId: null, message: null }));

  if (!chatId) {
    const result = await createNewChat(userId);
    if (result.blocked) {
      return new Response(JSON.stringify({ success: false, message: "Limit Reached" }), { status: 403 });
    }

    const headers = new Headers({ "Content-Type": "application/json", "Set-Cookie": setSessionIdCookie(sessionId) });
    return new Response(JSON.stringify(result.chat.toObject()), { headers });
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return new Response(JSON.stringify({ success: false, message: "Chat not found" }), { status: 404 });
  }

  const currentCount = sessionCounts.get(sessionId) || 0;
  if (currentCount >= MAX_SESSION_TURNS) {
    return new Response(JSON.stringify({ success: false, message: "Limit Reached" }), { status: 403 });
  }

  if (message) {
    chat.messages.push({ role: "user", content: message });
  }
  const savedChat = await chat.save();

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const model = chat.model || (await getFreeModel()) || "openrouter/auto";

  handleAIResponse(
    savedChat.messages,
    (chunk) => writer.write(chunk),
    async (fullResponse) => {
      chat.messages.push({ role: "assistant", content: fullResponse });
      await chat.save();
      writer.close();
    },
    model
  );

  sessionCounts.set(sessionId, currentCount + 1);

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Set-Cookie": setSessionIdCookie(sessionId),
    },
  });
}

export async function GET(req: Request) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const chatId = Object.fromEntries(searchParams.entries()).chatId;
  const user = await User.findById(req.headers.get("x-user-id"));

  if (!user || !user.chats.map((v: mongoose.Types.ObjectId) => String(v)).includes(chatId)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const chat = await Chat.findById(chatId);
  return new Response(JSON.stringify(chat?.messages || []), {
    headers: { "Content-Type": "application/json" },
  });
}
