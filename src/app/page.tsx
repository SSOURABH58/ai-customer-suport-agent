"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send } from "lucide-react";
import Profile from "@/components/profile";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Message {
  content: string;
  isUser: boolean;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [user, setUser] = useState<{ id?: string; username?: string; chats?: string[] } | null>(null);
  const [streamedMessage, setStreamedMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [limitDialog, setLimitDialog] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadChat = async (cid: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    const res = await fetch(`/api/chat?chatId=${cid}`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user?.id || "",
      },
    });

    if (!res.ok) return;
    const data = (await res.json()) as Array<{ role: string; content: string }>;
    const filtered = data
      .filter((m) => m.role !== "system")
      .map((m) => ({ ...m, isUser: m.role === "user" }));
    setMessages(filtered);
  };

  const handleSend = async () => {
    if (input.trim() === "") return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/auth";
      return;
    }

    let targetChatId = chatId;

    if (!targetChatId) {
      setIsLoading(true);
      try {
        const createRes = await fetch(`/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user?.id || "",
          },
          body: JSON.stringify({ chatId: null }),
        });

        if (createRes.status === 403) {
          const payload = await createRes.json().catch(() => ({}));
          if (payload?.message === "Limit Reached") {
            setLimitDialog(true);
          }
          setIsLoading(false);
          return;
        }

        if (!createRes.ok) {
          setIsLoading(false);
          return;
        }

        const chatObj = await createRes.json();
        targetChatId = chatObj._id;
        setChatId(targetChatId);

        const updatedUser = { ...user, chats: [...(user?.chats || []), targetChatId] };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Error creating chat:", error);
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    }

    const userMessage = input;
    setMessages((p) => [...p, { content: userMessage, isUser: true }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({ chatId: targetChatId, message: userMessage }),
      });

      if (response.status === 403) {
        const payload = await response.json().catch(() => ({}));
        if (payload?.message === "Limit Reached") {
          setLimitDialog(true);
        }
        setIsLoading(false);
        return;
      }

      setIsStreaming(true);
      if (!response.body) {
        setIsStreaming(false);
        setIsLoading(false);
        return;
      }

      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          setStreamedMessage((p) => p + value);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsStreaming(false);
      setIsLoading(false);
      setInput("");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/auth";
      return;
    }

    (async () => {
      const stored = JSON.parse(localStorage.getItem("user") || "{}") as {
        id?: string;
        username?: string;
        chats?: string[];
      };
      const chats = stored.chats || [];
      const lastChat = chats.slice().reverse().find((id: string) => id);

      if (lastChat) {
        await loadChat(lastChat);
        setChatId(lastChat);
      }
      setUser(stored);
    })();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, streamedMessage, isLoading]);

  return (
    <div className="relative flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Profile username={user?.username || ""} />
      <div className="flex-1 overflow-hidden w-full max-w-3xl mx-auto md:p-8 relative">
        <Card className="flex flex-col h-full border-2 transition-all duration-300 animate-border-pulse bg-gradient-to-b from-transparent to-green-50 dark:to-green-900/30 animate-glow-pulse">
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            ref={containerRef}
          >
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 pt-8">Send a message to start chatting</p>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg text-wrap ${
                      message.isUser
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted text-muted-foreground rounded-tl-none"
                    }`}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              ))
            )}
            {streamedMessage && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-4 rounded-lg bg-muted text-muted-foreground rounded-tl-none">
                  <ReactMarkdown>{streamedMessage}</ReactMarkdown>
                </div>
              </div>
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-4 rounded-lg bg-muted text-muted-foreground rounded-tl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t flex gap-2 items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
              disabled={isLoading || limitDialog}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || input.trim() === "" || isStreaming || limitDialog}
              className="bg-background disabled:opacity-50"
              size="icon"
            >
              <Send className="h-5 w-5 text-primary" color="#10a37f" />
            </Button>
          </div>
        </Card>
      </div>

      <Dialog open={limitDialog} onOpenChange={setLimitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Limit Reached</DialogTitle>
            <DialogDescription>
              You have used the available limit. This session allows only 3 requests/messages. To continue
              chatting, log in again or create a new account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setLimitDialog(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
