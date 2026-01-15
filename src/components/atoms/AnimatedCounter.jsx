import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

/**
 * AnimatedCounter - Smooth number counting animation
 * @param {Object} props
 * @param {number} props.value - Target number
 * @param {number} props.duration - Animation duration in seconds
 * @param {string} props.suffix - Suffix (e.g., '+', '%', 'K')
 */
export default function AnimatedCounter({ 
  value, 
  duration = 2,
  suffix = "",
  className 
}) {
  const [isInView, setIsInView] = useState(false);
  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (current) =>
    Math.floor(current).toLocaleString()
  );

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [spring, value, isInView]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      onViewportEnter={() => setIsInView(true)}
      viewport={{ once: true }}
    >
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  );
}