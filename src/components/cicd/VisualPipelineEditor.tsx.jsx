/**
 * Visual CI/CD Pipeline Editor
 * Drag-and-drop pipeline configuration with AI suggestions
 */

import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { CinematicButton } from '../atoms/CinematicButton';
import { CinematicCard } from '../atoms/CinematicCard';
import {
  Plus,
  Sparkles,
  Save,
  Play,
  GitBranch,
  Hammer,
  TestTube,
  Rocket,
  Server,
  Code,
} from 'lucide-react';
import { toast } from 'sonner';
import { aiService } from '../services/AIService';

const stageTypes = [
  { type: 'trigger', label: 'Trigger', icon: GitBranch, color: 'from-blue-500 to-cyan-600' },
  { type: 'build', label: 'Build', icon: Hammer, color: 'from-orange-500 to-red-600' },
  { type: 'test', label: 'Test', icon: TestTube, color: 'from-green-500 to-emerald-600' },
  { type: 'deploy', label: 'Deploy', icon: Rocket, color: 'from-purple-500 to-pink-600' },
  { type: 'custom', label: 'Custom', icon: Code, color: 'from-slate-500 to-slate-700' },
];

interface PipelineEditorProps {
  projectType?: string;
  onSave?: (pipeline: any) => void;
}

export function VisualPipelineEditor({ projectType = 'react', onSave }: PipelineEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [generating, setGenerating] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: any) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#8a5cff' },
            style: { strokeWidth: 2, stroke: '#8a5cff' },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const addStage = (stageType: string) => {
    const newNode = {
      id: `${stageType}-${Date.now()}`,
      type: 'default',
      position: {
        x: nodes.length * 250,
        y: 100,
      },
      data: {
        label: stageType.charAt(0).toUpperCase() + stageType.slice(1),
      },
      style: {
        background: 'linear-gradient(135deg, #8a5cff, #ff3b9d)',
        color: 'white',
        border: '2px solid rgba(255,255,255,0.2)',
        borderRadius: '12px',
        padding: '16px',
        minWidth: '150px',
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const generateAIPipeline = async () => {
    setGenerating(true);
    try {
      const prompt = `You are a CI/CD expert. Generate an optimal pipeline configuration for a ${projectType} project.

Analyze the project type and provide:
1. Required stages (e.g., lint, build, test, deploy)
2. Recommended tools for each stage
3. Best practices for this project type
4. Environment-specific configurations (dev, staging, prod)
5. Parallelization opportunities

Return JSON:
{
  "stages": [
    {
      "id": "unique-id",
      "name": "Stage Name",
      "type": "build|test|deploy|lint|security",
      "commands": ["command1", "command2"],
      "dependencies": ["stage-id"],
      "environment": "dev|staging|production|all",
      "parallel": true|false,
      "timeout_minutes": 30,
      "retry": { "max_attempts": 3, "backoff": "exponential" }
    }
  ],
  "environments": [
    {
      "name": "production",
      "requires_approval": true,
      "branch_restrictions": ["main", "release/*"]
    }
  ],
  "recommendations": [
    {
      "category": "performance|security|reliability",
      "suggestion": "specific recommendation",
      "impact": "high|medium|low"
    }
  ]
}`;

      const result = await aiService.invokeLLM({
        prompt,
        schema: {
          type: 'object',
          properties: {
            stages: { type: 'array' },
            environments: { type: 'array' },
            recommendations: { type: 'array' },
          },
        },
      });

      // Convert to ReactFlow nodes
      const generatedNodes = result.stages.map((stage: any, index: number) => ({
        id: stage.id,
        type: 'default',
        position: { x: index * 250, y: 100 },
        data: {
          label: stage.name,
          commands: stage.commands,
          environment: stage.environment,
        },
        style: {
          background: 'linear-gradient(135deg, #8a5cff, #ff3b9d)',
          color: 'white',
          border: '2px solid rgba(255,255,255,0.2)',
          borderRadius: '12px',
          padding: '16px',
          minWidth: '150px',
        },
      }));

      // Create edges based on dependencies
      const generatedEdges = result.stages
        .filter((stage: any) => stage.dependencies?.length > 0)
        .flatMap((stage: any) =>
          stage.dependencies.map((dep: string) => ({
            id: `${dep}-${stage.id}`,
            source: dep,
            target: stage.id,
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#8a5cff' },
            style: { strokeWidth: 2, stroke: '#8a5cff' },
          }))
        );

      setNodes(generatedNodes);
      setEdges(generatedEdges);

      // Show recommendations
      if (result.recommendations?.length > 0) {
        const topRec = result.recommendations[0];
        toast.success(`💡 ${topRec.suggestion}`, { duration: 5000 });
      }

      toast.success('✨ AI-optimized pipeline generated!');
    } catch (error) {
      console.error('Failed to generate pipeline', error);
      toast.error('Failed to generate pipeline');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    const pipeline = {
      nodes,
      edges,
      projectType,
      created_at: new Date().toISOString(),
    };
    onSave?.(pipeline);
    toast.success('Pipeline saved successfully!');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Visual Pipeline Editor</h2>
            <p className="text-white/60 text-sm">Drag & drop stages • AI-powered optimization</p>
          </div>
          <div className="flex gap-3">
            <CinematicButton
              variant="secondary"
              icon={Sparkles}
              onClick={generateAIPipeline}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'AI Generate'}
            </CinematicButton>
            <CinematicButton variant="primary" icon={Save} onClick={handleSave} glow>
              Save Pipeline
            </CinematicButton>
          </div>
        </div>

        {/* Stage Palette */}
        <div className="flex gap-2 flex-wrap">
          {stageTypes.map((stage) => (
            <button
              key={stage.type}
              onClick={() => addStage(stage.type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${stage.color} text-white text-sm font-medium hover:scale-105 transition-transform shadow-lg`}
            >
              <stage.icon className="w-4 h-4" />
              Add {stage.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-slate-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background color="#8a5cff" gap={16} size={1} style={{ opacity: 0.1 }} />
          <Controls className="!bg-white/10 !border-white/20 !backdrop-blur-md" />
          <MiniMap className="!bg-slate-900/90 !border-white/20" nodeColor="#8a5cff" />
        </ReactFlow>
      </div>
    </div>
  );
}

export default VisualPipelineEditor;