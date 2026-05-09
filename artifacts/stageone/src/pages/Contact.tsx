import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GoldButton } from "@/components/ui/GoldButton";
import { motion } from "framer-motion";
import { Calendar, Mail, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(1, "Company is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setIsSubmitted(true);
    form.reset();
    setTimeout(() => setIsSubmitted(false), 5000);
  }

  return (
    <AppLayout>
      <section className="py-24 relative overflow-hidden bg-grid-pattern">
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="max-w-3xl mb-16">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
              Start Your <span className="text-gold-gradient">Next Stage</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Whether you need a cutting-edge web platform or a custom AI automation system, we're ready to engineer your solution.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form Section */}
            <GlassCard className="p-8 md:p-12">
              <h3 className="text-2xl font-serif font-bold text-white mb-8">Send an Inquiry</h3>
              
              {isSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-primary/10 border border-primary/30 rounded-lg p-6 text-center"
                >
                  <h4 className="text-xl font-bold text-white mb-2">Message Received</h4>
                  <p className="text-primary">We will get back to you within 24 hours.</p>
                </motion.div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/80">Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" className="bg-black/50 border-white/10 text-white focus-visible:ring-primary focus-visible:border-primary" {...field} />
                            </FormControl>
                            <FormMessage className="text-destructive" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/80">Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="john@example.com" className="bg-black/50 border-white/10 text-white focus-visible:ring-primary focus-visible:border-primary" {...field} />
                            </FormControl>
                            <FormMessage className="text-destructive" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Corp" className="bg-black/50 border-white/10 text-white focus-visible:ring-primary focus-visible:border-primary" {...field} />
                          </FormControl>
                          <FormMessage className="text-destructive" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">Project Details</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your goals..." 
                              className="min-h-[150px] bg-black/50 border-white/10 text-white focus-visible:ring-primary focus-visible:border-primary resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-destructive" />
                        </FormItem>
                      )}
                    />
                    <GoldButton type="submit" className="w-full">
                      Submit Inquiry
                    </GoldButton>
                  </form>
                </Form>
              )}
            </GlassCard>

            {/* Info Section */}
            <div className="space-y-8">
              <GlassCard className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-white">Book a Strategy Call</h3>
                    <p className="text-sm text-muted-foreground">Direct access to our leadership team</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-8">
                  Skip the inbox and book a 30-minute discovery call directly on our calendar to discuss your needs.
                </p>
                <GoldButton href="https://calendly.com" target="_blank" rel="noopener noreferrer" variant="outline" className="w-full">
                  Open Calendar
                </GoldButton>
              </GlassCard>

              <GlassCard className="p-8">
                <h3 className="text-xl font-serif font-bold text-white mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <Mail className="text-primary w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">General Inquiries</p>
                      <a href="mailto:hello@stageone.agency" className="text-white hover:text-primary transition-colors font-medium">
                        hello@stageone.agency
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <MapPin className="text-primary w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="text-white font-medium">Remote · Global</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
