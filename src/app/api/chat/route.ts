import { handleAIResponse } from "@/ai/ai-provider";
import { initPrompt } from "@/ai/PromptProvider";
import { Chat } from "@/db/models/chat";
import { User } from "@/db/models/user";
import { connectToDB } from "@/db/mongo";
import mongoose from "mongoose";

const createNewChat = async (userId: string) => {
  const user = await User.findById(userId);

  const chat = new Chat({
    messages: [...initPrompt],
    userId: new mongoose.Types.ObjectId(userId),
  });
  await chat.save();
  user.chats.push(chat._id);
  await user.save();
  return chat;
};

export async function POST(req: Request) {
  await connectToDB();

  console.log("req.userId", req.headers);

  const userId = req.headers.get("x-user-id");

  const { chatId, message } = await req.json();

  if (!chatId) {
    const chat = await createNewChat(userId);
    return new Response(JSON.stringify(chat), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Find chat and append message
  const chat = await Chat.findById(chatId);
  chat.messages.push({ role: "user", content: message });
  const newChat = await chat.save();

  console.log(newChat);

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();

  handleAIResponse(
    newChat.messages,
    (chunk) => {
      // chunk is a string
      writer.write(chunk);
    },
    async (fullResponse) => {
      chat.messages.push({ role: "assistant", content: fullResponse });
      await chat.save();
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  //@ts-ignore
  const { chatId } = searchParams;
  //@ts-ignore
  const user = await User.findById(req.userId);

  if (!user.chats.includes(chatId)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const chat = await Chat.findById(chatId);
  return new Response(JSON.stringify(chat.messages), {
    headers: { "Content-Type": "application/json" },
  });
}
