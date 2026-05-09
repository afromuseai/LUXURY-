import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CursorEffect() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const springConfig = { damping: 28, stiffness: 300, mass: 0.5 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  const lagConfig = { damping: 20, stiffness: 120, mass: 0.8 };
  const lagX = useSpring(cursorX, lagConfig);
  const lagY = useSpring(cursorY, lagConfig);

  useEffect(() => {
    // Only show custom cursor on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const onEnter = () => setIsVisible(true);
    const onLeave = () => setIsVisible(false);
    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const onHoverCheck = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest("a, button, [role='button'], input, textarea, select, label");
      setIsHovering(!!isInteractive);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousemove", onHoverCheck);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    // Hide default cursor
    document.documentElement.style.cursor = "none";

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousemove", onHoverCheck);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.documentElement.style.cursor = "";
    };
  }, [isVisible]);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return null;

  return (
    <>
      {/* Outer glow ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[99998] mix-blend-screen"
        style={{
          x: lagX,
          y: lagY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isHovering ? 2.2 : isClicking ? 0.7 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="w-10 h-10 rounded-full border border-primary/40"
          style={{
            boxShadow: "0 0 20px rgba(201,168,76,0.3), inset 0 0 10px rgba(201,168,76,0.1)",
            background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[99999]"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isClicking ? 0.5 : isHovering ? 1.5 : 1,
        }}
        transition={{ duration: 0.1 }}
      >
        <div
          className="w-2 h-2 rounded-full bg-primary"
          style={{ boxShadow: "0 0 8px rgba(201,168,76,0.8)" }}
        />
      </motion.div>
    </>
  );
}
