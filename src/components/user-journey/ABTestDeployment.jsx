import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { 
  Rocket, Code, Database, Settings, Copy, 
  CheckCircle2, Loader2, Download, BarChart3,
  Play, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export function ABTestDeployment({ scenario, open, onClose }) {
  const [config, setConfig] = useState({
    trafficAllocation: 50,
    duration: 14,
    analyticsProvider: 'google-analytics',
    trackingEvents: ['click', 'view', 'conversion'],
    environment: 'staging'
  });
  const [deployment, setDeployment] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const [activeTab, setActiveTab] = useState('config');

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const { deployABTest } = await import('@/functions/deployABTest');
      const result = await deployABTest({ scenario, config });
      
      if (result.success) {
        setDeployment(result);
        setActiveTab('code');
        toast.success('Deployment code generated', {
          description: `Test ID: ${result.testId}`
        });
      }
    } catch (error) {
      console.error('Deployment error:', error);
      toast.error('Failed to generate deployment');
    } finally {
      setDeploying(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const downloadCode = (code, filename) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File downloaded');
  };

  const CodeBlock = ({ code, filename, language = 'javascript' }) => (
    <div className="relative group">
      <div className="flex items-center justify-between mb-2 px-3">
        <span className="text-xs text-white/60 font-mono">{filename}</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyCode(code)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => downloadCode(code, filename)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <pre className="bg-slate-950 p-4 rounded-lg overflow-auto max-h-96 text-sm border border-white/10">
        <code className="text-green-400 font-mono">{code}</code>
      </pre>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            Deploy A/B Test
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Configure and deploy your A/B test with live tracking
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="bg-white/5 w-full grid grid-cols-4">
            <TabsTrigger value="config" disabled={deploying}>
              <Settings className="w-4 h-4 mr-2" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="code" disabled={!deployment}>
              <Code className="w-4 h-4 mr-2" />
              Code
            </TabsTrigger>
            <TabsTrigger value="database" disabled={!deployment}>
              <Database className="w-4 h-4 mr-2" />
              Database
            </TabsTrigger>
            <TabsTrigger value="monitoring" disabled={!deployment}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Monitoring
            </TabsTrigger>
          </TabsList>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-6 mt-6">
            <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/30">
              <h4 className="text-white font-semibold mb-2">Testing Scenario</h4>
              <p className="text-white/70 text-sm">{scenario?.frictionPoint}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Traffic Allocation */}
              <div className="space-y-3">
                <Label className="text-white">Traffic to Variant B</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[config.trafficAllocation]}
                    onValueChange={([value]) => setConfig({ ...config, trafficAllocation: value })}
                    min={10}
                    max={90}
                    step={5}
                    className="flex-1"
                  />
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 min-w-[60px] justify-center">
                    {config.trafficAllocation}%
                  </Badge>
                </div>
                <p className="text-xs text-white/50">
                  Control: {100 - config.trafficAllocation}% | Treatment: {config.trafficAllocation}%
                </p>
              </div>

              {/* Duration */}
              <div className="space-y-3">
                <Label className="text-white">Test Duration (days)</Label>
                <Input
                  type="number"
                  value={config.duration}
                  onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                  min={1}
                  max={90}
                  className="bg-slate-800/50 border-white/10 text-white"
                />
                <p className="text-xs text-white/50">
                  Recommended: 14-30 days for statistical significance
                </p>
              </div>

              {/* Analytics Provider */}
              <div className="space-y-3">
                <Label className="text-white">Analytics Platform</Label>
                <Select 
                  value={config.analyticsProvider} 
                  onValueChange={(value) => setConfig({ ...config, analyticsProvider: value })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    <SelectItem value="google-analytics">Google Analytics 4</SelectItem>
                    <SelectItem value="mixpanel">Mixpanel</SelectItem>
                    <SelectItem value="amplitude">Amplitude</SelectItem>
                    <SelectItem value="segment">Segment</SelectItem>
                    <SelectItem value="custom">Custom Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Environment */}
              <div className="space-y-3">
                <Label className="text-white">Deployment Environment</Label>
                <Select 
                  value={config.environment} 
                  onValueChange={(value) => setConfig({ ...config, environment: value })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleDeploy}
              disabled={deploying}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              size="lg"
            >
              {deploying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Deployment...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Generate Deployment Code
                </>
              )}
            </Button>
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code" className="space-y-6 mt-6">
            {deployment && (
              <>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-semibold text-sm">Deployment Ready</p>
                    <p className="text-white/60 text-xs">Test ID: {deployment.testId}</p>
                  </div>
                </div>

                <CodeBlock
                  code={deployment.deployment.reactComponent}
                  filename="ABTestVariant.tsx"
                  language="typescript"
                />

                <CodeBlock
                  code={deployment.deployment.featureFlagLogic}
                  filename="abTestUtils.ts"
                  language="typescript"
                />

                <CodeBlock
                  code={deployment.deployment.analyticsCode}
                  filename="analytics.ts"
                  language="typescript"
                />

                <CodeBlock
                  code={deployment.deployment.backendAPI}
                  filename="functions/abTestAPI.js"
                  language="javascript"
                />
              </>
            )}
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6 mt-6">
            {deployment && (
              <>
                <CodeBlock
                  code={deployment.deployment.databaseSchema}
                  filename="schema.sql"
                  language="sql"
                />

                <CodeBlock
                  code={deployment.deployment.configFile}
                  filename="abTestConfig.json"
                  language="json"
                />
              </>
            )}
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6 mt-6">
            {deployment && (
              <>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/10">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Play className="w-4 h-4 text-green-400" />
                    Deployment Steps
                  </h4>
                  <ol className="space-y-2">
                    {deployment.deployment.deploymentSteps?.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-white/70 text-sm">
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 min-w-[24px] h-6 flex items-center justify-center">
                          {i + 1}
                        </Badge>
                        <span className="flex-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/10">
                  <h4 className="text-white font-semibold mb-3">Testing Instructions</h4>
                  <pre className="text-white/70 text-sm whitespace-pre-wrap">
                    {deployment.deployment.testingInstructions}
                  </pre>
                </div>

                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/10">
                  <h4 className="text-white font-semibold mb-3">Monitoring Guide</h4>
                  <pre className="text-white/70 text-sm whitespace-pre-wrap">
                    {deployment.deployment.monitoringGuide}
                  </pre>
                </div>

                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-orange-400 font-semibold mb-1">Important Notes</p>
                      <ul className="text-white/70 space-y-1 list-disc list-inside">
                        <li>Test runs for {config.duration} days unless manually stopped</li>
                        <li>Users are bucketed consistently using their ID hash</li>
                        <li>Monitor daily for statistical significance</li>
                        <li>Stop test early if variant causes negative impact</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}