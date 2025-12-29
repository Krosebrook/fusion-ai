/**
 * Plugin Development Studio
 * Local dev environment for building and testing plugins
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '../components/atoms/CinematicCard';
import { CinematicButton } from '../components/atoms/CinematicButton';
import { PluginBoilerplateGenerator } from '../components/plugins/PluginBoilerplateGenerator';
import { PluginDebugger } from '../components/plugins/PluginDebugger';
import { PluginDevServer } from '../components/plugins/PluginDevServer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Bug, Server, BookOpen } from 'lucide-react';

export default function PluginDevStudioPage() {
  const [activeTab, setActiveTab] = useState('generator');

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Plugin Development Studio</h1>
              <p className="text-white/60">Build, test, and debug FlashFusion plugins</p>
            </div>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
            <TabsTrigger 
              value="generator"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <Code className="w-4 h-4 mr-2" />
              Generator
            </TabsTrigger>
            <TabsTrigger 
              value="server"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <Server className="w-4 h-4 mr-2" />
              Dev Server
            </TabsTrigger>
            <TabsTrigger 
              value="debugger"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <Bug className="w-4 h-4 mr-2" />
              Debugger
            </TabsTrigger>
            <TabsTrigger 
              value="docs"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Docs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator">
            <PluginBoilerplateGenerator />
          </TabsContent>

          <TabsContent value="server">
            <PluginDevServer />
          </TabsContent>

          <TabsContent value="debugger">
            <PluginDebugger />
          </TabsContent>

          <TabsContent value="docs">
            <CinematicCard className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Quick Start Guide</h2>
              <div className="space-y-4 text-white/70">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">1. Generate Boilerplate</h3>
                  <p>Use the Generator tab to create a starter plugin with all necessary files and structure.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">2. Start Dev Server</h3>
                  <p>Launch a local server that simulates the FlashFusion environment for testing your plugin.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">3. Debug & Test</h3>
                  <p>Use the Debugger to inspect API calls, webhook events, and UI component interactions in real-time.</p>
                </div>
              </div>
            </CinematicCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}