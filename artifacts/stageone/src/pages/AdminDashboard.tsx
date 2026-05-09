import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Users, BarChart3, Zap, Globe, TrendingUp, Shield, RefreshCw,
  Clock, CheckCircle, XCircle, Circle, Mail, Building, Tag,
  ChevronDown, Edit3, Trash2, Eye, Lock,
} from "lucide-react";

const ADMIN_PIN_KEY = "stageone_admin_pin";

interface Lead {
  id: number;
  email: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  industry: string | null;
  message: string | null;
  source: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totals: { leads: number; aiSessions: number };
  leadsBySource: Array<{ source: string; count: number }>;
  leadsByStatus: Array<{ status: string; count: number }>;
  sessionsByTool: Array<{ tool: string; count: number }>;
  recentLeads: Lead[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: "New", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: <Circle size={12} /> },
  contacted: { label: "Contacted", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: <Clock size={12} /> },
  qualified: { label: "Qualified", color: "text-purple-400 bg-purple-400/10 border-purple-400/20", icon: <Eye size={12} /> },
  proposal_sent: { label: "Proposal Sent", color: "text-primary bg-primary/10 border-primary/20", icon: <Mail size={12} /> },
  closed_won: { label: "Won", color: "text-green-400 bg-green-400/10 border-green-400/20", icon: <CheckCircle size={12} /> },
  closed_lost: { label: "Lost", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: <XCircle size={12} /> },
};

const SOURCE_LABELS: Record<string, string> = {
  contact_form: "Contact Form",
  ai_website_generator: "Website Generator",
  ai_business_advisor: "Business Advisor",
  ai_chatbot_builder: "Chatbot Builder",
  chat_widget: "Chat Widget",
};

const TOOL_LABELS: Record<string, string> = {
  website_generator: "Website Generator",
  business_advisor: "Business Advisor",
  chatbot_builder: "Chatbot Builder",
  chat_widget: "Chat Widget",
  content_generator: "Content Generator",
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "text-muted-foreground bg-white/5 border-white/10", icon: <Circle size={12} /> };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number | string; sub?: string }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-xs font-semibold text-primary uppercase tracking-widest">{label}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </GlassCard>
  );
}

export default function AdminDashboard() {
  const [pin, setPin] = useState<string>(() => localStorage.getItem(ADMIN_PIN_KEY) ?? "");
  const [authenticated, setAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const [stats, setStats] = useState<Stats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "leads">("overview");
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [saving, setSaving] = useState(false);

  async function authenticate() {
    setLoading(true);
    const res = await fetch("/api/admin/stats", {
      headers: { "x-admin-pin": pinInput },
    });
    setLoading(false);
    if (res.ok) {
      localStorage.setItem(ADMIN_PIN_KEY, pinInput);
      setPin(pinInput);
      setAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  }

  async function fetchData() {
    if (!authenticated && !pin) return;
    setLoading(true);
    try {
      const [statsRes, leadsRes] = await Promise.all([
        fetch("/api/admin/stats", { headers: { "x-admin-pin": pin } }),
        fetch("/api/admin/leads", { headers: { "x-admin-pin": pin } }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json() as Stats);
      if (leadsRes.ok) {
        const data = await leadsRes.json() as { leads: Lead[] };
        setLeads(data.leads);
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    if (pin) {
      fetch("/api/admin/stats", { headers: { "x-admin-pin": pin } }).then((r) => {
        if (r.ok) { setAuthenticated(true); fetchData(); }
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchData();
  }, [authenticated]);

  async function updateLead(id: number) {
    setSaving(true);
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ status: editStatus || undefined, notes: editNotes || undefined }),
    });
    if (res.ok) {
      await fetchData();
      setEditingLead(null);
    }
    setSaving(false);
  }

  async function deleteLead(id: number) {
    if (!confirm("Delete this lead?")) return;
    await fetch(`/api/admin/leads/${id}`, {
      method: "DELETE",
      headers: { "x-admin-pin": pin },
    });
    await fetchData();
  }

  const filteredLeads = leads.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
    return true;
  });

  if (!authenticated) {
    return (
      <AppLayout>
        <section className="min-h-screen pt-28 pb-24 px-6 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                <Lock size={28} className="text-primary" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-white mb-2">Admin Access</h1>
              <p className="text-muted-foreground text-sm mb-8">Enter your admin PIN to access the STAGEONE CRM dashboard.</p>
              <input
                type="password"
                placeholder="Enter admin PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") authenticate(); }}
                className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none transition-all text-center tracking-widest text-lg mb-4 ${
                  pinError ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-primary/50"
                }`}
              />
              {pinError && <p className="text-red-400 text-xs mb-4">Invalid PIN. Default: stageone2025</p>}
              <button
                onClick={authenticate}
                disabled={!pinInput || loading}
                className="w-full bg-primary text-background font-semibold py-3 rounded-sm tracking-wide hover:shadow-[0_0_30px_rgba(201,168,76,0.5)] transition-all disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Access Dashboard"}
              </button>
            </GlassCard>
          </motion.div>
        </section>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <section className="min-h-screen pt-28 pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">Admin Dashboard</span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">STAGEONE CRM</h1>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors border border-white/10 rounded-lg px-4 py-2 hover:border-white/20"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<Users size={18} />} label="Total Leads" value={stats.totals.leads} />
              <StatCard icon={<Zap size={18} />} label="AI Sessions" value={stats.totals.aiSessions} />
              <StatCard
                icon={<CheckCircle size={18} />}
                label="Won Deals"
                value={stats.leadsByStatus.find((s) => s.status === "closed_won")?.count ?? 0}
              />
              <StatCard
                icon={<TrendingUp size={18} />}
                label="In Pipeline"
                value={(stats.leadsByStatus.find((s) => s.status === "qualified")?.count ?? 0) +
                  (stats.leadsByStatus.find((s) => s.status === "proposal_sent")?.count ?? 0)}
              />
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 mb-6 w-fit">
            {[
              { id: "overview", label: "Overview", icon: <BarChart3 size={14} /> },
              { id: "leads", label: "All Leads", icon: <Users size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-2 px-5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === tab.id ? "bg-primary/15 text-primary border border-primary/20" : "text-muted-foreground hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "overview" && stats && (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Leads by Source */}
                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Globe size={14} className="text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-widest">Leads by Source</span>
                  </div>
                  <div className="space-y-3">
                    {stats.leadsBySource.map((s) => (
                      <div key={s.source} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{SOURCE_LABELS[s.source] ?? s.source}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min(100, (Number(s.count) / stats.totals.leads) * 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-white w-4 text-right">{s.count}</span>
                        </div>
                      </div>
                    ))}
                    {stats.leadsBySource.length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-4">No data yet</div>
                    )}
                  </div>
                </GlassCard>

                {/* Leads by Status */}
                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Tag size={14} className="text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-widest">Pipeline Status</span>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                      const item = stats.leadsByStatus.find((s) => s.status === status);
                      const c = Number(item?.count ?? 0);
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <StatusBadge status={status} />
                          <span className="text-sm font-semibold text-white">{c}</span>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>

                {/* AI Usage */}
                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Zap size={14} className="text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-widest">AI Tool Usage</span>
                  </div>
                  <div className="space-y-3">
                    {stats.sessionsByTool.map((s) => (
                      <div key={s.tool} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{TOOL_LABELS[s.tool] ?? s.tool}</span>
                        <span className="text-sm font-semibold text-white">{s.count}</span>
                      </div>
                    ))}
                    {stats.sessionsByTool.length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-4">No sessions yet</div>
                    )}
                  </div>
                </GlassCard>

                {/* Recent Activity */}
                <div className="md:col-span-3">
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <Clock size={14} className="text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-widest">Recent Activity</span>
                    </div>
                    {stats.recentLeads.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">No leads captured yet. Share the AI demos to start capturing leads.</div>
                    ) : (
                      <div className="space-y-3">
                        {stats.recentLeads.map((lead) => (
                          <div key={lead.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-primary text-xs font-bold">
                                  {(lead.name ?? lead.email)[0]?.toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-white">{lead.name ?? lead.email}</div>
                                <div className="text-xs text-muted-foreground">{lead.email} • {SOURCE_LABELS[lead.source] ?? lead.source}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <StatusBadge status={lead.status} />
                              <span className="text-xs text-muted-foreground hidden md:block">
                                {new Date(lead.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {activeTab === "leads" && (
              <motion.div key="leads" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Filters */}
                <div className="flex gap-3 mb-5 flex-wrap">
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white appearance-none focus:outline-none focus:border-primary/50 pr-8"
                    >
                      <option value="all" className="bg-background">All Statuses</option>
                      {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                        <option key={s} value={s} className="bg-background">{cfg.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={sourceFilter}
                      onChange={(e) => setSourceFilter(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white appearance-none focus:outline-none focus:border-primary/50 pr-8"
                    >
                      <option value="all" className="bg-background">All Sources</option>
                      {Object.entries(SOURCE_LABELS).map(([s, label]) => (
                        <option key={s} value={s} className="bg-background">{label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                  <div className="text-sm text-muted-foreground self-center">{filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}</div>
                </div>

                {/* Leads Table */}
                <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                  {filteredLeads.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Users size={40} className="mx-auto mb-4 opacity-30" />
                      <div className="text-sm">No leads found</div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left px-5 py-3 text-xs font-semibold text-primary uppercase tracking-widest">Contact</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-primary uppercase tracking-widest hidden md:table-cell">Source</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-primary uppercase tracking-widest">Status</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-primary uppercase tracking-widest hidden lg:table-cell">Date</th>
                            <th className="text-right px-5 py-3 text-xs font-semibold text-primary uppercase tracking-widest">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLeads.map((lead) => (
                            <tr key={lead.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                              <td className="px-5 py-4">
                                <div className="font-semibold text-white text-sm">{lead.name ?? "—"}</div>
                                <div className="text-xs text-muted-foreground">{lead.email}</div>
                                {lead.company && <div className="text-xs text-muted-foreground">{lead.company}</div>}
                              </td>
                              <td className="px-5 py-4 hidden md:table-cell">
                                <span className="text-xs bg-white/8 border border-white/10 rounded-full px-3 py-1 text-muted-foreground">
                                  {SOURCE_LABELS[lead.source] ?? lead.source}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <StatusBadge status={lead.status} />
                                {lead.notes && (
                                  <div className="text-xs text-muted-foreground mt-1 max-w-[180px] truncate">{lead.notes}</div>
                                )}
                              </td>
                              <td className="px-5 py-4 hidden lg:table-cell">
                                <div className="text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</div>
                                <div className="text-xs text-muted-foreground/50">{new Date(lead.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => { setEditingLead(lead); setEditStatus(lead.status); setEditNotes(lead.notes ?? ""); }}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button
                                    onClick={() => deleteLead(lead.id)}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Lead Modal */}
          <AnimatePresence>
            {editingLead && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
                onClick={(e) => { if (e.target === e.currentTarget) setEditingLead(null); }}
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  className="glass-card rounded-2xl border border-white/15 p-8 w-full max-w-md"
                >
                  <h3 className="font-serif text-xl font-bold text-white mb-5">Update Lead</h3>
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-white">{editingLead.name ?? editingLead.email}</div>
                    <div className="text-xs text-muted-foreground">{editingLead.email}</div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2">Status</label>
                    <div className="relative">
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-primary/50"
                      >
                        {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                          <option key={s} value={s} className="bg-background">{cfg.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-xs font-semibold text-primary uppercase tracking-widest mb-2">Notes</label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={3}
                      placeholder="Add notes about this lead..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none text-sm"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditingLead(null)}
                      className="flex-1 border border-white/10 rounded-sm py-2.5 text-sm text-muted-foreground hover:text-white hover:border-white/20 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => updateLead(editingLead.id)}
                      disabled={saving}
                      className="flex-1 bg-primary text-background font-semibold py-2.5 rounded-sm text-sm hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] transition-all disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
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
