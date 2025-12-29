/**
 * Plugin SDK Documentation
 * Developer guide for building FlashFusion plugins
 */

import React from 'react';
import { CinematicCard } from '../atoms/CinematicCard';
import { Code, BookOpen, Key, Webhook, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const sdkDocs = `
# FlashFusion Plugin SDK

Build powerful extensions for FlashFusion workflows, pipelines, and analytics.

## Getting Started

### 1. Register Your Plugin

Create a plugin entry with your configuration:

\`\`\`json
{
  "name": "My Custom AI Model",
  "slug": "my-custom-ai",
  "description": "Custom GPT-4 based model for specialized tasks",
  "category": "ai_model",
  "api_endpoint": "https://api.myplugin.com",
  "webhook_url": "https://api.myplugin.com/webhooks",
  "permissions": {
    "read_workflows": true,
    "execute_workflows": true,
    "ai_model_access": true
  }
}
\`\`\`

### 2. Authentication

All API requests require your API key:

\`\`\`bash
curl https://app.flashfusion.ai/api/pluginAPI/workflows \\
  -H "X-Plugin-Key: plugin_abc123..." \\
  -H "Content-Type: application/json"
\`\`\`

## API Endpoints

### List Workflows
\`\`\`javascript
POST /api/pluginAPI/workflows
{
  "method": "list"
}
\`\`\`

### Get Workflow
\`\`\`javascript
POST /api/pluginAPI/workflows
{
  "method": "get",
  "workflow_id": "wf_123"
}
\`\`\`

### Execute Workflow
\`\`\`javascript
POST /api/pluginAPI/execute-workflow
{
  "workflow_id": "wf_123",
  "input_data": {
    "param1": "value1"
  }
}
\`\`\`

### Get Analytics
\`\`\`javascript
POST /api/pluginAPI/analytics
{
  "workflow_id": "wf_123",
  "start_date": "2025-01-01",
  "end_date": "2025-01-31"
}
\`\`\`

## Custom AI Model Integration

### Define Your Model

\`\`\`json
{
  "ai_model_config": {
    "model_type": "llm",
    "api_endpoint": "https://api.myplugin.com/generate",
    "authentication_type": "api_key",
    "input_schema": {
      "type": "object",
      "properties": {
        "prompt": { "type": "string" },
        "max_tokens": { "type": "number" }
      }
    },
    "output_schema": {
      "type": "object",
      "properties": {
        "text": { "type": "string" },
        "tokens": { "type": "number" }
      }
    }
  }
}
\`\`\`

### Usage in Workflows

Once installed, your AI model appears as an option in AI Task nodes, allowing users to select it alongside built-in models.

## Webhooks

Receive real-time events from FlashFusion:

\`\`\`javascript
POST https://your-webhook-url.com
Headers:
  X-Plugin-Key: plugin_abc123...
  X-Webhook-Secret: whsec_xyz789...
  X-Event-Type: workflow.execution.completed

Body:
{
  "event": "workflow.execution.completed",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "workflow_id": "wf_123",
    "execution_id": "exec_456",
    "status": "completed",
    "duration_ms": 3500
  }
}
\`\`\`

### Available Events
- \`workflow.execution.started\`
- \`workflow.execution.completed\`
- \`workflow.execution.failed\`
- \`pipeline.run.started\`
- \`pipeline.run.completed\`

## Permissions

Request only the permissions you need:

| Permission | Description |
|------------|-------------|
| \`read_workflows\` | List and read workflow configurations |
| \`write_workflows\` | Modify workflow configurations |
| \`execute_workflows\` | Trigger workflow executions |
| \`read_pipelines\` | Access CI/CD pipeline data |
| \`write_pipelines\` | Modify pipeline configurations |
| \`read_analytics\` | Access execution logs and analytics |
| \`ai_model_access\` | Register as custom AI model provider |

## Security Best Practices

1. **Never log API keys or secrets**
2. **Validate webhook signatures** using \`X-Webhook-Secret\`
3. **Use HTTPS** for all endpoints
4. **Rate limit** your API to prevent abuse
5. **Sanitize inputs** before processing

## Example: Custom AI Model Plugin

\`\`\`javascript
// Your plugin API endpoint
app.post('/generate', async (req, res) => {
  const { prompt, max_tokens } = req.body;
  
  // Call your custom AI model
  const result = await yourAIModel.generate({
    prompt,
    max_tokens: max_tokens || 1000,
  });
  
  res.json({
    text: result.completion,
    tokens: result.usage.total_tokens,
  });
});
\`\`\`

## Support

- API Reference: [https://docs.flashfusion.ai/plugins](https://docs.flashfusion.ai/plugins)
- SDK on GitHub: [https://github.com/flashfusion/plugin-sdk](https://github.com/flashfusion/plugin-sdk)
- Discord Community: [https://discord.gg/flashfusion](https://discord.gg/flashfusion)
`;

export function PluginSDKDocumentation() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-10 h-10 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Plugin SDK Documentation</h1>
            <p className="text-white/60">Build extensions for FlashFusion</p>
          </div>
        </div>

        <CinematicCard className="p-8">
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                code: ({ inline, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <pre className="bg-slate-950/80 rounded-lg p-4 overflow-x-auto border border-white/10">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs font-mono">
                      {children}
                    </code>
                  );
                },
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-white mb-4 mt-8">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-white mb-3 mt-6">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-bold text-white mb-2 mt-4">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-white/70 mb-4 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-white/70 mb-4 space-y-2">{children}</ul>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full border-collapse">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-white/5">{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="border border-white/10 px-4 py-2 text-left text-white font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-white/10 px-4 py-2 text-white/70">{children}</td>
                ),
              }}
            >
              {sdkDocs}
            </ReactMarkdown>
          </div>
        </CinematicCard>
      </div>
    </div>
  );
}

export default PluginSDKDocumentation;