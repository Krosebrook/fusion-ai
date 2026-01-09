/**
 * Plugin Debugger
 * Real-time debugging interface for plugin interactions
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Play, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export function PluginDebugger() {
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState('/api/pluginAPI/workflows');
  const [requestBody, setRequestBody] = useState(JSON.stringify({ method: 'list' }, null, 2));
  const [response, setResponse] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (type, message, data = null) => {
    setLogs(prev => [...prev, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type,
      message,
      data,
    }]);
  };

  const executeRequest = async () => {
    if (!apiKey) {
      toast.error('API key required');
      return;
    }

    addLog('info', `Sending ${endpoint}`, requestBody);

    try {
      const body = JSON.parse(requestBody);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Plugin-Key': apiKey,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setResponse({ status: res.status, data });
      addLog('success', `Response ${res.status}`, data);
      toast.success('Request completed');
    } catch (error) {
      addLog('error', 'Request failed', error.message);
      toast.error(`Error: ${error.message}`);
    }
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
      toast.success('Response copied to clipboard');
    }
  };

  const quickTests = [
    {
      name: 'List Workflows',
      endpoint: '/api/pluginAPI/workflows',
      body: { method: 'list' },
    },
    {
      name: 'Execute Workflow',
      endpoint: '/api/pluginAPI/execute-workflow',
      body: { workflow_id: 'wf_123', input_data: {} },
    },
    {
      name: 'Get Analytics',
      endpoint: '/api/pluginAPI/analytics',
      body: { workflow_id: 'wf_123' },
    },
    {
      name: 'Trigger Workflow',
      endpoint: '/api/pluginAPI/trigger-workflow',
      body: { workflow_id: 'wf_123', priority: 'high' },
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Request Builder */}
      <div className="lg:col-span-2 space-y-6">
        <CinematicCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">API Request Builder</h2>
          
          <div className="space-y-4">
            <div>
              <Label className="text-white mb-2">API Key</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="plugin_abc123..."
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-white mb-2">Endpoint</Label>
              <Input
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="/api/pluginAPI/workflows"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-white mb-2">Request Body (JSON)</Label>
              <Textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={8}
                className="bg-white/5 border-white/10 text-white font-mono text-sm"
              />
            </div>

            <CinematicButton icon={Play} onClick={executeRequest} glow>
              Send Request
            </CinematicButton>
          </div>
        </CinematicCard>

        {/* Response Viewer */}
        {response && (
          <CinematicCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Response</h2>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${
                  response.status < 300 ? 'text-green-400' : 'text-red-400'
                }`}>
                  Status: {response.status}
                </span>
                <CinematicButton variant="ghost" icon={Copy} onClick={copyResponse}>
                  Copy
                </CinematicButton>
              </div>
            </div>
            <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto text-white/80 text-sm">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </CinematicCard>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Quick Tests */}
        <CinematicCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Quick Tests</h3>
          <div className="space-y-2">
            {quickTests.map((test) => (
              <button
                key={test.name}
                onClick={() => {
                  setEndpoint(test.endpoint);
                  setRequestBody(JSON.stringify(test.body, null, 2));
                }}
                className="w-full text-left px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm transition-colors"
              >
                {test.name}
              </button>
            ))}
          </div>
        </CinematicCard>

        {/* Logs */}
        <CinematicCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Logs</h3>
            <CinematicButton
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={() => setLogs([])}
            >
              Clear
            </CinematicButton>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {logs.slice().reverse().map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-3 rounded-lg text-xs ${
                    log.type === 'error'
                      ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                      : log.type === 'success'
                      ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                      : 'bg-white/5 border border-white/10 text-white/70'
                  }`}
                >
                  <div className="font-medium mb-1">{log.message}</div>
                  <div className="text-white/40 text-xs">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CinematicCard>
      </div>
    </div>
  );
}

export default PluginDebugger;