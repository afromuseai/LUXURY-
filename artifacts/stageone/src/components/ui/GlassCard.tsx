import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  className?: string;
  glowOnHover?: boolean;
  children?: React.ReactNode;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glowOnHover = true, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "glass-card rounded-xl p-6 transition-all duration-500 group relative overflow-hidden",
          glowOnHover && "hover:border-primary/40 hover:shadow-[0_0_30px_rgba(201,168,76,0.1)]",
          className
        )}
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        {...props}
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gold-gradient origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 rounded-full" />
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";
