"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LogOut, Send, Square, StopCircle } from "lucide-react";
import axios from "axios";

interface Message {
  content: string;
  isUser: boolean;
}

const axiosInstance = axios.create();

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [user, setUser] = useState<null | any>(null);

  const handleSend = async () => {
    if (input.trim() === "") return;

    setMessages([...messages, { content: input, isUser: true }]);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ chatId, message: input }),
      });
      setIsLoading(false);
      const reader = response.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // console.log(chunk);
        // const jsonString = chunk.match(/{[\s\S]*}/)?.[0];
        // console.log(jsonString);

        // const parsedChunk = JSON.parse(jsonString ?? "{}");

        setMessages((prev) => [
          ...prev,
          { content: value.choices[0]?.delta?.content, isUser: false },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  const createNewChat = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(`/api/chat`, {});

      setMessages([
        { content: response.data.messages[1].content, isUser: false },
      ]);
      // localStorage.setItem("user", response.data.chatId);
      console.log(response.data);

      return response.data._id;
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  const handleStopResponse = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    console.log(user, token);

    if (token) {
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
    }
    if (user) {
      if (!user.chats?.length) {
        (async () => {
          const newChatID = await createNewChat();
          setChatId(newChatID);
          localStorage.setItem(
            "user",
            JSON.stringify({ ...user, chats: [newChatID] })
          ); // Update the user object with the new chatId and save it to localStorage
          setUser({ ...user, chats: [newChatID] }); // Update the user object with the new chatId and save it to localStorage
        })();
      } else {
        console.log(user);

        setUser(user);
        setChatId(user.chats[0]);
      }
    }

    return () => {
      delete axiosInstance.defaults.headers.common["Authorization"];
    };
  }, []);

  return (
    <div className=" relative flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className=" absolute z-10 md:top-10 md:left-10 top-1 left-2 md:w-4 w-full md:-rotate-90 ">
        <div className="absolute md:right-0 md:bottom-0  flex flex-row items-center justify-center space-y-2  transform-origen-1 ">
          <button className="flex flex-row active:text-white items-center justify-center text-gray-500 hover:text-red-500 transition-colors duration-200 opacity-50 hover:opacity-100 m-0 mr-1 cursor-pointer">
            <LogOut className="h-5 w-5" />
          </button>
          <p className=" text-lg  opacity-70 font-black uppercase text-gray-800 dark:text-gray-200 top-0 left-0">
            {user?.username ?? "Loading..."}
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-hidden w-full max-w-3xl mx-auto md:p-8 relative ">
        <Card className="flex flex-col h-full border-2  transition-all duration-300 animate-border-pulse bg-gradient-to-b from-transparent to-green-50 dark:to-green-900/30 animate-glow-pulse">
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
