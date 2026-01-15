import React, { Suspense } from "react";
import { motion } from "framer-motion";

/**
 * LazyRoute wrapper for code splitting
 * Provides loading state while chunk loads
 */
export default function LazyRoute({ children }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="relative w-20 h-20 mx-auto mb-6">
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-2 rounded-full bg-slate-950"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
        <p className="text-slate-400 text-sm">Loading...</p>
      </motion.div>
    </div>
  );
}