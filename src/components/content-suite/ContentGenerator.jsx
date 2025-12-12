import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassmorphicCard } from "@/components/ui-library/GlassmorphicCard";
import { Loader2, Copy, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CONTENT_TYPES = [
  { value: 'marketing', label: 'Marketing Copy', prompt: 'compelling marketing copy that drives conversions' },
  { value: 'technical', label: 'Technical Documentation', prompt: 'clear, comprehensive technical documentation' },
  { value: 'social', label: 'Social Media Posts', prompt: 'engaging social media content optimized for platform algorithms' },
  { value: 'blog', label: 'Blog Article', prompt: 'well-researched, SEO-optimized blog article' },
  { value: 'email', label: 'Email Campaign', prompt: 'persuasive email marketing content' },
  { value: 'press', label: 'Press Release', prompt: 'professional press release following AP style' }
];

const TONES = ['Professional', 'Friendly', 'Authoritative', 'Casual', 'Enthusiastic', 'Empathetic'];
const AUDIENCES = ['General Public', 'Developers', 'Business Executives', 'Marketing Professionals', 'Students', 'Enterprise Clients'];

export default function ContentGenerator() {
  const [contentType, setContentType] = useState('marketing');
  const [tone, setTone] = useState('Professional');
  const [audience, setAudience] = useState('General Public');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [wordCount, setWordCount] = useState('500');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please provide a topic');
      return;
    }

    setGenerating(true);
    const selectedType = CONTENT_TYPES.find(t => t.value === contentType);

    try {
      const prompt = `Generate ${selectedType.prompt} with the following specifications:

Topic: ${topic}
Target Audience: ${audience}
Tone: ${tone}
Target Word Count: ${wordCount} words
${keywords ? `Keywords to include: ${keywords}` : ''}

CINEMATIC BRAND VOICE:
- Use vivid, cinematic language that evokes visual imagery
- Reference photography/film concepts naturally (e.g., "bringing your vision into focus," "capturing the moment")
- Maintain the sophistication of a creative studio while being approachable
- Think Space Grotesk headlines with Inter body copy - bold yet readable

Please format professionally with clear sections, compelling headlines, and a strong call-to-action where appropriate.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: contentType === 'blog' || contentType === 'technical'
      });

      setGeneratedContent(result);
      toast.success('Content generated successfully!');
    } catch (error) {
      toast.error('Generation failed: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Content copied to clipboard!');
  };

  const downloadContent = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contentType}-content-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Content downloaded!');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: generatedContent ? '1fr 1fr' : '1fr', gap: '32px' }}>
      {/* Configuration Panel */}
      <GlassmorphicCard className="p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-orange-400" />
          Content Configuration
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Content Type
            </label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Topic / Subject *
            </label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Launch of AI-powered design platform"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Target Audience
              </label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map(aud => (
                    <SelectItem key={aud} value={aud}>{aud}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Tone
              </label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Keywords (optional)
            </label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="AI, design, automation (comma-separated)"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Target Word Count
            </label>
            <Select value={wordCount} onValueChange={setWordCount}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="250">250 words</SelectItem>
                <SelectItem value="500">500 words</SelectItem>
                <SelectItem value="1000">1000 words</SelectItem>
                <SelectItem value="1500">1500 words</SelectItem>
                <SelectItem value="2000">2000 words</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-lg py-6 hover:opacity-90"
          >
            {generating ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Generating Content...
              </>
            ) : (
              <>
                <Sparkles className="mr-2" size={20} />
                Generate Content
              </>
            )}
          </Button>
        </div>
      </GlassmorphicCard>

      {/* Output Panel */}
      {generatedContent && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassmorphicCard className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Generated Content</h2>
              <div className="flex gap-2">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <Copy size={16} className="mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={downloadContent}
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
              </div>
            </div>

            <div 
              className="bg-black/30 rounded-xl p-6 max-h-[600px] overflow-y-auto"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#CBD5E1'
              }}
            >
              <ReactQuill
                value={generatedContent}
                onChange={setGeneratedContent}
                theme="snow"
                modules={{
                  toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link'],
                    ['clean']
                  ]
                }}
              />
            </div>
          </GlassmorphicCard>
        </motion.div>
      )}
    </div>
  );
}