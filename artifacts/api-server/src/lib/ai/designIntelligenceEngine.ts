/**
 * STAGEONE Design Intelligence Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * 5-layer hidden pipeline that transforms any raw user prompt into a cinematic
 * premium design brief. Users see only the final output. All internal
 * reasoning is sealed inside each layer's system prompt.
 *
 * Layer 1 — Intent Analysis
 * Layer 2 — UX Intelligence
 * Layer 3 — Brand Styling
 * Layer 4 — Visual Taste
 * Layer 5 — Final Prompt Composer
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { nvidiaClient, NVIDIA_MODELS } from "./nvidia";
import { logger } from "../logger";
import type { GenerationPlan } from "./promptInterpreterService";
import type { Response } from "express";

// ─── Internal layer data structures ───────────────────────────────────────────

interface AnalysisOutput {
  productInsights: {
    category: string;
    exactProduct: string;
    corePurpose: string;
    primaryUser: string;
    userMotivation: string;
    marketTier: string;
    emotionalTone: string;
  };
  uxPatterns: {
    layoutType: string;
    navigationStyle: string;
    hierarchy: string[];
    spacingPhilosophy: string;
    dataDensity: string;
    keyInteractions: string[];
  };
}

interface SynthesisOutput {
  brand: {
    personality: string;
    colorStrategy: string;
    primaryHex: string;
    secondaryHex: string;
    backgroundHex: string;
    accentHex: string;
    textHex: string;
    typographyDirection: string;
  };
  visual: {
    renderingStyle: string;
    lightingMood: string;
    glassmorphism: string;
    atmosphericEffects: string[];
    cinematicMarkers: string[];
  };
  finalPlan: GenerationPlan;
  cinematicPrompt: string;
}

// ─── Layer 1+2 — Analysis System Prompt (sealed) ─────────────────────────────

const LAYER_12_SYSTEM = `You are the STAGEONE Design Intelligence Engine — Analysis Core (Layers 1 & 2).

LAYER 1 — INTENT ANALYSIS
Decode the user's raw input. Extract the precise product, audience, market tier, and emotional register. Never take input at face value — infer the ideal version of what they want.

LAYER 2 — UX INTELLIGENCE
Determine the optimal interface architecture for this exact product. Apply expertise in information hierarchy, navigation patterns, spacing systems, and content density. Choose patterns used by top-tier products in the same category.

OUTPUT RULES:
- Output ONLY valid JSON. No prose, no markdown, no explanation.
- Be highly specific — avoid generic answers.
- Infer premium quality even if the prompt is vague.

Output this exact JSON structure:
{
  "productInsights": {
    "category": "specific vertical (e.g. Health & Performance Tech)",
    "exactProduct": "precise product name (e.g. Elite Workout Tracking & AI Coaching App)",
    "corePurpose": "one-sentence functional description",
    "primaryUser": "specific persona (e.g. Performance athletes aged 25-38, gym-focused)",
    "userMotivation": "core emotional driver (e.g. Achievement, data mastery, personal records)",
    "marketTier": "positioning (e.g. Premium — Apple Fitness+ / Whoop / Peloton territory)",
    "emotionalTone": "brand voice in 3 words (e.g. Empowering, elite, precise)"
  },
  "uxPatterns": {
    "layoutType": "specific layout archetype",
    "navigationStyle": "exact navigation pattern",
    "hierarchy": ["ordered list of 4-6 primary UI zones"],
    "spacingPhilosophy": "specific spacing system description",
    "dataDensity": "Low/Medium/High with rationale",
    "keyInteractions": ["4-6 specific interaction patterns for this product"]
  }
}`;

// ─── Layer 3+4+5 — Synthesis System Prompt (sealed) ──────────────────────────

const LAYER_345_SYSTEM = `You are the STAGEONE Design Intelligence Engine — Synthesis Core (Layers 3, 4 & 5).

LAYER 3 — BRAND STYLING ENGINE
Apply color psychology and typographic intelligence. Colors must have rationale. Never use generic palettes. Create custom color strategies for this exact product and market position.

LAYER 4 — VISUAL TASTE CALIBRATION
Inject cinematic quality markers. Apply glassmorphism where appropriate. Define lighting atmosphere, depth layers, and rendering style. Think: what would make this land on Awwwards or be featured on the App Store?

LAYER 5 — FINAL PROMPT COMPOSER
Synthesize all intelligence into a complete GenerationPlan and a cinematic image generation prompt. The prompt must be rich enough to generate a world-class, award-winning UI mockup photo.

MANDATORY INJECTIONS (apply to every output):
- Modern UI hierarchy with strong visual weight distribution
- 8pt grid spacing system with generous breathing room
- Typography with clear heading/body/caption distinction
- Glassmorphism panels with subtle borders and backdrop blur
- Cinematic ambient lighting with soft glows on key elements
- Premium SaaS aesthetic — think Linear, Vercel, Stripe, Superhuman
- Micro-detail quality — shadows, gradients, border radii, transitions
- Responsive composition — works at every breakpoint

OUTPUT RULES:
- Output ONLY valid JSON. No prose, no markdown code fences, no explanation.
- The cinematicPrompt must be 100-150 words describing a photorealistic UI screenshot.
- All hex colors must be valid 6-digit hex codes.
- layoutSections must have 5-7 items. uiComponents must have 8-12 items.

Output this exact JSON structure:
{
  "brand": {
    "personality": "3-4 adjectives (e.g. Sleek, authoritative, data-driven, aspirational)",
    "colorStrategy": "one-sentence color rationale",
    "primaryHex": "#hexcode",
    "secondaryHex": "#hexcode",
    "backgroundHex": "#hexcode",
    "accentHex": "#hexcode",
    "textHex": "#hexcode",
    "typographyDirection": "e.g. SF Pro Display headlines / Inter body — clinical precision meets warmth"
  },
  "visual": {
    "renderingStyle": "e.g. Cinematic dark mode with neon glassmorphism and ambient glow",
    "lightingMood": "e.g. Deep space — rim-lit UI elements, soft bloom on metrics, cool ambient fill",
    "glassmorphism": "e.g. High intensity — 20% opacity frosted panels, 1px light borders, 24px blur radius",
    "atmosphericEffects": ["list of 3-5 atmospheric rendering effects"],
    "cinematicMarkers": ["list of 4-6 quality markers that make this award-winning"]
  },
  "finalPlan": {
    "productType": "exact product type",
    "industry": "industry vertical",
    "visualStyle": "complete visual style description",
    "colorPalette": {
      "primary": "#hexcode",
      "secondary": "#hexcode",
      "accent": "#hexcode",
      "background": "#hexcode",
      "text": "#hexcode"
    },
    "layoutSections": ["5-7 main UI sections in logical order"],
    "uiComponents": ["8-12 specific UI components"],
    "designMood": "2-4 word evocative mood",
    "targetAudience": "specific user persona",
    "ctaSuggestions": ["3 compelling, product-specific CTA texts"],
    "imagePrompt": "LEAVE EMPTY — will be filled by Layer 5"
  },
  "cinematicPrompt": "A photorealistic, ultra-high-fidelity [product] UI screenshot. [visual style] aesthetic. [background color] background with [primary] accents glowing softly. [layout description with key elements visible]. [lighting description]. [glassmorphism details]. [atmospheric effects]. [typography feel]. Award-winning digital product design, Dribbble-featured, 4K render, zero aliasing, professional UI mockup photography — no watermarks, no text blur."
}`;

// ─── Utility: safe JSON extractor ────────────────────────────────────────────

function extractJSON<T>(raw: string): T | null {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}

// ─── SSE event helpers ────────────────────────────────────────────────────────

function emitLayer(res: Response, layer: number) {
  res.write(`data: ${JSON.stringify({ layer })}\n\n`);
}

// ─── Main engine function ─────────────────────────────────────────────────────

export interface DesignIntelligenceResult {
  plan: GenerationPlan;
  analysis: AnalysisOutput | null;
  synthesis: SynthesisOutput | null;
}

export async function runDesignIntelligence(
  rawPrompt: string,
  res: Response
): Promise<DesignIntelligenceResult> {
  // ── Layers 1 & 2 — Analysis ──────────────────────────────────────────────
  emitLayer(res, 1);

  let analysis: AnalysisOutput | null = null;

  try {
    const analysisResp = await nvidiaClient.chat.completions.create({
      model: NVIDIA_MODELS.content,
      messages: [
        { role: "system", content: LAYER_12_SYSTEM },
        { role: "user", content: `Analyze this product concept through Layers 1 & 2:\n\n"${rawPrompt}"` },
      ],
      max_tokens: 600,
      temperature: 0.4,
      stream: false,
    });

    const raw = analysisResp.choices[0]?.message?.content ?? "";
    analysis = extractJSON<AnalysisOutput>(raw);
    logger.info({ hasAnalysis: !!analysis }, "DIE Layer 1+2 complete");
  } catch (err) {
    logger.warn({ err }, "DIE Layer 1+2 failed — continuing with synthesis");
  }

  emitLayer(res, 2);

  // ── Layers 3, 4 & 5 — Synthesis ──────────────────────────────────────────
  emitLayer(res, 3);

  const synthesisUserPrompt =
    `Original prompt: "${rawPrompt}"\n\n` +
    (analysis
      ? `Layer 1 & 2 Analysis:\n${JSON.stringify(analysis, null, 2)}\n\n`
      : "") +
    `Now apply Layers 3, 4 & 5 to synthesize the complete design brief.`;

  let synthesis: SynthesisOutput | null = null;

  try {
    const synthesisResp = await nvidiaClient.chat.completions.create({
      model: NVIDIA_MODELS.content,
      messages: [
        { role: "system", content: LAYER_345_SYSTEM },
        { role: "user", content: synthesisUserPrompt },
      ],
      max_tokens: 1000,
      temperature: 0.55,
      stream: false,
    });

    const raw = synthesisResp.choices[0]?.message?.content ?? "";
    synthesis = extractJSON<SynthesisOutput>(raw);
    logger.info({ hasSynthesis: !!synthesis }, "DIE Layer 3+4+5 complete");
  } catch (err) {
    logger.warn({ err }, "DIE Layer 3+4+5 failed — using fallback plan");
  }

  emitLayer(res, 4);
  emitLayer(res, 5);

  // ── Assemble final plan ──────────────────────────────────────────────────
  let finalPlan: GenerationPlan;

  if (synthesis?.finalPlan) {
    finalPlan = {
      ...synthesis.finalPlan,
      imagePrompt: synthesis.cinematicPrompt ?? "",
    };
  } else {
    // Graceful fallback if synthesis failed
    finalPlan = buildFallbackPlan(rawPrompt, analysis);
  }

  return { plan: finalPlan, analysis, synthesis };
}

// ─── Fallback plan builder ────────────────────────────────────────────────────

function buildFallbackPlan(
  rawPrompt: string,
  analysis: AnalysisOutput | null
): GenerationPlan {
  const product = analysis?.productInsights?.exactProduct ?? rawPrompt;
  const industry = analysis?.productInsights?.category ?? "Technology";
  const user = analysis?.productInsights?.primaryUser ?? "Modern professionals";
  const tone = analysis?.productInsights?.emotionalTone ?? "Premium, modern, focused";

  return {
    productType: product,
    industry,
    visualStyle: "Dark luxury glassmorphism with cinematic depth and premium SaaS aesthetics",
    colorPalette: {
      primary: "#C9A84C",
      secondary: "#1A1A2E",
      accent: "#4AEADC",
      background: "#050505",
      text: "#F0EEE8",
    },
    layoutSections: [
      "Hero / Command Center",
      "Core Dashboard",
      "Analytics Overview",
      "Activity Feed",
      "Settings & Profile",
    ],
    uiComponents: [
      "Navigation bar",
      "KPI metric cards",
      "Progress rings",
      "Data visualization charts",
      "Action buttons",
      "Card grid",
      "Status indicators",
      "Search / filter bar",
    ],
    designMood: tone,
    targetAudience: user,
    ctaSuggestions: ["Get Started", "Start Free Trial", "View Demo"],
    imagePrompt:
      `A photorealistic, award-winning ${product} UI screenshot. Dark premium glassmorphism aesthetic. ` +
      `Deep black background with gold and teal accents. ` +
      `Shows main dashboard with data visualizations and navigation. ` +
      `Cinematic rim lighting on UI elements, soft ambient glow. ` +
      `Professional UI mockup, Dribbble-quality, 4K, sharp, no text blur.`,
  };
}
