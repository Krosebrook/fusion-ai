/**
 * CI/CD Tool Integration Hub
 * Unified interface for Jira, GitHub, GitLab integrations
 */
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Github, GitBranch, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ToolIntegrationHub() {
  const { data: integrations = [] } = useQuery({
    queryKey: ['cicd-integrations'],
    queryFn: async () => {
      const result = await base44.functions.invoke('getIntegrationStatus', {});
      return result?.integrations || [];
    },
  });

  const toolIcons = { github: Github, gitlab: GitBranch, jira: CheckCircle2 };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">CI/CD Tool Integrations</h2>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-800/50 border border-white/10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="github">GitHub</TabsTrigger>
          <TabsTrigger value="gitlab">GitLab</TabsTrigger>
          <TabsTrigger value="jira">Jira</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {integrations.map((tool, idx) => {
              const Icon = toolIcons[tool.name.toLowerCase()] || CheckCircle2;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <CinematicCard className={`p-6 ${tool.connected ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <Icon className={`w-6 h-6 ${tool.connected ? 'text-green-400' : 'text-white/60'}`} />
                      <h3 className="font-semibold text-white">{tool.name}</h3>
                    </div>
                    <p className="text-sm text-white/70 mb-3">{tool.description}</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${tool.connected ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className="text-xs font-bold">{tool.connected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                  </CinematicCard>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="github" className="mt-6">
          <CinematicCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">GitHub Actions Integration</h3>
            <p className="text-white/70 mb-4">Auto-trigger tests and deployments on push/PR</p>
            <div className="space-y-2 text-sm text-white/60">
              <p>✓ Workflow automation</p>
              <p>✓ PR status checks</p>
              <p>✓ Release automation</p>
            </div>
          </CinematicCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}