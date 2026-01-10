/**
 * Interactive Dashboard - Drill-down analytics
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, TrendingUp, Zap, BarChart3,
  Filter, X
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export function InteractiveDashboard({ experiments = [], versions = [] }) {
  const [drilldownPath, setDrilldownPath] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const drillInto = (level, data) => {
    setDrilldownPath([...drilldownPath, { level, data }]);
  };

  const drillOut = (index) => {
    setDrilldownPath(drilldownPath.slice(0, index + 1));
    if (index < 0) setSelectedVariant(null);
  };

  const currentView = drilldownPath[drilldownPath.length - 1];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      {drilldownPath.length > 0 && (
        <CinematicCard className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => drillOut(-1)}
              className="text-white/60 hover:text-white"
            >
              All Experiments
            </Button>
            {drilldownPath.map((path, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-4 h-4 text-white/40" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => drillOut(idx)}
                  className={idx === drilldownPath.length - 1 ? 'text-purple-400' : 'text-white/60'}
                >
                  {path.level}
                </Button>
              </React.Fragment>
            ))}
          </div>
        </CinematicCard>
      )}

      {/* Main View */}
      <AnimatePresence mode="wait">
        {!currentView && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <CinematicCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Experiments Overview</h2>
              <div className="space-y-3">
                {experiments.slice(0, 8).map((exp, idx) => (
                  <motion.button
                    key={exp.id}
                    onClick={() => drillInto(exp.name, exp)}
                    whileHover={{ x: 4 }}
                    className="w-full text-left p-4 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{exp.name}</p>
                        <p className="text-white/60 text-sm">{exp.variants?.length || 0} variants</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-500/20 text-purple-300">
                          {exp.status}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-white/40" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CinematicCard>
          </motion.div>
        )}

        {currentView && (
          <motion.div
            key="drilldown"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Variant Performance */}
            <CinematicCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">{currentView.level}</h2>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={currentView.data.results?.variant_metrics || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="variant_id" stroke="#ffffff40" />
                  <YAxis stroke="#ffffff40" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="avg_quality_score" fill="#a855f7" />
                  <Bar dataKey="success_rate" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </CinematicCard>

            {/* Variant Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentView.data.variants?.map((variant, idx) => (
                <motion.button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`text-left p-4 rounded-lg border transition-all ${
                    selectedVariant?.id === variant.id
                      ? 'bg-purple-600/20 border-purple-500'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-semibold">{variant.name}</p>
                    {variant.is_control && (
                      <Badge className="bg-blue-500/20 text-blue-300 text-xs">Control</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-white/60 text-xs">Traffic</p>
                      <p className="text-white">{variant.traffic_percentage}%</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">Version</p>
                      <p className="text-white font-mono text-xs">{variant.version_id?.slice(0, 8)}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Selected Variant Deep Dive */}
            {selectedVariant && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <CinematicCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{selectedVariant.name} - Deep Dive</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedVariant(null)}
                      className="text-white/60"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Quality Score', value: '0.92', icon: TrendingUp },
                      { label: 'Executions', value: '1,248', icon: Zap },
                      { label: 'Avg Latency', value: '1.2s', icon: BarChart3 }
                    ].map((stat, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30"
                      >
                        <stat.icon className="w-5 h-5 text-purple-400 mb-2" />
                        <p className="text-white/60 text-xs mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      </motion.div>
                    ))}
                  </div>
                </CinematicCard>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}