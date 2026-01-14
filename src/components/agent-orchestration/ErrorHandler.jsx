/**
 * Error Handler - Error management and retry mechanisms
 */

// Safe refactor: Removed unused React and icon imports (no logic change)
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, RefreshCw, FileText
} from 'lucide-react';
import { toast } from 'sonner';

export function ErrorHandler({ executions }) {
  const [selectedError, setSelectedError] = useState(null);
  const [retryingIds, setRetryingIds] = useState(new Set());

  const failedExecutions = executions?.filter(e => e.status === 'failed') || [];

  const retryExecution = useCallback(async (executionId) => {
    try {
      setRetryingIds(prev => new Set(prev).add(executionId));
      
      const failed = executions.find(e => e.id === executionId);
      await base44.entities.WorkflowExecution.create({
        workflow_id: failed.workflow_id,
        status: 'running',
        input_data: failed.input_data,
        trigger_data: { retry_of: executionId, retry_count: (failed.retry_count || 0) + 1 }
      });

      toast.success('Execution retry started');
    } catch (error) {
      toast.error('Failed to retry execution');
    } finally {
      setRetryingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(executionId);
        return newSet;
      });
    }
  }, [executions]);

  const getSeverity = (error) => {
    if (error?.includes('timeout')) return 'critical';
    if (error?.includes('auth')) return 'high';
    if (error?.includes('rate')) return 'medium';
    return 'low';
  };

  const severityColors = {
    critical: 'bg-red-500/20 border-red-500/50 text-red-300',
    high: 'bg-orange-500/20 border-orange-500/50 text-orange-300',
    medium: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
    low: 'bg-blue-500/20 border-blue-500/50 text-blue-300'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Error List */}
      <div className="lg:col-span-2 space-y-6">
        <CinematicCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              Failed Executions
            </h2>
            <Badge className="bg-red-500/20 text-red-300">{failedExecutions.length}</Badge>
          </div>

          <div className="space-y-3">
            {failedExecutions.map((exec) => (
              <motion.button
                key={exec.id}
                onClick={() => setSelectedError(exec)}
                whileHover={{ x: 4 }}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedError?.id === exec.id
                    ? 'bg-red-600/20 border-red-500'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="font-semibold text-white">Execution {exec.id?.slice(0, 8)}</span>
                  </div>
                  <Badge className="text-xs">
                    {exec.trigger_data?.retry_count || 0} retries
                  </Badge>
                </div>
                <p className="text-sm text-white/60 mb-2">{exec.error_message}</p>
                <p className="text-xs text-white/40">
                  {new Date(exec.created_date).toLocaleString()}
                </p>
              </motion.button>
            ))}
          </div>
        </CinematicCard>
      </div>

      {/* Error Details & Recovery */}
      {selectedError && (
        <CinematicCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Details
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-white/60 text-sm mb-2">Error Type</p>
              <Badge className={`text-xs ${severityColors[getSeverity(selectedError.error_message)]}`}>
                {getSeverity(selectedError.error_message)} - {selectedError.error_message?.split(':')[0]}
              </Badge>
            </div>

            <div>
              <p className="text-white/60 text-sm mb-2">Message</p>
              <p className="text-white/80 text-sm font-mono bg-white/5 p-3 rounded-lg border border-white/10 break-words">
                {selectedError.error_message}
              </p>
            </div>

            <div>
              <p className="text-white/60 text-sm mb-2">Failed Step</p>
              {selectedError.execution_log?.reverse().find(s => s.status === 'failed') && (
                <div className="text-white/80 text-sm bg-white/5 p-3 rounded-lg border border-white/10">
                  <p className="font-mono">{selectedError.execution_log?.reverse().find(s => s.status === 'failed').node_id}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-white/60 text-sm mb-2">Retry Strategy</p>
              <div className="text-white/80 text-sm bg-white/5 p-3 rounded-lg border border-white/10">
                <p>Max retries: 3</p>
                <p>Backoff: Exponential</p>
                <p>Current: {selectedError.trigger_data?.retry_count || 0}/3</p>
              </div>
            </div>

            <Button
              onClick={() => retryExecution(selectedError.id)}
              disabled={
                retryingIds.has(selectedError.id) || 
                (selectedError.trigger_data?.retry_count || 0) >= 3
              }
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
            >
              {retryingIds.has(selectedError.id) ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Execution
                </>
              )}
            </Button>
          </div>
        </CinematicCard>
      )}
    </div>
  );
}