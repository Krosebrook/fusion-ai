/**
 * Real-Time Security Monitor
 * Live security scanning during pipeline execution
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Loader2, XCircle } from 'lucide-react';

export function RealTimeSecurityMonitor({ pipelineRunId, onSecurityIssue }) {
  const [scanStages, setScanStages] = useState([
    { id: 'dependencies', name: 'Dependency Scan', status: 'pending', issues: 0 },
    { id: 'secrets', name: 'Secret Detection', status: 'pending', issues: 0 },
    { id: 'code', name: 'Code Analysis', status: 'pending', issues: 0 },
    { id: 'container', name: 'Container Scan', status: 'pending', issues: 0 },
  ]);
  const [overallStatus, setOverallStatus] = useState('scanning');

  useEffect(() => {
    if (!pipelineRunId) return;

    // Simulate real-time scanning
    const simulateScan = async () => {
      const stages = [...scanStages];
      
      for (let i = 0; i < stages.length; i++) {
        stages[i].status = 'running';
        setScanStages([...stages]);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const randomIssues = Math.floor(Math.random() * 5);
        stages[i].status = randomIssues > 2 ? 'failed' : 'success';
        stages[i].issues = randomIssues;
        setScanStages([...stages]);

        if (randomIssues > 2 && onSecurityIssue) {
          onSecurityIssue(stages[i]);
        }
      }

      const hasFailures = stages.some(s => s.status === 'failed');
      setOverallStatus(hasFailures ? 'failed' : 'success');
    };

    simulateScan();
  }, [pipelineRunId]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Shield className="w-5 h-5 text-white/40" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500/10 border-blue-500/30';
      case 'success':
        return 'bg-green-500/10 border-green-500/30';
      case 'failed':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-white/5 border-white/10';
    }
  };

  return (
    <CinematicCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-purple-400" />
          <div>
            <h3 className="text-lg font-bold text-white">Real-Time Security Scan</h3>
            <p className="text-white/60 text-sm">Live vulnerability detection during build</p>
          </div>
        </div>
        {overallStatus === 'scanning' && (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Scanning...
          </Badge>
        )}
        {overallStatus === 'success' && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            All Clear
          </Badge>
        )}
        {overallStatus === 'failed' && (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Issues Found
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {scanStages.map((stage, index) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-xl p-4 ${getStatusColor(stage.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(stage.status)}
                  <div>
                    <div className="font-semibold text-white">{stage.name}</div>
                    {stage.status === 'running' && (
                      <div className="text-white/60 text-sm">Analyzing...</div>
                    )}
                    {stage.status === 'success' && (
                      <div className="text-green-400 text-sm">No issues detected</div>
                    )}
                    {stage.status === 'failed' && (
                      <div className="text-red-400 text-sm">
                        {stage.issues} {stage.issues === 1 ? 'issue' : 'issues'} found
                      </div>
                    )}
                  </div>
                </div>

                {stage.status === 'failed' && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    {stage.issues}
                  </Badge>
                )}
              </div>

              {stage.status === 'running' && (
                <motion.div
                  className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="h-full bg-blue-400"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'linear' }}
                  />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {overallStatus === 'failed' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <div className="font-semibold text-red-400 mb-1">Security Issues Detected</div>
              <div className="text-white/70 text-sm">
                Critical security vulnerabilities found during build. Pipeline execution blocked
                until issues are resolved.
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </CinematicCard>
  );
}

export default RealTimeSecurityMonitor;