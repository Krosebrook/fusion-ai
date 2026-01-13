import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  GitBranch, Users, Shield, Crown, TrendingUp, 
  AlertCircle, CheckCircle, Zap, MessageSquare, 
  Download, Copy, Eye
} from 'lucide-react';
import { CinematicCard } from '../components/atoms/CinematicCard';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { MermaidDiagram } from '../components/visualization/MermaidDiagram';

export default function UserJourneyAnalyzerPage() {
  const [selectedRole, setSelectedRole] = useState('user');
  const [selectedFlow, setSelectedFlow] = useState('onboarding');
  const [customPrompt, setCustomPrompt] = useState('');
  const [conversation, setConversation] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  const agentName = 'UserJourneyMapper';

  const flows = {
    onboarding: 'User Onboarding Journey',
    recognition: 'Giving Recognition Flow',
    moderation: 'Content Moderation Review',
    gamification: 'Gamification Rule Configuration',
    custom: 'Custom Flow Analysis'
  };

  const roles = {
    user: { icon: Users, color: 'from-blue-500 to-cyan-500', label: 'User' },
    admin: { icon: Shield, color: 'from-purple-500 to-pink-500', label: 'Admin' },
    owner: { icon: Crown, color: 'from-orange-500 to-amber-500', label: 'Owner' }
  };

  const handleStartAnalysis = async () => {
    setAnalyzing(true);
    try {
      const conv = await base44.agents.createConversation({
        agent_name: agentName,
        metadata: {
          role: selectedRole,
          flow: selectedFlow,
          timestamp: new Date().toISOString()
        }
      });
      
      setConversation(conv);

      const prompt = selectedFlow === 'custom' && customPrompt
        ? customPrompt
        : `Analyze the ${flows[selectedFlow]} for a ${roles[selectedRole].label} role. Map out the complete user journey, identify all friction points, and generate a visual flowchart with specific recommendations for optimization.`;

      await base44.agents.addMessage(conv, {
        role: 'user',
        content: prompt
      });

      toast.success('Analysis started');
    } catch (error) {
      console.error('Failed to start analysis:', error);
      toast.error('Failed to start analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  useEffect(() => {
    if (!conversation) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setConversation(data);
    });

    return unsubscribe;
  }, [conversation?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-2xl blur-3xl" />
          <div className="relative flex items-center justify-between p-8 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl">
            <div className="flex items-center gap-6">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-2xl"
              >
                <GitBranch className="w-10 h-10 text-white" />
              </motion.div>
              <div>
                <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
                  User Journey Analyzer
                </h1>
                <p className="text-white/60 text-lg">
                  AI-powered flow mapping with friction detection
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Configuration Panel */}
        <CinematicCard className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Configure Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Role Selection */}
            <div>
              <label className="text-sm text-white/60 mb-2 block">User Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="bg-slate-800/50 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  {Object.entries(roles).map(([key, role]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <role.icon className="w-4 h-4" />
                        {role.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Flow Selection */}
            <div>
              <label className="text-sm text-white/60 mb-2 block">User Flow</label>
              <Select value={selectedFlow} onValueChange={setSelectedFlow}>
                <SelectTrigger className="bg-slate-800/50 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  {Object.entries(flows).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedFlow === 'custom' && (
            <div className="mb-6">
              <label className="text-sm text-white/60 mb-2 block">Custom Flow Description</label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe the custom user flow you want to analyze..."
                className="bg-slate-800/50 border-white/10 text-white min-h-[100px]"
              />
            </div>
          )}

          <Button
            onClick={handleStartAnalysis}
            disabled={analyzing || (selectedFlow === 'custom' && !customPrompt)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {analyzing ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-pulse" />
                Analyzing Journey...
              </>
            ) : (
              <>
                <GitBranch className="w-4 h-4 mr-2" />
                Start Analysis
              </>
            )}
          </Button>
        </CinematicCard>

        {/* Results Panel */}
        {conversation && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CinematicCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(conversation.messages?.[conversation.messages.length - 1]?.content || '')}
                      className="border-white/10"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {conversation.messages?.map((message, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-500/10 border border-blue-500/20' 
                          : 'bg-slate-800/50 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {message.role === 'user' ? (
                          <MessageSquare className="w-4 h-4 text-blue-400" />
                        ) : (
                          <GitBranch className="w-4 h-4 text-purple-400" />
                        )}
                        <span className="text-sm text-white/60 capitalize">{message.role}</span>
                      </div>
                      <ReactMarkdown 
                        className="prose prose-invert prose-sm max-w-none"
                        components={{
                          code: ({ inline, className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || '');
                            if (!inline && match && match[1] === 'mermaid') {
                              return <MermaidDiagram chart={String(children).trim()} />;
                            }
                            return inline ? (
                              <code className="bg-slate-700 px-1 py-0.5 rounded text-sm" {...props}>
                                {children}
                              </code>
                            ) : (
                              <pre className="bg-slate-900 p-4 rounded-lg overflow-auto">
                                <code {...props}>{children}</code>
                              </pre>
                            );
                          }
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ))}
                </div>
              </CinematicCard>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}