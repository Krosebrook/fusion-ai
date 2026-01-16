/**
 * Offline Indicator Component
 * 
 * Displays a persistent notification when the user loses network connectivity.
 * Automatically updates when connectivity is restored.
 * 
 * Features:
 * - Real-time online/offline detection
 * - Smooth slide-down animation
 * - Auto-dismiss on reconnection
 * - Mobile-optimized positioning
 * 
 * @component
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      
      // Auto-hide reconnected message after 3 seconds
      setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[200] bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
              <WifiOff className="w-5 h-5" />
              <p className="text-sm font-semibold">
                You're offline. Some features may be limited.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reconnected Toast */}
      <AnimatePresence>
        {showReconnected && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl rounded-xl px-6 py-3"
          >
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5" />
              <p className="text-sm font-semibold">Back online!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}