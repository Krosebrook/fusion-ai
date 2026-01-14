/**
 * Execution Monitor - Real-time workflow execution tracking
 */

// Safe refactor: Removed unused React and icon imports (no logic change)
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, CheckCircle, AlertCircle, Clock, 
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Safe refactor: workflows available for future use
export function ExecutionMonitor({ executions, workflows: _workflows }) {
  const [selectedExecution, setSelectedExecution] = useState(executions?.[0]);

  const getStatusColor = (status) => {
    const colors = {
      running: 'bg-blue-500 text-blue-100',
      completed: 'bg-green-500 text-green-100',
      failed: 'bg-red-500 text-red-100',
      cancelled: 'bg-gray-500 text-gray-100'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    const icons = {
      running: <Zap className="w-4 h-4 animate-pulse" />,
      completed: <CheckCircle className="w-4 h-4" />,
      failed: <AlertCircle className="w-4 h-4" />
    };
    return icons[status] || <Activity className="w-4 h-4" />;
  };

  // Aggregate execution data for timeline
  const timelineData = executions
    ?.slice(0, 20)
    .reverse()
    .map((e, idx) => ({
      time: idx,
      duration: e.duration_ms || 0,
      status: e.status === 'completed' ? 1 : e.status === 'failed' ? 0 : 0.5
    })) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Timeline Chart */}
      <div className="lg:col-span-2">
        <CinematicCard className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-400" />
            Execution Timeline
          </h2>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="time" stroke="#ffffff40" />
              <YAxis stroke="#ffffff40" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="duration" 
                stroke="#06b6d4" 
                dot={{ fill: '#06b6d4', r: 4 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CinematicCard>
      </div>

      {/* Execution List */}
      <div className="space-y-6">
        <CinematicCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {executions?.slice(0, 10).map((exec) => (
              <motion.button
                key={exec.id}
                onClick={() => setSelectedExecution(exec)}
                whileHover={{ x: 4 }}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedExecution?.id === exec.id
                    ? 'bg-blue-600/30 border border-blue-500'
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(exec.status)}
                  <Badge className={getStatusColor(exec.status)} size="sm">
                    {exec.status}
                  </Badge>
                </div>
                <p className="text-xs text-white/60">
                  {new Date(exec.created_date).toLocaleTimeString()}
                </p>
              </motion.button>
            ))}
          </div>
        </CinematicCard>

        {selectedExecution && (
          <CinematicCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-white/60 mb-1">Status</p>
                <Badge className={getStatusColor(selectedExecution.status)}>
                  {selectedExecution.status}
                </Badge>
              </div>
              <div>
                <p className="text-white/60 mb-1">Duration</p>
                <p className="text-white font-mono">
                  {selectedExecution.duration_ms}ms
                </p>
              </div>
              <div>
                <p className="text-white/60 mb-1">Steps Executed</p>
                <p className="text-white">
                  {selectedExecution.execution_log?.length || 0}
                </p>
              </div>
              {selectedExecution.error_message && (
                <div>
                  <p className="text-white/60 mb-1">Error</p>
                  <p className="text-red-400 text-xs">{selectedExecution.error_message}</p>
                </div>
              )}
            </div>
          </CinematicCard>
        )}
      </div>

      {/* Execution Flow */}
      {selectedExecution && (
        <CinematicCard className="lg:col-span-3 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Execution Steps</h3>
          <div className="space-y-3">
            {selectedExecution.execution_log?.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-start gap-4"
              >
                <div className="mt-1">
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : step.status === 'failed' ? (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">{step.node_id}</p>
                  <p className="text-white/60 text-sm mt-1">{step.status} • {step.duration_ms}ms</p>
                  {step.error && (
                    <p className="text-red-400 text-xs mt-2">{step.error}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CinematicCard>
      )}
    </div>
  );
}