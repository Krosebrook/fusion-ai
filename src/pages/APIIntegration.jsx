import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Key, Webhook, BookOpen } from "lucide-react";
import APIKeyManager from "../components/api/APIKeyManager";

export default function APIIntegrationPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("curl");

  const codeExamples = {
    trigger: {
      curl: `curl -X POST https://api.flashfusion.app/api/trigger-pipeline \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "pipeline_id": "pipeline_id_here",
    "branch": "main",
    "commit_message": "Triggered via API"
  }'`,
      javascript: `const response = await fetch('https://api.flashfusion.app/api/trigger-pipeline', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your_api_key_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    pipeline_id: 'pipeline_id_here',
    branch: 'main',
    commit_message: 'Triggered via API'
  })
});

const data = await response.json();
console.log(data.run_id);`,
      python: `import requests

response = requests.post(
    'https://api.flashfusion.app/api/trigger-pipeline',
    headers={
        'X-API-Key': 'your_api_key_here',
        'Content-Type': 'application/json'
    },
    json={
        'pipeline_id': 'pipeline_id_here',
        'branch': 'main',
        'commit_message': 'Triggered via API'
    }
)

data = response.json()
print(data['run_id'])`
    },
    status: {
      curl: `curl -X GET "https://api.flashfusion.app/api/get-status?run_id=run_id_here" \\
  -H "X-API-Key: your_api_key_here"`,
      javascript: `const response = await fetch(
  'https://api.flashfusion.app/api/get-status?run_id=run_id_here',
  {
    headers: {
      'X-API-Key': 'your_api_key_here'
    }
  }
);

const { run } = await response.json();
console.log(run.status, run.progress);`,
      python: `response = requests.get(
    'https://api.flashfusion.app/api/get-status',
    headers={'X-API-Key': 'your_api_key_here'},
    params={'run_id': 'run_id_here'}
)

run = response.json()['run']
print(run['status'], run['progress'])`
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <Code2 className="w-10 h-10 text-blue-400" />
          </div>
          <h1
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            API Integration
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Integrate FlashFusion pipelines into your external tools and workflows
          </p>
        </motion.div>

        <Tabs defaultValue="keys" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5">
            <TabsTrigger value="keys">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="docs">
              <BookOpen className="w-4 h-4 mr-2" />
              Documentation
            </TabsTrigger>
            <TabsTrigger value="webhooks">
              <Webhook className="w-4 h-4 mr-2" />
              Webhooks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keys" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-slate-900/95 to-slate-800/98"
            >
              <APIKeyManager />
            </motion.div>
          </TabsContent>

          <TabsContent value="docs" className="mt-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-slate-900/95 to-slate-800/98"
            >
              <h3 className="text-2xl font-bold text-white mb-6">API Endpoints</h3>

              {/* Trigger Pipeline */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded bg-green-500/20 text-green-400 text-sm font-bold">POST</span>
                  <code className="text-lg text-white font-mono">/api/trigger-pipeline</code>
                </div>
                <p className="text-gray-400 mb-4">Trigger a pipeline run programmatically</p>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Request Body</h4>
                  <div className="p-4 rounded-lg bg-black/40 border border-white/10">
                    <pre className="text-xs text-gray-300 font-mono">
{`{
  "pipeline_id": "string (required)",
  "branch": "string (optional)",
  "commit_message": "string (optional)"
}`}
                    </pre>
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  {['curl', 'javascript', 'python'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition ${
                        selectedLanguage === lang
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-black/40 border border-white/10 overflow-x-auto">
                  <pre className="text-xs text-gray-300 font-mono whitespace-pre">
                    {codeExamples.trigger[selectedLanguage]}
                  </pre>
                </div>
              </div>

              {/* Get Status */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded bg-blue-500/20 text-blue-400 text-sm font-bold">GET</span>
                  <code className="text-lg text-white font-mono">/api/get-status</code>
                </div>
                <p className="text-gray-400 mb-4">Get pipeline run status and details</p>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Query Parameters</h4>
                  <div className="p-4 rounded-lg bg-black/40 border border-white/10">
                    <pre className="text-xs text-gray-300 font-mono">
{`run_id: string (required)
OR
pipeline_id: string (required) - returns last 10 runs`}
                    </pre>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-black/40 border border-white/10 overflow-x-auto">
                  <pre className="text-xs text-gray-300 font-mono whitespace-pre">
                    {codeExamples.status[selectedLanguage]}
                  </pre>
                </div>
              </div>
            </motion.div>

            {/* Response Codes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-slate-900/95 to-slate-800/98"
            >
              <h3 className="text-2xl font-bold text-white mb-4">Response Codes</h3>
              <div className="space-y-2">
                {[
                  { code: 200, desc: 'Success - Request completed successfully' },
                  { code: 401, desc: 'Unauthorized - Invalid or missing API key' },
                  { code: 403, desc: 'Forbidden - Insufficient permissions' },
                  { code: 404, desc: 'Not Found - Resource does not exist' },
                  { code: 500, desc: 'Server Error - Internal error occurred' }
                ].map(({ code, desc }) => (
                  <div key={code} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      code === 200 ? 'bg-green-500/20 text-green-400' :
                      code === 401 || code === 403 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {code}
                    </span>
                    <p className="text-sm text-gray-300">{desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="webhooks" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-slate-900/95 to-slate-800/98"
            >
              <div className="text-center py-12">
                <Webhook className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Webhook Support Coming Soon</h3>
                <p className="text-gray-400">
                  Receive real-time notifications when pipeline events occur
                </p>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}