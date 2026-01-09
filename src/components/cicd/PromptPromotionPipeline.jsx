/**
 * Prompt Promotion Pipeline - Environment promotion and gating
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GitBranch, CheckCircle, AlertCircle, 
  Lock, Unlock, ArrowRight 
} from 'lucide-react';

export function PromptPromotionPipeline({ version, onPromote }) {
  const [currentEnv, setCurrentEnv] = useState('dev');
  const [promotionProgress, setPromotionProgress] = useState({});

  const environments = ['dev', 'staging', 'production'];
  const currentIndex = environments.indexOf(currentEnv);

  const promoteToNext = async () => {
    if (currentIndex < environments.length - 1) {
      const nextEnv = environments[currentIndex + 1];
      setPromotionProgress(prev => ({ ...prev, [nextEnv]: 'deploying' }));
      
      setTimeout(() => {
        setCurrentEnv(nextEnv);
        setPromotionProgress(prev => ({ ...prev, [nextEnv]: 'success' }));
      }, 1500);
    }
  };

  return (
    <CinematicCard className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <ArrowRight className="w-6 h-6 text-green-400" />
        Promotion Pipeline
      </h2>

      {/* Environment Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {environments.map((env, idx) => {
          const isActive = env === currentEnv;
          const isPassed = environments.indexOf(currentEnv) > idx;

          return (
            <motion.div
              key={env}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 rounded-lg border-2 transition-all ${
                isActive
                  ? 'border-blue-500 bg-blue-500/10'
                  : isPassed
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-bold capitalize">{env}</p>
                {isPassed ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : isActive ? (
                  <div className="w-5 h-5 rounded-full border-2 border-blue-400 animate-pulse" />
                ) : (
                  <Lock className="w-5 h-5 text-white/40" />
                )}
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Tests</span>
                  <Badge className={isPassed || isActive ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20'}>
                    {isPassed || isActive ? 'Pass' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Status</span>
                  <Badge className={isPassed || isActive ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20'}>
                    {promotionProgress[env] === 'deploying' ? 'Deploying...' : 'Ready'}
                  </Badge>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Promotion Control */}
      <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-4">
        <p className="text-white/60 text-sm mb-3">Current Environment: <span className="text-white font-bold capitalize">{currentEnv}</span></p>
        <Button
          onClick={promoteToNext}
          disabled={currentIndex >= environments.length - 1}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 disabled:opacity-50"
        >
          <Unlock className="w-4 h-4 mr-2" />
          Promote to {currentIndex < environments.length - 1 ? environments[currentIndex + 1] : 'Production'}
        </Button>
      </div>

      {/* Quality Gates */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3">Quality Gates</h3>
        <div className="space-y-2">
          {[
            { name: 'Unit Tests', passed: true },
            { name: 'Regression Tests', passed: true },
            { name: 'Performance Baseline', passed: true },
            { name: 'Security Scan', passed: false }
          ].map((gate, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3 p-2"
            >
              {gate.passed ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              )}
              <span className={gate.passed ? 'text-green-300' : 'text-yellow-300'}>
                {gate.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </CinematicCard>
  );
}