import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Box, Download, CheckCircle2, Settings, GitBranch, Eye, 
  Play, Lock, Zap, Terminal, Bell, Palette, FileCode, Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PipelineTemplateGenerator from "./PipelineTemplateGenerator";

export default function VSCodeExtension() {
  const [activeTab, setActiveTab] = useState("overview");

  const features = [
    {
      icon: GitBranch,
      title: 'Pipeline Management',
      description: 'View, trigger, and monitor pipelines directly from VS Code sidebar',
      color: '#10B981'
    },
    {
      icon: Eye,
      title: 'Live Logs Streaming',
      description: 'Stream build logs in real-time within the integrated terminal',
      color: '#00B4D8'
    },
    {
      icon: Lock,
      title: 'Secrets Management',
      description: 'Securely manage environment secrets without leaving your editor',
      color: '#8B5CF6'
    },
    {
      icon: Bell,
      title: 'Build Notifications',
      description: 'Get instant notifications for build successes and failures',
      color: '#F59E0B'
    },
    {
      icon: Zap,
      title: 'Quick Actions',
      description: 'Trigger common actions via command palette (Cmd/Ctrl+Shift+P)',
      color: '#FF7B00'
    },
    {
      icon: Palette,
      title: 'Status Bar Integration',
      description: 'See pipeline status at a glance in your status bar',
      color: '#E91E63'
    }
  ];

  const commands = [
    { command: 'FlashFusion: Trigger Pipeline', shortcut: 'Cmd+Shift+T' },
    { command: 'FlashFusion: View Pipeline Status', shortcut: 'Cmd+Shift+S' },
    { command: 'FlashFusion: Open Logs', shortcut: 'Cmd+Shift+L' },
    { command: 'FlashFusion: Manage Secrets', shortcut: 'Cmd+Shift+K' },
    { command: 'FlashFusion: Cancel Run', shortcut: 'Cmd+Shift+C' },
    { command: 'FlashFusion: Retry Failed Run', shortcut: 'Cmd+Shift+R' }
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/5 mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/20">
            <Box className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-orange-500/20">
            <FileCode className="w-4 h-4 mr-2" />
            Pipeline Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <PipelineTemplateGenerator />
        </TabsContent>

        <TabsContent value="overview">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-purple-500/30 p-8"
        style={{ background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Box className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-white mb-2">FlashFusion for VS Code</h2>
            <p className="text-gray-400 mb-4">
              Seamlessly integrate CI/CD workflows into your development environment. 
              Trigger pipelines, view logs, and manage secrets without switching contexts.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                <Download className="w-4 h-4 mr-2" />
                Install Extension
              </Button>
              <Button variant="outline" className="border-white/20">
                View on Marketplace
              </Button>
            </div>
          </div>

          <div className="flex-shrink-0 text-center">
            <p className="text-3xl font-bold text-white">50K+</p>
            <p className="text-sm text-gray-400">Downloads</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
              <span className="text-sm text-gray-400 ml-1">4.9</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl border border-white/10 p-6"
            style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                 style={{ background: `${feature.color}20` }}>
              <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
            </div>
            <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-400">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Commands */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-green-400" />
          Command Palette Commands
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {commands.map((cmd) => (
            <div key={cmd.command} className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/10">
              <span className="text-sm text-white">{cmd.command}</span>
              <kbd className="px-2 py-1 rounded bg-white/10 text-xs text-gray-400 font-mono">
                {cmd.shortcut}
              </kbd>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Setup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          Quick Setup
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">1</div>
            <div>
              <h4 className="font-medium text-white">Install the extension</h4>
              <p className="text-sm text-gray-400">Search "FlashFusion" in VS Code extensions or click Install above</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">2</div>
            <div>
              <h4 className="font-medium text-white">Authenticate</h4>
              <p className="text-sm text-gray-400">Run "FlashFusion: Login" from command palette and enter your API key</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">3</div>
            <div>
              <h4 className="font-medium text-white">Start using</h4>
              <p className="text-sm text-gray-400">Access FlashFusion panel in the sidebar or use keyboard shortcuts</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Screenshot Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border border-white/10 overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-gray-400 ml-2">VS Code - FlashFusion Extension</span>
        </div>
        
        <div className="p-6 flex gap-4">
          {/* Sidebar Mock */}
          <div className="w-64 border-r border-white/10 pr-4">
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase mb-2">Pipelines</p>
              {['web-app', 'api-server', 'mobile-app'].map(p => (
                <div key={p} className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white">{p}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-2">Recent Runs</p>
              {['#1234 - success', '#1233 - failed', '#1232 - success'].map((r, i) => (
                <div key={r} className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer">
                  {i === 1 ? (
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                  )}
                  <span className="text-xs text-gray-400">{r}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Main Content Mock */}
          <div className="flex-1">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white mb-2">Pipeline: web-app</h4>
              <div className="flex gap-2">
                <Button size="sm" className="bg-green-500/20 text-green-400 text-xs">
                  <Play className="w-3 h-3 mr-1" /> Trigger
                </Button>
                <Button size="sm" variant="outline" className="border-white/20 text-xs">
                  <Eye className="w-3 h-3 mr-1" /> Logs
                </Button>
              </div>
            </div>
            <div className="bg-black/60 rounded-lg p-4 font-mono text-xs">
              <p className="text-green-400">[12:34:56] Build started...</p>
              <p className="text-gray-400">[12:34:58] Installing dependencies...</p>
              <p className="text-gray-400">[12:35:12] Running tests...</p>
              <p className="text-green-400">[12:36:01] ✓ All tests passed</p>
              <p className="text-blue-400">[12:36:05] Deploying to production...</p>
              <p className="text-green-400">[12:36:45] ✓ Deployment successful</p>
            </div>
          </div>
        </div>
      </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}