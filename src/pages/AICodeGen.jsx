import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeGenerationPanel } from '@/components/ai-code/CodeGenerationPanel';
import { DebuggingAssistant } from '@/components/ai-code/DebuggingAssistant';
import { RefactoringTool } from '@/components/ai-code/RefactoringTool';
import { TestingAssistant } from '@/components/ai-code/TestingAssistant';
import { ProjectScaffolder } from '@/components/ai-code/ProjectScaffolder';
import { IntegrationGenerator } from '@/components/ai-code/IntegrationGenerator';
import { CodeReviewAssistant } from '@/components/ai-code/CodeReviewAssistant';
import { DocumentationGenerator } from '@/components/ai-code/DocumentationGenerator';
import { WorkflowOrchestrator } from '@/components/ai-code/WorkflowOrchestrator';
import { ComponentGenerator } from '@/components/ai-code/ComponentGenerator';
import { AgentCollaborationSystem } from '@/components/ai-agents/AgentCollaborationSystem';
import { Code, Bug, Zap, Sparkles, TestTube, FolderTree, Link2, Shield, BookOpen, GitBranch, Package, Users } from 'lucide-react';
import { useAuth } from '@/components/hooks/useAuth';

export default function AICodeGenPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">AI-Powered Code Assistant</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-['Space_Grotesk']">
            AI Code Studio
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Generate, debug, and refactor code with production-grade AI assistance
          </p>
        </motion.div>

        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 mb-6 flex-wrap h-auto">
            <TabsTrigger value="agents" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Users className="w-4 h-4 mr-2" />
              AI Agents
            </TabsTrigger>
            <TabsTrigger value="components" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
              <Package className="w-4 h-4 mr-2" />
              Components
            </TabsTrigger>
            <TabsTrigger value="workflow" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <GitBranch className="w-4 h-4 mr-2" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="scaffold" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <FolderTree className="w-4 h-4 mr-2" />
              Scaffold
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              <Link2 className="w-4 h-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="generate" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Code className="w-4 h-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="testing" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <TestTube className="w-4 h-4 mr-2" />
              Testing
            </TabsTrigger>
            <TabsTrigger value="review" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Shield className="w-4 h-4 mr-2" />
              Review
            </TabsTrigger>
            <TabsTrigger value="debug" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
              <Bug className="w-4 h-4 mr-2" />
              Debug
            </TabsTrigger>
            <TabsTrigger value="refactor" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Zap className="w-4 h-4 mr-2" />
              Refactor
            </TabsTrigger>
            <TabsTrigger value="docs" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              <BookOpen className="w-4 h-4 mr-2" />
              Docs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents">
            <AgentCollaborationSystem />
          </TabsContent>

          <TabsContent value="components">
            <ComponentGenerator />
          </TabsContent>

          <TabsContent value="workflow">
            <WorkflowOrchestrator />
          </TabsContent>

          <TabsContent value="scaffold">
            <ProjectScaffolder />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationGenerator />
          </TabsContent>

          <TabsContent value="generate">
            <CodeGenerationPanel />
          </TabsContent>

          <TabsContent value="testing">
            <TestingAssistant />
          </TabsContent>

          <TabsContent value="review">
            <CodeReviewAssistant />
          </TabsContent>

          <TabsContent value="debug">
            <DebuggingAssistant />
          </TabsContent>

          <TabsContent value="refactor">
            <RefactoringTool />
          </TabsContent>

          <TabsContent value="docs">
            <DocumentationGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}