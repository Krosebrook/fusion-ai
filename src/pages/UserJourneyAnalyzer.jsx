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
  const [selectedPreset, setSelectedPreset] = useState(null);
  const queryClient = useQueryClient();

  const agentName = 'UserJourneyMapper';

  const presets = {
    'first-recognition': {
      name: 'New User First-Time Recognition',
      role: 'user',
      flow: 'recognition',
      icon: '🎉',
      description: 'User discovers and sends their first recognition to a colleague',
      prompt: `Analyze the complete journey of a brand new user discovering and sending their first recognition. Map the flow from: 
1. Landing on the platform (post-onboarding)
2. Discovering the recognition feature (navigation, tooltips, prompts)
3. Understanding what recognition is and why to use it
4. Finding a colleague to recognize
5. Composing their first recognition message
6. Selecting rewards/badges (if applicable)
7. Sending and confirmation
8. Post-send experience (notifications, social proof)

Identify friction points such as: unclear CTAs, difficulty finding colleagues, uncertainty about what to write, technical barriers, lack of encouragement to complete the action. Generate a detailed Mermaid flowchart with decision points, potential dead ends, and success metrics.`
    },
    'admin-dispute': {
      name: 'Admin Dispute Resolution',
      role: 'admin',
      flow: 'moderation',
      icon: '⚖️',
      description: 'Admin handles a flagged content dispute between users',
      prompt: `Analyze the complete admin workflow for resolving a content dispute or moderation case:
1. Receiving notification of flagged content
2. Accessing the moderation queue/dashboard
3. Reviewing the flagged content and context (original post, reporter's reason, user history)
4. Investigating additional evidence (user profiles, previous incidents, community guidelines)
5. Making a decision (approve, remove, warn, ban)
6. Documenting the decision with reasoning
7. Communicating with involved parties
8. Implementing the decision (content removal, user sanctions)
9. Following up and monitoring

Identify friction points: insufficient context, unclear guidelines, lack of tools for investigation, difficult communication interfaces, no audit trail, excessive steps. Generate a detailed Mermaid flowchart highlighting decision branches and potential escalation paths.`
    },
    'owner-gamification': {
      name: 'Owner Gamification Setup',
      role: 'owner',
      flow: 'gamification',
      icon: '🎮',
      description: 'Owner configures complex gamification rules for the first time',
      prompt: `Analyze the complete owner journey for setting up a comprehensive gamification system from scratch:
1. Accessing gamification settings/configuration
2. Understanding available gamification mechanics (points, badges, leaderboards, levels)
3. Defining point rules (what actions earn points, how many)
4. Creating custom badges with criteria
5. Configuring leaderboards (timeframes, visibility, categories)
6. Setting up level thresholds and rewards
7. Testing the configuration with sample scenarios
8. Publishing/activating the gamification system
9. Monitoring initial user engagement and metrics

Identify friction points: complex configuration interfaces, lack of templates/presets, unclear impact preview, difficulty testing before launch, no validation of rule conflicts, missing documentation. Generate a detailed Mermaid flowchart with configuration steps, validation gates, and rollback points.`
    },
    'multi-role-recognition': {
      name: 'Cross-Department Recognition Flow',
      role: 'user',
      flow: 'recognition',
      icon: '🤝',
      description: 'User sends recognition across departments with approval workflow',
      prompt: `Analyze the complex journey of sending recognition that requires cross-departmental approval:
1. User identifies someone from another department to recognize
2. Searches/finds the person in the system
3. Composes recognition with specific achievements
4. Selects reward tier (triggering approval requirement)
5. Submission and notification to approvers
6. Approval workflow (manager review, budget check, HR approval)
7. Notification back to original user
8. Final delivery to recipient
9. Social sharing and celebration

Identify friction points: confusing approval requirements, lack of visibility into approval status, unclear budget constraints, lost context during approvals, delayed notifications, abandonment during waiting periods. Generate a detailed Mermaid flowchart showing parallel approval paths and timeout scenarios.`
    },
    'onboarding-activation': {
      name: 'Complete User Onboarding to Activation',
      role: 'user',
      flow: 'onboarding',
      icon: '🚀',
      description: 'New user journey from signup through first meaningful action',
      prompt: `Analyze the critical activation journey from initial signup to first value realization:
1. Landing page arrival and signup decision
2. Account creation (email, OAuth, form fields)
3. Email verification and first login
4. Profile setup (photo, bio, department, role)
5. Product tour/walkthrough
6. Connecting with colleagues (imports, search, suggestions)
7. Understanding the value proposition
8. Taking first meaningful action (give recognition, join challenge, etc.)
9. Receiving first notification/engagement
10. Returning for second session

Identify friction points: lengthy signup forms, unclear value proposition, overwhelming feature tours, difficulty finding relevant connections, lack of immediate value, poor mobile experience, confusing next steps. Generate a detailed Mermaid flowchart with drop-off points, intervention opportunities, and success indicators.`
    },
    'admin-bulk-actions': {
      name: 'Admin Bulk User Management',
      role: 'admin',
      flow: 'custom',
      icon: '👥',
      description: 'Admin performs bulk operations on user accounts',
      prompt: `Analyze the admin workflow for performing bulk operations on multiple user accounts:
1. Accessing user management dashboard
2. Defining selection criteria (department, role, activity level, date joined)
3. Previewing affected users
4. Selecting bulk action (role change, deactivation, messaging, export)
5. Confirming action with safeguards
6. Processing and progress tracking
7. Handling errors/exceptions
8. Reviewing completion report
9. Undoing if needed

Identify friction points: unclear selection criteria, no preview of impact, accidental actions, slow processing, lack of progress visibility, inadequate error handling, no undo option, missing audit logs. Generate a detailed Mermaid flowchart with safety checks and rollback procedures.`
    }
  };

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

  const handlePresetSelect = (presetKey) => {
    const preset = presets[presetKey];
    setSelectedPreset(presetKey);
    setSelectedRole(preset.role);
    setSelectedFlow(preset.flow);
    setCustomPrompt(preset.prompt);
    toast.success(`Loaded preset: ${preset.name}`);
  };

  const handleClearPreset = () => {
    setSelectedPreset(null);
    setCustomPrompt('');
  };

  const handleStartAnalysis = async () => {
    setAnalyzing(true);
    try {
      const conv = await base44.agents.createConversation({
        agent_name: agentName,
        metadata: {
          role: selectedRole,
          flow: selectedFlow,
          preset: selectedPreset,
          timestamp: new Date().toISOString()
        }
      });
      
      setConversation(conv);

      const prompt = customPrompt || 
        (selectedFlow === 'custom' 
          ? 'Please describe the user flow you want to analyze.'
          : `Analyze the ${flows[selectedFlow]} for a ${roles[selectedRole].label} role. Map out the complete user journey, identify all friction points, and generate a visual flowchart with specific recommendations for optimization.`);

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

        {/* Presets Grid */}
        <CinematicCard className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Start Presets</h2>
          <p className="text-white/60 text-sm mb-6">Select a complex scenario to analyze with pre-configured settings</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Object.entries(presets).map(([key, preset]) => (
              <motion.button
                key={key}
                onClick={() => handlePresetSelect(key)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border text-left transition-all ${
                  selectedPreset === key
                    ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
                    : 'bg-slate-800/30 border-white/10 hover:border-purple-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{preset.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                      {preset.name}
                    </h3>
                    <p className="text-white/60 text-xs mb-2 line-clamp-2">
                      {preset.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs bg-slate-700/50 border-white/10">
                        {roles[preset.role].label}
                      </Badge>
                      {selectedPreset === key && (
                        <CheckCircle className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {selectedPreset && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearPreset}
              className="border-white/10 mb-4"
            >
              Clear Preset
            </Button>
          )}
        </CinematicCard>

        {/* Configuration Panel */}
        <CinematicCard className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            {selectedPreset ? 'Review Configuration' : 'Custom Configuration'}
          </h2>
          
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

          {(selectedFlow === 'custom' || selectedPreset) && (
            <div className="mb-6">
              <label className="text-sm text-white/60 mb-2 block">
                {selectedPreset ? 'Preset Prompt (Edit if needed)' : 'Custom Flow Description'}
              </label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe the custom user flow you want to analyze..."
                className="bg-slate-800/50 border-white/10 text-white min-h-[120px]"
              />
            </div>
          )}

          <Button
            onClick={handleStartAnalysis}
            disabled={analyzing || (selectedFlow === 'custom' && !customPrompt && !selectedPreset)}
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