import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";

export default function About() {
  const values = [
    { title: "Innovation", desc: "We don't follow trends; we set them. We leverage the latest AI and web technologies to keep our clients ahead of the curve." },
    { title: "Precision", desc: "Every pixel, every line of code, every system prompt is crafted with meticulous attention to detail. Good enough is not enough." },
    { title: "Impact", desc: "We measure our success by your success. We build systems designed to increase revenue, reduce overhead, and drive measurable growth." }
  ];

  return (
    <AppLayout>
      <section className="py-24 relative overflow-hidden bg-grid-pattern min-h-[80vh] flex items-center">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Large background watermark text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-[12rem] md:text-[18rem] font-bold text-white/2 pointer-events-none select-none whitespace-nowrap overflow-hidden leading-none tracking-tighter">
          STAGEONE
        </div>
        
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight">
              Built at the Intersection of <br />
              <span className="text-gold-gradient">AI and Design</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              STAGEONE was founded on a simple premise: the future of business belongs to those who adapt. We exist to arm ambitious companies with the digital infrastructure required to dominate the next decade.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-[#030303] border-y border-white/5 relative">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((val, idx) => (
              <GlassCard key={idx} className="p-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <motion.div 
                  className="w-12 h-1 bg-primary mb-6 origin-left"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + idx * 0.1, duration: 0.6 }}
                />
                <h3 className="text-2xl font-serif font-bold text-white mb-4">{val.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{val.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 relative">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-24 text-center">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">The Leadership</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">The architects behind the systems.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <motion.div key={i} className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="aspect-[3/4] rounded-xl overflow-hidden relative border border-white/10 transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(201,168,76,0.15)]">
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-500 z-10" />
                  
                  <img 
                    src={`/team-${i}.png`} 
                    alt={`Team member ${i}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=800&h=1000";
                    }}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 z-20" />
                  
                  <div className="absolute bottom-0 left-0 w-full p-8 z-30">
                    <h4 className="text-3xl font-serif font-bold text-white mb-2">
                      {i === 1 ? "Alexander Vance" : i === 2 ? "Elena Rostova" : "Julian Park"}
                    </h4>
                    <p className="text-primary font-medium tracking-wide text-sm uppercase">
                      {i === 1 ? "Founder & CEO" : i === 2 ? "Head of AI" : "Creative Director"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-40 bg-[#030303] border-t border-white/5 relative overflow-hidden">
        {/* Diagonal light beam effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-[20%] w-[1px] h-[200%] bg-gradient-to-b from-primary/0 via-primary/10 to-primary/0 rotate-45 transform-gpu blur-[2px]" />
          <div className="absolute top-[-20%] left-[30%] w-[2px] h-[200%] bg-gradient-to-b from-primary/0 via-primary/5 to-primary/0 rotate-45 transform-gpu blur-[4px]" />
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-tight">
              Excellence is not an act, <br />
              <span className="text-gold-gradient italic">it's a habit.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We treat every project as our masterpiece. If you're ready to elevate your brand to the absolute highest standard, we're ready to build.
            </p>
          </motion.div>
        </div>
      </section>
    </AppLayout>
  );
}
