"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

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

    // Add user message
    setMessages([...messages, { content: input, isUser: true }]);

    // Simulate AI response (replace with actual API call)
    setIsLoading(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          content:
            "This is a simulated AI response. Replace this with your actual AI integration.",
          isUser: false,
        },
      ]);
      setIsLoading(false);
    }, 1000);

    setInput("");
  };

  const handleStopResponse = () => {
    // Implement stop functionality here
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden ">
      <h1 className="text-2xl font-bold text-center py-4">
        AI Customer Support
      </h1>

      <div className="flex-1 overflow-hidden px-4 w-full max-w-3xl mx-auto">
        <Card className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-4">
              {messages.length === 0 ? (
                <p className="text-center text-gray-500">
                  Start a conversation...
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
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.isUser
                          ? "bg-blue-500 text-white rounded-tr-none"
                          : "bg-gray-200 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-lg bg-gray-200 text-gray-800 rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || input.trim() === ""}
              >
                Send
              </Button>
              {isLoading && (
                <Button variant="destructive" onClick={handleStopResponse}>
                  Stop
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
