/**
 * Visual Pipeline Builder Page
 * AI-powered CI/CD pipeline configuration with drag-and-drop interface
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CinematicButton } from '../components/atoms/CinematicButton';
import { VisualPipelineEditor } from '@/components/cicd/VisualPipelineEditor';
import { ArrowLeft, Rocket } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function VisualPipelineBuilderPage() {
  const [saving, setSaving] = useState(false);

  const handleSavePipeline = async (pipeline) => {
    setSaving(true);
    try {
      await base44.entities.PipelineConfig.create({
        name: `Pipeline - ${new Date().toLocaleDateString()}`,
        provider: 'github',
        repository_name: 'user/repo',
        project_type: pipeline.projectType || 'react',
        branch: 'main',
        triggers: {
          push: true,
          pull_request: true,
          manual: true,
        },
        workflow_file: JSON.stringify(pipeline, null, 2),
        active: true,
      });

      toast.success('Pipeline saved successfully!');
    } catch (error) {
      console.error('Failed to save pipeline', error);
      toast.error('Failed to save pipeline');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('CICDAutomation')}>
                <CinematicButton variant="ghost" icon={ArrowLeft} size="sm">
                  Back
                </CinematicButton>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-purple-400" />
                  Visual Pipeline Builder
                </h1>
                <p className="text-white/60 text-sm">Design your CI/CD pipeline visually with AI assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="h-[calc(100vh-120px)]">
        <VisualPipelineEditor onSave={handleSavePipeline} />
      </div>
    </div>
  );
}