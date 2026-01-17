/**
 * User Journeys Page
 * Interactive journey mapping, path analysis, and opportunity identification
 */
import { motion } from 'framer-motion';
import { UserJourneyVisualizer } from '@/components/analytics/UserJourneyVisualizer';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { MapPin } from 'lucide-react';

export default function UserJourneysPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">User Journey Analysis</h1>
              <p className="text-white/60">AI-powered path mapping with anomaly detection</p>
            </div>
          </div>
        </motion.div>

        {/* Main Visualizer */}
        <UserJourneyVisualizer />
      </div>
    </div>
  );
}