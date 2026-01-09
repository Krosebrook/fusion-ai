import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui-library';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, TestTube, AlertTriangle, CheckCircle, Copy, Sparkles } from 'lucide-react';

const TESTING_FRAMEWORKS = [
  { value: 'jest', label: 'Jest' },
  { value: 'vitest', label: 'Vitest' },
  { value: 'mocha', label: 'Mocha + Chai' },
  { value: 'pytest', label: 'Pytest (Python)' },
  { value: 'junit', label: 'JUnit (Java)' }
];

export function TestingAssistant() {
  const [code, setCode] = useState('');
  const [framework, setFramework] = useState('jest');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generateTests = async () => {
    if (!code.trim()) {
      toast.error('Please provide code to test');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert software testing engineer. Generate comprehensive unit tests for the following code using ${framework}.

CODE TO TEST:
${code}

Requirements:
1. Generate complete, runnable unit tests with proper imports and setup
2. Cover happy path, edge cases, and error scenarios
3. Use descriptive test names that explain what's being tested
4. Include comments explaining complex test scenarios
5. Follow ${framework} best practices and conventions
6. Include mock data where needed

Return ONLY valid JSON with this structure:
{
  "tests": "complete test code",
  "edge_cases": [
    {"case": "description", "severity": "high|medium|low", "test_name": "test function name"}
  ],
  "coverage_areas": ["area1", "area2"],
  "setup_notes": "any setup instructions"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            tests: { type: "string" },
            edge_cases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  case: { type: "string" },
                  severity: { type: "string" },
                  test_name: { type: "string" }
                }
              }
            },
            coverage_areas: {
              type: "array",
              items: { type: "string" }
            },
            setup_notes: { type: "string" }
          }
        }
      });

      setResult(response);
      toast.success('Tests generated successfully!');
    } catch (error) {
      toast.error('Failed to generate tests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <GlassmorphicCard className="p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
            <TestTube className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Testing Assistant</h2>
            <p className="text-sm text-gray-400">Generate comprehensive tests automatically</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-white mb-2 block">Testing Framework</Label>
            <Select value={framework} onValueChange={setFramework}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                {TESTING_FRAMEWORKS.map(fw => (
                  <SelectItem key={fw.value} value={fw.value} className="text-white">
                    {fw.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white mb-2 block">Code to Test</Label>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="min-h-[400px] font-mono text-sm bg-slate-900/50 border-white/10 text-white"
            />
          </div>

          <Button
            onClick={generateTests}
            disabled={loading || !code.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Tests...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Tests
              </>
            )}
          </Button>
        </div>

        {/* Quick Tips */}
        <div className="mt-6 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
          <h4 className="text-sm font-semibold text-green-400 mb-2">💡 Pro Tips</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Include function names and types for better context</li>
            <li>• Provide complete functions rather than snippets</li>
            <li>• Specify any external dependencies in comments</li>
          </ul>
        </div>
      </GlassmorphicCard>

      {/* Results Panel */}
      <div className="space-y-6">
        {result ? (
          <Tabs defaultValue="tests" className="w-full">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="tests" className="data-[state=active]:bg-green-500/20">
                <TestTube className="w-4 h-4 mr-2" />
                Generated Tests
              </TabsTrigger>
              <TabsTrigger value="edge-cases" className="data-[state=active]:bg-orange-500/20">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Edge Cases
              </TabsTrigger>
              <TabsTrigger value="coverage" className="data-[state=active]:bg-blue-500/20">
                <CheckCircle className="w-4 h-4 mr-2" />
                Coverage
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tests" className="mt-4">
              <GlassmorphicCard className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">Generated Test Code</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.tests)}
                    className="border-white/10"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>

                <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto border border-white/10">
                  <code className="text-sm text-gray-300 font-mono">{result.tests}</code>
                </pre>

                {result.setup_notes && (
                  <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-400 mb-2">Setup Notes</h4>
                    <p className="text-sm text-gray-400">{result.setup_notes}</p>
                  </div>
                )}
              </GlassmorphicCard>
            </TabsContent>

            <TabsContent value="edge-cases" className="mt-4">
              <GlassmorphicCard className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">Identified Edge Cases</h3>
                
                {result.edge_cases?.map((edge, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={`${getSeverityColor(edge.severity)} border`}>
                        {edge.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs font-mono text-gray-500">{edge.test_name}</span>
                    </div>
                    <p className="text-sm text-gray-300">{edge.case}</p>
                  </motion.div>
                ))}
              </GlassmorphicCard>
            </TabsContent>

            <TabsContent value="coverage" className="mt-4">
              <GlassmorphicCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Test Coverage Areas</h3>
                
                <div className="space-y-3">
                  {result.coverage_areas?.map((area, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{area}</span>
                    </motion.div>
                  ))}
                </div>
              </GlassmorphicCard>
            </TabsContent>
          </Tabs>
        ) : (
          <GlassmorphicCard className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
              <TestTube className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Ready to Generate Tests</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Paste your code and select a testing framework to generate comprehensive unit tests with edge case detection
            </p>
          </GlassmorphicCard>
        )}
      </div>
    </div>
  );
}