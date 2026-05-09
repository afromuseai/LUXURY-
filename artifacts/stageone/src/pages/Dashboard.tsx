import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  BarChart3, Users, Zap, FolderOpen, GitBranch, MessageSquare,
  TrendingUp, Clock, CheckCircle, Circle, AlertCircle, ArrowUpRight,
  ChevronRight, Menu, X, Activity, Shield, Settings, Bell,
  Brain, Globe, Sparkles, Bot, RefreshCw, Target, ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Lead { id: number; email: string; name: string | null; company: string | null; source: string; status: string; createdAt: string }
interface Stats {
  totals: { leads: number; aiSessions: number };
  leadsBySource: Array<{ source: string; count: number }>;
  leadsByStatus: Array<{ status: string; count: number }>;
  sessionsByTool: Array<{ tool: string; count: number }>;
  recentLeads: Lead[];
}

// ─── Mock data for non-DB sections ────────────────────────────────────────────
const MOCK_PROJECTS = [
  { id: 1, name: "Apex Capital Website", client: "Apex Capital", status: "in_progress", completion: 78, due: "May 20, 2026" },
  { id: 2, name: "LegalEdge Chatbot", client: "LegalEdge Inc.", status: "review", completion: 95, due: "May 12, 2026" },
  { id: 3, name: "FitLife AI Automation", client: "FitLife Studio", status: "completed", completion: 100, due: "May 1, 2026" },
  { id: 4, name: "ReAlign Brand Identity", client: "ReAlign Co.", status: "in_progress", completion: 40, due: "Jun 3, 2026" },
];

const MOCK_AUTOMATIONS = [
  { id: 1, name: "Lead Qualification AI", status: "active", trigger: "New form submission", runs: 142, saved: "14h/week" },
  { id: 2, name: "Client Onboarding Flow", status: "active", trigger: "Signed contract", runs: 38, saved: "6h/week" },
  { id: 3, name: "Content Repurposing Pipeline", status: "active", trigger: "Blog post published", runs: 67, saved: "8h/week" },
  { id: 4, name: "Invoice Follow-up Bot", status: "paused", trigger: "Invoice overdue", runs: 0, saved: "3h/week" },
];

const MOCK_MESSAGES = [
  { id: 1, from: "Marcus Chen", company: "Apex Capital", preview: "Hey, just wanted to confirm the launch timeline...", time: "2h ago", unread: true },
  { id: 2, from: "Sarah Williams", company: "LegalEdge", preview: "The chatbot demo is looking great! Can we schedule...", time: "5h ago", unread: true },
  { id: 3, from: "David Okafor", company: "FitLife Studio", preview: "Automation is working perfectly, we've already saved...", time: "1d ago", unread: false },
  { id: 4, from: "Emma Rodriguez", company: "ReAlign Co.", preview: "Quick question about the brand guidelines document...", time: "2d ago", unread: false },
];

const ACTIVITY = [
  { icon: <Users size={13} />, text: "New lead from Website Generator", sub: "contact@techventures.io", time: "3m ago", color: "text-blue-400" },
  { icon: <Zap size={13} />, text: "Lead qualification automation triggered", sub: "Run #143", time: "18m ago", color: "text-primary" },
  { icon: <Brain size={13} />, text: "Business Advisor session completed", sub: "47 messages exchanged", time: "1h ago", color: "text-purple-400" },
  { icon: <CheckCircle size={13} />, text: "FitLife AI project marked complete", sub: "Delivered on schedule", time: "3h ago", color: "text-green-400" },
  { icon: <MessageSquare size={13} />, text: "New message from LegalEdge", sub: "Sarah Williams", time: "5h ago", color: "text-primary" },
  { icon: <Globe size={13} />, text: "Website Generator: 8 new concepts", sub: "Across 3 industries", time: "6h ago", color: "text-blue-400" },
];

const TOOL_LABELS: Record<string, string> = {
  website_generator: "Website Generator", business_advisor: "Business Advisor",
  chatbot_builder: "Chatbot Builder", chat_widget: "Chat Widget",
  content_generator: "Content Generator", playground: "AI Playground",
};

const SOURCE_LABELS: Record<string, string> = {
  contact_form: "Contact Form", ai_website_generator: "AI Generator",
  ai_business_advisor: "Business Advisor", ai_chatbot_builder: "Chatbot Builder", chat_widget: "Chat Widget",
};

const STATUS_COLORS: Record<string, string> = {
  new: "text-blue-400", contacted: "text-yellow-400", qualified: "text-purple-400",
  proposal_sent: "text-primary", closed_won: "text-green-400", closed_lost: "text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New", contacted: "Contacted", qualified: "Qualified",
  proposal_sent: "Proposal", closed_won: "Won", closed_lost: "Lost",
};

// ─── Mini sparkline chart ──────────────────────────────────────────────────────
function Sparkline({ data, color = "#C9A84C" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" className="w-16 h-8" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      <polyline points={`0,100 ${pts} 100,100`} fill={color} opacity="0.08" />
    </svg>
  );
}

// ─── Bar chart ────────────────────────────────────────────────────────────────
function BarChart({ data }: { data: Array<{ label: string; value: number; color?: string }> }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <motion.div
            className="w-full rounded-t-sm"
            style={{ backgroundColor: d.color ?? "rgba(201,168,76,0.5)", originY: 1 }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ height: `${Math.max(4, (d.value / max) * 88)}px` }} />
          </motion.div>
          <div className="text-[10px] text-muted-foreground text-center leading-tight truncate w-full">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, trend, sparkData }: {
  icon: React.ReactNode; label: string; value: number | string; trend?: string; sparkData?: number[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl p-5 border border-white/6 card-lift"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
          {icon}
        </div>
        {sparkData && <Sparkline data={sparkData} />}
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        {trend && (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <TrendingUp size={10} />
            {trend}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "overview", icon: <BarChart3 size={16} />, label: "Overview" },
  { id: "leads", icon: <Users size={16} />, label: "Leads" },
  { id: "ai-usage", icon: <Brain size={16} />, label: "AI Usage" },
  { id: "projects", icon: <FolderOpen size={16} />, label: "Projects" },
  { id: "automations", icon: <GitBranch size={16} />, label: "Automations" },
  { id: "messages", icon: <MessageSquare size={16} />, label: "Messages" },
];

function Sidebar({ active, onNav, collapsed, onToggle }: {
  active: string; onNav: (id: string) => void; collapsed: boolean; onToggle: () => void;
}) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex-shrink-0 glass-panel border-r border-white/6 flex flex-col overflow-hidden"
      style={{ minHeight: "100%" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/6">
        <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
          <Shield size={14} className="text-primary" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-sm font-bold text-white whitespace-nowrap">STAGEONE</div>
              <div className="text-xs text-muted-foreground">Dashboard</div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={onToggle} className="ml-auto text-muted-foreground hover:text-white transition-colors flex-shrink-0">
          {collapsed ? <ChevronRight size={14} /> : <Menu size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              active === item.id
                ? "sidebar-item-active text-primary"
                : "text-muted-foreground hover:text-white hover:bg-white/4"
            }`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {!collapsed && active === item.id && (
              <ChevronRight size={12} className="ml-auto" />
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-4 border-t border-white/6 space-y-1">
        <Link href="/admin">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/4 transition-all">
            <Settings size={16} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">CRM Admin</span>}
          </button>
        </Link>
        <Link href="/">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/4 transition-all">
            <Globe size={16} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">View Site</span>}
          </button>
        </Link>
      </div>
    </motion.aside>
  );
}

// ─── Page sections ────────────────────────────────────────────────────────────
function OverviewPage({ stats }: { stats: Stats | null }) {
  const mockSpark = [12, 18, 14, 24, 19, 31, 28, 35];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users size={16} />} label="Total Leads" value={stats?.totals.leads ?? 0} trend="+12%" sparkData={mockSpark} />
        <StatCard icon={<Zap size={16} />} label="AI Sessions" value={stats?.totals.aiSessions ?? 0} trend="+24%" sparkData={[8, 14, 22, 18, 30, 25, 38, 42]} />
        <StatCard icon={<FolderOpen size={16} />} label="Active Projects" value={MOCK_PROJECTS.filter(p => p.status !== "completed").length} />
        <StatCard icon={<GitBranch size={16} />} label="Automations" value={MOCK_AUTOMATIONS.filter(a => a.status === "active").length} trend="Live" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AI Tool Usage chart */}
        <div className="md:col-span-2 glass-panel rounded-xl border border-white/6 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-0.5">AI Tool Usage</div>
              <div className="text-sm text-muted-foreground">Sessions by tool this month</div>
            </div>
            <Brain size={16} className="text-primary" />
          </div>
          {stats?.sessionsByTool && stats.sessionsByTool.length > 0 ? (
            <BarChart data={stats.sessionsByTool.map((s) => ({
              label: TOOL_LABELS[s.tool]?.split(" ")[0] ?? s.tool,
              value: Number(s.count),
              color: "rgba(201,168,76,0.5)",
            }))} />
          ) : (
            <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">No AI sessions yet</div>
          )}
        </div>

        {/* Pipeline status */}
        <div className="glass-panel rounded-xl border border-white/6 p-5">
          <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Lead Pipeline</div>
          <div className="space-y-3">
            {Object.entries(STATUS_LABELS).map(([status, label]) => {
              const item = stats?.leadsByStatus.find((s) => s.status === status);
              const count = Number(item?.count ?? 0);
              const total = stats?.totals.leads ?? 1;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className={`text-xs font-medium w-20 ${STATUS_COLORS[status]}`}>{label}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: "rgba(201,168,76,0.5)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / total) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-xs text-white w-4 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity feed + Recent leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel rounded-xl border border-white/6 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest">Live Activity</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </div>
          <div className="space-y-3">
            {ACTIVITY.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3"
              >
                <div className={`w-6 h-6 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0 mt-0.5 ${item.color}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white font-medium truncate">{item.text}</div>
                  <div className="text-xs text-muted-foreground truncate">{item.sub}</div>
                </div>
                <div className="text-xs text-muted-foreground/50 flex-shrink-0">{item.time}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-xl border border-white/6 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest">Recent Leads</div>
            <span className="text-xs text-muted-foreground">{stats?.totals.leads ?? 0} total</span>
          </div>
          {(stats?.recentLeads ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users size={28} className="text-muted-foreground/30 mb-3" />
              <div className="text-sm text-muted-foreground">No leads yet</div>
              <div className="text-xs text-muted-foreground/50 mt-1">Use the AI tools to start capturing leads</div>
            </div>
          ) : (
            <div className="space-y-2">
              {(stats?.recentLeads ?? []).map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 py-2 border-b border-white/4 last:border-0">
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-[10px] font-bold">
                      {(lead.name ?? lead.email)[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white font-medium truncate">{lead.name ?? lead.email}</div>
                    <div className="text-xs text-muted-foreground">{SOURCE_LABELS[lead.source] ?? lead.source}</div>
                  </div>
                  <span className={`text-xs font-semibold ${STATUS_COLORS[lead.status]}`}>{STATUS_LABELS[lead.status]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LeadsPage({ leads }: { leads: Lead[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-white">All Leads</h2>
        <Link href="/admin">
          <button className="flex items-center gap-2 text-xs text-primary border border-primary/20 rounded-lg px-3 py-2 hover:bg-primary/10 transition-all">
            Full CRM <ArrowRight size={12} />
          </button>
        </Link>
      </div>
      <div className="glass-panel rounded-xl border border-white/6 overflow-hidden">
        {leads.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Users size={36} className="mx-auto mb-4 opacity-30" />
            <div className="text-sm">No leads captured yet</div>
            <div className="text-xs opacity-60 mt-1">AI tools capture leads automatically</div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6">
                {["Contact", "Source", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-primary uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3">
                    <div className="text-sm font-medium text-white">{lead.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{lead.email}</div>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{SOURCE_LABELS[lead.source] ?? lead.source}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold ${STATUS_COLORS[lead.status]}`}>{STATUS_LABELS[lead.status]}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function AiUsagePage({ stats }: { stats: Stats | null }) {
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl font-bold text-white">AI Usage Analytics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={<Brain size={16} />} label="Total Sessions" value={stats?.totals.aiSessions ?? 0} />
        <StatCard icon={<Sparkles size={16} />} label="Website Generations" value={stats?.sessionsByTool.find(s => s.tool === "website_generator")?.count ?? 0} />
        <StatCard icon={<Bot size={16} />} label="Chatbot Builds" value={stats?.sessionsByTool.find(s => s.tool === "chatbot_builder")?.count ?? 0} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel rounded-xl border border-white/6 p-5">
          <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-5">Sessions by Tool</div>
          {(stats?.sessionsByTool ?? []).length > 0 ? (
            <div className="space-y-4">
              {(stats?.sessionsByTool ?? []).map((s) => {
                const total = stats?.totals.aiSessions ?? 1;
                return (
                  <div key={s.tool}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-white">{TOOL_LABELS[s.tool] ?? s.tool}</span>
                      <span className="text-xs text-muted-foreground">{s.count} sessions</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gold-gradient"
                        initial={{ width: 0 }}
                        animate={{ width: `${(Number(s.count) / Number(total)) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">No AI sessions logged yet</div>
          )}
        </div>
        <div className="glass-panel rounded-xl border border-white/6 p-5">
          <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-5">Leads by AI Source</div>
          {(stats?.leadsBySource ?? []).length > 0 ? (
            <BarChart data={(stats?.leadsBySource ?? []).map((s) => ({
              label: SOURCE_LABELS[s.source]?.split(" ")[0] ?? s.source,
              value: Number(s.count),
            }))} />
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">No lead data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectsPage() {
  const statusStyle: Record<string, string> = {
    in_progress: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    review: "text-primary bg-primary/10 border-primary/20",
    completed: "text-green-400 bg-green-400/10 border-green-400/20",
  };
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl font-bold text-white">Projects</h2>
      <div className="space-y-3">
        {MOCK_PROJECTS.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-panel rounded-xl border border-white/6 p-5 card-lift"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-white">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.client} · Due {p.due}</div>
              </div>
              <span className={`text-xs font-semibold border rounded-full px-2.5 py-1 ${statusStyle[p.status]}`}>
                {p.status === "in_progress" ? "In Progress" : p.status.charAt(0).toUpperCase() + p.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gold-gradient"
                  initial={{ width: 0 }}
                  animate={{ width: `${p.completion}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.07 }}
                />
              </div>
              <span className="text-xs font-semibold text-primary">{p.completion}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AutomationsPage() {
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl font-bold text-white">Automations</h2>
      <div className="space-y-3">
        {MOCK_AUTOMATIONS.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-panel rounded-xl border border-white/6 p-5 card-lift"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${a.status === "active" ? "bg-green-400/10 border border-green-400/20" : "bg-white/5 border border-white/10"}`}>
                  <Zap size={14} className={a.status === "active" ? "text-green-400" : "text-muted-foreground"} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{a.name}</div>
                  <div className="text-xs text-muted-foreground">Trigger: {a.trigger}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <div className="text-xs font-semibold text-primary">{a.runs}</div>
                  <div className="text-xs text-muted-foreground">runs</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-green-400">{a.saved}</div>
                  <div className="text-xs text-muted-foreground">saved</div>
                </div>
                <div className={`w-2 h-2 rounded-full ${a.status === "active" ? "bg-green-400 animate-pulse" : "bg-white/20"}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MessagesPage() {
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl font-bold text-white">Messages</h2>
      <div className="glass-panel rounded-xl border border-white/6 overflow-hidden">
        {MOCK_MESSAGES.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex items-start gap-4 p-5 border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors cursor-pointer group"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${m.unread ? "bg-primary/15 border-primary/30" : "bg-white/5 border-white/10"}`}>
              <span className={`text-sm font-bold ${m.unread ? "text-primary" : "text-muted-foreground"}`}>
                {m.from[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <div className={`text-sm font-semibold ${m.unread ? "text-white" : "text-muted-foreground"}`}>{m.from}</div>
                <div className="text-xs text-muted-foreground/60">{m.time}</div>
              </div>
              <div className="text-xs text-muted-foreground mb-1">{m.company}</div>
              <div className="text-xs text-muted-foreground/70 truncate">{m.preview}</div>
            </div>
            {m.unread && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const ADMIN_PIN = "stageone2025";

export default function Dashboard() {
  const [section, setSection] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [sRes, lRes] = await Promise.all([
          fetch("/api/admin/stats", { headers: { "x-admin-pin": ADMIN_PIN } }),
          fetch("/api/admin/leads", { headers: { "x-admin-pin": ADMIN_PIN } }),
        ]);
        if (sRes.ok) setStats(await sRes.json() as Stats);
        if (lRes.ok) { const d = await lRes.json() as { leads: Lead[] }; setLeads(d.leads); }
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const renderSection = () => {
    switch (section) {
      case "overview": return <OverviewPage stats={stats} />;
      case "leads": return <LeadsPage leads={leads} />;
      case "ai-usage": return <AiUsagePage stats={stats} />;
      case "projects": return <ProjectsPage />;
      case "automations": return <AutomationsPage />;
      case "messages": return <MessagesPage />;
      default: return <OverviewPage stats={stats} />;
    }
  };

  const currentNav = NAV_ITEMS.find((n) => n.id === section);

  return (
    <div className="min-h-screen bg-background flex flex-col cursor-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 glass-panel border-b border-white/6 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button className="md:hidden text-muted-foreground hover:text-white" onClick={() => setMobileNav(!mobileNav)}>
            {mobileNav ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-primary">{currentNav?.icon}</span>
              <span className="text-sm font-semibold text-white">{currentNav?.label}</span>
            </div>
            <div className="text-xs text-muted-foreground hidden md:block">STAGEONE Internal Dashboard</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {loading && <RefreshCw size={14} className="text-muted-foreground animate-spin" />}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 border border-white/8 rounded-full px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            All systems live
          </div>
          <Link href="/">
            <button className="text-xs text-muted-foreground hover:text-white transition-colors border border-white/8 rounded-lg px-3 py-1.5 hover:border-white/15">
              View Site
            </button>
          </Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Sidebar desktop */}
        <div className="hidden md:block h-full">
          <Sidebar active={section} onNav={setSection} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        </div>

        {/* Mobile nav overlay */}
        <AnimatePresence>
          {mobileNav && (
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute top-0 left-0 z-20 h-full w-56 md:hidden"
            >
              <Sidebar active={section} onNav={(id) => { setSection(id); setMobileNav(false); }} collapsed={false} onToggle={() => setMobileNav(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6 bg-grid-fine">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
