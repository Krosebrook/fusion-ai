import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="mb-4 inline-block"
        >
          <Loader2 className="w-12 h-12 text-purple-500" />
        </motion.div>
        <p className="text-gray-400 text-lg">{message}</p>
      </motion.div>
    </div>
  );
}