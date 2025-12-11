import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeGenerationPanel } from '@/components/ai-code/CodeGenerationPanel';
import { DebuggingAssistant } from '@/components/ai-code/DebuggingAssistant';
import { RefactoringTool } from '@/components/ai-code/RefactoringTool';
import { TestingAssistant } from '@/components/ai-code/TestingAssistant';
import { Code, Bug, Zap, Sparkles, TestTube } from 'lucide-react';
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

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 mb-6">
            <TabsTrigger 
              value="generate" 
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Code className="w-4 h-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger 
              value="debug" 
              className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400"
            >
              <Bug className="w-4 h-4 mr-2" />
              Debug
            </TabsTrigger>
            <TabsTrigger 
              value="refactor" 
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              <Zap className="w-4 h-4 mr-2" />
              Refactor
            </TabsTrigger>
            <TabsTrigger 
              value="testing" 
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Testing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <CodeGenerationPanel />
          </TabsContent>

          <TabsContent value="debug">
            <DebuggingAssistant />
          </TabsContent>

          <TabsContent value="refactor">
            <RefactoringTool />
          </TabsContent>

          <TabsContent value="testing">
            <TestingAssistant />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}