import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface GoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
}

export const GoldButton = React.forwardRef<HTMLButtonElement, GoldButtonProps>(
  ({ className, variant = "solid", size = "md", href, target, rel, children, ...props }, ref) => {
    const baseStyles =
      "relative inline-flex items-center justify-center rounded-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 tracking-wide overflow-hidden group";

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-8 py-3 text-sm",
      lg: "px-10 py-4 text-lg",
    };

    const variants = {
      solid:
        "bg-primary text-background hover:shadow-[0_0_40px_rgba(201,168,76,0.6),_0_0_20px_rgba(201,168,76,0.4)] shadow-[0_0_20px_rgba(201,168,76,0.3)]",
      ghost:
        "text-primary hover:bg-primary/10",
      outline:
        "border border-primary text-primary hover:bg-primary hover:text-background hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] animate-gold-glow",
    };

    const buttonClasses = cn(baseStyles, sizes[size], variants[variant], className);

    const inner = (
      <>
        {variant === "solid" && (
          <span className="absolute inset-0 w-full h-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.25)_50%,transparent_100%)] bg-[length:200%_100%] opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_1.5s_linear_infinite]" />
        )}
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      </>
    );

    if (href) {
      const isExternal = href.startsWith("http") || target === "_blank";
      if (isExternal) {
        return (
          <motion.a
            href={href}
            target={target}
            rel={rel}
            className={buttonClasses}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ ease: [0.22, 1, 0.36, 1] }}
          >
            {inner}
          </motion.a>
        );
      }
      return (
        <Link href={href} className="inline-block">
          <motion.button
            ref={ref}
            className={buttonClasses}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ ease: [0.22, 1, 0.36, 1] }}
            {...props as any}
          >
            {inner}
          </motion.button>
        </Link>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={buttonClasses}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ ease: [0.22, 1, 0.36, 1] }}
        {...props as any}
      >
        {inner}
      </motion.button>
    );
  }
);

GoldButton.displayName = "GoldButton";
