import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { ParticleField } from "@/components/effects/ParticleField";
import { GoldButton } from "@/components/ui/GoldButton";
import {
  Wand2, Sparkles, Code2, Copy, Download, Check, ZoomIn, ZoomOut,
  History, Trash2, Settings2, ChevronRight, ChevronDown, Play,
  Layout, BarChart3, X, RefreshCw, ImageIcon, FileCode2,
  Layers, Target, Palette, Users, MessageSquare, Package,
} from "lucide-react";

interface GenerationPlan {
  productType: string;
  industry: string;
  visualStyle: string;
  colorPalette: { primary: string; secondary: string; accent: string; background: string; text: string };
  layoutSections: string[];
  uiComponents: string[];
  designMood: string;
  targetAudience: string;
  ctaSuggestions: string[];
  imagePrompt: string;
}

interface HistoryItem {
  id: string;
  prompt: string;
  type: "landing" | "dashboard";
  plan: GenerationPlan;
  imageUrl: string | null;
  code: string;
  createdAt: number;
}

type Phase = "idle" | "interpreting" | "imaging" | "coding" | "complete" | "error";

const EXAMPLE_PROMPTS = [
  "A private wealth management platform for ultra-high-net-worth clients with portfolio tracking and AI insights",
  "A real-time cybersecurity operations dashboard for enterprise security teams",
  "A luxury real estate landing page targeting buyers of $10M+ properties",
  "A B2B SaaS analytics platform for e-commerce brands with predictive revenue forecasting",
  "A healthcare patient portal with appointment scheduling and telemedicine integration",
  "A crypto trading dashboard with live order books, portfolio analytics, and DeFi tools",
];

const HISTORY_KEY = "stageone_v2_history";

function loadHistory(): HistoryItem[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"); } catch { return []; }
}
function saveHistory(items: HistoryItem[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 15))); } catch {}
}

function syntaxHighlight(code: string): string {
  return code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/(\/\/[^\n]*)/g, '<span style="color:#6A9955">$1</span>')
    .replace(/(`[^`]*`)/g, '<span style="color:#CE9178">$1</span>')
    .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#CE9178">$1</span>')
    .replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color:#CE9178">$1</span>')
    .replace(/\b(return|const|let|var|function|export|default|import|from|if|else|for|while|class|extends|new|typeof|interface|type|async|await|try|catch)\b/g, '<span style="color:#569CD6">$1</span>')
    .replace(/\b(true|false|null|undefined)\b/g, '<span style="color:#569CD6">$1</span>')
    .replace(/\b(React|useState|useEffect|useRef|useCallback)\b/g, '<span style="color:#4EC9B0">$1</span>')
    .replace(/\b(style|className|onClick|onChange|href|src|alt|key|type|placeholder|disabled|value|name|id)\b(?=\s*=)/g, '<span style="color:#9CDCFE">$1</span>')
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#B5CEA8">$1</span>');
}

function PlanCard({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-white/3 p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} className="text-primary flex-shrink-0" />
        <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">{label}</span>
      </div>
      {children}
    </motion.div>
  );
}

function ConceptPreview({ plan }: { plan: GenerationPlan }) {
  const { colorPalette, layoutSections, uiComponents, productType } = plan;
  const isDash = productType.toLowerCase().includes("dashboard") || productType.toLowerCase().includes("analytics") || productType.toLowerCase().includes("platform");

  return (
    <div className="w-full h-full rounded-lg overflow-hidden" style={{ background: colorPalette.background, color: colorPalette.text, fontFamily: "Inter, sans-serif" }}>
      {isDash ? (
        <div className="flex h-full">
          <div className="w-40 flex-shrink-0 p-3 flex flex-col gap-1" style={{ background: `${colorPalette.primary}08`, borderRight: `1px solid ${colorPalette.primary}20` }}>
            <div className="font-bold text-[10px] tracking-widest uppercase mb-3" style={{ color: colorPalette.primary }}>{productType.split(" ")[0]}</div>
            {layoutSections.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px]" style={{ background: i === 0 ? `${colorPalette.primary}20` : "transparent", color: i === 0 ? colorPalette.primary : colorPalette.text, opacity: i === 0 ? 1 : 0.45 }}>
                <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: i === 0 ? colorPalette.primary : colorPalette.text }} />
                {s}
              </div>
            ))}
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[["Total Revenue", "$2.4M", "+12.5%"], ["Active Users", "18,492", "+8.2%"], ["Conversion", "4.7%", "+0.9%"]].map(([l, v, d]) => (
                <div key={l} className="rounded-lg p-2.5" style={{ background: `${colorPalette.primary}0D`, border: `1px solid ${colorPalette.primary}20` }}>
                  <div className="text-[9px] opacity-50 mb-0.5">{l}</div>
                  <div className="text-sm font-bold">{v}</div>
                  <div className="text-[10px] font-semibold" style={{ color: colorPalette.primary }}>{d}</div>
                </div>
              ))}
            </div>
            <div className="rounded-lg p-3 mb-2" style={{ background: `${colorPalette.primary}08`, border: `1px solid ${colorPalette.primary}18` }}>
              <div className="text-[9px] mb-2 opacity-50">Performance Overview</div>
              <div className="flex items-end gap-0.5 h-16">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i === 11 ? colorPalette.primary : `${colorPalette.primary}${Math.round(h * 0.5).toString(16).padStart(2, "0")}` }} />
                ))}
              </div>
            </div>
            <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${colorPalette.primary}18` }}>
              <div className="flex text-[9px] font-semibold px-2.5 py-1.5 opacity-40" style={{ background: `${colorPalette.primary}10` }}>
                {["Entity", "Status", "Value"].map(c => <div key={c} className="flex-1">{c}</div>)}
              </div>
              {["Alpha Corp", "Beta Industries", "Gamma Systems"].map((n, i) => (
                <div key={n} className="flex text-[9px] px-2.5 py-2" style={{ borderTop: `1px solid ${colorPalette.primary}10`, opacity: 0.7 }}>
                  <div className="flex-1">{n}</div>
                  <div className="flex-1"><span className="px-1.5 py-0.5 rounded-full text-[9px]" style={{ background: `${colorPalette.primary}25`, color: colorPalette.primary }}>Active</span></div>
                  <div className="flex-1">${(120 + i * 47).toFixed(1)}K</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${colorPalette.primary}20` }}>
            <div className="font-bold text-[10px] tracking-widest uppercase" style={{ color: colorPalette.primary }}>{productType.split(" ")[0]}</div>
            <div className="flex gap-4 text-[9px] opacity-50">{layoutSections.slice(0, 3).map(s => <span key={s}>{s}</span>)}</div>
            <div className="px-3 py-1 text-[9px] font-semibold rounded-sm" style={{ background: colorPalette.primary, color: colorPalette.background }}>{plan.ctaSuggestions[0] ?? "Get Started"}</div>
          </div>
          <div className="px-6 py-10 text-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${colorPalette.background} 0%, ${colorPalette.primary}18 100%)` }}>
            <div className="absolute inset-0 opacity-25 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${colorPalette.primary}50 0%, transparent 65%)` }} />
            <div className="relative">
              <div className="text-[9px] font-semibold uppercase tracking-[0.2em] mb-3 opacity-60" style={{ color: colorPalette.accent }}>{plan.designMood}</div>
              <h1 className="text-xl font-bold mb-2">{productType}</h1>
              <p className="text-[10px] opacity-50 mb-5">{plan.targetAudience}</p>
              <div className="flex justify-center gap-2">
                <div className="px-5 py-2 text-[9px] font-semibold rounded-sm" style={{ background: colorPalette.primary, color: colorPalette.background }}>{plan.ctaSuggestions[0]}</div>
                <div className="px-5 py-2 text-[9px] font-semibold rounded-sm" style={{ border: `1px solid ${colorPalette.primary}40`, color: colorPalette.primary }}>{plan.ctaSuggestions[1]}</div>
              </div>
            </div>
          </div>
          <div className="px-5 pb-5">
            <div className="grid gap-2 mt-3" style={{ gridTemplateColumns: `repeat(${Math.min(layoutSections.length, 3)}, 1fr)` }}>
              {layoutSections.slice(0, 3).map((s, i) => (
                <div key={s} className="rounded-lg p-3" style={{ background: `${colorPalette.primary}${i === 0 ? "18" : "0A"}`, border: `1px solid ${colorPalette.primary}${i === 0 ? "30" : "15"}` }}>
                  <div className="w-4 h-4 rounded-sm mb-2 flex items-center justify-center text-[9px] font-bold" style={{ background: colorPalette.primary, color: colorPalette.background }}>{i + 1}</div>
                  <div className="text-[9px] font-semibold mb-0.5">{s}</div>
                  <div className="text-[9px] opacity-35">{uiComponents[i] ?? "Premium component"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Generate() {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<"landing" | "dashboard">("landing");
  const [phase, setPhase] = useState<Phase>("idle");
  const [plan, setPlan] = useState<GenerationPlan | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFallback, setImageFallback] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "plan">("code");
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [showExamples, setShowExamples] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeLayer, setActiveLayer] = useState(0);
  const [completedLayers, setCompletedLayers] = useState<number[]>([]);
  const codeRef = useRef<HTMLPreElement>(null);

  const canGenerate = prompt.trim().length >= 8 && phase === "idle";

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;
    setPhase("interpreting");
    setPlan(null);
    setImageUrl(null);
    setImageFallback(false);
    setCode("");
    setError(null);
    setActiveLayer(0);
    setCompletedLayers([]);
    setActiveTab("plan");

    let finalPlan: GenerationPlan | null = null;

    // ── Step 1: Interpret ──
    try {
      const resp = await fetch("/api/ai/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Server error ${resp.status}`);
      }
      if (!resp.body) throw new Error("No response body");
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const d = JSON.parse(line.slice(6)) as { layer?: number; delta?: string; done?: boolean; plan?: GenerationPlan; error?: string };
          if (typeof d.layer === "number") {
            setActiveLayer(d.layer);
            setCompletedLayers((prev) => {
              const prevLayer = d.layer! - 1;
              return prevLayer > 0 && !prev.includes(prevLayer) ? [...prev, prevLayer] : prev;
            });
          }
          if (d.done && d.plan) {
            setCompletedLayers([1, 2, 3, 4, 5]);
            finalPlan = d.plan; setPlan(d.plan);
          }
          if (d.done && d.error) throw new Error(d.error);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e)); setPhase("error"); return;
    }

    if (!finalPlan) { setError("No plan generated"); setPhase("error"); return; }

    // ── Step 2: Generate Image ──
    setPhase("imaging");
    try {
      const resp = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: finalPlan }),
      });
      if (resp.ok) {
        const data = await resp.json() as { imageBase64?: string; imageUrl?: string; fallback?: boolean };
        if (data.imageBase64) setImageUrl(data.imageBase64);
        else if (data.imageUrl) setImageUrl(data.imageUrl);
        if (data.fallback) setImageFallback(true);
      } else {
        setImageFallback(true);
      }
    } catch {
      setImageFallback(true);
    }

    // ── Step 3: Generate Code ──
    setPhase("coding");
    setActiveTab("code");
    let finalCode = "";
    try {
      const resp = await fetch("/api/ai/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: finalPlan }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Server error ${resp.status}`);
      }
      if (!resp.body) throw new Error("No response body");
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const d = JSON.parse(line.slice(6)) as { delta?: string; done?: boolean; code?: string; error?: string };
          if (d.delta) { finalCode += d.delta; setCode((c) => c + d.delta); if (codeRef.current) codeRef.current.scrollTop = codeRef.current.scrollHeight; }
          if (d.done && d.code) { finalCode = d.code; setCode(d.code); }
          if (d.done && d.error) throw new Error(d.error);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e)); setPhase("error"); return;
    }

    // ── Save to history ──
    const newItem: HistoryItem = {
      id: crypto.randomUUID(), prompt, type,
      plan: finalPlan, imageUrl, code: finalCode, createdAt: Date.now(),
    };
    setHistory((prev) => { const u = [newItem, ...prev]; saveHistory(u); return u; });
    setPhase("complete");
  }, [prompt, type, canGenerate]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "generated-ui.tsx"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement("a"); a.href = imageUrl; a.download = "ui-concept.png"; a.click();
  };

  const restoreHistory = (item: HistoryItem) => {
    setPrompt(item.prompt); setType(item.type); setPlan(item.plan);
    setImageUrl(item.imageUrl); setCode(item.code); setPhase("complete"); setActiveTab("code");
  };

  const clearHistory = () => { setHistory([]); localStorage.removeItem(HISTORY_KEY); };

  const reset = () => {
    setPhase("idle"); setPlan(null); setImageUrl(null); setCode(""); setError(null);
    setPlanStreamText(""); setZoom(1);
  };

  const isGenerating = phase === "interpreting" || phase === "imaging" || phase === "coding";

  return (
    <>
      {/* Fixed workspace covers full screen below navbar */}
      <div className="fixed inset-0 top-0 z-0 pointer-events-none overflow-hidden">
        <ParticleField count={30} />
      </div>

      <Navbar />

      <div className="fixed inset-0 top-[72px] z-10 flex overflow-hidden bg-background">

        {/* ═══ LEFT SIDEBAR ═══ */}
        <div className="w-64 flex-shrink-0 flex flex-col border-r border-white/8 bg-black/30 backdrop-blur-md overflow-hidden">

          {/* Prompt area */}
          <div className="p-4 border-b border-white/8 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Wand2 size={13} className="text-primary" />
              <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">Prompt</span>
              <div className="flex gap-1 ml-auto">
                <button
                  onClick={() => setType("landing")}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${type === "landing" ? "bg-primary/20 text-primary" : "text-white/30 hover:text-white/60"}`}
                >
                  <Layout size={10} className="inline mr-1" />Page
                </button>
                <button
                  onClick={() => setType("dashboard")}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${type === "dashboard" ? "bg-primary/20 text-primary" : "text-white/30 hover:text-white/60"}`}
                >
                  <BarChart3 size={10} className="inline mr-1" />Dash
                </button>
              </div>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
              placeholder="Describe your product or UI concept..."
              rows={5}
              disabled={isGenerating}
              className="w-full bg-white/4 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-primary/40 resize-none leading-relaxed transition-all"
            />

            <div className="mt-2">
              <GoldButton
                onClick={handleGenerate}
                disabled={!canGenerate}
                size="sm"
                className="w-full justify-center"
              >
                {isGenerating ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                      <RefreshCw size={12} />
                    </motion.div>
                    <span className="ml-1.5">
                      {phase === "interpreting" ? "Interpreting..." : phase === "imaging" ? "Generating image..." : "Writing code..."}
                    </span>
                  </>
                ) : (
                  <><Sparkles size={12} /><span className="ml-1.5">Generate</span></>
                )}
              </GoldButton>
            </div>

            {/* Examples toggle */}
            <button
              onClick={() => setShowExamples((v) => !v)}
              className="mt-2 w-full flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/60 transition-colors py-1"
            >
              <ChevronRight size={10} className={`transition-transform ${showExamples ? "rotate-90" : ""}`} />
              Examples
            </button>

            <AnimatePresence>
              {showExamples && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="space-y-1 mt-1">
                    {EXAMPLE_PROMPTS.map((ex) => (
                      <button
                        key={ex}
                        onClick={() => { setPrompt(ex); setShowExamples(false); }}
                        className="w-full text-left px-2 py-1.5 rounded text-[10px] text-white/40 hover:text-white/70 hover:bg-white/5 transition-all leading-relaxed"
                      >
                        {ex.length > 70 ? ex.slice(0, 70) + "…" : ex}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-2.5 sticky top-0 bg-black/40 backdrop-blur-sm border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <History size={11} className="text-white/40" />
                <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">History</span>
                {history.length > 0 && <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">{history.length}</span>}
              </div>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-white/20 hover:text-red-400/60 transition-colors">
                  <Trash2 size={10} />
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="px-4 py-6 text-center text-[10px] text-white/20">No generations yet</div>
            ) : (
              <div className="p-2 space-y-1">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => restoreHistory(item)}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/8 transition-all group"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] bg-primary/12 text-primary/80 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">{item.type}</span>
                      <span className="text-[9px] text-white/25">{new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div className="text-[10px] text-white/50 group-hover:text-white/70 line-clamp-2 leading-relaxed transition-colors">
                      {item.prompt}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="border-t border-white/8 flex-shrink-0">
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              className="w-full flex items-center gap-2 px-4 py-3 text-[10px] text-white/30 hover:text-white/60 transition-colors"
            >
              <Settings2 size={11} />
              <span className="uppercase tracking-wider font-semibold">Settings</span>
              <ChevronDown size={10} className={`ml-auto transition-transform ${settingsOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {settingsOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-3 space-y-2">
                    <div className="text-[9px] text-white/30 leading-relaxed">
                      Powered by NVIDIA AI APIs. Requires <code className="text-primary/60">NVIDIA_API_KEY</code> environment variable.
                    </div>
                    <div className="text-[9px] text-white/20 leading-relaxed">
                      Models: Mistral Large (interpretation + code), Flux Schnell (image)
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ═══ CENTER PANEL ═══ */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-white/8">

          {/* Center toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-black/20 flex-shrink-0">
            <div className="flex items-center gap-2">
              <ImageIcon size={13} className="text-primary/60" />
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                {plan ? plan.productType : "Visual Concept"}
              </span>
              {plan && (
                <span className="text-[9px] text-white/20 font-mono">{plan.industry}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {(phase === "complete" || plan) && (
                <>
                  <button onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))} className="p-1.5 rounded text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"><ZoomOut size={12} /></button>
                  <span className="text-[10px] font-mono text-white/25 w-9 text-center">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom((z) => Math.min(2, z + 0.15))} className="p-1.5 rounded text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"><ZoomIn size={12} /></button>
                  <button onClick={() => setZoom(1)} className="px-2 py-1 rounded border border-white/8 text-[10px] text-white/25 hover:text-white/50 hover:border-white/15 transition-all ml-1">1:1</button>
                </>
              )}
              {phase === "complete" && (
                <button onClick={reset} className="ml-2 flex items-center gap-1 px-2 py-1 rounded border border-white/8 text-[10px] text-white/30 hover:text-primary hover:border-primary/30 transition-all">
                  <RefreshCw size={10} />New
                </button>
              )}
            </div>
          </div>

          {/* Center content */}
          <div className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">

              {/* Idle state */}
              {phase === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 4, repeat: Infinity }}
                    className="w-20 h-20 rounded-full border border-primary/20 flex items-center justify-center mb-6"
                    style={{ background: "radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)" }}>
                    <Wand2 size={28} className="text-primary/50" />
                  </motion.div>
                  <h2 className="font-serif text-2xl text-white mb-2">AI Generation Studio</h2>
                  <p className="text-sm text-white/30 max-w-xs leading-relaxed">
                    Enter a prompt in the sidebar and hit Generate to create a full UI concept with image and code.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-2 max-w-sm w-full">
                    {["Image concept", "React + Tailwind code", "Color palette", "Design plan"].map((f) => (
                      <div key={f} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/6 text-[11px] text-white/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />{f}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Interpreting — 5-layer Design Intelligence Engine */}
              {phase === "interpreting" && (
                <motion.div key="interpreting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center p-8">
                  <div className="w-full max-w-md">

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                      <div className="relative flex-shrink-0">
                        <motion.div className="w-8 h-8 rounded-lg border border-primary/40 flex items-center justify-center"
                          style={{ background: "radial-gradient(ellipse at center, rgba(201,168,76,0.15) 0%, transparent 70%)" }}>
                          <Sparkles size={14} className="text-primary" />
                        </motion.div>
                        <motion.div className="absolute inset-0 rounded-lg border border-primary/20"
                          animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.15, 1] }}
                          transition={{ duration: 2, repeat: Infinity }} />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em]">Design Intelligence Engine</p>
                        <p className="text-[11px] text-white/30 mt-0.5">Multi-layer prompt enhancement pipeline</p>
                      </div>
                    </div>

                    {/* 5 Layers */}
                    <div className="space-y-2">
                      {[
                        { n: 1, name: "Intent Analysis", sub: "Decoding product vision & market tier" },
                        { n: 2, name: "UX Intelligence", sub: "Mapping interface architecture" },
                        { n: 3, name: "Brand Synthesis", sub: "Engineering visual identity" },
                        { n: 4, name: "Visual Taste", sub: "Calibrating cinematic quality" },
                        { n: 5, name: "Prompt Composer", sub: "Assembling design brief" },
                      ].map(({ n, name, sub }) => {
                        const isDone = completedLayers.includes(n);
                        const isActive = activeLayer === n && !isDone;
                        const isPending = !isDone && !isActive;

                        return (
                          <motion.div
                            key={n}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: n * 0.06 }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500"
                            style={{
                              borderColor: isDone ? "rgba(201,168,76,0.2)" : isActive ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.05)",
                              background: isDone ? "rgba(201,168,76,0.04)" : isActive ? "rgba(201,168,76,0.07)" : "rgba(255,255,255,0.02)",
                            }}
                          >
                            {/* Layer number / status */}
                            <div className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                              style={{
                                background: isDone ? "rgba(201,168,76,0.2)" : isActive ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                                color: isDone || isActive ? "rgba(201,168,76,0.9)" : "rgba(255,255,255,0.2)",
                              }}>
                              {isDone ? <Check size={11} /> : n}
                            </div>

                            {/* Layer info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-semibold transition-colors"
                                style={{ color: isDone ? "rgba(255,255,255,0.5)" : isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)" }}>
                                {name}
                              </p>
                              <p className="text-[10px] transition-colors"
                                style={{ color: isDone ? "rgba(255,255,255,0.2)" : isActive ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)" }}>
                                {sub}
                              </p>
                            </div>

                            {/* Active pulse / done indicator */}
                            {isActive && (
                              <motion.div className="flex gap-0.5 flex-shrink-0">
                                {[0, 1, 2].map((i) => (
                                  <motion.div key={i} className="w-1 h-3 rounded-full bg-primary/60"
                                    animate={{ scaleY: [0.4, 1, 0.4] }}
                                    transition={{ duration: 0.9, delay: i * 0.15, repeat: Infinity }} />
                                ))}
                              </motion.div>
                            )}
                            {isDone && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0" />
                            )}
                            {isPending && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white/8 flex-shrink-0" />
                            )}
                          </motion.div>
                        );
                      })}
                    </div>

                    <p className="text-[10px] text-white/20 text-center mt-6 leading-relaxed">
                      Intelligence layers run sequentially. Output is sealed — only the final design brief is visible.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Imaging */}
              {phase === "imaging" && (
                <motion.div key="imaging" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center p-8">
                  <div className="w-full max-w-sm text-center">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <motion.div className="absolute inset-0 rounded-full border-2 border-primary/30"
                        animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
                      <motion.div className="absolute inset-2 rounded-full border border-primary/15"
                        animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon size={24} className="text-primary/60" />
                      </div>
                    </div>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Generating Visual Concept</p>
                    <p className="text-[11px] text-white/20 mt-2">NVIDIA Flux Schnell</p>
                    {plan && (
                      <div className="mt-4 px-4 py-2 rounded-lg border border-white/8 text-[10px] text-white/30 bg-white/3">
                        {plan.visualStyle}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Plan shown + image (complete or coding) */}
              {(phase === "coding" || phase === "complete") && plan && (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-4 space-y-3" style={{ minHeight: "100%" }}>

                  {/* Image preview */}
                  <div className="relative rounded-xl overflow-hidden border border-white/10" style={{ background: "#050505" }}>
                    {/* Corner decorations */}
                    {["top-2 left-2 border-t border-l", "top-2 right-2 border-t border-r", "bottom-2 left-2 border-b border-l", "bottom-2 right-2 border-b border-r"].map((cls) => (
                      <div key={cls} className={`absolute w-4 h-4 ${cls} border-primary/30 z-10 pointer-events-none`} />
                    ))}

                    <div className="overflow-hidden" style={{ height: 320 }}>
                      <AnimatePresence mode="wait">
                        {imageUrl && !imageFallback ? (
                          <motion.img
                            key="real-image"
                            src={imageUrl}
                            alt="Generated UI concept"
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: zoom }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            style={{ width: "100%", height: "100%", objectFit: "cover", transformOrigin: "top center" }}
                          />
                        ) : (
                          <motion.div
                            key="concept-preview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6 }}
                            style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.3s ease", height: "100%" }}
                          >
                            <ConceptPreview plan={plan} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Image toolbar */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2"
                      style={{ background: "linear-gradient(to top, rgba(5,5,5,0.9), transparent)" }}>
                      <span className="text-[9px] text-white/30 font-mono">
                        {imageFallback ? "Concept preview (no API key)" : "NVIDIA Flux Schnell"}
                      </span>
                      {imageUrl && !imageFallback && (
                        <button onClick={handleDownloadImage}
                          className="flex items-center gap-1 px-2 py-1 rounded border border-white/10 text-[10px] text-white/40 hover:text-white/70 hover:border-white/20 transition-all">
                          <Download size={10} />Save
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Color palette */}
                  <div className="flex items-center gap-2 px-1">
                    {Object.entries(plan.colorPalette).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-1.5 group">
                        <div className="w-5 h-5 rounded-md border border-white/10 shadow-sm flex-shrink-0" style={{ backgroundColor: v }} />
                        <span className="text-[9px] font-mono text-white/25 group-hover:text-white/50 transition-colors hidden xl:block">{v}</span>
                      </div>
                    ))}
                    <span className="ml-auto text-[10px] text-white/25">{plan.designMood}</span>
                  </div>

                  {/* Sections chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {plan.layoutSections.map((s) => (
                      <span key={s} className="text-[10px] px-2 py-1 rounded-full border border-white/10 text-white/35">{s}</span>
                    ))}
                  </div>

                  {phase === "coding" && (
                    <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/20 bg-primary/5 text-[11px] text-primary/70">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                        <RefreshCw size={11} />
                      </motion.div>
                      Streaming React code...
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Error */}
              {phase === "error" && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center p-8">
                  {error?.includes("NVIDIA_API_KEY") ? (
                    <div className="text-center max-w-sm w-full">
                      <div className="w-14 h-14 rounded-full border border-primary/30 bg-primary/8 flex items-center justify-center mx-auto mb-5"
                        style={{ background: "radial-gradient(ellipse at center, rgba(201,168,76,0.12) 0%, transparent 70%)" }}>
                        <Sparkles size={22} className="text-primary/70" />
                      </div>
                      <h3 className="font-serif text-lg text-white mb-2">NVIDIA API Key Required</h3>
                      <p className="text-xs text-white/40 leading-relaxed mb-5 max-w-xs mx-auto">
                        AI generation requires an NVIDIA API key. A free tier is available with generous credits for testing.
                      </p>
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-5 text-left space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="text-primary/60 font-mono text-[11px] font-bold mt-0.5">1.</span>
                          <div>
                            <p className="text-[11px] text-white/60">Get a free key at</p>
                            <a href="https://build.nvidia.com" target="_blank" rel="noreferrer"
                              className="text-[11px] font-mono text-primary/80 hover:text-primary underline underline-offset-2 transition-colors">
                              build.nvidia.com
                            </a>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-primary/60 font-mono text-[11px] font-bold mt-0.5">2.</span>
                          <div>
                            <p className="text-[11px] text-white/60">Add it as an environment secret named</p>
                            <code className="text-[11px] font-mono text-primary/80 bg-white/5 px-1.5 py-0.5 rounded mt-0.5 inline-block">NVIDIA_API_KEY</code>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-primary/60 font-mono text-[11px] font-bold mt-0.5">3.</span>
                          <p className="text-[11px] text-white/60">Restart the API Server workflow and generate again</p>
                        </div>
                      </div>
                      <button onClick={reset} className="px-5 py-2 rounded-lg border border-white/10 text-xs text-white/40 hover:text-white/70 hover:border-white/20 transition-all">
                        Dismiss
                      </button>
                    </div>
                  ) : (
                    <div className="text-center max-w-xs">
                      <div className="w-12 h-12 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                        <X size={20} className="text-red-400" />
                      </div>
                      <p className="text-sm text-white/60 mb-2">Generation Failed</p>
                      <p className="text-[11px] text-white/30 mb-5 leading-relaxed">{error}</p>
                      <button onClick={reset} className="px-4 py-2 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white/80 hover:border-white/20 transition-all">
                        Try Again
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* ═══ RIGHT SIDEBAR ═══ */}
        <div className="w-[420px] flex-shrink-0 flex flex-col overflow-hidden bg-black/20 backdrop-blur-md">

          {/* Tab header */}
          <div className="flex items-center border-b border-white/8 flex-shrink-0">
            {[
              { id: "code" as const, label: "Code", icon: FileCode2 },
              { id: "plan" as const, label: "Design Plan", icon: Layers },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-[11px] font-semibold transition-all border-b-2 ${
                  activeTab === id
                    ? "text-primary border-primary"
                    : "text-white/30 border-transparent hover:text-white/60"
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-1 pr-2">
              {activeTab === "code" && code && (
                <>
                  <button onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] border border-white/10 hover:border-primary/30 hover:text-primary text-white/40 transition-all">
                    {copied ? <Check size={11} className="text-primary" /> : <Copy size={11} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button onClick={handleDownload}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] border border-white/10 hover:border-primary/30 hover:text-primary text-white/40 transition-all">
                    <Download size={11} />TSX
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">

            {/* Code tab */}
            {activeTab === "code" && (
              <div className="h-full relative">
                {!code && phase !== "coding" ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <Code2 size={28} className="text-white/15 mb-3" />
                    <p className="text-[11px] text-white/25 leading-relaxed max-w-xs">
                      React + Tailwind code will appear here as it streams from the AI
                    </p>
                  </div>
                ) : (
                  <>
                    {phase === "coding" && !code && (
                      <div className="flex items-center gap-2 p-4 text-[11px] text-primary/60">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                          <RefreshCw size={12} />
                        </motion.div>
                        Initializing code generation...
                      </div>
                    )}
                    <pre
                      ref={codeRef}
                      className="p-4 text-[11px] leading-5 font-mono overflow-x-auto h-full"
                      style={{ color: "#D4D4D4", background: "transparent", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                      dangerouslySetInnerHTML={{ __html: syntaxHighlight(code) }}
                    />
                    {phase === "coding" && (
                      <motion.div
                        className="inline-block w-2 h-4 bg-primary ml-1"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </>
                )}
              </div>
            )}

            {/* Plan tab */}
            {activeTab === "plan" && (
              <div className="p-3 space-y-2">
                {!plan ? (
                  <div className="py-12 text-center">
                    <Layers size={24} className="text-white/15 mx-auto mb-3" />
                    <p className="text-[11px] text-white/25">Design plan appears here after interpretation</p>
                    {phase === "interpreting" && (
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
                        className="mt-3 text-[10px] text-primary/50">Interpreting...</motion.div>
                    )}
                  </div>
                ) : (
                  <>
                    <PlanCard icon={Package} label="Product">
                      <p className="text-xs text-white font-semibold">{plan.productType}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">{plan.industry}</p>
                    </PlanCard>

                    <PlanCard icon={Palette} label="Visual Style">
                      <p className="text-[11px] text-white/70 leading-relaxed">{plan.visualStyle}</p>
                    </PlanCard>

                    <PlanCard icon={Palette} label="Color Palette">
                      <div className="space-y-1.5">
                        {Object.entries(plan.colorPalette).map(([k, v]) => (
                          <div key={k} className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-md border border-white/10 flex-shrink-0" style={{ backgroundColor: v }} />
                            <span className="text-[10px] text-white/40 capitalize w-16 flex-shrink-0">{k}</span>
                            <span className="text-[10px] font-mono text-primary/70">{v}</span>
                          </div>
                        ))}
                      </div>
                    </PlanCard>

                    <PlanCard icon={Layers} label="Layout Sections">
                      <div className="space-y-1">
                        {plan.layoutSections.map((s, i) => (
                          <div key={s} className="flex items-center gap-2 text-[11px] text-white/60">
                            <span className="text-[9px] text-primary/60 w-4 font-mono">{i + 1}.</span>{s}
                          </div>
                        ))}
                      </div>
                    </PlanCard>

                    <PlanCard icon={Target} label="UI Components">
                      <div className="flex flex-wrap gap-1">
                        {plan.uiComponents.map((c) => (
                          <span key={c} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/40">{c}</span>
                        ))}
                      </div>
                    </PlanCard>

                    <PlanCard icon={Users} label="Target Audience">
                      <p className="text-[11px] text-white/60 leading-relaxed">{plan.targetAudience}</p>
                    </PlanCard>

                    <PlanCard icon={MessageSquare} label="CTA Suggestions">
                      <div className="space-y-1">
                        {plan.ctaSuggestions.map((c) => (
                          <div key={c} className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-primary/50 flex-shrink-0" />
                            <span className="text-[11px] text-white/60">{c}</span>
                          </div>
                        ))}
                      </div>
                    </PlanCard>

                    {plan.imagePrompt && (
                      <PlanCard icon={ImageIcon} label="Image Prompt">
                        <p className="text-[10px] text-white/40 leading-relaxed">{plan.imagePrompt}</p>
                      </PlanCard>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
