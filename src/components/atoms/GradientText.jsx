import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * GradientText - Cinematic gradient text component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Text content
 * @param {string} props.gradient - Gradient direction: 'purple-cyan' | 'pink-purple' | 'orange-pink'
 * @param {boolean} props.animate - Enable animation on mount
 * @param {string} props.className - Additional classes
 */
export default function GradientText({ 
  children, 
  gradient = 'purple-cyan',
  animate = false,
  className 
}) {
  const gradients = {
    'purple-cyan': 'from-purple-400 via-pink-400 to-cyan-400',
    'pink-purple': 'from-pink-400 to-purple-400',
    'orange-pink': 'from-orange-400 to-pink-400',
    'cyan-blue': 'from-cyan-400 to-blue-400',
  };

  const Component = animate ? motion.span : 'span';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' }
  } : {};

  return (
    <Component
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        gradients[gradient],
        className
      )}
      {...animationProps}
    >
      {children}
    </Component>
  );
}