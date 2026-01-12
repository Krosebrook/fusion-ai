import { useState } from "react";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  FileText, Loader2, CheckCircle, Download, TrendingUp, 
  Target, Mail, Share2, Search, Megaphone, Copy, Eye 
} from "lucide-react";
import { motion } from "framer-motion";

export default function MarketingSuitePage() {
  const [config, setConfig] = useState({
    contentType: 'blog-post',
    topic: '',
    audience: '',
    tone: 'professional',
    keywords: '',
    length: 'medium',
    includeCallToAction: true,
    includeSEO: true
  });
  
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('create');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!config.topic || !config.audience) {
      alert('Please provide topic and target audience');
      return;
    }

    setGenerating(true);
    setProgress(0);
    setActiveTab('preview');

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const contentTypeMap = {
        'blog-post': 'Blog Post',
        'social-media': 'Social Media Campaign',
        'email-campaign': 'Email Marketing Campaign',
        'landing-page': 'Landing Page Copy',
        'product-description': 'Product Description',
        'press-release': 'Press Release',
        'ad-copy': 'Advertisement Copy'
      };

      const lengthMap = {
        'short': '300-500 words',
        'medium': '800-1200 words',
        'long': '1500-2500 words'
      };

      const prompt = `Create a high-quality, SEO-optimized ${contentTypeMap[config.contentType]} with the following specifications:

Topic: ${config.topic}

Target Audience: ${config.audience}

Tone: ${config.tone}

Content Length: ${lengthMap[config.length]}

${config.keywords ? `Primary Keywords: ${config.keywords}` : ''}

Requirements:
1. Create engaging, conversion-focused content that resonates with the target audience
2. ${config.includeSEO ? 'Include SEO optimization with meta title, meta description, and keyword placement' : 'Focus on readability and engagement'}
3. ${config.includeCallToAction ? 'Include a compelling call-to-action (CTA)' : 'No CTA needed'}
4. Use persuasive copywriting techniques
5. Structure content with clear headings and subheadings
6. Make it scannable with bullet points where appropriate
7. Include emotional hooks and value propositions

${config.contentType === 'social-media' ? `
Create multiple versions for different platforms:
- Twitter/X (280 characters, engaging hook)
- LinkedIn (professional, value-focused)
- Facebook (conversational, community-building)
- Instagram (visual description + hashtags)
` : ''}

${config.contentType === 'email-campaign' ? `
Include:
- Attention-grabbing subject line (5-7 variations)
- Preview text
- Email body with proper formatting
- Personalization placeholders
- CTA button copy
` : ''}

${config.contentType === 'landing-page' ? `
Include:
- Headline and subheadline
- Hero section copy
- Features/benefits section
- Social proof section
- FAQ section
- Final CTA section
` : ''}

Format the output professionally with clear sections.`;

      const response = await InvokeLLM({ prompt });
      
      clearInterval(progressInterval);
      setProgress(100);

      // Generate SEO analysis if requested
      let seoAnalysis = null;
      if (config.includeSEO) {
        const seoPrompt = `Analyze this marketing content for SEO optimization:

${response}

Provide:
1. SEO Score (0-100)
2. Keyword density analysis
3. Readability score
4. Suggestions for improvement
5. Recommended schema markup
6. Social media preview optimization

Format as a clear, actionable report.`;

        seoAnalysis = await InvokeLLM({ prompt: seoPrompt });
      }

      setGenerated({
        content: response,
        seoAnalysis: seoAnalysis,
        config: config,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error generating content:", error);
      alert('Error generating marketing content. Please try again.');
    } finally {
      clearInterval(progressInterval);
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generated) return;
    
    try {
      await navigator.clipboard.writeText(generated.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    if (!generated) return;
    
    const content = `${generated.content}\n\n${generated.seoAnalysis ? `\n\nSEO ANALYSIS:\n${generated.seoAnalysis}` : ''}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketing-content-${config.contentType}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const contentTypes = [
    { value: 'blog-post', label: 'Blog Post', icon: FileText },
    { value: 'social-media', label: 'Social Media Campaign', icon: Share2 },
    { value: 'email-campaign', label: 'Email Campaign', icon: Mail },
    { value: 'landing-page', label: 'Landing Page', icon: Target },
    { value: 'product-description', label: 'Product Description', icon: TrendingUp },
    { value: 'press-release', label: 'Press Release', icon: Megaphone },
    { value: 'ad-copy', label: 'Advertisement Copy', icon: Target }
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
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
            }}>
              <Megaphone size={28} style={{ color: '#FFFFFF' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: '800',
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Marketing Suite
              </h1>
              <p style={{ fontSize: '16px', color: '#94A3B8' }}>
                Create SEO-optimized marketing content and high-converting campaigns with AI
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1 mb-8">
            <TabsTrigger 
              value="create" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500"
            >
              <FileText className="w-4 h-4 mr-2" />
              Create Content
            </TabsTrigger>
            <TabsTrigger 
              value="preview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview & SEO
            </TabsTrigger>
          </TabsList>

          {/* Create Content Tab */}
          <TabsContent value="create">
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
                        marginBottom: '12px', 
                        color: '#E2E8F0',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Content Type
                      </label>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '8px' 
                      }}>
                        {contentTypes.map(type => {
                          const IconComponent = type.icon;
                          return (
                            <button
                              key={type.value}
                              onClick={() => setConfig({ ...config, contentType: type.value })}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px',
                                background: config.contentType === type.value 
                                  ? 'rgba(16, 185, 129, 0.2)' 
                                  : 'rgba(30, 41, 59, 0.5)',
                                border: config.contentType === type.value
                                  ? '2px solid rgba(16, 185, 129, 0.5)'
                                  : '1px solid rgba(71, 85, 105, 0.5)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: '13px',
                                color: '#E2E8F0',
                                fontWeight: config.contentType === type.value ? '600' : '400'
                              }}
                            >
                              <IconComponent className="w-4 h-4" />
                              {type.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        color: '#E2E8F0',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Topic / Subject *
                      </label>
                      <Input
                        placeholder="e.g., AI-powered project management tools"
                        value={config.topic}
                        onChange={(e) => setConfig({ ...config, topic: e.target.value })}
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
                        Target Audience *
                      </label>
                      <Textarea
                        placeholder="Describe your target audience: demographics, interests, pain points..."
                        value={config.audience}
                        onChange={(e) => setConfig({ ...config, audience: e.target.value })}
                        rows={3}
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
                        <Search className="inline w-4 h-4 mr-2" />
                        Keywords (SEO)
                      </label>
                      <Input
                        placeholder="Comma-separated keywords: AI tools, productivity, automation"
                        value={config.keywords}
                        onChange={(e) => setConfig({ ...config, keywords: e.target.value })}
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
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
                        Tone of Voice
                      </label>
                      <Select 
                        value={config.tone} 
                        onValueChange={(value) => setConfig({ ...config, tone: value })}
                      >
                        <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual & Friendly</SelectItem>
                          <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                          <SelectItem value="authoritative">Authoritative</SelectItem>
                          <SelectItem value="empathetic">Empathetic</SelectItem>
                          <SelectItem value="humorous">Humorous</SelectItem>
                          <SelectItem value="inspirational">Inspirational</SelectItem>
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
                        Content Length
                      </label>
                      <Select 
                        value={config.length} 
                        onValueChange={(value) => setConfig({ ...config, length: value })}
                      >
                        <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short (300-500 words)</SelectItem>
                          <SelectItem value="medium">Medium (800-1200 words)</SelectItem>
                          <SelectItem value="long">Long (1500-2500 words)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '12px', 
                        color: '#E2E8F0',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Options
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            background: 'rgba(30, 41, 59, 0.5)',
                            border: '1px solid rgba(71, 85, 105, 0.5)',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={config.includeSEO}
                            onChange={(e) => setConfig({ ...config, includeSEO: e.target.checked })}
                            style={{ cursor: 'pointer' }}
                          />
                          <div>
                            <div style={{ fontSize: '14px', color: '#E2E8F0', fontWeight: '600' }}>
                              SEO Optimization
                            </div>
                            <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                              Include meta tags, keywords, and SEO analysis
                            </div>
                          </div>
                        </label>

                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            background: 'rgba(30, 41, 59, 0.5)',
                            border: '1px solid rgba(71, 85, 105, 0.5)',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={config.includeCallToAction}
                            onChange={(e) => setConfig({ ...config, includeCallToAction: e.target.checked })}
                            style={{ cursor: 'pointer' }}
                          />
                          <div>
                            <div style={{ fontSize: '14px', color: '#E2E8F0', fontWeight: '600' }}>
                              Call-to-Action (CTA)
                            </div>
                            <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                              Add compelling CTA for conversions
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div style={{
                      padding: '16px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      marginTop: '12px'
                    }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#10B981', marginBottom: '8px' }}>
                        💡 Pro Tips
                      </h4>
                      <ul style={{ fontSize: '12px', color: '#94A3B8', lineHeight: '1.6', paddingLeft: '20px' }}>
                        <li>Be specific about your audience's pain points</li>
                        <li>Use keywords naturally in your topic description</li>
                        <li>Choose tone that matches your brand voice</li>
                        <li>Include relevant industry terms in keywords</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                  <Button
                    onClick={handleGenerate}
                    disabled={generating || !config.topic || !config.audience}
                    style={{
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      color: 'white',
                      padding: '12px 48px',
                      fontSize: '16px',
                      fontWeight: '600',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: generating ? 'not-allowed' : 'pointer',
                      opacity: (generating || !config.topic || !config.audience) ? 0.6 : 1,
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                        Generating Content...
                      </>
                    ) : (
                      <>
                        <Megaphone className="w-5 h-5 mr-2 inline" />
                        Generate Marketing Content
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
              {generating && (
                <Card className="p-8 bg-slate-800/50 border-slate-700">
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Loader2 className="w-16 h-16 mx-auto mb-6 animate-spin text-green-500" />
                    <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#E2E8F0', marginBottom: '12px' }}>
                      Crafting Your Marketing Content...
                    </h3>
                    <p style={{ fontSize: '16px', color: '#94A3B8', marginBottom: '24px' }}>
                      Creating engaging copy and optimizing for SEO
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
                        background: 'linear-gradient(90deg, #10B981, #059669)',
                        transition: 'width 0.3s ease',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <p style={{ marginTop: '12px', fontSize: '14px', color: '#64748B' }}>
                      {progress}% complete
                    </p>
                  </div>
                </Card>
              )}

              {!generating && !generated && (
                <Card className="p-8 bg-slate-800/50 border-slate-700">
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Megaphone className="w-16 h-16 mx-auto mb-6 text-green-500" />
                    <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#E2E8F0', marginBottom: '12px' }}>
                      Ready to Create
                    </h3>
                    <p style={{ fontSize: '16px', color: '#94A3B8' }}>
                      Configure your content settings and generate professional marketing materials
                    </p>
                  </div>
                </Card>
              )}

              {!generating && generated && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Content Card */}
                  <Card className="p-8 bg-slate-800/50 border-slate-700">
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
                            Content Generated Successfully
                          </h3>
                          <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>
                            {generated.config.contentType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} • {generated.config.tone}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                          onClick={handleCopy}
                          style={{
                            background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                            border: copied ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(139, 92, 246, 0.5)',
                            color: copied ? '#10B981' : '#A78BFA',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copied ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button
                          onClick={handleDownload}
                          style={{
                            background: 'rgba(16, 185, 129, 0.2)',
                            border: '1px solid rgba(16, 185, 129, 0.5)',
                            color: '#10B981',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(71, 85, 105, 0.5)',
                      borderRadius: '8px',
                      padding: '24px',
                      maxHeight: '500px',
                      overflowY: 'auto'
                    }}>
                      <pre style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontSize: '15px',
                        lineHeight: '1.8',
                        color: '#E2E8F0',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        margin: 0
                      }}>
                        {generated.content}
                      </pre>
                    </div>
                  </Card>

                  {/* SEO Analysis Card */}
                  {generated.seoAnalysis && (
                    <Card className="p-8 bg-slate-800/50 border-slate-700">
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '20px'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #10B981, #059669)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Search size={20} style={{ color: '#FFFFFF' }} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#E2E8F0' }}>
                          SEO Analysis & Recommendations
                        </h3>
                      </div>

                      <div style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(71, 85, 105, 0.5)',
                        borderRadius: '8px',
                        padding: '20px',
                        maxHeight: '400px',
                        overflowY: 'auto'
                      }}>
                        <pre style={{
                          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                          fontSize: '13px',
                          lineHeight: '1.6',
                          color: '#94A3B8',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          margin: 0
                        }}>
                          {generated.seoAnalysis}
                        </pre>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}