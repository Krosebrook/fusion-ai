/**
 * Plugin Development Server
 * Local server simulator for testing plugins
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Square, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function PluginDevServer() {
  const [serverUrl, setServerUrl] = useState('http://localhost:3000');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const testEndpoint = async (endpoint, method = 'GET', body = null) => {
    try {
      const response = await fetch(`${serverUrl}${endpoint}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : null,
      });

      const data = await response.json();
      return { success: true, data, status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    const results = [];

    // Test health endpoint
    const healthResult = await testEndpoint('/health');
    results.push({
      name: 'Health Check',
      ...healthResult,
    });

    // Test AI model endpoint (if applicable)
    const aiResult = await testEndpoint('/generate', 'POST', {
      prompt: 'Test prompt',
      max_tokens: 100,
    });
    results.push({
      name: 'AI Model Endpoint',
      ...aiResult,
    });

    // Test webhook endpoint
    const webhookResult = await testEndpoint('/webhooks', 'POST', {
      event: 'workflow.execution.completed',
      data: { workflow_id: 'test_123' },
    });
    results.push({
      name: 'Webhook Handler',
      ...webhookResult,
    });

    setTestResults(results);
    setIsRunning(false);

    const successCount = results.filter(r => r.success).length;
    if (successCount === results.length) {
      toast.success('✅ All tests passed!');
    } else {
      toast.warning(`⚠️ ${successCount}/${results.length} tests passed`);
    }
  };

  return (
    <CinematicCard className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Plugin Development Server</h2>

      <div className="space-y-6">
        <div>
          <Label className="text-white mb-2">Plugin Server URL</Label>
          <Input
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="http://localhost:3000"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="flex gap-3">
          <CinematicButton
            icon={Play}
            onClick={runTests}
            disabled={isRunning}
            glow
          >
            {isRunning ? 'Testing...' : 'Run Tests'}
          </CinematicButton>
          <CinematicButton
            variant="outline"
            icon={Square}
            onClick={() => setTestResults([])}
          >
            Clear Results
          </CinematicButton>
        </div>

        {testResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-white">Test Results</h3>
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border ${
                  result.success
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-white font-medium">{result.name}</span>
                  {result.status && (
                    <span className="ml-auto text-white/60 text-sm">
                      Status: {result.status}
                    </span>
                  )}
                </div>
                {result.success ? (
                  <pre className="text-white/70 text-xs overflow-x-auto bg-black/20 p-3 rounded">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                ) : (
                  <p className="text-red-400 text-sm">{result.error}</p>
                )}
              </div>
            ))}
          </motion.div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-2">💡 Quick Tips</h3>
          <ul className="text-white/70 text-sm space-y-1">
            <li>• Ensure your plugin server is running on the specified URL</li>
            <li>• CORS must be enabled for localhost testing</li>
            <li>• Check browser console for detailed error messages</li>
            <li>• Use the Debugger tab to inspect real-time API calls</li>
          </ul>
        </div>
      </div>
    </CinematicCard>
  );
}

export default PluginDevServer;