import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { GoldButton } from "@/components/ui/GoldButton";
import { Menu, X, ChevronDown, Sparkles, Brain, Bot, Gamepad2, LayoutDashboard, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faviconSrc = "/favicon.png";

const AI_TOOLS = [
  { name: "Generate", path: "/generate", icon: <Wand2 size={14} />, desc: "Generate UI from a prompt", badge: "New" },
  { name: "AI Playground", path: "/ai-playground", icon: <Gamepad2 size={14} />, desc: "5 tools in one interface" },
  { name: "Website Generator", path: "/ai-generator", icon: <Sparkles size={14} />, desc: "Generate landing page concepts" },
  { name: "Business Advisor", path: "/business-advisor", icon: <Brain size={14} />, desc: "Strategic AI advice" },
  { name: "Chatbot Builder", path: "/chatbot-builder", icon: <Bot size={14} />, desc: "Build & preview chatbots" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [location] = useLocation();
  const aiMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (aiMenuRef.current && !aiMenuRef.current.contains(e.target as Node)) {
        setAiMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isAiPath = ["/generate", "/ai-generator", "/business-advisor", "/chatbot-builder", "/ai-playground"].includes(location);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-white/5 py-4"
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 z-50 group" data-testid="link-logo-home">
          <div className="relative flex-shrink-0">
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(ellipse at center, rgba(201,168,76,0.5) 0%, transparent 70%)",
                filter: "blur(6px)",
                transform: "scale(1.6)",
              }}
            />
            <img
              src={faviconSrc}
              alt=""
              aria-hidden="true"
              className="relative"
              style={{
                height: "34px",
                width: "34px",
                objectFit: "contain",
                mixBlendMode: "screen",
                filter: "drop-shadow(0 0 6px rgba(201,168,76,0.8)) brightness(1.1)",
              }}
            />
          </div>
          <span
            className="font-serif font-bold tracking-widest transition-all duration-300"
            style={{
              fontSize: "1.25rem",
              background: "linear-gradient(135deg, #C9A84C 0%, #F0D080 40%, #C9A84C 70%, #A07830 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "none",
              filter: "drop-shadow(0 0 8px rgba(201,168,76,0.4))",
            }}
          >
            STAGEONE
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              data-testid={`link-nav-${link.name.toLowerCase()}`}
              className={cn(
                "text-sm font-medium tracking-wide transition-all duration-200 hover:text-primary relative group",
                location === link.path ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.name}
              <span className={cn(
                "absolute -bottom-1 left-0 right-0 h-px bg-primary transition-transform duration-300 origin-left",
                location === link.path ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              )} />
            </Link>
          ))}

          {/* AI Tools Dropdown */}
          <div ref={aiMenuRef} className="relative">
            <button
              onClick={() => setAiMenuOpen(!aiMenuOpen)}
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium tracking-wide transition-all duration-200 hover:text-primary relative group",
                isAiPath ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Sparkles size={13} className={cn("transition-all", aiMenuOpen && "text-primary")} />
              AI Tools
              <ChevronDown
                size={13}
                className={cn("transition-transform duration-300", aiMenuOpen && "rotate-180")}
              />
              <span className={cn(
                "absolute -bottom-1 left-0 right-0 h-px bg-primary transition-transform duration-300 origin-left",
                isAiPath ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              )} />
            </button>

            <AnimatePresence>
              {aiMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-full right-0 mt-4 w-68 glass-card rounded-2xl border border-white/12 p-2 shadow-2xl"
                  style={{ width: 272 }}
                >
                  {/* Glow top */}
                  <div className="absolute -top-px left-4 right-4 h-px bg-gold-gradient opacity-60 rounded-full" />

                  {AI_TOOLS.map((tool, i) => (
                    <motion.div
                      key={tool.path}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={tool.path}
                        onClick={() => setAiMenuOpen(false)}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-xl transition-all duration-200 group",
                          location === tool.path
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-white/5 border border-transparent"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center text-primary flex-shrink-0 mt-0.5 transition-all duration-200 border",
                          location === tool.path
                            ? "bg-primary/20 border-primary/40"
                            : "bg-primary/8 border-primary/15 group-hover:bg-primary/15 group-hover:border-primary/30"
                        )}>
                          {tool.icon}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-primary transition-colors duration-200">{tool.name}</div>
                          <div className="text-xs text-muted-foreground">{tool.desc}</div>
                        </div>
                        {tool.badge && (
                          <span className="ml-auto text-[9px] bg-primary/15 text-primary border border-primary/25 rounded-full px-1.5 py-0.5 font-semibold uppercase tracking-wider self-start mt-0.5">{tool.badge}</span>
                        )}
                      </Link>
                    </motion.div>
                  ))}

                  {/* Dashboard link */}
                  <div className="mt-1 pt-1 border-t border-white/6">
                    <Link href="/dashboard" onClick={() => setAiMenuOpen(false)}>
                      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground flex-shrink-0 group-hover:border-white/20">
                          <LayoutDashboard size={14} />
                        </div>
                        <div className="text-sm font-medium text-muted-foreground group-hover:text-white transition-colors">Internal Dashboard</div>
                      </div>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <GoldButton href="/contact" variant="outline" className="py-2 px-6">
            Book a Call
          </GoldButton>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden z-50 text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="button-mobile-menu"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mobileMenuOpen ? "x" : "menu"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.div>
          </AnimatePresence>
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-full left-0 right-0 bg-background/97 backdrop-blur-2xl border-b border-white/8 p-6 flex flex-col gap-4 md:hidden shadow-2xl"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-lg font-medium tracking-wide transition-colors py-1",
                    location === link.path ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-white/8 pt-4 mt-1">
                <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Sparkles size={11} />
                  AI Tools
                </div>
                {AI_TOOLS.map((tool) => (
                  <Link
                    key={tool.path}
                    href={tool.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-2.5 text-muted-foreground hover:text-white transition-colors"
                  >
                    <span className="text-primary">{tool.icon}</span>
                    <span className="text-base font-medium">{tool.name}</span>
                  </Link>
                ))}
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center gap-3 py-2.5 text-muted-foreground hover:text-white transition-colors">
                    <LayoutDashboard size={14} className="text-muted-foreground" />
                    <span className="text-base font-medium">Dashboard</span>
                  </div>
                </Link>
              </div>
              <GoldButton href="/contact" variant="solid" className="w-full mt-2" onClick={() => setMobileMenuOpen(false)}>
                Book a Call
              </GoldButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
