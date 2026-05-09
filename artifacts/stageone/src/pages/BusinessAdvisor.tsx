import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { GoldButton } from "@/components/ui/GoldButton";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Brain, Send, ArrowRight, RotateCcw, Bookmark, ChevronDown,
  TrendingUp, Zap, Target, Layers, Shield, BarChart3, Loader2,
} from "lucide-react";

const SUGGESTED_PROMPTS = [
  { icon: <TrendingUp size={14} />, text: "How can I scale my business from $1M to $10M ARR using AI automation?" },
  { icon: <Zap size={14} />, text: "What AI tools should I implement first to reduce operational overhead by 40%?" },
  { icon: <Target size={14} />, text: "How do I build an AI-powered lead generation system that converts at 15%+?" },
  { icon: <Layers size={14} />, text: "What's the most effective AI marketing stack for a B2B SaaS company?" },
  { icon: <Shield size={14} />, text: "How do I position my brand as the premium option in a crowded market?" },
  { icon: <BarChart3 size={14} />, text: "What growth strategies should I prioritize to achieve 3x revenue in 12 months?" },
];

const DOMAINS = [
  { id: "automation", label: "Automation" },
  { id: "marketing", label: "Marketing" },
  { id: "operations", label: "Operations" },
  { id: "growth_strategy", label: "Growth" },
  { id: "ai_integration", label: "AI Integration" },
  { id: "brand_positioning", label: "Branding" },
] as const;

type Domain = typeof DOMAINS[number]["id"];

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

function formatMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## ")) {
      return <div key={i} className="text-primary font-semibold text-sm mt-4 mb-2 first:mt-0">{line.slice(3)}</div>;
    }
    if (line.startsWith("# ")) {
      return <div key={i} className="text-white font-bold text-base mt-4 mb-2 first:mt-0">{line.slice(2)}</div>;
    }
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return (
        <div key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed ml-2">
          <span className="text-primary mt-1.5 flex-shrink-0">▸</span>
          <span>{line.slice(2)}</span>
        </div>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return <div key={i} className="text-sm text-muted-foreground leading-relaxed">{line}</div>;
  });
}

const STORAGE_KEY = "stageone_advisor_history";

export default function BusinessAdvisor() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Message[]) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [domain, setDomain] = useState<Domain | "">("");
  const [industry, setIndustry] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [email, setEmail] = useState("");
  const [emailSaved, setEmailSaved] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamContent]);

  async function sendMessage(question?: string) {
    const q = question ?? input.trim();
    if (!q || streaming) return;

    if (email && !emailSaved) {
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "ai_business_advisor" }),
      }).catch(() => {});
      setEmailSaved(true);
    }

    const userMsg: Message = { role: "user", content: q, timestamp: Date.now() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setStreaming(true);
    setStreamContent("");

    try {
      const res = await fetch("/api/ai/business/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          domain: domain || undefined,
          industry: industry || undefined,
          history: history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("Request failed");
      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));
          if (data.delta) {
            accumulated += data.delta;
            setStreamContent(accumulated);
          }
          if (data.done) {
            const assistantMsg: Message = { role: "assistant", content: accumulated, timestamp: Date.now() };
            setMessages((prev) => [...prev, assistantMsg]);
            setStreamContent("");
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I encountered an issue. Please try again.", timestamp: Date.now() },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  function clearHistory() {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <AppLayout>
      <section className="min-h-screen pt-28 pb-0 px-6 md:px-12 flex flex-col">
        <div className="max-w-5xl mx-auto w-full flex flex-col flex-1">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <Brain size={14} className="text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">AI Business Advisor</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Your Personal
              <span className="shimmer-text"> AI Strategist</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ask anything about growth, automation, marketing, and AI strategy. Get expert-level, actionable advice powered by NVIDIA AI.
            </p>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            <div>
              <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2">Focus Domain</label>
              <div className="relative">
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as Domain)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm appearance-none focus:outline-none focus:border-primary/50 transition-all"
                >
                  <option value="" className="bg-background">Any Domain</option>
                  {DOMAINS.map((d) => (
                    <option key={d.id} value={d.id} className="bg-background">{d.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2">Your Industry</label>
              <input
                type="text"
                placeholder="e.g. SaaS, E-commerce..."
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2">Your Email</label>
              <input
                type="email"
                placeholder="Get strategy report"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
          </motion.div>

          {/* Suggested Prompts */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <div className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Suggested Questions</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt.text)}
                    disabled={streaming}
                    className="flex items-start gap-3 text-left p-3 rounded-lg border border-white/8 bg-white/3 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
                  >
                    <span className="text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform">{prompt.icon}</span>
                    <span className="text-sm text-muted-foreground group-hover:text-white transition-colors leading-relaxed">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            {messages.length > 0 && (
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs text-muted-foreground">{messages.length} message{messages.length !== 1 ? "s" : ""} in session</div>
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors"
                >
                  <RotateCcw size={12} />
                  Clear History
                </button>
              </div>
            )}

            <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[500px] pr-1 scrollbar-thin">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "user" ? (
                    <div className="max-w-[75%] bg-primary/15 border border-primary/20 rounded-2xl rounded-tr-sm px-5 py-3">
                      <div className="text-sm text-white leading-relaxed">{msg.content}</div>
                    </div>
                  ) : (
                    <div className="max-w-[90%] glass-card rounded-2xl rounded-tl-sm px-5 py-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain size={12} className="text-primary" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-widest">STAGEONE Advisor</span>
                      </div>
                      <div className="space-y-1">{formatMarkdown(msg.content)}</div>
                    </div>
                  )}
                </motion.div>
              ))}

              {streaming && streamContent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[90%] glass-card rounded-2xl rounded-tl-sm px-5 py-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-xs font-semibold text-primary uppercase tracking-widest">Thinking...</span>
                    </div>
                    <div className="space-y-1">{formatMarkdown(streamContent)}</div>
                  </div>
                </motion.div>
              )}

              {streaming && !streamContent && (
                <div className="flex justify-start">
                  <div className="glass-card rounded-2xl rounded-tl-sm px-5 py-4 border border-primary/20">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="sticky bottom-0 pb-6 pt-2 bg-gradient-to-t from-background via-background to-transparent">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about growth, automation, marketing strategy..."
                    rows={2}
                    disabled={streaming}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-5 py-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all resize-none text-sm pr-14"
                  />
                </div>
                <GoldButton
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || streaming}
                  className="h-14 w-14 p-0 flex-shrink-0 rounded-xl"
                >
                  {streaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </GoldButton>
              </div>
              <div className="text-xs text-muted-foreground/50 mt-2 text-center">
                Press Enter to send — Shift+Enter for new line — conversation saved locally
              </div>
            </div>
          </div>

          {/* CTA */}
          {messages.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 mb-8 text-center p-8 rounded-2xl border border-primary/20 bg-primary/5 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(201,168,76,0.6) 0%, transparent 70%)" }} />
              <div className="relative z-10">
                <h3 className="font-serif text-xl text-white mb-2">
                  Want STAGEONE to
                  <span className="shimmer-text"> implement this system for you?</span>
                </h3>
                <p className="text-muted-foreground text-sm mb-5">Turn these strategies into reality. Our team builds the systems so you can focus on growth.</p>
                <GoldButton href="/contact" size="md">
                  Book a Strategy Session
                  <ArrowRight size={16} />
                </GoldButton>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
