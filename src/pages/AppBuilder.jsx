import { useState } from "react";
import { InvokeLLM } from "@/integrations/Core";
import { Project } from "@/entities/Project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, Loader2, CheckCircle, Download, Eye } from "lucide-react";

export default function AppBuilderPage() {
  const [config, setConfig] = useState({
    appName: '',
    description: '',
    frontend: 'React',
    backend: 'Node.js',
    database: 'PostgreSQL',
    styling: 'Tailwind CSS'
  });
  
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    if (!config.appName || !config.description) {
      alert('Please provide app name and description');
      return;
    }

    setGenerating(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const prompt = `Generate a complete full-stack application structure for: ${config.appName}

Description: ${config.description}

Tech Stack:
- Frontend: ${config.frontend}
- Backend: ${config.backend}
- Database: ${config.database}
- Styling: ${config.styling}

Provide:
1. Complete project structure (folders and files)
2. Frontend components (at least 3 main components)
3. Backend API routes (at least 3 endpoints)
4. Database schema
5. Package.json dependencies
6. README with setup instructions

Format as a detailed technical specification with code snippets.`;

      const response = await InvokeLLM({ prompt });
      
      clearInterval(progressInterval);
      setProgress(100);

      const project = await Project.create({
        name: config.appName,
        type: 'full_stack_app',
        status: 'completed',
        configuration: config,
        output_data: { specification: response }
      });

      setGenerated({
        id: project.id,
        specification: response
      });
    } catch (error) {
      console.error("Error generating app:", error);
      alert('Error generating application. Please try again.');
    } finally {
      clearInterval(progressInterval);
      setGenerating(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }} className="ff-fade-in">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FF7B0020, #FF7B0010)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Code size={28} style={{ color: '#FF7B00' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: '800',
                marginBottom: '8px'
              }}>
                Full-Stack App Builder
              </h1>
              <p style={{ fontSize: '16px', color: '#94A3B8' }}>
                Generate production-ready applications in minutes
              </p>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: generated ? '1fr 1fr' : '1fr',
          gap: '32px'
        }}>
          {/* Configuration Panel */}
          <div className="ff-card" style={{ padding: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '24px',
              color: '#FFFFFF'
            }}>
              App Configuration
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#CBD5E1'
                }}>
                  Application Name *
                </label>
                <Input
                  value={config.appName}
                  onChange={(e) => setConfig({ ...config, appName: e.target.value })}
                  placeholder="e.g., Task Manager Pro"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#CBD5E1'
                }}>
                  Description *
                </label>
                <Textarea
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  placeholder="Describe what your app should do..."
                  rows={4}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#CBD5E1'
                  }}>
                    Frontend Framework
                  </label>
                  <Select
                    value={config.frontend}
                    onValueChange={(value) => setConfig({ ...config, frontend: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="React">React</SelectItem>
                      <SelectItem value="Vue.js">Vue.js</SelectItem>
                      <SelectItem value="Angular">Angular</SelectItem>
                      <SelectItem value="Svelte">Svelte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#CBD5E1'
                  }}>
                    Backend Framework
                  </label>
                  <Select
                    value={config.backend}
                    onValueChange={(value) => setConfig({ ...config, backend: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Node.js">Node.js (Express)</SelectItem>
                      <SelectItem value="Python">Python (FastAPI)</SelectItem>
                      <SelectItem value="Go">Go</SelectItem>
                      <SelectItem value="Ruby">Ruby on Rails</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#CBD5E1'
                  }}>
                    Database
                  </label>
                  <Select
                    value={config.database}
                    onValueChange={(value) => setConfig({ ...config, database: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                      <SelectItem value="MongoDB">MongoDB</SelectItem>
                      <SelectItem value="MySQL">MySQL</SelectItem>
                      <SelectItem value="SQLite">SQLite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#CBD5E1'
                  }}>
                    Styling
                  </label>
                  <Select
                    value={config.styling}
                    onValueChange={(value) => setConfig({ ...config, styling: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tailwind CSS">Tailwind CSS</SelectItem>
                      <SelectItem value="Material-UI">Material-UI</SelectItem>
                      <SelectItem value="Bootstrap">Bootstrap</SelectItem>
                      <SelectItem value="Styled Components">Styled Components</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="ff-btn-primary ff-glow-orange"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {generating ? (
                  <>
                    <Loader2 className="animate-spin" style={{ marginRight: '8px' }} size={20} />
                    Generating... {progress}%
                  </>
                ) : (
                  <>
                    <Code style={{ marginRight: '8px' }} size={20} />
                    Generate Application
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Output Panel */}
          {generated && (
            <div className="ff-card" style={{ padding: '32px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle size={24} style={{ color: '#10B981' }} />
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#FFFFFF'
                  }}>
                    Application Generated!
                  </h2>
                </div>
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '12px',
                padding: '24px',
                maxHeight: '500px',
                overflowY: 'auto',
                marginBottom: '24px',
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#CBD5E1',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {generated.specification}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Button className="ff-btn-secondary" style={{ flex: 1 }}>
                  <Download size={18} style={{ marginRight: '8px' }} />
                  Download
                </Button>
                <Button className="ff-btn-secondary" style={{ flex: 1 }}>
                  <Eye size={18} style={{ marginRight: '8px' }} />
                  Preview
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}