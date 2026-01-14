import { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, Code, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function TestGenerator({ onGenerate }) {
  const [generating, setGenerating] = useState(false);
  const [config, setConfig] = useState({
    name: '',
    type: 'unit',
    framework: 'vitest',
    codeInput: '',
    description: ''
  });
  const [generatedTests, setGeneratedTests] = useState(null);

  const handleGenerate = async () => {
    if (!config.codeInput.trim()) {
      toast.error('Please provide code to generate tests for');
      return;
    }

    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate comprehensive ${config.type} tests for the following code using ${config.framework}. 
        
Code:
\`\`\`
${config.codeInput}
\`\`\`

${config.description ? `Context: ${config.description}` : ''}

Generate:
1. Test cases covering happy paths
2. Edge cases and error scenarios
3. Mock data where needed
4. Assertions for expected behavior

Return ONLY valid ${config.framework} test code, no explanations.`,
        response_json_schema: {
          type: 'object',
          properties: {
            test_code: { type: 'string' },
            test_cases: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  confidence: { type: 'number' }
                }
              }
            }
          }
        }
      });

      setGeneratedTests(response);

      // Save to database
      const suite = await base44.entities.TestSuite.create({
        name: config.name || `Generated ${config.type} tests`,
        type: config.type,
        framework: config.framework,
        test_cases: response.test_cases.map((tc, idx) => ({
          id: `test_${idx}`,
          name: tc.name,
          description: tc.description,
          code: response.test_code,
          ai_generated: true,
          confidence_score: tc.confidence,
          tags: [config.type, config.framework]
        }))
      });

      onGenerate?.(suite);
      toast.success(`Generated ${response.test_cases.length} test cases`);
    } catch (error) {
      toast.error('Failed to generate tests');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-white/80 text-sm mb-2 block">Suite Name</label>
          <Input
            placeholder="My Test Suite"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            className="bg-slate-800/50 border-white/10 text-white"
          />
        </div>
        <div>
          <label className="text-white/80 text-sm mb-2 block">Test Type</label>
          <Select value={config.type} onValueChange={(v) => setConfig({ ...config, type: v })}>
            <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unit">Unit Tests</SelectItem>
              <SelectItem value="integration">Integration Tests</SelectItem>
              <SelectItem value="e2e">E2E Tests</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-white/80 text-sm mb-2 block">Framework</label>
          <Select value={config.framework} onValueChange={(v) => setConfig({ ...config, framework: v })}>
            <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vitest">Vitest</SelectItem>
              <SelectItem value="jest">Jest</SelectItem>
              <SelectItem value="playwright">Playwright</SelectItem>
              <SelectItem value="cypress">Cypress</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-white/80 text-sm mb-2 block">Description (Optional)</label>
          <Input
            placeholder="What should these tests cover?"
            value={config.description}
            onChange={(e) => setConfig({ ...config, description: e.target.value })}
            className="bg-slate-800/50 border-white/10 text-white"
          />
        </div>
      </div>

      <div>
        <label className="text-white/80 text-sm mb-2 block">Code to Test</label>
        <Textarea
          placeholder="Paste your code here..."
          value={config.codeInput}
          onChange={(e) => setConfig({ ...config, codeInput: e.target.value })}
          className="bg-slate-800/50 border-white/10 text-white font-mono h-64"
        />
      </div>

      <Button
        onClick={handleGenerate}
        disabled={generating}
        className="bg-gradient-to-r from-green-500 to-emerald-600 w-full"
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Tests...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 mr-2" />
            Generate Tests
          </>
        )}
      </Button>

      {generatedTests && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">Tests Generated!</h3>
          </div>
          <div className="space-y-2">
            <p className="text-white/80">Generated {generatedTests.test_cases.length} test cases</p>
            <div className="bg-slate-900/50 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400 font-mono">
                {generatedTests.test_code}
              </pre>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}