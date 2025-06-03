"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Square, StopCircle } from "lucide-react";

interface Message {
  content: string;
  isUser: boolean;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = () => {
    if (input.trim() === "") return;

    setMessages([...messages, { content: input, isUser: true }]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { content: "AI response here", isUser: false },
      ]);
      setIsLoading(false);
    }, 1000);

    setInput("");
  };

  const handleStopResponse = () => {
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="flex-1 overflow-hidden w-full max-w-3xl mx-auto">
        <Card className="flex flex-col h-full border-2 border-primary/50  transition-all duration-300 animate-border-pulse bg-gradient-to-b from-transparent to-green-50 dark:to-green-900/30 animate-glow-pulse">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 pt-8">
                Send a message to start chatting
              </p>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.isUser
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted text-muted-foreground rounded-tl-none"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))
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
              disabled={isLoading}
            />
            <Button
              onClick={isLoading ? handleStopResponse : handleSend}
              disabled={!isLoading && input.trim() === ""}
              className="bg-background"
              size="icon"
            >
              {isLoading ? (
                <Square className="h-5 w-5 text-primary" color="#10a37f" />
              ) : (
                <Send className="h-5 w-5 text-primary" color="#10a37f" />
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
