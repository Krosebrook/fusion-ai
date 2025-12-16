/**
 * Collaboration Monitor
 * Real-time visualization of multi-agent collaboration and communication
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicBadge } from '../atoms/CinematicBadge';
import {
  Bot,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { agentOrchestrationService, type CollaborationSession, type ExecutionStep, type AgentMessage } from '../services/AgentOrchestrationService';
import { tokens } from '../design-system/tokens';

interface CollaborationMonitorProps {
  sessionId: string;
}

export function CollaborationMonitor({ sessionId }: CollaborationMonitorProps) {
  const [session, setSession] = useState<CollaborationSession | null>(null);

  useEffect(() => {
    // Subscribe to session updates
    const unsubscribe = agentOrchestrationService.subscribeToSession(sessionId, (updatedSession) => {
      setSession(updatedSession);
    });

    // Load initial session
    const initialSession = agentOrchestrationService.getSession(sessionId);
    if (initialSession) {
      setSession(initialSession);
    }

    return unsubscribe;
  }, [sessionId]);

  if (!session) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const progress = (session.currentStep / session.steps.length) * 100;
  const duration = session.completedAt
    ? session.completedAt - session.startedAt
    : Date.now() - session.startedAt;

  return (
    <div className="space-y-6">
      {/* Header */}
      <CinematicCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Collaboration Session
              </h2>
              <p className="text-slate-400 text-sm">
                {session.steps.length} agents working together
              </p>
            </div>
            <CinematicBadge
              variant={
                session.status === 'completed'
                  ? 'success'
                  : session.status === 'failed'
                  ? 'error'
                  : 'info'
              }
              pulse={session.status === 'running'}
            >
              {session.status}
            </CinematicBadge>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">
                Step {session.currentStep + 1} of {session.steps.length}
              </span>
              <span className="text-white font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-pink-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: tokens.easing.smooth }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">Duration</p>
              <p className="text-white font-semibold">
                {Math.round(duration / 1000)}s
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">Messages</p>
              <p className="text-white font-semibold">{session.messages.length}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">Completed</p>
              <p className="text-white font-semibold">
                {session.steps.filter(s => s.status === 'completed').length}/{session.steps.length}
              </p>
            </div>
          </div>
        </div>
      </CinematicCard>

      {/* Execution Timeline */}
      <CinematicCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Execution Timeline
          </h3>

          <div className="space-y-4">
            <AnimatePresence>
              {session.steps.map((step, index) => (
                <StepCard
                  key={step.nodeId}
                  step={step}
                  index={index}
                  isActive={index === session.currentStep}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </CinematicCard>

      {/* Communication Log */}
      <CinematicCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Agent Communication
          </h3>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {session.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {session.messages.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                <p className="text-sm">No messages yet</p>
              </div>
            )}
          </div>
        </div>
      </CinematicCard>
    </div>
  );
}

function StepCard({ step, index, isActive }: { step: ExecutionStep; index: number; isActive: boolean }) {
  const statusConfig = {
    pending: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-400/20' },
    running: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-500/20', spin: true },
    completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/20' },
    failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/20' },
  }[step.status];

  const Icon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative pl-8 ${isActive ? 'scale-105' : ''}`}
    >
      {/* Timeline Line */}
      {index < 10 && (
        <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-white/10" />
      )}

      {/* Status Icon */}
      <div
        className={`absolute left-0 top-1 w-8 h-8 rounded-full ${statusConfig.bg} flex items-center justify-center`}
      >
        <Icon
          className={`w-4 h-4 ${statusConfig.color} ${statusConfig.spin ? 'animate-spin' : ''}`}
        />
      </div>

      {/* Content */}
      <div
        className={`bg-white/5 rounded-xl p-4 border-2 transition-all ${
          isActive ? 'border-orange-500' : 'border-white/10'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-orange-500" />
            <span className="text-white font-medium">Step {index + 1}</span>
          </div>
          {step.duration && (
            <CinematicBadge variant="info" size="sm">
              {Math.round(step.duration / 1000)}s
            </CinematicBadge>
          )}
        </div>

        <p className="text-slate-400 text-sm mb-2">{step.input || 'Processing...'}</p>

        {step.output && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-slate-400 text-xs mb-1">Output:</p>
            <pre className="text-slate-300 text-xs font-mono overflow-x-auto">
              {typeof step.output === 'string'
                ? step.output
                : JSON.stringify(step.output, null, 2)}
            </pre>
          </div>
        )}

        {step.error && (
          <div className="mt-3 pt-3 border-t border-red-500/20">
            <p className="text-red-400 text-xs">{step.error}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MessageBubble({ message }: { message: AgentMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 rounded-xl p-4 border border-white/10"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-medium text-sm">{message.senderName}</span>
            {message.recipientName && (
              <>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="text-slate-400 text-sm">{message.recipientName}</span>
              </>
            )}
            <CinematicBadge variant="info" size="sm">
              {message.type}
            </CinematicBadge>
          </div>
          <p className="text-slate-300 text-sm">{message.content}</p>
          <p className="text-slate-500 text-xs mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default CollaborationMonitor;