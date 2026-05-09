import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GoldButton } from "@/components/ui/GoldButton";
import { motion } from "framer-motion";
import { Brain, Zap, Globe, LayoutTemplate, PenTool, ArrowUpRight } from "lucide-react";

export default function Services() {
  const services = [
    { 
      icon: Zap, 
      title: "AI Automation", 
      desc: "Automate workflows, reduce overhead, scale operations without scaling headcount. We map your current processes and implement custom AI agents to handle repetitive tasks.",
      features: ["Workflow Analysis", "Custom Agent Development", "API Integrations", "24/7 Monitoring"]
    },
    { 
      icon: Brain, 
      title: "AI Assistants", 
      desc: "Custom AI chatbots and assistants trained on your proprietary business data. Deliver perfect customer support and internal knowledge retrieval instantly.",
      features: ["RAG Implementation", "Custom LLM Fine-tuning", "Omnichannel Deployment", "Analytics Dashboard"]
    },
    { 
      icon: Globe, 
      title: "Smart Websites", 
      desc: "High-converting, blazing-fast web experiences built with modern tech. We combine elite cinematic design with robust technical architecture.",
      features: ["Cinematic UI/UX", "Next.js / React Architecture", "Headless CMS", "Conversion Optimization"]
    },
    { 
      icon: PenTool, 
      title: "Brand Identity", 
      desc: "Strategic visual identities that position you as an industry leader. We create premium brand systems that command authority and trust.",
      features: ["Logo & Visual System", "Brand Guidelines", "Motion Language", "Digital Assets"]
    },
    { 
      icon: LayoutTemplate, 
      title: "Content Systems", 
      desc: "AI-powered content pipelines that produce at scale. Generate high-quality blogs, social posts, and marketing copy automatically.",
      features: ["Content Strategy", "Automated Pipelines", "SEO Optimization", "Multi-platform Publishing"]
    }
  ];

  return (
    <AppLayout>
      <section className="py-24 relative overflow-hidden bg-grid-pattern">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <motion.div 
            className="max-w-3xl mb-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
              Our <span className="text-gold-gradient">Services</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We engineer elite digital infrastructure. From brand identity to autonomous AI systems, we provide everything a modern business needs to dominate its category.
            </p>
          </motion.div>

          <div className="space-y-12 mb-32">
            {services.map((service, idx) => (
              <GlassCard 
                key={idx} 
                className="p-8 md:p-12 flex flex-col md:flex-row gap-8 md:gap-16 items-start relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary origin-top scale-y-0 transition-transform duration-500 group-hover:scale-y-100 z-10" />
                
                <span className="absolute top-6 right-8 font-serif text-5xl text-white/5 pointer-events-none">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                <div className="relative w-20 h-20 shrink-0">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-primary/20 blur-xl transition-colors duration-500" />
                  <div className="relative w-full h-full rounded-xl bg-primary/10 border border-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors z-10">
                    <service.icon className="text-primary w-10 h-10" />
                  </div>
                </div>
                
                <div className="flex-grow z-10">
                  <h2 className="text-3xl font-serif font-bold text-white mb-4">{service.title}</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-3xl">
                    {service.desc}
                  </p>
                  <div className="flex flex-wrap gap-3 mb-8">
                    {service.features.map((feature, i) => (
                      <span key={i} className="font-mono text-xs bg-[rgba(201,168,76,0.08)] border border-primary/20 text-white/80 px-3 py-1 rounded-sm">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <GoldButton href="/contact" variant="outline">
                    Learn More <ArrowUpRight className="ml-2 w-4 h-4" />
                  </GoldButton>
                </div>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5" />
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
                Not sure where to start? <br />
                <span className="text-gold-gradient">Our AI advisor is ready.</span>
              </h3>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Discuss your business goals and get tailored recommendations on which systems will drive the highest impact.
              </p>
              <GoldButton href="/contact" variant="solid" size="lg">
                Talk to Advisor
              </GoldButton>
            </div>
          </GlassCard>

        </div>
      </section>
      
      <section className="py-24 bg-[#030303] text-center border-t border-white/5">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-8">Ready to transform your business?</h2>
          <div className="inline-block animate-gold-glow rounded-sm">
            <GoldButton href="/contact" variant="solid" size="lg">
              Book a Consultation
            </GoldButton>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
