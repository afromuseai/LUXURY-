import React from "react";
import { Link } from "wouter";
import { Twitter, Linkedin, Instagram, ArrowRight } from "lucide-react";

const faviconSrc = "/favicon.png";

export function Footer() {
  return (
    <footer className="bg-[#030303] border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group" data-testid="link-footer-logo">
              {/* Favicon icon with glow */}
              <div className="relative flex-shrink-0">
                <div
                  className="absolute inset-0 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(201,168,76,0.45) 0%, transparent 70%)",
                    filter: "blur(8px)",
                    transform: "scale(1.8)",
                  }}
                />
                <img
                  src={faviconSrc}
                  alt=""
                  aria-hidden="true"
                  style={{
                    height: "40px",
                    width: "40px",
                    objectFit: "contain",
                    mixBlendMode: "screen",
                    filter: "drop-shadow(0 0 8px rgba(201,168,76,0.8)) brightness(1.1)",
                    position: "relative",
                  }}
                />
              </div>
              {/* Wordmark */}
              <span
                className="font-serif font-bold tracking-widest"
                style={{
                  fontSize: "1.5rem",
                  background: "linear-gradient(135deg, #C9A84C 0%, #F0D080 40%, #C9A84C 70%, #A07830 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 6px rgba(201,168,76,0.35))",
                }}
              >
                STAGEONE
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm text-lg leading-relaxed mb-8">
              Elite AI digital agency building cutting-edge digital systems for modern businesses. Enter the next stage of growth.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-background transition-all" data-testid="link-social-twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-background transition-all" data-testid="link-social-linkedin">
                <Linkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-background transition-all" data-testid="link-social-instagram">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-lg font-bold mb-6 text-white">Navigation</h4>
            <ul className="space-y-4">
              {[
                { label: "Home", href: "/" },
                { label: "Services", href: "/services" },
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group">
                    <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-bold mb-6 text-white">Contact</h4>
            <ul className="space-y-4">
              <li className="text-muted-foreground">
                <a href="mailto:hello@stageone.agency" className="hover:text-primary transition-colors">
                  hello@stageone.agency
                </a>
              </li>
              <li className="text-muted-foreground">Remote · Global</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} STAGEONE Agency. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
