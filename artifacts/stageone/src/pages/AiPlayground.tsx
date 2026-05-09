import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { GoldButton } from "@/components/ui/GoldButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedGradient } from "@/components/effects/AnimatedGradient";
import {
  Globe, Sparkles, TrendingUp, Zap, MessageSquare, Send,
  Loader2, RotateCcw, ArrowRight, Lock, Mail, Copy, Check,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Tool = "website_copy" | "brand_names" | "marketing_assistant" | "automation_ideas" | "chatbot_assistant";

interface Message { role: "user" | "assistant"; content: string }
interface TabState { messages: Message[]; lastPrompt: string }

const TABS: Array<{ id: Tool; label: string; icon: React.ReactNode; placeholder: string; isChat: boolean; color: string }> = [
  {
    id: "website_copy", label: "Website Copy", icon: <Globe size={15} />,
    placeholder: "Describe your business — e.g. 'SaaS project management tool for remote teams, targeting CTOs at Series A startups'",
    isChat: false, color: "from-blue-500/10 to-transparent",
  },
  {
    id: "brand_names", label: "Brand Names", icon: <Sparkles size={15} />,
    placeholder: "Describe what you're naming — e.g. 'A luxury skincare line using AI formulation, targeting affluent women 30-50'",
    isChat: false, color: "from-purple-500/10 to-transparent",
  },
  {
    id: "marketing_assistant", label: "Marketing AI", icon: <TrendingUp size={15} />,
    placeholder: "Ask any marketing question — e.g. 'How do I build a high-converting LinkedIn lead gen funnel for a B2B SaaS?'",
    isChat: true, color: "from-green-500/10 to-transparent",
  },
  {
    id: "automation_ideas", label: "Automation Ideas", icon: <Zap size={15} />,
    placeholder: "Describe your business — e.g. 'E-commerce store selling handmade jewelry, 50 orders/day, 2 staff members'",
    isChat: false, color: "from-amber-500/10 to-transparent",
  },
  {
    id: "chatbot_assistant", label: "AI Assistant", icon: <MessageSquare size={15} />,
    placeholder: "Ask me anything about business, AI, marketing, strategy, or tech...",
    isChat: true, color: "from-primary/10 to-transparent",
  },
];

const FREE_LIMIT = 4;
const STORAGE_KEY = "stageone_playground_usage";
const EMAIL_KEY = "stageone_playground_email";

// ─── Markdown renderer ────────────────────────────────────────────────────────
function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) return <div key={i} className="text-primary font-semibold text-sm mt-5 mb-2 first:mt-0 tracking-wide">{line.slice(3)}</div>;
        if (line.startsWith("# ")) return <div key={i} className="text-white font-bold text-base mt-5 mb-2 first:mt-0">{line.slice(2)}</div>;
        if (line.startsWith("### ")) return <div key={i} className="text-white/80 font-semibold text-sm mt-4 mb-1">{line.slice(4)}</div>;
        if (line.match(/^\d+\.\s/)) return (
          <div key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed ml-2">
            <span className="text-primary font-semibold flex-shrink-0">{line.match(/^\d+/)?.[0]}.</span>
            <span>{line.replace(/^\d+\.\s/, "")}</span>
          </div>
        );
        if (line.startsWith("- ") || line.startsWith("• ")) return (
          <div key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed ml-2">
            <span className="text-primary mt-1.5 flex-shrink-0 text-xs">▸</span>
            <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
          </div>
        );
        if (line.startsWith("**") && line.endsWith("**")) return (
          <div key={i} className="text-white font-semibold text-sm mt-3">{line.slice(2, -2)}</div>
        );
        if (line.trim() === "") return <div key={i} className="h-2" />;
        return (
          <div key={i} className="text-sm text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
        );
      })}
    </div>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
      title="Copy"
    >
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
    </button>
  );
}

// ─── Email gate modal ─────────────────────────────────────────────────────────
function EmailGate({ onSubmit }: { onSubmit: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!email.includes("@")) return;
    setLoading(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "ai_website_generator", metadata: JSON.stringify({ tool: "playground" }) }),
      });
    } catch {}
    localStorage.setItem(EMAIL_KEY, email);
    setLoading(false);
    onSubmit(email);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-background/85 backdrop-blur-lg rounded-xl"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 w-full max-w-sm mx-4 text-center border border-primary/20"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
          <Lock size={22} className="text-primary" />
        </div>
        <h3 className="font-serif text-xl font-bold text-white mb-2">Unlock More Generations</h3>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          You've used your {FREE_LIMIT} free generations. Enter your email to continue with unlimited access.
        </p>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          autoFocus
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all mb-4 text-sm input-gold"
        />
        <GoldButton onClick={submit} disabled={!email.includes("@") || loading} className="w-full">
          {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Mail size={16} className="mr-2" />}
          Continue Free
        </GoldButton>
        <p className="text-xs text-muted-foreground/50 mt-3">No credit card. Just great AI results.</p>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AiPlayground() {
  const [activeTool, setActiveTool] = useState<Tool>("website_copy");
  const [tabStates, setTabStates] = useState<Record<Tool, TabState>>(() =>
    Object.fromEntries(TABS.map((t) => [t.id, { messages: [], lastPrompt: "" }])) as Record<Tool, TabState>
  );
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [usageCount, setUsageCount] = useState<number>(() => {
    try { return parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10); } catch { return 0; }
  });
  const [emailUnlocked, setEmailUnlocked] = useState(() => !!localStorage.getItem(EMAIL_KEY));

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentTab = TABS.find((t) => t.id === activeTool)!;
  const currentState = tabStates[activeTool];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentState.messages, streamContent]);

  useEffect(() => {
    setInput("");
    inputRef.current?.focus();
  }, [activeTool]);

  const trackUsage = () => {
    const next = usageCount + 1;
    setUsageCount(next);
    try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
  };

  const canGenerate = () => {
    if (emailUnlocked) return true;
    if (usageCount >= FREE_LIMIT) { setShowEmailGate(true); return false; }
    return true;
  };

  const stream = useCallback(async (prompt: string, history: Message[]) => {
    if (!canGenerate()) return;
    if (!prompt.trim() || streaming) return;

    trackUsage();
    setStreaming(true);
    setStreamContent("");

    // Optimistically add user message for chat tools
    if (currentTab.isChat) {
      setTabStates((prev) => ({
        ...prev,
        [activeTool]: {
          ...prev[activeTool],
          messages: [...prev[activeTool].messages, { role: "user", content: prompt }],
        },
      }));
    }

    try {
      const res = await fetch("/api/ai/playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: activeTool,
          prompt,
          history: history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) throw new Error("Failed");

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
          if (data.delta) { accumulated += data.delta; setStreamContent(accumulated); }
          if (data.done) {
            setTabStates((prev) => ({
              ...prev,
              [activeTool]: {
                messages: [...prev[activeTool].messages, { role: "assistant", content: accumulated }],
                lastPrompt: prompt,
              },
            }));
            setStreamContent("");
          }
        }
      }
    } catch {
      setStreamContent("Generation failed. Please try again.");
    } finally {
      setStreaming(false);
    }
  }, [activeTool, streaming, usageCount, emailUnlocked, currentTab.isChat]);

  const handleSubmit = () => {
    const q = input.trim();
    if (!q) return;
    setInput("");
    stream(q, currentState.messages);
  };

  const clearTab = () => {
    setTabStates((prev) => ({
      ...prev,
      [activeTool]: { messages: [], lastPrompt: "" },
    }));
    setStreamContent("");
  };

  const usageLeft = Math.max(0, FREE_LIMIT - usageCount);

  return (
    <AppLayout>
      <section className="min-h-screen pt-28 pb-16 px-4 md:px-8 relative overflow-hidden">
        <AnimatedGradient intensity="low" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles size={13} className="text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">AI Playground</span>
              {!emailUnlocked && (
                <span className="ml-2 text-xs bg-white/10 rounded-full px-2 py-0.5 text-muted-foreground">
                  {usageLeft} free left
                </span>
              )}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              5 AI Tools.
              <span className="shimmer-text"> One Playground.</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Generate website copy, brand names, marketing strategies, automation blueprints, and more — powered by NVIDIA AI.
            </p>
          </motion.div>

          {/* Tool tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex gap-1.5 flex-wrap justify-center mb-8"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTool(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  activeTool === tab.id
                    ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_20px_rgba(201,168,76,0.1)]"
                    : "text-muted-foreground bg-white/4 border border-white/8 hover:border-white/15 hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Main interface */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTool}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div className="glass-card rounded-2xl overflow-hidden border border-white/8">
                  {/* Tab header bar */}
                  <div className={`flex items-center justify-between px-6 py-4 border-b border-white/6 bg-gradient-to-r ${currentTab.color}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        {currentTab.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{currentTab.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {currentTab.isChat ? "Conversational AI" : "One-shot generation"}
                        </div>
                      </div>
                    </div>
                    {currentState.messages.length > 0 && (
                      <button
                        onClick={clearTab}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors border border-white/10 rounded-lg px-3 py-1.5 hover:border-white/20"
                      >
                        <RotateCcw size={11} />
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Messages / output area */}
                  <div className="min-h-[320px] max-h-[520px] overflow-y-auto p-6 space-y-5">
                    {currentState.messages.length === 0 && !streamContent && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-56 text-center"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center text-primary mb-4 animate-float">
                          {currentTab.icon}
                        </div>
                        <div className="text-white/50 text-sm font-medium mb-1">{currentTab.label}</div>
                        <div className="text-muted-foreground/60 text-xs max-w-xs">{currentTab.placeholder}</div>
                      </motion.div>
                    )}

                    {currentState.messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.role === "user" ? (
                          <div className="max-w-[78%] bg-primary/12 border border-primary/20 rounded-2xl rounded-tr-sm px-5 py-3">
                            <div className="text-sm text-white leading-relaxed">{msg.content}</div>
                          </div>
                        ) : (
                          <div className="w-full max-w-full">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                                <Sparkles size={10} className="text-primary" />
                              </div>
                              <span className="text-xs font-semibold text-primary uppercase tracking-widest">STAGEONE AI</span>
                              <div className="flex-1" />
                              <CopyButton text={msg.content} />
                            </div>
                            <div className="pl-7">
                              <RenderMarkdown text={msg.content} />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {/* Streaming output */}
                    {streamContent && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="w-full max-w-full">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Sparkles size={10} className="text-primary" />
                              </motion.div>
                            </div>
                            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Generating...</span>
                          </div>
                          <div className="pl-7">
                            <RenderMarkdown text={streamContent} />
                            <span className="inline-block w-0.5 h-4 bg-primary animate-blink ml-0.5 align-middle" />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {streaming && !streamContent && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="flex gap-1">
                          {[0, 150, 300].map((d) => (
                            <span key={d} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d}ms` }} />
                          ))}
                        </div>
                        <span className="text-xs">Processing...</span>
                      </div>
                    )}

                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t border-white/6 px-6 py-4 bg-black/20">
                    <div className="flex gap-3 items-end">
                      <div className="flex-1 relative">
                        <textarea
                          ref={inputRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
                          }}
                          placeholder={currentTab.placeholder}
                          rows={2}
                          disabled={streaming}
                          className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-all resize-none text-sm input-gold"
                        />
                      </div>
                      <GoldButton
                        onClick={handleSubmit}
                        disabled={!input.trim() || streaming}
                        className="h-12 w-12 p-0 flex-shrink-0 rounded-xl"
                      >
                        {streaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      </GoldButton>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground/40">
                      <span>Enter to generate · Shift+Enter for newline</span>
                      {!emailUnlocked && (
                        <span>{usageLeft} free generation{usageLeft !== 1 ? "s" : ""} remaining</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email gate overlay */}
                <AnimatePresence>
                  {showEmailGate && (
                    <EmailGate onSubmit={(email) => {
                      setEmailUnlocked(true);
                      setShowEmailGate(false);
                    }} />
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Quick prompts row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex flex-wrap gap-2 justify-center"
          >
            {[
              { tool: "website_copy" as Tool, label: "E-commerce landing page" },
              { tool: "brand_names" as Tool, label: "Tech startup brand name" },
              { tool: "marketing_assistant" as Tool, label: "YouTube growth strategy" },
              { tool: "automation_ideas" as Tool, label: "Restaurant automations" },
              { tool: "chatbot_assistant" as Tool, label: "How to 10x revenue?" },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => { setActiveTool(p.tool); setInput(p.label); }}
                className="text-xs bg-white/4 border border-white/8 rounded-full px-3 py-1.5 text-muted-foreground hover:text-white hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                {p.label}
              </button>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center p-10 rounded-2xl border border-primary/15 bg-primary/4 relative overflow-hidden"
          >
            <AnimatedGradient intensity="low" />
            <div className="relative z-10">
              <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Go Beyond the Demo</div>
              <h3 className="font-serif text-2xl text-white mb-3">
                Want STAGEONE to build this
                <span className="shimmer-text"> into your actual business?</span>
              </h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-xl mx-auto">
                We integrate AI systems directly into your operations — custom-built, fully automated, and designed for your exact workflows.
              </p>
              <GoldButton href="/contact" size="lg">
                Book a Free Strategy Call
                <ArrowRight size={16} />
              </GoldButton>
            </div>
          </motion.div>
        </div>
      </section>
    </AppLayout>
  );
}
