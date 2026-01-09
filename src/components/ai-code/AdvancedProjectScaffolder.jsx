import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui-library';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, Rocket, Code2, TestTube2, GitBranch } from 'lucide-react';

const CI_CD_PROVIDERS = [
  { id: 'github-actions', name: 'GitHub Actions', icon: '🐙', config: '.github/workflows' },
  { id: 'gitlab-ci', name: 'GitLab CI/CD', icon: '🦊', config: '.gitlab-ci.yml' },
  { id: 'circleci', name: 'CircleCI', icon: '⭕', config: '.circleci/config.yml' },
  { id: 'jenkins', name: 'Jenkins', icon: '👷', config: 'Jenkinsfile' }
];

const TESTING_FRAMEWORKS = [
  { id: 'jest-rtl', name: 'Jest + React Testing Library', type: 'unit', lang: 'javascript' },
  { id: 'vitest', name: 'Vitest', type: 'unit', lang: 'javascript' },
  { id: 'pytest', name: 'pytest', type: 'unit', lang: 'python' },
  { id: 'playwright', name: 'Playwright', type: 'e2e', lang: 'javascript' },
  { id: 'cypress', name: 'Cypress', type: 'e2e', lang: 'javascript' }
];

export function AdvancedProjectScaffolder() {
  const [config, setConfig] = useState({
    projectName: '',
    projectType: 'react-spa',
    description: '',
    cicdProvider: 'github-actions',
    testingFramework: 'jest-rtl',
    includeMocking: true,
    includeFixtures: true,
    includeDocker: false,
    includeK8s: false
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generateProject = async () => {
    if (!config.projectName.trim()) {
      toast.error('Project name required');
      return;
    }

    setLoading(true);
    try {
      const prompt = `Generate a PRODUCTION-READY ${config.projectType} project: "${config.projectName}"

DESCRIPTION: ${config.description}

CI/CD CONFIGURATION:
- Provider: ${config.cicdProvider}
- Stages: build → test → deploy
- Environment: staging + production
- Auto-deploy on main branch merge
- Rollback strategies included

TESTING STRATEGY:
- Framework: ${config.testingFramework}
${config.includeMocking ? '- Mocking: Jest mocks + MSW for API mocking' : ''}
${config.includeFixtures ? '- Fixtures: Test data factories + seeders' : ''}
- Coverage threshold: 80%
- Integration tests with mocked dependencies

INFRASTRUCTURE:
${config.includeDocker ? '- Docker: Multi-stage Dockerfile optimized for production' : ''}
${config.includeK8s ? '- Kubernetes: Deployment manifests with health checks' : ''}

Return comprehensive JSON:
{
  "structure": { "folders": [...], "files": [...] },
  "sourceFiles": [{ "path": "string", "content": "complete code", "purpose": "string" }],
  "cicd": {
    "provider": "${config.cicdProvider}",
    "configFiles": [{ "path": "string", "content": "complete pipeline yaml" }],
    "stages": ["build", "test", "deploy"],
    "environments": { "staging": {...}, "production": {...} }
  },
  "testing": {
    "framework": "${config.testingFramework}",
    "testFiles": [{ "path": "string", "content": "complete test code" }],
    "mocks": [{ "path": "string", "content": "mock implementation" }],
    "fixtures": [{ "path": "string", "content": "test data" }],
    "commands": { "unit": "string", "integration": "string", "e2e": "string" }
  },
  "docker": {
    "dockerfile": "multi-stage production dockerfile",
    "dockerCompose": "docker-compose.yml with services",
    "dockerignore": ".dockerignore content"
  },
  "documentation": {
    "readme": "comprehensive README.md",
    "apiDocs": "API documentation markdown",
    "architecture": "system architecture explanation",
    "deployment": "deployment guide"
  },
  "dependencies": { "production": {...}, "development": {...} }
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            structure: { type: "object" },
            sourceFiles: { type: "array", items: { type: "object" } },
            cicd: { type: "object" },
            testing: { type: "object" },
            docker: { type: "object" },
            documentation: { type: "object" },
            dependencies: { type: "object" }
          }
        }
      });

      setResult(response);
      toast.success('Production-ready project generated!');
    } catch (error) {
      toast.error('Generation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <GlassmorphicCard className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Rocket className="w-6 h-6 text-purple-400" />
          Advanced Project Generator
        </h2>

        <div className="space-y-6">
          <div>
            <Label className="text-white mb-2 block">Project Name</Label>
            <input
              value={config.projectName}
              onChange={(e) => setConfig({ ...config, projectName: e.target.value })}
              placeholder="my-production-app"
              className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white"
            />
          </div>

          <div>
            <Label className="text-white mb-2 block">Description</Label>
            <Textarea
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              placeholder="E-commerce platform with real-time inventory..."
              className="bg-slate-900/50 border-white/10 text-white"
            />
          </div>

          <div>
            <Label className="text-white mb-3 block flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              CI/CD Provider
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {CI_CD_PROVIDERS.map(provider => (
                <motion.button
                  key={provider.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setConfig({ ...config, cicdProvider: provider.id })}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    config.cicdProvider === provider.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{provider.icon}</span>
                  <div className="text-sm font-semibold text-white">{provider.name}</div>
                  <div className="text-xs text-gray-500">{provider.config}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-white mb-3 block flex items-center gap-2">
              <TestTube2 className="w-4 h-4" />
              Testing Framework
            </Label>
            <select
              value={config.testingFramework}
              onChange={(e) => setConfig({ ...config, testingFramework: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white"
            >
              {TESTING_FRAMEWORKS.map(fw => (
                <option key={fw.id} value={fw.id}>
                  {fw.name} ({fw.type})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-lg">
            {[
              { key: 'includeMocking', label: 'Include Mocking Setup', desc: 'Jest mocks + MSW for API' },
              { key: 'includeFixtures', label: 'Include Test Fixtures', desc: 'Factories + seed data' },
              { key: 'includeDocker', label: 'Docker Configuration', desc: 'Multi-stage Dockerfile' },
              { key: 'includeK8s', label: 'Kubernetes Manifests', desc: 'K8s deployment configs' }
            ].map(opt => (
              <div
                key={opt.key}
                className="flex items-start gap-3 p-3 bg-white/5 rounded cursor-pointer"
                onClick={() => setConfig({ ...config, [opt.key]: !config[opt.key] })}
              >
                <Checkbox checked={config[opt.key]} />
                <div>
                  <div className="text-sm font-medium text-white">{opt.label}</div>
                  <div className="text-xs text-gray-400">{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={generateProject}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 h-12"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5 mr-2" />}
            {loading ? 'Generating...' : 'Generate Production Project'}
          </Button>
        </div>
      </GlassmorphicCard>

      <GlassmorphicCard className="p-6">
        {result ? (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">{config.projectName}</h3>
            
            <div>
              <h4 className="text-sm font-semibold text-purple-400 mb-2">Generated Files</h4>
              <div className="text-sm text-gray-400">{result.sourceFiles?.length || 0} source files</div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-cyan-400 mb-2">CI/CD Pipeline</h4>
              <div className="text-sm text-gray-400">
                {result.cicd?.provider} • {result.cicd?.stages?.join(' → ')}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-green-400 mb-2">Testing</h4>
              <div className="text-sm text-gray-400">
                {result.testing?.testFiles?.length || 0} test files
                {result.testing?.mocks && ` • ${result.testing.mocks.length} mocks`}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <Code2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">Configure and generate your project</p>
            </div>
          </div>
        )}
      </GlassmorphicCard>
    </div>
  );
}