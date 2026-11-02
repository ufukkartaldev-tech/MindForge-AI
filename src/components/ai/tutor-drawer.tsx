"use client";

import React, { useState } from "react";
import { MessageSquare, Send, Sparkles, X, Bot, User, Loader2 } from "lucide-react";
import { TutorMessage } from "@/lib/types";
import { getStoredTutorMessages, saveTutorMessage, getStoredApiKey } from "@/lib/storage";

interface TutorDrawerProps {
  courseTitle?: string;
  topicTitle?: string;
  courseId?: string;
  topicId?: string;
}

export function TutorDrawer({
  courseTitle = "Ders",
  topicTitle = "Konu",
  courseId,
  topicId
}: TutorDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<TutorMessage[]>(() => getStoredTutorMessages(topicId || courseId));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input.trim();
    if (!textToSend || loading) return;

    const userMsg: TutorMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      content: textToSend,
      timestamp: new Date().toISOString(),
      courseId,
      topicId
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveTutorMessage(userMsg);
    if (!questionText) setInput("");
    setLoading(true);

    try {
      const storedKey = getStoredApiKey();
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(storedKey ? { "x-gemini-key": storedKey } : {})
        },
        body: JSON.stringify({
          action: "tutor",
          courseTitle,
          topicTitle,
          courseId,
          topicId,
          userQuestion: textToSend,
          context: newMessages.slice(-4)
        })
      });

      const data = await res.json();
      const replyContent = data.reply || "Sorunu aldım, konuyu birlikte adım adım inceleyelim!";

      const botMsg: TutorMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "assistant",
        content: replyContent,
        timestamp: new Date().toISOString(),
        courseId,
        topicId
      };

      setMessages(prev => [...prev, botMsg]);
      saveTutorMessage(botMsg);
    } catch (e) {
      console.error("Tutor error:", e);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Daha basit bir örnekle açıklar mısın?",
    "Vize sınavında bu konudan ne sorulabilir?",
    "Bu konunun pratik bir kod örneğini ver"
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground font-medium shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
      >
        <Sparkles className="w-4 h-4 fill-current animate-pulse" />
        <span className="text-xs font-semibold">AI Öğretmene Sor</span>
      </button>

      {/* Slide-over Drawer Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md h-full bg-card border-l border-border flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    MindForge AI Öğretmen
                  </h3>
                  <p className="text-[11px] text-muted-foreground truncate max-w-[240px]">
                    {courseTitle} • {topicTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="p-2.5 border-b border-border bg-background/50 flex gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(qp)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full border border-border text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted text-foreground rounded-tl-none border border-border font-sans"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.sender === "user" && (
                    <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>AI Öğretmen yanıtı hazırlıyor...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-border bg-background">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Kafana takılan soruyu yaz..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-input bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
