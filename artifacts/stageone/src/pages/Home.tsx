import React from "react";
import { motion } from "framer-motion";
import { GoldButton } from "@/components/ui/GoldButton";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { Brain, Zap, Globe, Shield, PenTool, LayoutTemplate, Star, ArrowUpRight, BarChart3, Clock } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

const AnimatedText = ({ text, className }: { text: string; className?: string }) => {
  const words = text.split(" ");
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          className="inline-block mr-[0.25em]"
        >
          {word === "Digital" || word === "Systems" ? (
            <span className="shimmer-text">{word}</span>
          ) : (
            word
          )}
        </motion.span>
      ))}
    </motion.div>
  );
};

const AnimatedTextSimple = ({ text, className }: { text: string; className?: string }) => {
  const words = text.split(" ");
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

const StatPill = ({ target, suffix, label }: { target: number; suffix: string; label: string }) => {
  const { count, ref } = useCountUp(target);
  return (
    <div ref={ref} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-md">
      <span className="font-serif font-bold text-primary">{count}{suffix}</span>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid-pattern">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/8 rounded-full blur-[150px] pointer-events-none" />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/12 rounded-full blur-[100px] pointer-events-none translate-x-1/4 -translate-y-1/4" 
      />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/6 rounded-full blur-[80px] pointer-events-none -translate-x-1/4 translate-y-1/4" />

      <div className="container relative z-10 mx-auto px-6 md:px-12 text-center pt-20">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm relative overflow-hidden group"
          >
            <span className="absolute inset-0 w-full h-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] bg-[length:200%_100%] opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_2s_linear_infinite]" />
            
            <div className="relative flex items-center justify-center w-2 h-2">
              <span className="absolute w-full h-full rounded-full bg-green-500/50 animate-ping-slow" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-green-500" />
            </div>
            <span className="text-sm font-medium tracking-wide text-white/80 relative z-10">Premium AI Systems Agency</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-[1.1] mb-8 tracking-tight flex flex-col items-center">
            <AnimatedText text="AI-Powered" />
            <AnimatedText text="Digital Systems" />
            <AnimatedText text="for Modern Businesses" />
          </h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto"
          >
            We build cutting-edge digital infrastructure that scales. From intelligent automation to high-converting web experiences, we architect the future of your business.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
          >
            <div className="animate-gold-glow rounded-sm w-full sm:w-auto">
              <GoldButton href="/contact" variant="solid" size="lg" className="w-full">
                Book a Consultation
              </GoldButton>
            </div>
            <GoldButton href="/services" variant="ghost" size="lg" className="w-full sm:w-auto text-white">
              View Services
            </GoldButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <StatPill target={50} suffix="+" label="Projects" />
            <StatPill target={3} suffix="x" label="Growth" />
            <StatPill target={24} suffix="/7" label="AI" />
            <StatPill target={100} suffix="%" label="Success" />
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[10px] text-white/30 uppercase tracking-widest">Scroll</span>
        <div className="w-[1px] h-16 bg-white/10 overflow-hidden">
          <div className="w-full h-full bg-primary animate-scroll-line" />
        </div>
      </div>
    </section>
  );
};

const MarqueeStrip = () => {
  const items = ["NVIDIA", "React", "TypeScript", "Framer Motion", "OpenAI", "Vercel", "AWS", "TailwindCSS", "Node.js", "PostgreSQL"];
  
  return (
    <section className="w-full py-6 border-y border-white/5 bg-[#030303] overflow-hidden">
      <div className="marquee-track">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center shrink-0">
            {items.map((item, j) => (
              <React.Fragment key={j}>
                <span className="text-sm text-white/25 tracking-[0.2em] uppercase whitespace-nowrap mx-8">
                  {item}
                </span>
                <span className="text-primary/40 text-xs">◆</span>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

const ServicesOverview = () => {
  const services = [
    { icon: Zap, title: "AI Automation", desc: "Streamline operations and reduce overhead with intelligent autonomous workflows." },
    { icon: Globe, title: "Web Design", desc: "High-performance, cinematic web experiences that convert visitors into clients." },
    { icon: Brain, title: "AI Chatbots", desc: "Custom knowledge assistants trained on your proprietary business data." },
    { icon: PenTool, title: "Branding", desc: "Strategic visual identities that position your business as an industry leader." },
    { icon: LayoutTemplate, title: "Content Systems", desc: "AI-powered pipelines to generate and distribute content at scale." }
  ];

  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-20">
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-4">What We Build</h2>
          <AnimatedTextSimple text="Our Expertise" className="text-4xl md:text-5xl font-serif font-bold text-white flex flex-wrap" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <GlassCard key={index} className="p-8 flex flex-col h-full group relative" 
              initial={{ opacity: 0, y: 32, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="text-5xl font-serif text-white/5 absolute top-4 right-6 pointer-events-none">
                {String(index + 1).padStart(2, '0')}
              </span>
              
              <div className="relative w-14 h-14 mb-8">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/20 blur-xl transition-colors duration-500" />
                <div className="relative w-full h-full rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors z-10 border border-white/5">
                  <service.icon className="text-primary" size={24} />
                </div>
              </div>
              
              <div className="relative mb-4">
                <h4 className="text-xl font-bold text-white font-serif">{service.title}</h4>
                <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-primary/50 to-transparent scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100" />
              </div>
              
              <p className="text-muted-foreground leading-relaxed flex-grow mt-2">{service.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ target, suffix, label }: { target: number, suffix: string, label: string }) => {
  const { count, ref } = useCountUp(target);
  return (
    <GlassCard className="p-8 text-center relative overflow-hidden" glowOnHover={false}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-primary/10 pointer-events-none" />
      <div ref={ref} className="text-5xl font-serif font-bold text-gold-glow text-white mb-3 flex items-center justify-center">
        {count}{suffix}
      </div>
      <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">{label}</div>
    </GlassCard>
  );
};

const WhyStageone = () => {
  return (
    <section className="py-32 bg-[radial-gradient(ellipse_at_center,rgba(20,16,10,1)_0%,rgba(3,3,3,1)_100%)] relative border-y border-white/5">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-4">Why STAGEONE</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8 leading-tight">
              We engineer <span className="text-gold-gradient">unfair advantages</span> for ambitious brands.
            </h3>
            <AnimatedTextSimple 
              text="We don't just build websites; we build intelligent systems. By combining elite design with cutting-edge artificial intelligence, we create digital assets that work tirelessly for your business 24/7."
              className="text-lg text-muted-foreground mb-8 leading-relaxed flex flex-wrap" 
            />
            
            <GoldButton href="/about" variant="outline">
              Discover Our Method <ArrowUpRight className="ml-2 w-4 h-4" />
            </GoldButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatCard target={3} suffix="x" label="Average Growth" />
            <div className="sm:translate-y-8"><StatCard target={50} suffix="+" label="Projects Shipped" /></div>
            <StatCard target={100} suffix="%" label="Client Success" />
            <div className="sm:translate-y-8"><StatCard target={24} suffix="/7" label="AI Systems" /></div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturedProjects = () => {
  const projects = [
    { 
      name: "Nexus Finance", 
      tag: "AI Dashboard", 
      desc: "A wealth management interface powered by predictive AI models.",
      bgClass: "from-[#050e12] to-[#0a1a20]"
    },
    { 
      name: "Aura Skincare", 
      tag: "E-Commerce", 
      desc: "High-conversion headless Shopify storefront with hyper-fast performance.",
      bgClass: "from-[#0d0510] to-[#150820]"
    },
    { 
      name: "Vertex Legal", 
      tag: "AI Automation", 
      desc: "Automated contract review pipeline for a top-tier law firm.",
      bgClass: "from-[#120e04] to-[#1a1508]"
    }
  ];

  return (
    <section className="py-32">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div>
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-4">Our Work</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-white">Featured Projects</h3>
          </div>
          <GoldButton href="/contact" variant="ghost" className="text-white hover:text-primary">
            Start Your Project <ArrowUpRight className="ml-2 w-4 h-4" />
          </GoldButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((project, i) => (
            <motion.div 
              key={i}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <div className={`aspect-[4/3] rounded-xl overflow-hidden mb-6 relative bg-gradient-to-br ${project.bgClass} border border-white/5 group-hover:-translate-y-2 group-hover:border-primary/60 transition-all duration-500 ease-out`}>
                
                {i === 0 && (
                  <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJub25lIi8+Cjxwb2x5Z29uIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgcG9pbnRzPSIwLDAgMSwwIDAsMSIvPgo8L3N2Zz4=')] mix-blend-overlay" />
                )}

                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md border border-primary/40 text-primary text-xs font-mono tracking-widest px-3 py-1 rounded-sm z-20">
                  {project.tag}
                </div>
                
                <div className="absolute top-4 right-6 font-serif text-6xl text-primary/15 z-10 pointer-events-none select-none">
                  {String(i + 1).padStart(2, '0')}
                </div>

                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <span className="font-serif text-white/5 text-6xl md:text-7xl font-bold tracking-widest uppercase text-center w-[150%] rotate-[-15deg] pointer-events-none select-none">
                    {project.name}
                  </span>
                </div>
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30 flex items-center justify-center">
                  <span className="text-white font-medium tracking-wide translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    View Project <ArrowUpRight className="inline w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
              
              <h4 className="text-2xl font-serif font-bold text-white mb-3 group-hover:text-primary transition-colors">{project.name}</h4>
              <p className="text-muted-foreground leading-relaxed">{project.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const testimonials = [
    { quote: "STAGEONE completely revolutionized how we operate. Their AI systems reduced our overhead by 40% in just three months.", name: "Marcus Chen", company: "CEO, TechFlow" },
    { quote: "The most premium agency experience I've ever had. They don't just design beautifully; they think strategically.", name: "Sarah Jenkins", company: "Founder, Lumina" },
    { quote: "Our conversion rate doubled after the redesign. The level of precision in their work is unmatched in the industry.", name: "David Rossi", company: "Director, Apex Capital" }
  ];

  return (
    <section className="py-32 bg-[#030303] border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <h3 className="text-3xl md:text-4xl font-serif font-bold text-center text-white mb-20">
          Trusted by <span className="text-gold-gradient">Industry Leaders</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <GlassCard 
              key={i} 
              className="p-10 relative pt-12"
              transition={{ delay: i * 0.15 }}
            >
              <div className="absolute top-2 left-4 font-serif text-[6rem] leading-none text-primary/10 pointer-events-none select-none">
                "
              </div>
              
              <div className="flex text-primary mb-8 relative z-10">
                {[...Array(5)].map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + j * 0.08, duration: 0.4 }}
                  >
                    <Star className="w-5 h-5 fill-primary" />
                  </motion.div>
                ))}
              </div>
              
              <p className="font-serif text-xl italic text-white/90 leading-relaxed mb-8 relative z-10">"{t.quote}"</p>
              
              <div className="w-8 h-[1px] bg-primary/40 mb-6" />
              
              <div>
                <div className="font-bold text-white tracking-wide">{t.name}</div>
                <div className="text-sm text-primary uppercase tracking-wider mt-1 font-medium">{t.company}</div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};

const FinalCTA = () => {
  return (
    <section className="py-40 relative overflow-hidden bg-grid-pattern">
      <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />
      
      <motion.div 
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" 
      />
      
      <div className="absolute w-2 h-2 bg-primary rounded-full animate-float blur-[1px] left-[20%] top-[30%] shadow-[0_0_10px_rgba(201,168,76,0.8)]" style={{ animationDelay: '0s' }} />
      <div className="absolute w-3 h-3 bg-primary rounded-full animate-float blur-[1px] right-[25%] top-[20%] shadow-[0_0_15px_rgba(201,168,76,0.8)]" style={{ animationDelay: '1s' }} />
      <div className="absolute w-1.5 h-1.5 bg-primary rounded-full animate-float blur-[0.5px] right-[20%] bottom-[30%] shadow-[0_0_8px_rgba(201,168,76,0.8)]" style={{ animationDelay: '2.5s' }} />
      <div className="absolute w-2.5 h-2.5 bg-primary rounded-full animate-float blur-[1px] left-[30%] bottom-[20%] shadow-[0_0_12px_rgba(201,168,76,0.8)]" style={{ animationDelay: '1.5s' }} />
      
      <div className="container relative z-10 mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 flex flex-wrap justify-center">
            <AnimatedText text="Enter the" className="mr-4" />
            <AnimatedText text="Next Stage" className="text-gold-gradient" />
          </h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-xl text-white/70 max-w-2xl mx-auto mb-12"
          >
            Stop competing on yesterday's battlefield. Let's build the digital systems that will define your future.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <div className="animate-gold-glow rounded-sm w-full sm:w-auto">
              <GoldButton href="/contact" variant="solid" size="lg" className="w-full">
                Start Your Project
              </GoldButton>
            </div>
            <GoldButton href="/projects" variant="ghost" size="lg" className="w-full sm:w-auto text-white">
              View Our Work
            </GoldButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <AppLayout>
      <Hero />
      <MarqueeStrip />
      <ServicesOverview />
      <WhyStageone />
      <FeaturedProjects />
      <Testimonials />
      <FinalCTA />
    </AppLayout>
  );
}
