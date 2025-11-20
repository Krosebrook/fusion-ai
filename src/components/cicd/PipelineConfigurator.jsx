import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitBranch, Play, Settings, Zap, Clock, GitCommit, Server, Github, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import GitRepositoryManager from "./GitRepositoryManager";

export default function PipelineConfigurator({ onSave }) {
  const { data: environments = [] } = useQuery({
    queryKey: ['environments'],
    queryFn: () => base44.entities.Environment.list('-created_date'),
    initialData: []
  });

  const [config, setConfig] = useState({
    provider: "github",
    projectType: "react",
    repository_name: "",
    repository_id: "",
    repository_url: "",
    available_branches: [],
    branch: "main",
    triggers: {
      push: true,
      pullRequest: true,
      schedule: false,
      manual: true
    },
    buildCommand: "npm run build",
    testCommand: "npm test",
    deployCommand: "npm run deploy",
    environment_id: null,
    autoScale: true,
    notifications: true
  });

  const [showRepoSelector, setShowRepoSelector] = useState(false);

  const projectTypes = [
    { value: "react", label: "React App", buildCmd: "npm run build" },
    { value: "nextjs", label: "Next.js", buildCmd: "npm run build" },
    { value: "vue", label: "Vue.js", buildCmd: "npm run build" },
    { value: "node", label: "Node.js API", buildCmd: "npm start" },
    { value: "python", label: "Python", buildCmd: "python app.py" },
    { value: "docker", label: "Docker", buildCmd: "docker build ." }
  ];

  const selectedEnvironment = environments.find(e => e.id === config.environment_id);

  const handleProjectTypeChange = (type) => {
    const selected = projectTypes.find(p => p.value === type);
    setConfig({
      ...config,
      projectType: type,
      buildCommand: selected?.buildCmd || config.buildCommand
    });
  };

  const handleSelectRepository = (repoData) => {
    setConfig({
      ...config,
      repository_id: repoData.repository_id,
      repository_name: repoData.repository_name,
      repository_url: repoData.repository_url,
      available_branches: repoData.available_branches,
      branch: repoData.default_branch
    });
    setShowRepoSelector(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
      }}
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Pipeline Configuration
          </h3>
        </div>
        <p className="text-sm text-gray-400">Configure your CI/CD pipeline settings</p>
      </div>

      <Tabs defaultValue="github" className="w-full" onValueChange={(v) => setConfig({ ...config, provider: v })}>
        <div className="px-6 pt-4">
          <TabsList className="grid w-full grid-cols-2 bg-white/5">
            <TabsTrigger value="github" className="data-[state=active]:bg-orange-500/20">
              GitHub Actions
            </TabsTrigger>
            <TabsTrigger value="gitlab" className="data-[state=active]:bg-orange-500/20">
              GitLab CI
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="github" className="p-6 space-y-6">
          <div className="grid gap-4">
            <div>
              <Label className="text-white mb-2 block">Project Type</Label>
              <Select value={config.projectType} onValueChange={handleProjectTypeChange}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {projectTypes.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-white">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Repository Selector */}
            <div>
              <Label className="text-white mb-2 block flex items-center gap-2">
                <Github className="w-4 h-4 text-orange-400" />
                Git Repository
              </Label>
              {config.repository_name ? (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{config.repository_name}</p>
                    <p className="text-xs text-gray-400">{config.available_branches?.length || 0} branches available</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowRepoSelector(true)}
                    className="text-blue-400"
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowRepoSelector(true)}
                  className="w-full bg-blue-500/20 text-blue-400 border border-blue-500/30"
                >
                  <Github className="w-4 h-4 mr-2" />
                  Connect Repository
                </Button>
              )}
            </div>

            {showRepoSelector && (
              <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                <GitRepositoryManager onSelectRepository={handleSelectRepository} />
              </div>
            )}

            {config.available_branches?.length > 0 && (
              <div>
                <Label className="text-white mb-2 block">Branch</Label>
                <Select value={config.branch} onValueChange={(v) => setConfig({ ...config, branch: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    {config.available_branches.map(branch => (
                      <SelectItem key={branch} value={branch} className="text-white">
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-3 h-3 text-purple-400" />
                          {branch}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-white mb-2 block flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                Deployment Environment
              </Label>
              {environments.length > 0 ? (
                <Select value={config.environment_id} onValueChange={(v) => setConfig({ ...config, environment_id: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    {environments.map(env => (
                      <SelectItem key={env.id} value={env.id} className="text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: env.color }} />
                          {env.name}
                          {env.deployment_url && (
                            <span className="text-xs text-gray-400">• {env.deployment_url}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-xs text-yellow-400">No environments configured. Create one first.</p>
                </div>
              )}
              {selectedEnvironment && (
                <div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <span>Deploy to:</span>
                    <span className="text-white font-mono">{selectedEnvironment.deployment_url || 'No URL'}</span>
                  </div>
                  {selectedEnvironment.protection_enabled && (
                    <p className="text-xs text-orange-400">⚠️ Protected environment - requires approval</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              Triggers
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <GitCommit className="w-4 h-4 text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Push to Branch</p>
                    <p className="text-xs text-gray-400">Trigger on git push</p>
                  </div>
                </div>
                <Switch
                  checked={config.triggers.push}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    triggers: { ...config.triggers, push: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <GitBranch className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Pull Request</p>
                    <p className="text-xs text-gray-400">Trigger on PR creation/update</p>
                  </div>
                </div>
                <Switch
                  checked={config.triggers.pullRequest}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    triggers: { ...config.triggers, pullRequest: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Scheduled</p>
                    <p className="text-xs text-gray-400">Run on a schedule (cron)</p>
                  </div>
                </div>
                <Switch
                  checked={config.triggers.schedule}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    triggers: { ...config.triggers, schedule: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Play className="w-4 h-4 text-orange-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Manual</p>
                    <p className="text-xs text-gray-400">Allow manual triggers</p>
                  </div>
                </div>
                <Switch
                  checked={config.triggers.manual}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    triggers: { ...config.triggers, manual: checked }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-white">Build Commands</h4>
            
            <div>
              <Label className="text-sm text-gray-400 mb-2 block">Build</Label>
              <Input
                value={config.buildCommand}
                onChange={(e) => setConfig({ ...config, buildCommand: e.target.value })}
                className="bg-white/5 border-white/10 text-white font-mono text-sm"
              />
            </div>

            <div>
              <Label className="text-sm text-gray-400 mb-2 block">Test</Label>
              <Input
                value={config.testCommand}
                onChange={(e) => setConfig({ ...config, testCommand: e.target.value })}
                className="bg-white/5 border-white/10 text-white font-mono text-sm"
              />
            </div>

            <div>
              <Label className="text-sm text-gray-400 mb-2 block">Deploy</Label>
              <Input
                value={config.deployCommand}
                onChange={(e) => setConfig({ ...config, deployCommand: e.target.value })}
                className="bg-white/5 border-white/10 text-white font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Auto-scaling</p>
                <p className="text-xs text-gray-400">Automatically scale based on traffic</p>
              </div>
              <Switch
                checked={config.autoScale}
                onCheckedChange={(checked) => setConfig({ ...config, autoScale: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Notifications</p>
                <p className="text-xs text-gray-400">Email on build success/failure</p>
              </div>
              <Switch
                checked={config.notifications}
                onCheckedChange={(checked) => setConfig({ ...config, notifications: checked })}
              />
            </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              Quality Gates
            </h4>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div>
                <p className="text-sm font-medium text-white">Enable Quality Checks</p>
                <p className="text-xs text-gray-400">Run automated code quality and security scans</p>
              </div>
              <Switch
                checked={config.quality_gates?.enabled || false}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  quality_gates: { ...config.quality_gates, enabled: checked, tools: checked ? ['eslint', 'snyk'] : [] }
                })}
              />
            </div>

            {config.quality_gates?.enabled && (
              <div className="space-y-3 ml-4">
                <div className="grid grid-cols-2 gap-3">
                  {['eslint', 'snyk', 'sonarqube', 'prettier'].map(tool => (
                    <label key={tool} className="flex items-center gap-2 p-2 rounded bg-white/5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.quality_gates?.tools?.includes(tool) || false}
                        onChange={(e) => {
                          const tools = config.quality_gates?.tools || [];
                          const updated = e.target.checked
                            ? [...tools, tool]
                            : tools.filter(t => t !== tool);
                          setConfig({ ...config, quality_gates: { ...config.quality_gates, tools: updated } });
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-gray-300 capitalize">{tool}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            </div>
        </TabsContent>

        <TabsContent value="gitlab" className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-400">GitLab CI configuration coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="p-6 border-t border-white/10 flex justify-end gap-3">
        <Button variant="outline" className="border-white/10 text-gray-300">
          Cancel
        </Button>
        <Button
          onClick={() => onSave(config)}
          className="bg-gradient-to-r from-orange-500 to-pink-500"
        >
          Save Configuration
        </Button>
      </div>
    </motion.div>
  );
}