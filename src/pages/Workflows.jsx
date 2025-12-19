/**
 * Workflows Page
 * Manage and browse AI agent workflows
 */

import React, { useState } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import { useEntityList } from '@/components/hooks/useEntity';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { CinematicButton } from '@/components/atoms/CinematicButton';
import { CinematicBadge } from '@/components/atoms/CinematicBadge';
import { LoadingScreen, EmptyState } from '@/components/ui-library';
import { motion } from 'framer-motion';
import { Plus, Zap, Clock, CheckCircle, AlertCircle, Play, Edit } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function WorkflowsPage() {
  const { user } = useAuth();
  const { data: workflows, isLoading } = useEntityList(
    'Workflow',
    user ? { created_by: user.email } : {},
    '-updated_date'
  );

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      draft: 'info',
      paused: 'warning',
      archived: 'default',
    };
    return <CinematicBadge variant={variants[status] || 'info'} size="sm">{status}</CinematicBadge>;
  };

  if (isLoading) return <LoadingScreen message="Loading workflows..." />;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  AI Agent Workflows
                </h1>
                <p className="text-lg text-white/70">
                  Build sophisticated automation with visual workflow builder
                </p>
              </div>
            </div>

            <CinematicButton
              variant="primary"
              icon={Plus}
              onClick={() => window.location.href = createPageUrl('WorkflowBuilder')}
              glow
            >
              New Workflow
            </CinematicButton>
          </div>
        </motion.div>

        {/* Workflows Grid */}
        {workflows.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="No workflows yet"
            description="Create your first AI agent workflow to automate complex tasks"
            action={() => window.location.href = createPageUrl('WorkflowBuilder')}
            actionLabel="Create Workflow"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow, index) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CinematicCard className="p-6 hover:scale-105 transition-transform">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        {workflow.name}
                      </h3>
                      <p className="text-sm text-white/60 line-clamp-2">
                        {workflow.description || 'No description'}
                      </p>
                    </div>
                    {getStatusBadge(workflow.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <Play className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs text-white/60">Executions</span>
                      </div>
                      <p className="text-lg font-bold text-white">
                        {workflow.execution_count || 0}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-white/60">Success</span>
                      </div>
                      <p className="text-lg font-bold text-white">
                        {workflow.success_rate ? `${Math.round(workflow.success_rate * 100)}%` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {workflow.last_executed && (
                    <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
                      <Clock className="w-3 h-3" />
                      Last run: {format(new Date(workflow.last_executed), 'MMM d, h:mm a')}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <CinematicButton
                      variant="glass"
                      size="sm"
                      icon={Edit}
                      onClick={() => window.location.href = createPageUrl('WorkflowBuilder') + '/' + workflow.id}
                      className="flex-1"
                    >
                      Edit
                    </CinematicButton>
                    <CinematicButton
                      variant="primary"
                      size="sm"
                      icon={Play}
                      className="flex-1"
                    >
                      Run
                    </CinematicButton>
                  </div>
                </CinematicCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}