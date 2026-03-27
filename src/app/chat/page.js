'use client'
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
      if (!input.trim()) return;
      const userMessage = { sender: "user", text: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);

      try {
        const response = await fetch("http://localhost:5000/predict_intent_v2", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: input })
        });

        const data = await response.json();

        // --- NEW HANDLING LOGIC START ---
        
        // 1. Format the Top-K intents into a readable string
        const topIntentsText = data.top_intents
          ? data.top_intents
              .slice(0, 3) // Take top 3 for brevity
              .map(it => `• ${it.intent}: ${(it.confidence * 100).toFixed(1)}%`)
              .join('\n')
          : '';

        // 2. Build the final message string
        const botMessage = {
          sender: "bot",
          text: `🎯 Predicted Intent: ${data.intent}
  📊 Confidence: ${(data.confidence * 100).toFixed(2)}%
  🎭 Sentiment: ${data.sentiment}

  🔍 Top Alternatives:
  ${topIntentsText}

  Source: ${data.source}`
        };
        
        // --- NEW HANDLING LOGIC END ---

        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage = { sender: "bot", text: "Error connecting to the backend." };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-4">
      <motion.h1
        className="text-4xl font-bold mb-6 text-purple-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Query Classification
      </motion.h1>
      <Card className="w-full max-w-xl shadow-xl rounded-2xl">
        <CardContent className="p-4 space-y-4">
          <ScrollArea className="h-96 p-2 bg-white rounded-md border">
            <div className="flex flex-col gap-2 whitespace-pre-wrap">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  className={`p-3 rounded-xl max-w-xs text-white ${
                    msg.sender === "user"
                      ? "bg-blue-500 self-end ml-auto"
                      : "bg-purple-500 self-start"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {msg.text}
                </motion.div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex gap-2">
            <Input
              className="flex-1"
              placeholder="Enter complaint here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
            />
            <Button onClick={sendMessage} disabled={loading}>
              {loading ? "Sending..." : "Send"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}