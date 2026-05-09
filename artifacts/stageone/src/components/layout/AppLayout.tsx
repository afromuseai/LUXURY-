import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "framer-motion";
import { useLocation } from "wouter";
import { CursorEffect } from "@/components/effects/CursorEffect";
import { ParticleField } from "@/components/effects/ParticleField";

function PageProgressBar() {
  const [key, setKey] = useState(0);
  const [location] = useLocation();

  useEffect(() => { setKey((prev) => prev + 1); }, [location]);

  return (
    <motion.div
      key={key}
      className="fixed top-0 left-0 h-[2px] bg-gold-gradient z-[9999] origin-left"
      initial={{ scaleX: 0, opacity: 1 }}
      animate={{ scaleX: [0, 0.4, 1], opacity: [1, 1, 0] }}
      transition={{ duration: 0.85, ease: "easeOut", times: [0, 0.5, 1] }}
    />
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 h-[1px] bg-primary/40 origin-left z-[9998]"
      style={{ scaleX }}
    />
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans cursor-none relative">
      <CursorEffect />
      <PageProgressBar />
      <ScrollProgress />
      <Navbar />

      <AnimatePresence mode="wait">
        <motion.main
          key={location}
          className="flex-grow pt-24 relative"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Subtle particle background on every page */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <ParticleField count={40} />
          </div>

          <div className="relative z-10">{children}</div>
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  );
}
