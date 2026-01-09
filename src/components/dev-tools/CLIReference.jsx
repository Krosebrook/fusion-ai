import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Terminal, Copy, CheckCircle2, ChevronRight, GitBranch, Play, 
  Eye, Lock, Settings, Download, Key, FileCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PipelineTemplateGenerator from "./PipelineTemplateGenerator";

export default function CLIReference() {
  const [copiedCommand, setCopiedCommand] = useState(null);
  const [expandedSection, setExpandedSection] = useState('pipelines');

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const commandSections = [
    {
      id: 'auth',
      title: 'Authentication',
      icon: Key,
      commands: [
        { name: 'login', description: 'Authenticate with FlashFusion', usage: 'flashfusion auth login', options: ['--token <api_key>', '--browser'] },
        { name: 'logout', description: 'Log out from current session', usage: 'flashfusion auth logout' },
        { name: 'whoami', description: 'Display current user info', usage: 'flashfusion auth whoami' },
        { name: 'token', description: 'Generate new API token', usage: 'flashfusion auth token --name "CLI Token"' }
      ]
    },
    {
      id: 'pipelines',
      title: 'Pipelines',
      icon: GitBranch,
      commands: [
        { name: 'list', description: 'List all pipelines', usage: 'flashfusion pipelines list', options: ['--format json', '--limit 10'] },
        { name: 'get', description: 'Get pipeline details', usage: 'flashfusion pipelines get <pipeline_id>' },
        { name: 'create', description: 'Create new pipeline', usage: 'flashfusion pipelines create --config pipeline.yml' },
        { name: 'update', description: 'Update pipeline config', usage: 'flashfusion pipelines update <id> --file config.yml' },
        { name: 'delete', description: 'Delete a pipeline', usage: 'flashfusion pipelines delete <pipeline_id> --confirm' }
      ]
    },
    {
      id: 'runs',
      title: 'Pipeline Runs',
      icon: Play,
      commands: [
        { name: 'trigger', description: 'Trigger a pipeline run', usage: 'flashfusion run trigger --pipeline <id>', options: ['--branch main', '--wait', '--env KEY=value'] },
        { name: 'status', description: 'Check run status', usage: 'flashfusion run status <run_id>' },
        { name: 'list', description: 'List recent runs', usage: 'flashfusion run list --pipeline <id>', options: ['--status failed', '--limit 20'] },
        { name: 'cancel', description: 'Cancel running pipeline', usage: 'flashfusion run cancel <run_id>' },
        { name: 'retry', description: 'Retry failed run', usage: 'flashfusion run retry <run_id>' }
      ]
    },
    {
      id: 'logs',
      title: 'Logs',
      icon: Eye,
      commands: [
        { name: 'view', description: 'View run logs', usage: 'flashfusion logs <run_id>', options: ['--follow', '--step build', '--timestamps'] },
        { name: 'download', description: 'Download logs to file', usage: 'flashfusion logs download <run_id> -o logs.txt' },
        { name: 'search', description: 'Search through logs', usage: 'flashfusion logs search <run_id> --query "error"' }
      ]
    },
    {
      id: 'secrets',
      title: 'Secrets',
      icon: Lock,
      commands: [
        { name: 'list', description: 'List all secrets', usage: 'flashfusion secrets list', options: ['--env production'] },
        { name: 'set', description: 'Set a secret', usage: 'flashfusion secrets set <name> <value>', options: ['--env staging', '--pipeline <id>'] },
        { name: 'get', description: 'Get secret metadata', usage: 'flashfusion secrets get <name>' },
        { name: 'delete', description: 'Delete a secret', usage: 'flashfusion secrets delete <name> --confirm' },
        { name: 'rotate', description: 'Rotate a secret', usage: 'flashfusion secrets rotate <name>' }
      ]
    },
    {
      id: 'config',
      title: 'Configuration',
      icon: Settings,
      commands: [
        { name: 'init', description: 'Initialize project config', usage: 'flashfusion config init', options: ['--template react', '--ci github'] },
        { name: 'validate', description: 'Validate config file', usage: 'flashfusion config validate pipeline.yml' },
        { name: 'set', description: 'Set config value', usage: 'flashfusion config set <key> <value>' },
        { name: 'get', description: 'Get config value', usage: 'flashfusion config get <key>' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="commands" className="w-full">
        <TabsList className="bg-white/5 mb-6">
          <TabsTrigger value="commands" className="data-[state=active]:bg-green-500/20">
            <Terminal className="w-4 h-4 mr-2" />
            CLI Commands
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-purple-500/20">
            <FileCode className="w-4 h-4 mr-2" />
            Pipeline Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <PipelineTemplateGenerator />
        </TabsContent>

        <TabsContent value="commands">
      {/* Installation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-green-500/30 p-6"
        style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-green-400" />
          Installation
        </h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Using npm:</p>
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/10">
              <code className="text-green-400 font-mono">npm install -g @flashfusion/cli</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard('npm install -g @flashfusion/cli', 'npm-install')}
                className="text-gray-400"
              >
                {copiedCommand === 'npm-install' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Using Homebrew (macOS):</p>
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/10">
              <code className="text-green-400 font-mono">brew install flashfusion/tap/cli</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard('brew install flashfusion/tap/cli', 'brew-install')}
                className="text-gray-400"
              >
                {copiedCommand === 'brew-install' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Verify installation:</p>
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/10">
              <code className="text-green-400 font-mono">flashfusion --version</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard('flashfusion --version', 'version')}
                className="text-gray-400"
              >
                {copiedCommand === 'version' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Command Reference */}
      <div className="space-y-4">
        {commandSections.map((section, idx) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl border border-white/10 overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
          >
            <button
              onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <section.icon className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-bold text-white">{section.title}</h3>
                <span className="text-xs text-gray-500">{section.commands.length} commands</span>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === section.id ? 'rotate-90' : ''}`} />
            </button>

            {expandedSection === section.id && (
              <div className="p-4 pt-0 space-y-3">
                {section.commands.map((cmd, i) => (
                  <div key={cmd.name} className="p-4 rounded-lg bg-black/40 border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <code className="text-green-400 font-mono text-sm">{cmd.usage}</code>
                        <p className="text-xs text-gray-400 mt-1">{cmd.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(cmd.usage, `${section.id}-${cmd.name}`)}
                        className="text-gray-400"
                      >
                        {copiedCommand === `${section.id}-${cmd.name}` ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {cmd.options && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <p className="text-xs text-gray-500 mb-1">Options:</p>
                        <div className="flex flex-wrap gap-2">
                          {cmd.options.map(opt => (
                            <code key={opt} className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400">
                              {opt}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}