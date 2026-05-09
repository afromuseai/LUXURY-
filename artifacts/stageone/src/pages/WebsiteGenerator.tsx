import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { GoldButton } from "@/components/ui/GoldButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { Sparkles, Globe, Palette, Layers, Target, ChevronDown, ArrowRight, Check, Loader2 } from "lucide-react";

const INDUSTRIES = [
  "Technology & SaaS", "E-commerce & Retail", "Healthcare & Wellness",
  "Finance & Fintech", "Real Estate", "Education & EdTech",
  "Legal & Professional Services", "Marketing & Advertising",
  "Hospitality & Tourism", "Food & Beverage", "Construction & Architecture",
  "Fitness & Sports", "Beauty & Fashion", "Consulting & Coaching", "Other",
];

const BRAND_TONES = [
  { id: "luxury", label: "Luxury & Premium", desc: "Sophisticated, exclusive, high-end" },
  { id: "bold", label: "Bold & Disruptive", desc: "Confident, edgy, category-defining" },
  { id: "professional", label: "Professional & Trustworthy", desc: "Credible, reliable, authoritative" },
  { id: "friendly", label: "Friendly & Approachable", desc: "Warm, conversational, relatable" },
  { id: "innovative", label: "Innovative & Tech-Forward", desc: "Cutting-edge, futuristic, visionary" },
  { id: "minimalist", label: "Minimalist & Clean", desc: "Simple, refined, less-is-more" },
];

interface GeneratedResult {
  headline: string;
  subheadline: string;
  cta: string;
  tagline: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    label: string;
  };
  brandPositioning: string;
  sections: Array<{ type: string; title: string; content: string }>;
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-md border border-white/10 flex-shrink-0 shadow-md"
        style={{ backgroundColor: color }}
      />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-xs font-mono text-primary">{color}</div>
      </div>
    </div>
  );
}

function SectionCard({ section, index }: { section: GeneratedResult["sections"][0]; index: number }) {
  const icons: Record<string, React.ReactNode> = {
    hero: <Sparkles className="text-primary" size={16} />,
    problem: <Target className="text-primary" size={16} />,
    solution: <Check className="text-primary" size={16} />,
    features: <Layers className="text-primary" size={16} />,
    social_proof: <Globe className="text-primary" size={16} />,
    cta_section: <ArrowRight className="text-primary" size={16} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card rounded-lg p-4 border border-white/10"
    >
      <div className="flex items-center gap-2 mb-2">
        {icons[section.type] ?? <Layers className="text-primary" size={16} />}
        <span className="text-xs font-semibold text-primary uppercase tracking-widest">{section.title}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
    </motion.div>
  );
}

export default function WebsiteGenerator() {
  const [formData, setFormData] = useState({
    businessName: "",
    industry: "",
    brandTone: "",
    services: "",
    targetAudience: "",
    email: "",
  });
  const [generating, setGenerating] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [leadSaving, setLeadSaving] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const isValid = formData.businessName && formData.industry && formData.brandTone && formData.services;

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    if (formData.email && !emailSubmitted) {
      setLeadSaving(true);
      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            source: "ai_website_generator",
            metadata: JSON.stringify({ businessName: formData.businessName, industry: formData.industry }),
          }),
        });
        setEmailSubmitted(true);
      } catch {}
      setLeadSaving(false);
    }

    setGenerating(true);
    setStreamText("");
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/ai/website-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Generation failed");
      if (!response.body) throw new Error("No stream");

      const reader = response.body.getReader();
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
          if (data.delta) {
            setStreamText((prev) => prev + data.delta);
          }
          if (data.done) {
            if (data.result) {
              setResult(data.result as GeneratedResult);
              setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
            } else if (data.error) {
              setError("Could not parse AI response. Please try again.");
            }
          }
        }
      }
    } catch (err) {
      setError("Generation failed. Please try again.");
    } finally {
      setGenerating(false);
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
              <Sparkles size={14} className="text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">AI Website Generator</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-5 leading-tight">
              Generate Your
              <br />
              <span className="shimmer-text">Landing Page Concept</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Enter your business details and our NVIDIA-powered AI will generate a complete landing page concept — headlines, copy, color palette, and brand positioning — in seconds.
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleGenerate}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard className="mb-8 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Capital Advisors"
                    value={formData.businessName}
                    onChange={(e) => setFormData((p) => ({ ...p, businessName: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2">
                    Industry *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData((p) => ({ ...p, industry: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
                    >
                      <option value="" disabled className="bg-background">Select industry...</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind} className="bg-background">{ind}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Series A startups, SMBs, C-suite executives"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData((p) => ({ ...p, targetAudience: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                {/* Services */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2">
                    Core Services / Products *
                  </label>
                  <textarea
                    placeholder="e.g. Wealth management, portfolio optimization, tax-efficient investing, retirement planning"
                    value={formData.services}
                    onChange={(e) => setFormData((p) => ({ ...p, services: e.target.value }))}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all resize-none"
                  />
                </div>

                {/* Brand Tone */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-3">
                    Brand Tone *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {BRAND_TONES.map((tone) => (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, brandTone: tone.id }))}
                        className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                          formData.brandTone === tone.id
                            ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(201,168,76,0.15)]"
                            : "border-white/10 bg-white/3 hover:border-white/20"
                        }`}
                      >
                        <div className="text-sm font-semibold text-white mb-0.5">{tone.label}</div>
                        <div className="text-xs text-muted-foreground">{tone.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email Capture */}
                <div className="md:col-span-2 border-t border-white/10 pt-5 mt-1">
                  <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2">
                    Email (to receive your full concept)
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <GoldButton
                  type="submit"
                  disabled={!isValid || generating || leadSaving}
                  size="lg"
                  className="min-w-[240px]"
                >
                  {generating ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Generating Concept...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} className="mr-2" />
                      Generate My Landing Page
                    </>
                  )}
                </GoldButton>
              </div>
            </GlassCard>
          </motion.form>

          {/* Streaming indicator */}
          <AnimatePresence>
            {generating && streamText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-8"
              >
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-xs text-muted-foreground uppercase tracking-widest">AI is generating your concept...</span>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground/60 max-h-32 overflow-hidden leading-relaxed">
                    {streamText.slice(-800)}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div className="mb-8 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                ref={resultRef}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                {/* Hero Preview */}
                <div
                  className="rounded-2xl p-10 md:p-16 text-center border border-white/10 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${result.colorPalette.background}ee 0%, ${result.colorPalette.primary}22 100%)`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${result.colorPalette.primary}60 0%, transparent 70%)` }}
                  />
                  <div className="relative z-10">
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] mb-4 opacity-70" style={{ color: result.colorPalette.accent }}>
                      {result.tagline}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight" style={{ color: result.colorPalette.text }}>
                      {result.headline}
                    </h2>
                    <p className="text-lg opacity-75 mb-8 max-w-2xl mx-auto" style={{ color: result.colorPalette.text }}>
                      {result.subheadline}
                    </p>
                    <div
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-sm font-semibold tracking-wide text-sm"
                      style={{ backgroundColor: result.colorPalette.primary, color: result.colorPalette.background }}
                    >
                      {result.cta}
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Brand Positioning */}
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Target size={16} className="text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-widest">Brand Positioning</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{result.brandPositioning}</p>
                  </GlassCard>

                  {/* Color Palette */}
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Palette size={16} className="text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                        Color Palette — {result.colorPalette.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <ColorSwatch color={result.colorPalette.primary} label="Primary" />
                      <ColorSwatch color={result.colorPalette.secondary} label="Secondary" />
                      <ColorSwatch color={result.colorPalette.accent} label="Accent" />
                      <ColorSwatch color={result.colorPalette.background} label="Background" />
                    </div>
                  </GlassCard>
                </div>

                {/* Page Sections */}
                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Layers size={16} className="text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-widest">Landing Page Sections</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.sections.map((section, i) => (
                      <SectionCard key={section.type} section={section} index={i} />
                    ))}
                  </div>
                </GlassCard>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center p-10 rounded-2xl border border-primary/20 bg-primary/5 relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(201,168,76,0.6) 0%, transparent 70%)" }} />
                  <div className="relative z-10">
                    <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Ready to Build the Real Thing?</div>
                    <h3 className="font-serif text-2xl md:text-3xl text-white mb-3">
                      Let STAGEONE Build Your
                      <span className="shimmer-text"> Full Website</span>
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                      Your concept is ready. Our team will transform it into a live, high-converting website with custom AI integrations built for your business.
                    </p>
                    <GoldButton href="/contact" size="lg">
                      Book STAGEONE — Start Building
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
