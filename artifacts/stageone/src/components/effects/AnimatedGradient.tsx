import React from "react";
import { motion } from "framer-motion";

interface AnimatedGradientProps {
  className?: string;
  intensity?: "low" | "medium" | "high";
}

export function AnimatedGradient({ className = "", intensity = "medium" }: AnimatedGradientProps) {
  const opacityMap = { low: 0.06, medium: 0.10, high: 0.16 };
  const op = opacityMap[intensity];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Primary gold orb - top right */}
      <motion.div
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -40, 30, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-1/4 -right-1/4 w-[70%] h-[70%] rounded-full"
        style={{
          background: `radial-gradient(ellipse, rgba(201,168,76,${op * 1.2}) 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />

      {/* Secondary orb - bottom left */}
      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 50, -20, 0],
          scale: [1, 0.8, 1.15, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-1/4 -left-1/4 w-[60%] h-[60%] rounded-full"
        style={{
          background: `radial-gradient(ellipse, rgba(201,168,76,${op * 0.7}) 0%, transparent 70%)`,
          filter: "blur(80px)",
        }}
      />

      {/* Center subtle orb */}
      <motion.div
        animate={{
          scale: [1, 1.3, 0.85, 1],
          opacity: [op * 0.5, op, op * 0.3, op * 0.5],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full"
        style={{
          background: `radial-gradient(ellipse, rgba(201,168,76,${op * 0.4}) 0%, transparent 70%)`,
          filter: "blur(100px)",
        }}
      />

      {/* Mesh overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(201,168,76,1) 1px, transparent 1px),
            radial-gradient(circle at 80% 80%, rgba(201,168,76,1) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );
}

export function FloatingOrb({
  size = 300,
  delay = 0,
  x = "50%",
  y = "50%",
  opacity = 0.08,
}: {
  size?: number;
  delay?: number;
  x?: string;
  y?: string;
  opacity?: number;
}) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.2, 0.9, 1.1, 1],
        opacity: [opacity, opacity * 1.5, opacity * 0.6, opacity * 1.2, opacity],
      }}
      transition={{ duration: 14 + delay * 2, repeat: Infinity, ease: "easeInOut", delay }}
      className="absolute pointer-events-none rounded-full"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(ellipse, rgba(201,168,76,${opacity * 2}) 0%, transparent 65%)`,
        filter: `blur(${size * 0.2}px)`,
      }}
    />
  );
}
