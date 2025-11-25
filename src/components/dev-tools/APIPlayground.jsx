import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Zap, Play, Copy, CheckCircle2, Code, ChevronDown, 
  Key, Clock, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function APIPlayground({ apiKeys }) {
  const [selectedEndpoint, setSelectedEndpoint] = useState('trigger');
  const [apiKey, setApiKey] = useState('');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const endpoints = [
    { 
      id: 'trigger', 
      method: 'POST', 
      path: '/api/trigger-pipeline',
      description: 'Trigger a new pipeline run',
      body: { pipeline_id: 'your_pipeline_id', branch: 'main' }
    },
    { 
      id: 'status', 
      method: 'GET', 
      path: '/api/get-status',
      description: 'Get status of a pipeline run',
      params: 'run_id=your_run_id'
    },
    { 
      id: 'config', 
      method: 'GET', 
      path: '/api/get-config',
      description: 'Get pipeline configuration',
      params: 'pipeline_id=your_pipeline_id'
    }
  ];

  const currentEndpoint = endpoints.find(e => e.id === selectedEndpoint);

  const executeRequest = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setResponseTime(Date.now() - startTime);
    setResponse({
      status: 200,
      data: currentEndpoint.id === 'trigger' 
        ? { success: true, run_id: 'run_abc123', status: 'running' }
        : currentEndpoint.id === 'status'
        ? { success: true, run: { id: 'run_abc123', status: 'success', duration_seconds: 245 } }
        : { success: true, config: { name: 'Web App Pipeline', provider: 'github', branch: 'main' } }
    });
    setLoading(false);
  };

  const generateCode = (language) => {
    const endpoint = currentEndpoint;
    const baseUrl = 'https://api.flashfusion.app';
    
    if (language === 'curl') {
      if (endpoint.method === 'POST') {
        return `curl -X POST ${baseUrl}${endpoint.path} \\
  -H "X-API-Key: ${apiKey || 'your_api_key'}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(endpoint.body, null, 2)}'`;
      }
      return `curl "${baseUrl}${endpoint.path}?${endpoint.params}" \\
  -H "X-API-Key: ${apiKey || 'your_api_key'}"`;
    }
    
    if (language === 'javascript') {
      if (endpoint.method === 'POST') {
        return `const response = await fetch('${baseUrl}${endpoint.path}', {
  method: 'POST',
  headers: {
    'X-API-Key': '${apiKey || 'your_api_key'}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(${JSON.stringify(endpoint.body, null, 4)})
});
const data = await response.json();`;
      }
      return `const response = await fetch('${baseUrl}${endpoint.path}?${endpoint.params}', {
  headers: { 'X-API-Key': '${apiKey || 'your_api_key'}' }
});
const data = await response.json();`;
    }
    
    if (language === 'python') {
      if (endpoint.method === 'POST') {
        return `import requests

response = requests.post(
    '${baseUrl}${endpoint.path}',
    headers={'X-API-Key': '${apiKey || 'your_api_key'}'},
    json=${JSON.stringify(endpoint.body)}
)
data = response.json()`;
      }
      return `import requests

response = requests.get(
    '${baseUrl}${endpoint.path}',
    headers={'X-API-Key': '${apiKey || 'your_api_key'}'},
    params={'${endpoint.params?.split('=')[0]}': '${endpoint.params?.split('=')[1]}'}
)
data = response.json()`;
    }
    
    return '';
  };

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* API Key Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-purple-400" />
          Authentication
        </h3>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key (ffai_...)"
              className="bg-white/5 border-white/10 text-white font-mono"
            />
          </div>
          {apiKeys.length > 0 && (
            <Select onValueChange={(v) => setApiKey(v)}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select saved key" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                {apiKeys.map(key => (
                  <SelectItem key={key.id} value={key.key_preview} className="text-white">
                    {key.name} ({key.key_preview})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        {!apiKey && (
          <p className="text-xs text-orange-400 mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Enter an API key to test endpoints
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Builder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-white/10 p-6"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            Request Builder
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Endpoint</label>
              <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {endpoints.map(ep => (
                    <SelectItem key={ep.id} value={ep.id} className="text-white">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          ep.method === 'POST' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {ep.method}
                        </span>
                        {ep.path}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">{currentEndpoint?.description}</p>
            </div>

            {currentEndpoint?.body && (
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Request Body</label>
                <Textarea
                  value={requestBody || JSON.stringify(currentEndpoint.body, null, 2)}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="bg-black/40 border-white/10 text-white font-mono text-sm min-h-[120px]"
                />
              </div>
            )}

            {currentEndpoint?.params && (
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Query Parameters</label>
                <Input
                  value={currentEndpoint.params}
                  className="bg-black/40 border-white/10 text-white font-mono text-sm"
                  readOnly
                />
              </div>
            )}

            <Button
              onClick={executeRequest}
              disabled={!apiKey || loading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              {loading ? (
                <>Sending...</>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Response */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-white/10 p-6"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-green-400" />
              Response
            </h3>
            {responseTime && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {responseTime}ms
              </span>
            )}
          </div>

          {response ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  response.status === 200 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {response.status} {response.status === 200 ? 'OK' : 'Error'}
                </span>
              </div>
              <pre className="bg-black/40 rounded-lg p-4 overflow-auto text-sm font-mono text-white">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Send a request to see the response</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Code Snippets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <h3 className="text-lg font-bold text-white mb-4">Code Snippets</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['curl', 'javascript', 'python'].map(lang => (
            <div key={lang} className="rounded-lg bg-black/40 border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-white/10">
                <span className="text-sm text-white capitalize">{lang}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyCode(generateCode(lang), lang)}
                  className="text-gray-400"
                >
                  {copiedCode === lang ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <pre className="p-3 text-xs font-mono text-gray-300 overflow-x-auto">
                {generateCode(lang)}
              </pre>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}