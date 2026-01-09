import { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Terminal, Code2, Download, Copy, CheckCircle2, Zap, Box
} from "lucide-react";
import CLIReference from "../components/dev-tools/CLIReference";
import VSCodeExtension from "../components/dev-tools/VSCodeExtension";
import APIPlayground from "../components/dev-tools/APIPlayground";

export default function DeveloperToolsPage() {
  const [copiedCommand, setCopiedCommand] = useState(null);

  const { data: apiKeys = [] } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: () => base44.entities.APIKey.list('-created_date')
  });

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const quickCommands = [
    { id: 'install', label: 'Install CLI', command: 'npm install -g @flashfusion/cli' },
    { id: 'login', label: 'Authenticate', command: 'flashfusion auth login' },
    { id: 'list', label: 'List Pipelines', command: 'flashfusion pipelines list' },
    { id: 'trigger', label: 'Trigger Build', command: 'flashfusion run trigger --pipeline <id>' },
    { id: 'status', label: 'Check Status', command: 'flashfusion run status <run_id>' },
    { id: 'logs', label: 'View Logs', command: 'flashfusion logs <run_id> --follow' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Developer Tools
            </h1>
            <p className="text-gray-400">CLI, VS Code Extension, and API integrations for your workflow</p>
          </div>

          <div className="flex gap-3">
            <Button className="bg-gradient-to-r from-green-500 to-cyan-500">
              <Download className="w-4 h-4 mr-2" />
              Download CLI
            </Button>
            <Button variant="outline" className="border-purple-500/30 text-purple-400">
              <Box className="w-4 h-4 mr-2" />
              VS Code Extension
            </Button>
          </div>
        </motion.div>

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 p-6"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-green-400" />
            Quick Start
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickCommands.map((cmd) => (
              <div 
                key={cmd.id}
                className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/10 hover:border-green-500/30 transition-colors"
              >
                <div>
                  <p className="text-xs text-gray-400 mb-1">{cmd.label}</p>
                  <code className="text-sm text-green-400 font-mono">{cmd.command}</code>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(cmd.command, cmd.id)}
                  className="text-gray-400 hover:text-white"
                >
                  {copiedCommand === cmd.id ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main Tabs */}
        <Tabs defaultValue="cli" className="w-full">
          <TabsList className="bg-white/5 mb-4">
            <TabsTrigger value="cli" className="data-[state=active]:bg-green-500/20">
              <Terminal className="w-4 h-4 mr-2" />
              CLI Reference
            </TabsTrigger>
            <TabsTrigger value="vscode" className="data-[state=active]:bg-purple-500/20">
              <Code2 className="w-4 h-4 mr-2" />
              VS Code Extension
            </TabsTrigger>
            <TabsTrigger value="playground" className="data-[state=active]:bg-blue-500/20">
              <Zap className="w-4 h-4 mr-2" />
              API Playground
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cli">
            <CLIReference />
          </TabsContent>

          <TabsContent value="vscode">
            <VSCodeExtension />
          </TabsContent>

          <TabsContent value="playground">
            <APIPlayground apiKeys={apiKeys} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}