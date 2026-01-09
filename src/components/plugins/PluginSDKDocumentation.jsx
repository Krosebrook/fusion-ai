/**
 * Plugin SDK Documentation
 * Developer guide for building FlashFusion plugins
 */

import { CinematicCard } from '../atoms/CinematicCard';
import { BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const sdkDocs = `
# FlashFusion Plugin SDK v2.0

Build powerful extensions for FlashFusion workflows, pipelines, and analytics with advanced capabilities.

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

### Trigger Workflow
\`\`\`javascript
POST /api/pluginAPI/trigger-workflow
{
  "workflow_id": "wf_123",
  "input_data": { "param1": "value1" },
  "priority": "high"
}
\`\`\`

### Update Pipeline
\`\`\`javascript
POST /api/pluginAPI/update-pipeline
{
  "pipeline_id": "pipe_123",
  "updates": {
    "build_command": "npm run build:optimized",
    "notifications": true
  }
}
\`\`\`

### Security Scan
\`\`\`javascript
POST /api/pluginAPI/security-scan
{
  "target_type": "pipeline",
  "target_id": "pipe_123",
  "scan_type": "vulnerability"
}
\`\`\`

## Custom AI Model Integration

### Standard Model Types
\`\`\`javascript
// Supported: "llm", "vision", "embedding", "classification"
{
  "ai_model_config": {
    "model_type": "llm",
    "api_endpoint": "https://api.myplugin.com/generate",
    "authentication_type": "api_key"
  }
}
\`\`\`

### Register Custom Model Type
\`\`\`javascript
POST /api/pluginAPI/register-ai-model
{
  "model_type": "custom",
  "custom_type_name": "code_optimizer",
  "capabilities": ["code-refactoring", "bug-detection", "performance-tuning"],
  "input_schema": {
    "type": "object",
    "properties": {
      "code": { "type": "string" },
      "language": { "type": "string" },
      "optimization_level": { "type": "string", "enum": ["basic", "aggressive"] }
    },
    "required": ["code", "language"]
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "optimized_code": { "type": "string" },
      "improvements": { "type": "array" },
      "performance_gain": { "type": "number" }
    }
  }
}
\`\`\`

### Usage in Workflows
Your AI model appears in AI Task nodes with your custom capabilities exposed to users.

## Custom UI Components

### Define Embeddable UI
\`\`\`json
{
  "ui_components": [
    {
      "id": "config-dashboard",
      "name": "Configuration Dashboard",
      "type": "dashboard",
      "iframe_url": "https://plugin.com/dashboard.html",
      "height": "600px",
      "sandbox_permissions": ["allow-forms"]
    },
    {
      "id": "settings-form",
      "name": "Settings Form",
      "type": "config_form",
      "iframe_url": "https://plugin.com/config.html",
      "height": "400px"
    }
  ]
}
\`\`\`

### Communication Protocol
\`\`\`javascript
// Plugin receives config on load
window.addEventListener('message', (event) => {
  if (event.data.type === 'CONFIG') {
    const { config, pluginId } = event.data;
    // Initialize your UI with config
  }
});

// Send data back to FlashFusion
window.parent.postMessage({
  type: 'UPDATE',
  data: { setting1: 'value1' }
}, '*');
\`\`\`

## Real-Time Analytics Dashboard

Plugins can provide real-time analytics dashboards with streaming data visualization:

### Analytics Configuration

\`\`\`json
{
  "analytics_config": {
    "enabled": true,
    "realtime_streaming": true,
    "streaming_endpoint": "wss://your-plugin.com/analytics/stream",
    "data_sources": [
      {
        "id": "api_requests",
        "name": "API Requests",
        "endpoint": "/metrics/requests",
        "refresh_interval_ms": 5000
      }
    ],
    "metrics": [
      {
        "id": "request_count",
        "name": "Request Count",
        "type": "counter",
        "unit": "requests",
        "aggregation": "sum"
      },
      {
        "id": "response_time",
        "name": "Response Time",
        "type": "timeseries",
        "unit": "ms",
        "aggregation": "avg"
      }
    ],
    "visualizations": [
      {
        "id": "requests_over_time",
        "name": "Requests Over Time",
        "chart_type": "line",
        "metric_ids": ["request_count"],
        "layout": { "width": 600, "height": 300 }
      }
    ]
  }
}
\`\`\`

### Streaming Protocols

**WebSocket:** Send real-time metric updates
\`\`\`javascript
// Server-side (plugin)
wss.on('connection', (ws) => {
  setInterval(() => {
    ws.send(JSON.stringify({
      metrics: [
        { id: 'request_count', value: getCurrentCount() },
        { id: 'response_time', value: getAvgResponseTime() }
      ]
    }));
  }, 1000);
});
\`\`\`

**Server-Sent Events (SSE):** Alternative streaming method
\`\`\`javascript
// Server-side (plugin)
app.get('/analytics/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  setInterval(() => {
    res.write(\`data: \${JSON.stringify({ metrics: [...] })}\\n\\n\`);
  }, 1000);
});
\`\`\`

---

## Project Management Integration

Enable two-way sync with external PM tools (Jira, Asana, Linear, etc.):

### PM Integration Configuration

\`\`\`json
{
  "pm_integration": {
    "enabled": true,
    "provider": "jira",
    "sync_config": {
      "bidirectional": true,
      "sync_interval_minutes": 5,
      "entity_mappings": [
        {
          "flashfusion_entity": "Task",
          "external_resource": "issue",
          "field_mappings": {
            "title": "summary",
            "description": "description",
            "status": "status.name",
            "assignee": "assignee.displayName"
          },
          "sync_direction": "bidirectional"
        }
      ],
      "conflict_resolution": "latest_wins",
      "webhook_events": ["issue.created", "issue.updated"]
    },
    "auth_config": {
      "type": "oauth2",
      "oauth_scopes": ["read:jira-work", "write:jira-work"]
    }
  }
}
\`\`\`

### PM Sync API Endpoints

**Import from external tool:**
\`\`\`javascript
POST /pm/import
Headers: Authorization: Bearer <api_key>
Body: {
  "resource": "issue",
  "field_mappings": { ... }
}
Response: {
  "items": [
    { "id": "PROJ-123", "summary": "Task title", ... }
  ]
}
\`\`\`

**Export to external tool:**
\`\`\`javascript
POST /pm/export
Headers: Authorization: Bearer <api_key>
Body: {
  "resource": "issue",
  "items": [
    { "summary": "New task", "description": "Details", ... }
  ]
}
Response: { "count": 5, "created": ["PROJ-124", ...] }
\`\`\`

### Conflict Resolution Strategies

- **latest_wins:** Most recent modification wins
- **external_wins:** External PM tool data takes precedence
- **flashfusion_wins:** FlashFusion data takes precedence
- **manual_review:** Flag conflicts for user resolution

---

## Custom AI Model Registration

Register custom generative AI models for use in Media Studio and Workflow stages:

### AI Model Configuration

\`\`\`json
{
  "ai_model_config": {
    "model_type": "custom",
    "custom_type_name": "SuperGen AI",
    "api_endpoint": "https://api.supergen.ai/v1/generate",
    "authentication_type": "api_key",
    "capabilities": [
      "image_generation",
      "video_generation",
      "text_generation"
    ],
    "streaming_supported": true,
    "max_tokens": 8000,
    "pricing_per_request": 0.05,
    "input_schema": {
      "type": "object",
      "properties": {
        "prompt": { "type": "string" },
        "style": { "type": "string", "enum": ["photorealistic", "artistic", "cinematic"] },
        "resolution": { "type": "string", "enum": ["1024x1024", "1920x1080", "4K"] }
      },
      "required": ["prompt"]
    },
    "output_schema": {
      "type": "object",
      "properties": {
        "media_url": { "type": "string" },
        "metadata": { "type": "object" }
      }
    }
  }
}
\`\`\`

### Model Invocation from Media Studio

Users can select your model from the Media Studio:

\`\`\`javascript
// FlashFusion will call your endpoint:
POST https://api.supergen.ai/v1/generate
Headers: {
  "Authorization": "Bearer <user_plugin_api_key>",
  "Content-Type": "application/json"
}
Body: {
  "prompt": "A cinematic sunset over mountains",
  "style": "photorealistic",
  "resolution": "4K"
}

// Your response:
{
  "media_url": "https://cdn.supergen.ai/generated/abc123.jpg",
  "metadata": {
    "generation_time_ms": 2500,
    "model_version": "v2.1",
    "seed": 42
  }
}
\`\`\`

### Model Invocation from Workflows

Custom AI models appear as workflow nodes:

\`\`\`javascript
// Workflow node configuration
{
  "type": "ai_generation",
  "plugin_id": "your-plugin-id",
  "model": "SuperGen AI",
  "input": {
    "prompt": "{{workflow.variables.prompt}}",
    "style": "cinematic",
    "resolution": "1920x1080"
  },
  "output_variable": "generated_media"
}
\`\`\`

### Streaming Response Support

For long-running generations, support streaming:

\`\`\`javascript
// SSE streaming response
POST /generate?stream=true

// Stream progress updates:
data: {"status": "processing", "progress": 0.25}
data: {"status": "processing", "progress": 0.50}
data: {"status": "processing", "progress": 0.75}
data: {"status": "complete", "media_url": "...", "progress": 1.0}
\`\`\`

---

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
| \`security_analysis\` | Trigger security scans and access results |
| \`custom_ui\` | Embed custom UI components in FlashFusion |

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