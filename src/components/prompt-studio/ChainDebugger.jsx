import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Pause, SkipForward, RotateCcw, 
  CheckCircle2, XCircle, Clock, AlertTriangle 
} from 'lucide-react';
import { CinematicCard } from '../atoms/CinematicCard';

export function ChainDebugger({ chain, executionLog }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = executionLog?.node_logs || [];

  if (!chain || !executionLog || steps.length === 0) {
    return (
      <CinematicCard className="p-12 text-center">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-white/20" />
        <h3 className="text-xl font-bold text-white mb-2">No Execution Data</h3>
        <p className="text-white/60">Run a chain execution to see debug information</p>
      </CinematicCard>
    );
  }

  const stepStatus = (step) => {
    if (step.status === 'success') return { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20' };
    if (step.status === 'failed') return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' };
    if (step.status === 'running') return { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/20' };
    return { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
  };

  return (
    <div className="space-y-6">
      <CinematicCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Chain Debugger</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-blue-600"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              onClick={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))}
              variant="outline"
              className="border-white/10"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => setCurrentStep(0)}
              variant="outline"
              className="border-white/10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative mb-6">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step, idx) => {
              const status = stepStatus(step);
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    idx === currentStep ? status.bg : 'bg-slate-800'
                  }`}
                >
                  <status.icon className={`w-4 h-4 ${status.color}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Step Details */}
        <AnimatePresence mode="wait">
          {steps[currentStep] && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">
                  Step {currentStep + 1}: {steps[currentStep].node_id}
                </h4>
                <Badge className={stepStatus(steps[currentStep]).bg}>
                  {steps[currentStep].status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/30 border border-white/10">
                  <div className="text-white/60 text-sm mb-2">Input</div>
                  <pre className="text-white text-xs font-mono whitespace-pre-wrap">
                    {JSON.stringify(steps[currentStep].input, null, 2)}
                  </pre>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/30 border border-white/10">
                  <div className="text-white/60 text-sm mb-2">Output</div>
                  <pre className="text-white text-xs font-mono whitespace-pre-wrap">
                    {JSON.stringify(steps[currentStep].output, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/30 border border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Duration</span>
                  <span className="text-white font-semibold">{steps[currentStep].duration_ms}ms</span>
                </div>
                {steps[currentStep].error && (
                  <div className="mt-3 p-3 rounded bg-red-500/10 border border-red-500/30">
                    <div className="text-red-400 text-sm">{steps[currentStep].error}</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CinematicCard>
    </div>
  );
}