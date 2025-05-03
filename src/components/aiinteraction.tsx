"use client";
import React, { useState, useEffect, useRef } from "react";
import { TalkWithAIFunction } from "@/utils";

interface AiInteractionProps {
  fileContent: any;
  setFileContent: React.Dispatch<React.SetStateAction<any>>;
}

export default function AiInteraction({
  fileContent,
  setFileContent,
}: AiInteractionProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: { role: "user" | "ai"; content: string } = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    const prompt = input.trim();
    setInput("");

    interface SwaggerAIResponse {
      aiResponse: string;
      updatedSwagger: object;
    }

    try {
      const response = (await TalkWithAIFunction({
        fileContent: fileContent,
        userPrompt: prompt,
      })) as SwaggerAIResponse;

      const incomingMessage = response?.aiResponse;
      const incomingSwaggerJson = response.updatedSwagger;

      const aiMessage: { role: "user" | "ai"; content: string } = {
        role: "ai",
        content: incomingMessage || "No response from AI.",
      };

      setMessages((prev) => [...prev, aiMessage]);

      // ✅ Update fileContent only if updatedSwagger is not an empty object
      if (incomingSwaggerJson && Object.keys(incomingSwaggerJson).length > 0) {
        setFileContent(incomingSwaggerJson);
      }
    } catch (e) {
      console.error("AI Interaction Error:", e);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "⚠️ AI failed to process your query." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  return (
    <div className="h-full w-full flex flex-col p-4">
      {/* Chat Window */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 rounded-lg"
      >
        {messages.length === 0 && (
          <p className="text-gray-700 text-center mt-5">
            Ask how to change or understand your Swagger file...
          </p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-xl px-4 py-2 max-w-[70%] text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-green-700 text-right text-white"
                  : "bg-green-500 text-left"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-sm text-gray-500 italic">Thinking...</div>
        )}
      </div>

      {/* Input Box */}
      <div className="pt-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Change all GET to POST, Add auth header..."
            className="flex-1 rounded-lg border border-green-400 px-4 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={handleSend}
            disabled={loading || input.trim() === ""}
            className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
