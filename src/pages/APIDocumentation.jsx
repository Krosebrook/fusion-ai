import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Book, Code, Zap, Copy, Check, ChevronRight, Terminal, 
  FileText, Play, Shield, Key, ExternalLink, Sparkles
} from "lucide-react";
import { toast } from "sonner";

const METHOD_COLORS = {
  GET: 'bg-green-500/20 text-green-400 border-green-500/30',
  POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PUT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const API_ENDPOINTS = [
  {
    category: 'Prompt Templates',
    icon: FileText,
    endpoints: [
      {
        method: 'GET',
        path: '/templates',
        description: 'List all prompt templates',
        params: [
          { name: 'limit', type: 'number', optional: true, description: 'Max results (default: 50)' },
          { name: 'category', type: 'string', optional: true, description: 'Filter by category' }
        ],
        response: `{
  "templates": [...],
  "count": 25
}`
      },
      {
        method: 'GET',
        path: '/templates/:id',
        description: 'Get a specific template by ID',
        response: `{
  "template": {
    "id": "abc123",
    "name": "Code Review",
    "template": "Review {{code}}...",
    "variables": [...]
  }
}`
      },
      {
        method: 'POST',
        path: '/templates',
        description: 'Create a new prompt template',
        body: `{
  "name": "My Template",
  "description": "Template description",
  "category": "custom",
  "template": "Analyze {{input}} and provide insights",
  "variables": [
    { "name": "input", "type": "string", "required": true }
  ],
  "llm_settings": {
    "temperature": 0.7,
    "max_tokens": 1000
  }
}`,
        response: `{
  "template": {...},
  "message": "Template created successfully"
}`
      },
      {
        method: 'PUT',
        path: '/templates/:id',
        description: 'Update an existing template',
        body: `{
  "name": "Updated Name",
  "template": "New template content..."
}`
      },
      {
        method: 'DELETE',
        path: '/templates/:id',
        description: 'Delete a template'
      }
    ]
  },
  {
    category: 'Prompt Execution',
    icon: Play,
    endpoints: [
      {
        method: 'POST',
        path: '/execute',
        description: 'Execute a prompt template with variables',
        body: `{
  "template_id": "abc123",
  "variables": {
    "input": "Your data here",
    "context": "Additional context"
  },
  "options": {
    "include_prompt": true,
    "llm_settings": {
      "temperature": 0.5
    }
  }
}`,
        response: `{
  "result": "AI generated response...",
  "metadata": {
    "template_id": "abc123",
    "latency_ms": 1234,
    "compiled_prompt": "..."
  }
}`
      },
      {
        method: 'POST',
        path: '/execute/batch',
        description: 'Execute multiple prompts in batch',
        body: `{
  "executions": [
    { "template_id": "abc", "variables": {...} },
    { "template_id": "def", "variables": {...} }
  ]
}`,
        response: `{
  "results": [...],
  "total": 2,
  "successful": 2
}`
      }
    ]
  },
  {
    category: 'Prompt Chains',
    icon: Zap,
    endpoints: [
      {
        method: 'GET',
        path: '/chains',
        description: 'List all prompt chains'
      },
      {
        method: 'POST',
        path: '/chains',
        description: 'Create a new prompt chain',
        body: `{
  "name": "Analysis Chain",
  "nodes": [...],
  "edges": [...]
}`
      },
      {
        method: 'POST',
        path: '/chains/:id/execute',
        description: 'Execute a prompt chain',
        body: `{
  "variables": {
    "input": "Data to process"
  }
}`,
        response: `{
  "result": {...},
  "execution_log": [...],
  "nodes_executed": 3
}`
      }
    ]
  },
  {
    category: 'A/B Experiments',
    icon: Sparkles,
    endpoints: [
      {
        method: 'GET',
        path: '/experiments',
        description: 'List all experiments',
        params: [
          { name: 'status', type: 'string', optional: true, description: 'Filter by status' }
        ]
      },
      {
        method: 'POST',
        path: '/experiments',
        description: 'Create a new A/B experiment'
      },
      {
        method: 'PUT',
        path: '/experiments/:id/status',
        description: 'Update experiment status',
        body: `{ "status": "running" }`
      }
    ]
  },
  {
    category: 'Version Control',
    icon: Code,
    endpoints: [
      {
        method: 'GET',
        path: '/templates/:id/versions',
        description: 'Get version history for a template'
      },
      {
        method: 'POST',
        path: '/templates/:id/versions',
        description: 'Create a new version (commit)',
        body: `{
  "version_number": "1.1.0",
  "version_tag": "stable",
  "commit_message": "Fixed variable handling"
}`
      }
    ]
  },
  {
    category: 'Analytics',
    icon: Zap,
    endpoints: [
      {
        method: 'GET',
        path: '/analytics/overview',
        description: 'Get overall analytics summary',
        response: `{
  "total_executions": 1250,
  "success_rate": "98.50",
  "avg_latency_ms": 1890,
  "total_cost_usd": "12.3400",
  "executions_by_type": {
    "single": 1100,
    "chain": 100,
    "experiment": 50
  }
}`
      },
      {
        method: 'GET',
        path: '/analytics/templates',
        description: 'Get top templates by usage'
      },
      {
        method: 'GET',
        path: '/analytics/logs',
        description: 'Get execution logs',
        params: [
          { name: 'limit', type: 'number', optional: true },
          { name: 'status', type: 'string', optional: true }
        ]
      }
    ]
  },
  {
    category: 'Agents',
    icon: Sparkles,
    endpoints: [
      {
        method: 'GET',
        path: '/agents',
        description: 'List all agent workflows and status'
      },
      {
        method: 'POST',
        path: '/agents/workflows',
        description: 'Create a new agent workflow'
      },
      {
        method: 'POST',
        path: '/agents/workflows/:id/trigger',
        description: 'Trigger an agent workflow',
        body: `{ "data": { "context": "..." } }`
      },
      {
        method: 'GET',
        path: '/agents/collaborations/:id',
        description: 'Get collaboration execution status'
      }
    ]
  }
];

const SDK_EXAMPLES = {
  javascript: `import FlashFusion from '@flashfusion/sdk';

// Initialize the SDK
const ff = new FlashFusion({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-app.base44.app/api/flashfusionAPI'
});

// List templates
const templates = await ff.templates.list({ category: 'analysis' });

// Execute a prompt
const result = await ff.execute({
  templateId: 'abc123',
  variables: {
    input: 'Your data here',
    context: 'Additional context'
  },
  options: {
    temperature: 0.5
  }
});

console.log(result.result);

// Execute a chain
const chainResult = await ff.chains.execute('chain-id', {
  input: 'Process this data'
});

// Get analytics
const stats = await ff.analytics.overview();
console.log(\`Success rate: \${stats.success_rate}%\`);`,

  python: `from flashfusion import FlashFusion

# Initialize the SDK
ff = FlashFusion(
    api_key="your-api-key",
    base_url="https://your-app.base44.app/api/flashfusionAPI"
)

# List templates
templates = ff.templates.list(category="analysis")

# Execute a prompt
result = ff.execute(
    template_id="abc123",
    variables={
        "input": "Your data here",
        "context": "Additional context"
    },
    options={"temperature": 0.5}
)

print(result["result"])

# Execute a chain
chain_result = ff.chains.execute("chain-id", {
    "input": "Process this data"
})

# Get analytics
stats = ff.analytics.overview()
print(f"Success rate: {stats['success_rate']}%")`,

  curl: `# List templates
curl -X GET "https://your-app.base44.app/api/flashfusionAPI?path=templates" \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Execute a prompt
curl -X POST "https://your-app.base44.app/api/flashfusionAPI?path=execute" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "template_id": "abc123",
    "variables": {
      "input": "Your data here"
    }
  }'

# Get analytics overview
curl -X GET "https://your-app.base44.app/api/flashfusionAPI?path=analytics/overview" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
};

export default function APIDocumentationPage() {
  const [copied, setCopied] = useState(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [activeTab, setActiveTab] = useState('endpoints');
  const [sdkLang, setSdkLang] = useState('javascript');

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-medium">Developer API</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            FlashFusion API & SDK
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Programmatically access prompt templates, execute AI prompts, manage agents, and retrieve analytics data.
          </p>
        </motion.div>

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 p-6"
          style={{ background: "linear-gradient(135deg, rgba(255, 123, 0, 0.05) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Quick Start</h2>
              <p className="text-sm text-gray-400">Get up and running in minutes</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white/5">
              <div className="text-orange-400 font-mono text-sm mb-2">1. Get your API Key</div>
              <p className="text-gray-400 text-sm">Navigate to Settings → API Keys and create a new key with required permissions.</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5">
              <div className="text-orange-400 font-mono text-sm mb-2">2. Set Base URL</div>
              <code className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded block mt-2 overflow-x-auto">
                https://your-app.base44.app/api/flashfusionAPI
              </code>
            </div>
            <div className="p-4 rounded-lg bg-white/5">
              <div className="text-orange-400 font-mono text-sm mb-2">3. Authenticate</div>
              <code className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded block mt-2">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 mb-6">
            <TabsTrigger value="endpoints" className="data-[state=active]:bg-orange-500/20">
              <Book className="w-4 h-4 mr-2" />
              API Endpoints
            </TabsTrigger>
            <TabsTrigger value="sdk" className="data-[state=active]:bg-orange-500/20">
              <Code className="w-4 h-4 mr-2" />
              SDK Examples
            </TabsTrigger>
            <TabsTrigger value="playground" className="data-[state=active]:bg-orange-500/20">
              <Terminal className="w-4 h-4 mr-2" />
              Playground
            </TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-6">
            {API_ENDPOINTS.map((category, idx) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl border border-white/10 overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
              >
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <category.icon className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="font-bold text-white">{category.category}</h3>
                </div>

                <div className="divide-y divide-white/5">
                  {category.endpoints.map((endpoint, i) => (
                    <div key={i} className="p-4 hover:bg-white/5 transition-colors">
                      <div 
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setSelectedEndpoint(selectedEndpoint === `${category.category}-${i}` ? null : `${category.category}-${i}`)}
                      >
                        <Badge className={`${METHOD_COLORS[endpoint.method]} border font-mono text-xs`}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm text-white font-mono">{endpoint.path}</code>
                        <span className="text-gray-400 text-sm flex-1">{endpoint.description}</span>
                        <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${selectedEndpoint === `${category.category}-${i}` ? 'rotate-90' : ''}`} />
                      </div>

                      {selectedEndpoint === `${category.category}-${i}` && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 space-y-4"
                        >
                          {endpoint.params && (
                            <div>
                              <h4 className="text-xs font-medium text-gray-400 mb-2">Query Parameters</h4>
                              <div className="space-y-2">
                                {endpoint.params.map((param, pi) => (
                                  <div key={pi} className="flex items-center gap-2 text-sm">
                                    <code className="text-orange-400">{param.name}</code>
                                    <span className="text-gray-500">({param.type})</span>
                                    {param.optional && <Badge variant="outline" className="text-xs">optional</Badge>}
                                    <span className="text-gray-400 text-xs">{param.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {endpoint.body && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-medium text-gray-400">Request Body</h4>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2"
                                  onClick={() => copyToClipboard(endpoint.body, `body-${i}`)}
                                >
                                  {copied === `body-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </Button>
                              </div>
                              <pre className="text-xs text-gray-300 bg-black/30 p-3 rounded-lg overflow-x-auto font-mono">
                                {endpoint.body}
                              </pre>
                            </div>
                          )}

                          {endpoint.response && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-medium text-gray-400">Response</h4>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2"
                                  onClick={() => copyToClipboard(endpoint.response, `resp-${i}`)}
                                >
                                  {copied === `resp-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </Button>
                              </div>
                              <pre className="text-xs text-green-300 bg-black/30 p-3 rounded-lg overflow-x-auto font-mono">
                                {endpoint.response}
                              </pre>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="sdk">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/10 overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-white">SDK Usage Examples</h3>
                <div className="flex gap-2">
                  {['javascript', 'python', 'curl'].map(lang => (
                    <Button
                      key={lang}
                      size="sm"
                      variant={sdkLang === lang ? 'default' : 'outline'}
                      onClick={() => setSdkLang(lang)}
                      className={sdkLang === lang ? 'bg-orange-500' : 'border-white/10'}
                    >
                      {lang === 'javascript' ? 'JavaScript' : lang === 'python' ? 'Python' : 'cURL'}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">{sdkLang}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(SDK_EXAMPLES[sdkLang], 'sdk')}
                  >
                    {copied === 'sdk' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <pre className="text-sm text-gray-300 bg-black/30 p-4 rounded-lg overflow-x-auto font-mono whitespace-pre">
                  {SDK_EXAMPLES[sdkLang]}
                </pre>
              </div>
            </motion.div>

            {/* Installation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 rounded-xl border border-white/10 p-6"
              style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
            >
              <h3 className="font-bold text-white mb-4">Installation</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-black/30">
                  <div className="text-xs text-gray-400 mb-2">npm / yarn</div>
                  <code className="text-sm text-green-400">npm install @flashfusion/sdk</code>
                </div>
                <div className="p-4 rounded-lg bg-black/30">
                  <div className="text-xs text-gray-400 mb-2">pip</div>
                  <code className="text-sm text-green-400">pip install flashfusion</code>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="playground">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/10 p-6"
              style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
            >
              <div className="text-center py-12">
                <Terminal className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">API Playground</h3>
                <p className="text-gray-400 mb-6">Test API endpoints directly in your browser</p>
                <Button 
                  className="bg-gradient-to-r from-orange-500 to-pink-500"
                  onClick={() => window.location.href = '/DeveloperTools'}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Developer Tools
                </Button>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Rate Limits & Security */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/10 p-6"
            style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h3 className="font-bold text-white">Rate Limits</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Standard tier</span>
                <span className="text-white">100 requests/min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pro tier</span>
                <span className="text-white">1000 requests/min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Enterprise</span>
                <span className="text-white">Unlimited</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-white/10 p-6"
            style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-green-400" />
              <h3 className="font-bold text-white">Security</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                TLS 1.3 encryption in transit
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                API keys with granular permissions
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                Request signing & validation
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                Audit logging for all API calls
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}