"use client";

import React, { useState, useEffect } from "react";
import { getStoredCourses, getStoredTutorMessages, saveTutorMessage, getStoredApiKey } from "@/lib/storage";
import { Course, TutorMessage } from "@/lib/types";
import { Bot, Send, User, Sparkles, BookOpen, Loader2, Lightbulb, Code2 } from "lucide-react";

export default function TutorCenterPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("cpp-intro");
  const [selectedTopicTitle, setSelectedTopicTitle] = useState<string>("");
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = getStoredCourses();
    setCourses(stored);
    setMessages(getStoredTutorMessages());
  }, []);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const courseTopics = selectedCourse?.modules.flatMap(m => m.topics) || [];

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || loading) return;

    const userMsg: TutorMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      content: textToSend,
      timestamp: new Date().toISOString(),
      courseId: selectedCourseId,
      topicId: selectedTopicTitle
    };

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    saveTutorMessage(userMsg);
    if (!customPrompt) setInput("");
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
          courseTitle: selectedCourse?.title || "Üniversite Dersi",
          courseId: selectedCourseId,
          topicTitle: selectedTopicTitle || selectedCourse?.title || "Genel Konu",
          userQuestion: textToSend,
          context: newMsgs.slice(-4)
        })
      });

      const json = await res.json();
      const botMsg: TutorMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "assistant",
        content: json.reply || "Sorunu aldım, konuyu birlikte inceleyelim!",
        timestamp: new Date().toISOString(),
        courseId: selectedCourseId,
        topicId: selectedTopicTitle
      };

      setMessages(prev => [...prev, botMsg]);
      saveTutorMessage(botMsg);
    } catch (e) {
      console.error("Tutor hatası:", e);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Bu konuyu ilkokul öğrencisine anlatır gibi basitleştir",
    "Vizede kesin çıkabilecek kritik bir soru tipi üret",
    "Bu konunun C++ veya pratikteki en somut kod örneğini ver",
    "Sık yapılan kavram yanılgıları ve hatalar nelerdir?"
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header & Course Context Selectors */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <span>AI Üniversite Öğretmenim</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dersini ve konunu seç, takıldığın her formülü, algoritmayı veya kodu 7/24 danış.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCourseId}
            onChange={e => {
              setSelectedCourseId(e.target.value);
              setSelectedTopicTitle("");
            }}
            className="text-xs px-3 py-2 rounded-lg border border-input bg-background font-medium"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          <select
            value={selectedTopicTitle}
            onChange={e => setSelectedTopicTitle(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-input bg-background"
          >
            <option value="">Genel Ders Kapsamı</option>
            {courseTopics.map(t => (
              <option key={t.id} value={t.title}>{t.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 p-5 rounded-2xl border border-border bg-card shadow-sm flex flex-col overflow-hidden">
        {/* Messages scroll */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[80%] whitespace-pre-wrap ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none font-medium"
                    : "bg-muted text-foreground rounded-tl-none border border-border"
                }`}
              >
                {msg.content}
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>AI Öğretmen yanıtı formüle ediyor...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="pt-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar border-t border-border">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              className="whitespace-nowrap px-3 py-1.5 rounded-full border border-border text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="pt-2 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={`${selectedCourse?.title || "Ders"} hakkında bir soru sor veya "Bunu daha basit açıkla" de...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 px-4 py-3 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
