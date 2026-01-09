/**
 * Prompt Quality Gates - Automated checks and gates before deployment
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, XCircle, Clock, Play, 
  AlertTriangle, TrendingUp, Zap
} from 'lucide-react';
import { toast } from 'sonner';

export function PromptQualityGates({ versionId, environment }) {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);

  const qualityChecks = [
    { 
      id: 'syntax',
      name: 'Syntax Validation',
      description: 'Validates prompt structure and variable placeholders',
      icon: CheckCircle,
      required: true
    },
    { 
      id: 'regression',
      name: 'Regression Tests',
      description: 'Ensures outputs match historical baselines',
      icon: Zap,
      required: true
    },
    { 
      id: 'performance',
      name: 'Performance Benchmark',
      description: 'Checks latency and token consumption',
      icon: TrendingUp,
      required: environment !== 'development'
    },
    { 
      id: 'security',
      name: 'Security Scan',
      description: 'Detects injection risks and PII exposure',
      icon: AlertTriangle,
      required: environment === 'production'
    }
  ];

  const runQualityGates = async () => {
    setRunning(true);
    setResults(null);

    try {
      const checkResults = {};
      
      for (const check of qualityChecks) {
        const result = await base44.functions.invoke('promptQualityCheck', {
          version_id: versionId,
          check_type: check.id,
          environment
        });
        
        checkResults[check.id] = {
          passed: result.passed,
          message: result.message,
          details: result.details,
          duration_ms: result.duration_ms
        };
      }

      setResults(checkResults);

      const allPassed = Object.values(checkResults).every(r => r.passed);
      if (allPassed) {
        toast.success('All quality gates passed');
      } else {
        toast.error('Some quality gates failed');
      }
    } catch (error) {
      toast.error('Failed to run quality gates');
    } finally {
      setRunning(false);
    }
  };

  return (
    <CinematicCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Quality Gates</h2>
          <p className="text-white/60 text-sm">
            Environment: <span className="text-white capitalize">{environment}</span>
          </p>
        </div>
        <Button
          onClick={runQualityGates}
          disabled={running}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          {running ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Checks
            </>
          )}
        </Button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {qualityChecks.map((check, idx) => {
            const result = results?.[check.id];
            const Icon = check.icon;

            return (
              <motion.div
                key={check.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  result?.passed
                    ? 'border-green-500 bg-green-500/10'
                    : result && !result.passed
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${
                      result?.passed
                        ? 'text-green-400'
                        : result && !result.passed
                        ? 'text-red-400'
                        : 'text-white/60'
                    }`} />
                    <div>
                      <p className="text-white font-semibold">{check.name}</p>
                      <p className="text-white/60 text-xs">{check.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {check.required && (
                      <Badge className="bg-orange-500/20 text-orange-300 text-xs">
                        Required
                      </Badge>
                    )}
                    {result && (
                      <Badge className={`text-xs ${
                        result.passed 
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {result.passed ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {result.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    )}
                  </div>
                </div>

                {result && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <p className="text-white/80 text-sm mb-2">{result.message}</p>
                    {result.details && (
                      <div className="text-xs text-white/60 space-y-1">
                        {Object.entries(result.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="font-mono">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-white/40 text-xs mt-2">
                      Duration: {result.duration_ms}ms
                    </p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {results && (
        <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-white font-semibold mb-2">Summary</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-white/60">Total Checks</p>
              <p className="text-white font-bold">{qualityChecks.length}</p>
            </div>
            <div>
              <p className="text-white/60">Passed</p>
              <p className="text-green-400 font-bold">
                {Object.values(results).filter(r => r.passed).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </CinematicCard>
  );
}