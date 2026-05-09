import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { GoldButton } from "@/components/ui/GoldButton";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  MessageSquare, Bot, Zap, ArrowRight, Send, ChevronDown,
  Loader2, Settings, BarChart3, GitBranch, Sparkles, User,
} from "lucide-react";

const BUSINESS_TYPES = [
  "E-commerce Store", "SaaS Product", "Law Firm", "Medical / Dental Practice",
  "Real Estate Agency", "Restaurant / Food Service", "Fitness Studio / Gym",
  "Financial Advisor", "Digital Marketing Agency", "Consulting Firm",
  "Educational Institution", "Hotel / Hospitality", "Insurance Agency",
  "Beauty Salon / Spa", "Tech Startup", "Other",
];

const TONES = [
  { id: "professional", label: "Professional", desc: "Formal, trustworthy" },
  { id: "friendly", label: "Friendly", desc: "Warm, approachable" },
  { id: "luxury", label: "Luxury", desc: "Exclusive, premium" },
  { id: "casual", label: "Casual", desc: "Relaxed, conversational" },
  { id: "technical", label: "Technical", desc: "Precise, expert" },
  { id: "energetic", label: "Energetic", desc: "Dynamic, motivating" },
];

interface ChatbotPersonality {
  name: string;
  greeting: string;
  personality: string;
  expertise: string[];
  sampleResponses: Array<{ question: string; answer: string }>;
  suggestedAutomations: Array<{ title: string; description: string; impact: string }>;
  customerSupportFlows: Array<{ trigger: string; flow: string[]; outcome: string }>;
  systemPrompt: string;
}

interface LiveChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatbotBuilder() {
  const [form, setForm] = useState({
    businessType: "",
    businessName: "",
    industry: "",
    tone: "",
    faqs: "",
    email: "",
  });
  const [generating, setGenerating] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [personality, setPersonality] = useState<ChatbotPersonality | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"personality" | "automations" | "flows" | "chat">("personality");

  // Live chat
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatStreaming, setChatStreaming] = useState(false);
  const [chatStreamContent, setChatStreamContent] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const isValid = form.businessType && form.tone && form.faqs;

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatStreamContent]);

  useEffect(() => {
    if (personality) {
      setChatMessages([{ role: "assistant", content: personality.greeting }]);
    }
  }, [personality]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    if (form.email) {
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, source: "ai_chatbot_builder" }),
      }).catch(() => {});
    }

    setGenerating(true);
    setStreamText("");
    setPersonality(null);
    setError(null);

    try {
      const res = await fetch("/api/ai/chatbot-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed");
      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));
          if (data.delta) setStreamText((p) => p + data.delta);
          if (data.done) {
            if (data.result) {
              setPersonality(data.result as ChatbotPersonality);
              setActiveTab("personality");
            } else {
              setError("Could not parse AI response.");
            }
          }
        }
      }
    } catch {
      setError("Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function sendChatMessage() {
    if (!chatInput.trim() || chatStreaming || !personality) return;
    const userMsg: LiveChatMessage = { role: "user", content: chatInput.trim() };
    const updatedHistory = [...chatMessages, userMsg];
    setChatMessages(updatedHistory);
    setChatInput("");
    setChatStreaming(true);
    setChatStreamContent("");

    try {
      const res = await fetch("/api/ai/chatbot-builder/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType: form.businessType,
          businessName: form.businessName,
          tone: form.tone,
          systemPrompt: personality.systemPrompt,
          messages: updatedHistory.map((m) => ({ role: m.role, content: m.content })),
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
          if (data.delta) { accumulated += data.delta; setChatStreamContent(accumulated); }
          if (data.done) {
            setChatMessages((prev) => [...prev, { role: "assistant", content: accumulated }]);
            setChatStreamContent("");
          }
        }
      }
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I had a connection issue. Please try again." }]);
    } finally {
      setChatStreaming(false);
    }
  }

  return (
    <AppLayout>
      <section className="min-h-screen pt-28 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <Bot size={14} className="text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">AI Chatbot Builder</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-5 leading-tight">
              Build Your AI
              <br />
              <span className="shimmer-text">Chatbot in Seconds</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Enter your business details and FAQs. Our AI generates a complete chatbot personality, support flows, and automation plan — then you can test it live.
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleGenerate}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="mb-8 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Type */}
                <div>
                  <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2">Business Type *</label>
                  <div className="relative">
                    <select
                      value={form.businessType}
                      onChange={(e) => setForm((p) => ({ ...p, businessType: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-primary/50 transition-all"
                    >
                      <option value="" disabled className="bg-background">Select type...</option>
                      {BUSINESS_TYPES.map((t) => (
                        <option key={t} value={t} className="bg-background">{t}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2">Business Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Law Group"
                    value={form.businessName}
                    onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                {/* FAQs */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2">FAQ / Key Business Info *</label>
                  <textarea
                    placeholder={`e.g.\nQ: What are your hours? A: We're open Mon-Fri 9am-6pm\nQ: Do you offer free consultations? A: Yes, 30-min free call\nQ: What are your pricing tiers? A: Starter $99/mo, Pro $299/mo, Enterprise custom`}
                    value={form.faqs}
                    onChange={(e) => setForm((p) => ({ ...p, faqs: e.target.value }))}
                    rows={6}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all resize-none text-sm"
                  />
                </div>

                {/* Tone */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-3">Chatbot Tone *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {TONES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, tone: t.id }))}
                        className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                          form.tone === t.id
                            ? "border-primary bg-primary/10"
                            : "border-white/10 bg-white/3 hover:border-white/20"
                        }`}
                      >
                        <div className="text-sm font-semibold text-white">{t.label}</div>
                        <div className="text-xs text-muted-foreground">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email */}
                <div className="md:col-span-2 border-t border-white/10 pt-5">
                  <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2">Email (optional)</label>
                  <input
                    type="email"
                    placeholder="Get the chatbot setup guide"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <GoldButton type="submit" disabled={!isValid || generating} size="lg" className="min-w-[240px]">
                  {generating ? (
                    <><Loader2 size={18} className="animate-spin mr-2" />Building Chatbot...</>
                  ) : (
                    <><Bot size={18} className="mr-2" />Build My Chatbot</>
                  )}
                </GoldButton>
              </div>
            </GlassCard>
          </motion.form>

          {/* Streaming */}
          <AnimatePresence>
            {generating && streamText && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-8">
                <GlassCard className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-xs text-muted-foreground uppercase tracking-widest">Designing your chatbot...</span>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground/50 max-h-24 overflow-hidden">{streamText.slice(-600)}</div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {error && <div className="mb-8 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">{error}</div>}

          {/* Results */}
          <AnimatePresence>
            {personality && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                {/* Bot Card */}
                <GlassCard className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_30px_rgba(201,168,76,0.2)]">
                    <Bot size={28} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-primary uppercase tracking-widest mb-1">Your AI Chatbot</div>
                    <h2 className="text-2xl font-serif font-bold text-white mb-1">{personality.name}</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">{personality.personality}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {personality.expertise.map((e, i) => (
                        <span key={i} className="text-xs bg-white/8 border border-white/10 rounded-full px-3 py-1 text-muted-foreground">{e}</span>
                      ))}
                    </div>
                  </div>
                </GlassCard>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
                  {[
                    { id: "personality", label: "Sample Responses", icon: <MessageSquare size={14} /> },
                    { id: "automations", label: "Automations", icon: <Zap size={14} /> },
                    { id: "flows", label: "Support Flows", icon: <GitBranch size={14} /> },
                    { id: "chat", label: "Live Preview", icon: <Bot size={14} /> },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex items-center gap-2 flex-1 justify-center py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                        activeTab === tab.id
                          ? "bg-primary/15 text-primary border border-primary/20"
                          : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      {tab.icon}
                      <span className="hidden sm:block">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  {activeTab === "personality" && (
                    <motion.div key="personality" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                      {personality.sampleResponses.map((sr, i) => (
                        <GlassCard key={i} className="p-5">
                          <div className="flex items-start gap-2 mb-3">
                            <User size={14} className="text-muted-foreground mt-0.5" />
                            <p className="text-sm text-muted-foreground italic">"{sr.question}"</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <Bot size={14} className="text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-white leading-relaxed">{sr.answer}</p>
                          </div>
                        </GlassCard>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === "automations" && (
                    <motion.div key="automations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {personality.suggestedAutomations.map((auto, i) => (
                        <GlassCard key={i} className="p-5">
                          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center mb-3">
                            <Zap size={14} className="text-primary" />
                          </div>
                          <h4 className="font-semibold text-white mb-2 text-sm">{auto.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{auto.description}</p>
                          <div className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 inline-block">{auto.impact}</div>
                        </GlassCard>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === "flows" && (
                    <motion.div key="flows" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      {personality.customerSupportFlows.map((flow, i) => (
                        <GlassCard key={i} className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <GitBranch size={14} className="text-primary" />
                            <span className="text-sm font-semibold text-white">Trigger: {flow.trigger}</span>
                          </div>
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex flex-col items-center gap-1">
                              {flow.flow.map((_, fi) => (
                                <React.Fragment key={fi}>
                                  <div className="w-2 h-2 rounded-full bg-primary/50" />
                                  {fi < flow.flow.length - 1 && <div className="w-0.5 h-4 bg-white/10" />}
                                </React.Fragment>
                              ))}
                            </div>
                            <div className="flex-1 space-y-3">
                              {flow.flow.map((step, fi) => (
                                <div key={fi} className="text-sm text-muted-foreground">{step}</div>
                              ))}
                            </div>
                          </div>
                          <div className="text-xs text-primary bg-primary/10 rounded-lg px-3 py-2">
                            Outcome: {flow.outcome}
                          </div>
                        </GlassCard>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === "chat" && (
                    <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <GlassCard className="p-0 overflow-hidden">
                        {/* Chat Header */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                            <Bot size={14} className="text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{personality.name}</div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                              <span className="text-xs text-muted-foreground">Live Preview</span>
                            </div>
                          </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="h-80 overflow-y-auto p-5 space-y-3">
                          {chatMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                              {msg.role === "user" ? (
                                <div className="max-w-[75%] bg-primary/20 border border-primary/20 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-white">{msg.content}</div>
                              ) : (
                                <div className="max-w-[80%] bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-white">{msg.content}</div>
                              )}
                            </div>
                          ))}
                          {chatStreaming && (
                            <div className="flex justify-start">
                              <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-white max-w-[80%]">
                                {chatStreamContent || (
                                  <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          <div ref={chatBottomRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="flex gap-2 p-3 border-t border-white/10">
                          <input
                            type="text"
                            placeholder="Test your chatbot..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") sendChatMessage(); }}
                            disabled={chatStreaming}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
                          />
                          <button
                            onClick={sendChatMessage}
                            disabled={!chatInput.trim() || chatStreaming}
                            className="p-2.5 bg-primary/15 border border-primary/30 rounded-lg text-primary hover:bg-primary/20 transition-all disabled:opacity-40"
                          >
                            {chatStreaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          </button>
                        </div>
                      </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center p-10 rounded-2xl border border-primary/20 bg-primary/5 relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(201,168,76,0.6) 0%, transparent 70%)" }} />
                  <div className="relative z-10">
                    <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Ready for a Real Deployment?</div>
                    <h3 className="font-serif text-2xl text-white mb-3">
                      Let STAGEONE Build Your
                      <span className="shimmer-text"> Production Chatbot</span>
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-xl mx-auto text-sm">
                      We'll take this concept and build a fully integrated AI chatbot — trained on your data, connected to your systems, deployed on your website.
                    </p>
                    <GoldButton href="/contact" size="lg">
                      Deploy My Chatbot with STAGEONE
                      <ArrowRight size={18} />
                    </GoldButton>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </AppLayout>
  );
}
