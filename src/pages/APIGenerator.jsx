import { useState } from "react";
import { InvokeLLM } from "@/integrations/Core";
import { Project } from "@/entities/Project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Cpu, Loader2, CheckCircle, Download, Eye, Code, Shield, Database, FileCode } from "lucide-react";
import { motion } from "framer-motion";

export default function APIGeneratorPage() {
  const [config, setConfig] = useState({
    apiName: '',
    description: '',
    framework: 'Express.js',
    database: 'PostgreSQL',
    authentication: 'JWT',
    endpoints: '',
    features: []
  });
  
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('config');

  const handleFeatureToggle = (feature) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleGenerate = async () => {
    if (!config.apiName || !config.description) {
      alert('Please provide API name and description');
      return;
    }

    setGenerating(true);
    setProgress(0);
    setActiveTab('preview');

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const prompt = `Generate a complete production-ready RESTful API for: ${config.apiName}

Description: ${config.description}

Tech Stack:
- Framework: ${config.framework}
- Database: ${config.database}
- Authentication: ${config.authentication}

Endpoints to implement:
${config.endpoints || 'Generate standard CRUD endpoints'}

Additional Features:
${config.features.length > 0 ? config.features.join(', ') : 'None'}

Provide:
1. Complete API structure with organized folders
2. Authentication middleware and configuration
3. Database models/schemas for ${config.database}
4. API route handlers with full implementation
5. Error handling middleware
6. Input validation schemas
7. API documentation (OpenAPI/Swagger format)
8. Environment configuration template
9. Package.json with all dependencies
10. README with setup and usage instructions

Format the response with clear code blocks and file paths.`;

      const response = await InvokeLLM({ prompt });
      
      clearInterval(progressInterval);
      setProgress(100);

      const project = await Project.create({
        name: config.apiName,
        type: 'api',
        status: 'completed',
        configuration: config,
        output_data: { 
          specification: response,
          framework: config.framework,
          database: config.database,
          authentication: config.authentication
        }
      });

      setGenerated({
        id: project.id,
        specification: response
      });
    } catch (error) {
      console.error("Error generating API:", error);
      alert('Error generating API. Please try again.');
    } finally {
      clearInterval(progressInterval);
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generated) return;
    
    const blob = new Blob([generated.specification], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.apiName}-api-specification.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const featureOptions = [
    { id: 'rate-limiting', label: 'Rate Limiting' },
    { id: 'caching', label: 'Response Caching' },
    { id: 'logging', label: 'Request Logging' },
    { id: 'cors', label: 'CORS Configuration' },
    { id: 'pagination', label: 'Pagination Support' },
    { id: 'filtering', label: 'Advanced Filtering' },
    { id: 'versioning', label: 'API Versioning' },
    { id: 'webhooks', label: 'Webhook Support' }
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '48px' }} 
          className="ff-fade-in"
        >
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
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)'
            }}>
              <Cpu size={28} style={{ color: '#FFFFFF' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: '800',
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                API Generator
              </h1>
              <p style={{ fontSize: '16px', color: '#94A3B8' }}>
                Generate production-ready RESTful APIs with authentication and documentation
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1 mb-8">
            <TabsTrigger 
              value="config" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500"
            >
              <Code className="w-4 h-4 mr-2" />
              Configuration
            </TabsTrigger>
            <TabsTrigger 
              value="preview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500"
            >
              <Eye className="w-4 h-4 mr-2" />
              Generated API
            </TabsTrigger>
          </TabsList>

          {/* Configuration Tab */}
          <TabsContent value="config">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 bg-slate-800/50 border-slate-700">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {/* Left Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        color: '#E2E8F0',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        API Name *
                      </label>
                      <Input
                        placeholder="e.g., E-commerce API, Blog API, etc."
                        value={config.apiName}
                        onChange={(e) => setConfig({ ...config, apiName: e.target.value })}
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        color: '#E2E8F0',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Description *
                      </label>
                      <Textarea
                        placeholder="Describe your API's purpose and main functionality..."
                        value={config.description}
                        onChange={(e) => setConfig({ ...config, description: e.target.value })}
                        rows={4}
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        color: '#E2E8F0',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        <Database className="inline w-4 h-4 mr-2" />
                        Framework
                      </label>
                      <Select 
                        value={config.framework} 
                        onValueChange={(value) => setConfig({ ...config, framework: value })}
                      >
                        <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Express.js">Express.js (Node.js)</SelectItem>
                          <SelectItem value="FastAPI">FastAPI (Python)</SelectItem>
                          <SelectItem value="Django REST">Django REST (Python)</SelectItem>
                          <SelectItem value="Flask">Flask (Python)</SelectItem>
                          <SelectItem value="NestJS">NestJS (Node.js/TypeScript)</SelectItem>
                          <SelectItem value="Spring Boot">Spring Boot (Java)</SelectItem>
                          <SelectItem value="ASP.NET Core">ASP.NET Core (C#)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        color: '#E2E8F0',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        <Database className="inline w-4 h-4 mr-2" />
                        Database
                      </label>
                      <Select 
                        value={config.database} 
                        onValueChange={(value) => setConfig({ ...config, database: value })}
                      >
                        <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                          <SelectItem value="MongoDB">MongoDB</SelectItem>
                          <SelectItem value="MySQL">MySQL</SelectItem>
                          <SelectItem value="SQLite">SQLite</SelectItem>
                          <SelectItem value="Redis">Redis</SelectItem>
                          <SelectItem value="DynamoDB">DynamoDB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        color: '#E2E8F0',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        <Shield className="inline w-4 h-4 mr-2" />
                        Authentication
                      </label>
                      <Select 
                        value={config.authentication} 
                        onValueChange={(value) => setConfig({ ...config, authentication: value })}
                      >
                        <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="JWT">JWT (JSON Web Tokens)</SelectItem>
                          <SelectItem value="OAuth2">OAuth 2.0</SelectItem>
                          <SelectItem value="API Key">API Key</SelectItem>
                          <SelectItem value="Session">Session-based</SelectItem>
                          <SelectItem value="Basic Auth">Basic Auth</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        color: '#E2E8F0',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        <FileCode className="inline w-4 h-4 mr-2" />
                        Endpoints
                      </label>
                      <Textarea
                        placeholder="List your API endpoints (one per line)&#10;e.g.:&#10;GET /users&#10;POST /users&#10;GET /users/:id&#10;PUT /users/:id&#10;DELETE /users/:id"
                        value={config.endpoints}
                        onChange={(e) => setConfig({ ...config, endpoints: e.target.value })}
                        rows={8}
                        className="bg-slate-900/50 border-slate-600 text-white font-mono text-sm"
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '12px', 
                        color: '#E2E8F0',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Additional Features
                      </label>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '8px' 
                      }}>
                        {featureOptions.map(feature => (
                          <label
                            key={feature.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 12px',
                              background: config.features.includes(feature.id) 
                                ? 'rgba(139, 92, 246, 0.2)' 
                                : 'rgba(30, 41, 59, 0.5)',
                              border: config.features.includes(feature.id)
                                ? '1px solid rgba(139, 92, 246, 0.5)'
                                : '1px solid rgba(71, 85, 105, 0.5)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={config.features.includes(feature.id)}
                              onChange={() => handleFeatureToggle(feature.id)}
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '13px', color: '#E2E8F0' }}>
                              {feature.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                  <Button
                    onClick={handleGenerate}
                    disabled={generating || !config.apiName || !config.description}
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                      color: 'white',
                      padding: '12px 48px',
                      fontSize: '16px',
                      fontWeight: '600',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: generating ? 'not-allowed' : 'pointer',
                      opacity: (generating || !config.apiName || !config.description) ? 0.6 : 1,
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                    }}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                        Generating API...
                      </>
                    ) : (
                      <>
                        <Cpu className="w-5 h-5 mr-2 inline" />
                        Generate API
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 bg-slate-800/50 border-slate-700">
                {generating && (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Loader2 className="w-16 h-16 mx-auto mb-6 animate-spin text-purple-500" />
                    <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#E2E8F0', marginBottom: '12px' }}>
                      Generating Your API...
                    </h3>
                    <p style={{ fontSize: '16px', color: '#94A3B8', marginBottom: '24px' }}>
                      Creating routes, authentication, database models, and documentation
                    </p>
                    <div style={{
                      width: '100%',
                      maxWidth: '400px',
                      height: '8px',
                      background: 'rgba(30, 41, 59, 0.5)',
                      borderRadius: '4px',
                      margin: '0 auto',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #8B5CF6, #6366F1)',
                        transition: 'width 0.3s ease',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <p style={{ marginTop: '12px', fontSize: '14px', color: '#64748B' }}>
                      {progress}% complete
                    </p>
                  </div>
                )}

                {!generating && !generated && (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Cpu className="w-16 h-16 mx-auto mb-6 text-purple-500" />
                    <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#E2E8F0', marginBottom: '12px' }}>
                      Ready to Generate
                    </h3>
                    <p style={{ fontSize: '16px', color: '#94A3B8' }}>
                      Configure your API settings and click Generate to create your production-ready API
                    </p>
                  </div>
                )}

                {!generating && generated && (
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '24px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid rgba(71, 85, 105, 0.5)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <div>
                          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#E2E8F0' }}>
                            API Generated Successfully
                          </h3>
                          <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>
                            {config.apiName} • {config.framework} • {config.database}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleDownload}
                        style={{
                          background: 'rgba(139, 92, 246, 0.2)',
                          border: '1px solid rgba(139, 92, 246, 0.5)',
                          color: '#A78BFA',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>

                    <div style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(71, 85, 105, 0.5)',
                      borderRadius: '8px',
                      padding: '24px',
                      maxHeight: '600px',
                      overflowY: 'auto'
                    }}>
                      <pre style={{
                        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        color: '#E2E8F0',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        margin: 0
                      }}>
                        {generated.specification}
                      </pre>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}