/**
 * Workflow Builder Page
 * Visual AI agent workflow creation and management
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkflowCanvas } from '@/components/workflow-builder/WorkflowCanvas';
import { CinematicButton } from '@/components/atoms/CinematicButton';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { LoadingScreen } from '@/components/ui-library';
import { base44 } from '@/api/base44Client';
import { workflowExecutionService } from '@/components/services/WorkflowExecutionService';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Play, Save, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

export default function WorkflowBuilderPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    if (id) {
      loadWorkflow();
    } else {
      // New workflow
      setWorkflow({
        name: 'New Workflow',
        description: '',
        status: 'draft',
        nodes: [
          {
            id: 'trigger-1',
            type: 'trigger',
            position: { x: 250, y: 50 },
            data: { label: 'Trigger', config: { type: 'manual' } },
          },
        ],
        edges: [],
        variables: {},
      });
      setLoading(false);
    }
  }, [id]);

  const loadWorkflow = async () => {
    try {
      const workflows = await base44.entities.Workflow.filter({ id });
      if (workflows.length > 0) {
        setWorkflow(workflows[0]);
      }
    } catch (error) {
      toast.error('Failed to load workflow');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (canvasData) => {
    try {
      const workflowData = {
        ...workflow,
        nodes: canvasData.nodes,
        edges: canvasData.edges,
      };

      if (workflow.id) {
        await base44.entities.Workflow.update(workflow.id, workflowData);
        toast.success('Workflow saved');
      } else {
        const created = await base44.entities.Workflow.create({
          ...workflowData,
          created_by: user.email,
        });
        setWorkflow(created);
        navigate(`/workflow-builder/${created.id}`);
        toast.success('Workflow created');
      }
    } catch (error) {
      toast.error('Failed to save workflow');
      console.error(error);
    }
  };

  const handleExecute = async (canvasData) => {
    if (!workflow.id) {
      toast.error('Save workflow before executing');
      return;
    }

    try {
      setExecuting(true);
      
      // Save current state first
      await handleSave(canvasData);

      // Execute workflow
      const result = await workflowExecutionService.executeWorkflow(workflow.id, {});
      
      toast.success('Workflow executed successfully');
      console.log('Execution result', result);
    } catch (error) {
      toast.error(`Execution failed: ${error.message}`);
      console.error(error);
    } finally {
      setExecuting(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading workflow builder..." />;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-white/10 bg-slate-900/80 backdrop-blur-xl"
      >
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(createPageUrl('Workflows'))}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {workflow?.name || 'New Workflow'}
                </h1>
                <p className="text-sm text-white/60">
                  {workflow?.description || 'Visual AI agent workflow builder'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CinematicButton
                variant="glass"
                icon={Settings}
                size="sm"
              >
                Settings
              </CinematicButton>
              
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                <div className={`w-2 h-2 rounded-full ${workflow?.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`} />
                <span className="text-sm text-white/80 capitalize">{workflow?.status || 'draft'}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Canvas */}
      <div className="flex-1 relative">
        {workflow && (
          <WorkflowCanvas
            workflow={workflow}
            onSave={handleSave}
            onExecute={handleExecute}
          />
        )}

        {executing && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
            <CinematicCard className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="inline-block mb-4"
              >
                <Zap className="w-12 h-12 text-orange-500" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Executing Workflow</h3>
              <p className="text-white/60">Processing nodes...</p>
            </CinematicCard>
          </div>
        )}
      </div>
    </div>
  );
}