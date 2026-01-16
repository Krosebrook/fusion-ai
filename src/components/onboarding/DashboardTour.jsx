/**
 * Dashboard Tour Component
 * 
 * Interactive tour of the Advanced Analytics dashboard with
 * highlighted sections and explanations.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, PieChart, Download } from 'lucide-react';

const TOUR_HIGHLIGHTS = [
  {
    id: 'header',
    title: 'Test Selector & Filters',
    description: 'Choose which A/B test to analyze. Filter by date range and metrics to focus on what matters.',
    icon: BarChart3,
    position: 'top',
  },
  {
    id: 'trends',
    title: 'Trend Analysis',
    description: 'View performance metrics over time. See how success rates, latency, and costs evolve throughout your test.',
    icon: TrendingUp,
    position: 'middle-left',
  },
  {
    id: 'cohorts',
    title: 'Cohort Analysis',
    description: 'Analyze user behavior by cohort. Understand retention rates and segment performance by date groups.',
    icon: PieChart,
    position: 'middle-right',
  },
  {
    id: 'export',
    title: 'Export & Reports',
    description: 'Export analysis results as CSV or PDF. Share reports with stakeholders and maintain audit trails.',
    icon: Download,
    position: 'bottom',
  },
];

export function DashboardTour({ onComplete }) {
  const [currentHighlight, setCurrentHighlight] = useState(0);
  const highlight = TOUR_HIGHLIGHTS[currentHighlight];
  const Icon = highlight.icon;

  return (
    <div className="space-y-8">
      {/* Animated Mock Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <CinematicCard className="p-8 bg-gradient-to-b from-slate-800/30 to-slate-900/30">
          <div className="space-y-6">
            {/* Header Section - Highlighted */}
            <motion.div
              animate={currentHighlight === 0 ? { boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)' } : {}}
              className="p-4 rounded-lg border border-white/10 bg-slate-800/20 transition"
            >
              <div className="flex items-center justify-between">
                <div className="h-6 bg-white/20 rounded w-40" />
                <div className="flex gap-2">
                  <div className="h-6 bg-white/10 rounded w-20" />
                  <div className="h-6 bg-white/10 rounded w-20" />
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  animate={currentHighlight === 1 ? { boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)' } : {}}
                  className="p-4 rounded-lg border border-white/10 bg-slate-800/20"
                >
                  <div className="h-3 bg-white/20 rounded w-20 mb-2" />
                  <div className="h-6 bg-white/10 rounded w-16" />
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                animate={currentHighlight === 2 ? { boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)' } : {}}
                className="p-4 rounded-lg border border-white/10 bg-slate-800/20 h-48"
              >
                <div className="h-full flex items-end justify-between">
                  {[30, 50, 40, 60, 45, 55].map((h, i) => (
                    <div key={i} className="w-6 bg-cyan-500/50 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </motion.div>

              <motion.div
                animate={currentHighlight === 3 ? { boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)' } : {}}
                className="p-4 rounded-lg border border-white/10 bg-slate-800/20 h-48 flex items-center justify-center"
              >
                <div className="w-32 h-32 rounded-full border-8 border-cyan-500/20" />
              </motion.div>
            </div>
          </div>
        </CinematicCard>

        {/* Highlight Label */}
        <motion.div
          key={currentHighlight}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/50 px-4 py-2 rounded-lg"
        >
          <Icon className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-300 text-sm font-semibold">{highlight.title}</span>
        </motion.div>
      </motion.div>

      {/* Description */}
      <CinematicCard className="p-6 bg-white/5">
        <motion.div
          key={currentHighlight}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
            <Icon className="w-5 h-5 text-cyan-400" />
            {highlight.title}
          </h3>
          <p className="text-white/70 leading-relaxed mb-4">{highlight.description}</p>
          <p className="text-white/50 text-sm">
            {currentHighlight + 1} of {TOUR_HIGHLIGHTS.length}
          </p>
        </motion.div>
      </CinematicCard>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setCurrentHighlight(Math.max(0, currentHighlight - 1))}
          disabled={currentHighlight === 0}
          variant="outline"
          className="border-white/20"
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {TOUR_HIGHLIGHTS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHighlight(idx)}
              className={`w-2 h-2 rounded-full transition ${
                idx === currentHighlight ? 'bg-cyan-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={() => currentHighlight < TOUR_HIGHLIGHTS.length - 1 ? setCurrentHighlight(currentHighlight + 1) : onComplete()}
          className="bg-gradient-to-r from-cyan-500 to-blue-600"
        >
          {currentHighlight === TOUR_HIGHLIGHTS.length - 1 ? 'Done' : 'Next'}
        </Button>
      </div>
    </div>
  );
}