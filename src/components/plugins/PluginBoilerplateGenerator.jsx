/**
 * Plugin Boilerplate Generator
 * Generates starter code for plugin development
 */

import { useState } from 'react';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

const pluginTemplates = {
  'custom-ai-model': {
    name: 'Custom AI Model',
    files: ['server.js', 'manifest.json', 'README.md'],
  },
  'dashboard-widget': {
    name: 'Dashboard Widget',
    files: ['index.html', 'widget.js', 'styles.css', 'manifest.json'],
  },
  'workflow-integration': {
    name: 'Workflow Integration',
    files: ['server.js', 'webhooks.js', 'manifest.json', 'README.md'],
  },
  'security-scanner': {
    name: 'Security Scanner',
    files: ['server.js', 'scanner.js', 'manifest.json', 'README.md'],
  },
};

export function PluginBoilerplateGenerator() {
  const [config, setConfig] = useState({
    name: '',
    slug: '',
    type: 'custom-ai-model',
    description: '',
    includeUI: false,
    includeWebhooks: false,
    includeTests: false,
  });

  const generateBoilerplate = () => {
    if (!config.name || !config.slug) {
      toast.error('Plugin name and slug are required');
      return;
    }

    const manifest = {
      name: config.name,
      slug: config.slug,
      version: '1.0.0',
      description: config.description || `A custom FlashFusion plugin`,
      author: 'Your Name',
      category: config.type.includes('ai') ? 'ai_model' : 'integration',
      permissions: {
        read_workflows: true,
        execute_workflows: config.type === 'workflow-integration',
        ai_model_access: config.type === 'custom-ai-model',
        custom_ui: config.includeUI,
      },
      api_endpoint: 'http://localhost:3000',
      webhook_url: config.includeWebhooks ? 'http://localhost:3000/webhooks' : null,
    };

    const serverCode = `// FlashFusion Plugin Server
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', plugin: '${config.name}' });
});

${config.type === 'custom-ai-model' ? `
// AI Model endpoint
app.post('/generate', async (req, res) => {
  const { prompt, max_tokens = 1000 } = req.body;
  
  // TODO: Implement your AI model logic here
  const result = {
    text: 'Generated response for: ' + prompt,
    tokens: max_tokens,
  };
  
  res.json(result);
});
` : ''}

${config.includeWebhooks ? `
// Webhook handler
app.post('/webhooks', (req, res) => {
  const { event, data } = req.body;
  console.log('Webhook received:', event, data);
  
  // TODO: Handle webhook events
  
  res.json({ success: true });
});
` : ''}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`🚀 Plugin server running on http://localhost:\${PORT}\`);
});
`;

    const readme = `# ${config.name}

${config.description || 'A FlashFusion plugin'}

## Installation

\`\`\`bash
npm install
npm start
\`\`\`

## Configuration

Update \`manifest.json\` with your plugin details.

## Development

1. Start the dev server: \`npm start\`
2. Test locally with FlashFusion Dev Studio
3. Deploy to production when ready

## API Endpoints

${config.type === 'custom-ai-model' ? '- `POST /generate` - Generate AI completions' : ''}
${config.includeWebhooks ? '- `POST /webhooks` - Handle FlashFusion events' : ''}

## License

MIT
`;

    const packageJson = {
      name: config.slug,
      version: '1.0.0',
      description: config.description,
      main: 'server.js',
      scripts: {
        start: 'node server.js',
        dev: 'nodemon server.js',
      },
      dependencies: {
        express: '^4.18.2',
        cors: '^2.8.5',
      },
      devDependencies: {
        nodemon: '^3.0.1',
      },
    };

    // Create downloadable zip
    const files = {
      'manifest.json': JSON.stringify(manifest, null, 2),
      'server.js': serverCode,
      'README.md': readme,
      'package.json': JSON.stringify(packageJson, null, 2),
    };

    if (config.includeUI) {
      files['index.html'] = `<!DOCTYPE html>
<html>
<head>
  <title>${config.name}</title>
  <style>
    body { font-family: system-ui; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${config.name}</h1>
    <p>Plugin UI Component</p>
  </div>
  <script>
    // Listen for config from FlashFusion
    window.addEventListener('message', (event) => {
      if (event.data.type === 'CONFIG') {
        console.log('Received config:', event.data.config);
      }
    });
  </script>
</body>
</html>`;
    }

    // Download as text files
    Object.entries(files).forEach(([filename, content]) => {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    });

    toast.success('✨ Plugin boilerplate generated!');
  };

  return (
    <CinematicCard className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Generate Plugin Boilerplate</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <Label className="text-white mb-2">Plugin Name</Label>
          <Input
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            placeholder="My Awesome Plugin"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div>
          <Label className="text-white mb-2">Slug (URL-safe)</Label>
          <Input
            value={config.slug}
            onChange={(e) => setConfig({ ...config, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
            placeholder="my-awesome-plugin"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="md:col-span-2">
          <Label className="text-white mb-2">Description</Label>
          <Input
            value={config.description}
            onChange={(e) => setConfig({ ...config, description: e.target.value })}
            placeholder="What does your plugin do?"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div>
          <Label className="text-white mb-2">Plugin Type</Label>
          <Select value={config.type} onValueChange={(type) => setConfig({ ...config, type })}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(pluginTemplates).map(([key, template]) => (
                <SelectItem key={key} value={key}>{template.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-3">
          <Label className="text-white">Additional Features</Label>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={config.includeUI}
              onCheckedChange={(checked) => setConfig({ ...config, includeUI: checked })}
            />
            <span className="text-white/70 text-sm">Custom UI Component</span>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={config.includeWebhooks}
              onCheckedChange={(checked) => setConfig({ ...config, includeWebhooks: checked })}
            />
            <span className="text-white/70 text-sm">Webhook Support</span>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={config.includeTests}
              onCheckedChange={(checked) => setConfig({ ...config, includeTests: checked })}
            />
            <span className="text-white/70 text-sm">Test Files</span>
          </div>
        </div>
      </div>

      <CinematicButton
        icon={Download}
        onClick={generateBoilerplate}
        glow
      >
        Generate & Download
      </CinematicButton>
    </CinematicCard>
  );
}

export default PluginBoilerplateGenerator;