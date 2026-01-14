import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { GitBranch } from 'lucide-react';
import { CinematicCard } from '../components/atoms/CinematicCard';
import { toast } from 'sonner';
import { ABTestScenarios } from '../components/user-journey/ABTestScenarios';
import { PresetCard } from '../components/user-journey/PresetCard';
import { JourneyConfig } from '../components/user-journey/JourneyConfig';
import { AnalysisResults } from '../components/user-journey/AnalysisResults';
import { JOURNEY_PRESETS, USER_ROLES, FLOW_TYPES } from '../components/user-journey/constants';

export default function UserJourneyAnalyzerPage() {
  const [selectedRole, setSelectedRole] = useState('user');
  const [selectedFlow, setSelectedFlow] = useState('onboarding');
  const [customPrompt, setCustomPrompt] = useState('');
  const [conversation, setConversation] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [abTestScenarios, setAbTestScenarios] = useState(null);
  const [generatingTests, setGeneratingTests] = useState(false);

  const agentName = 'UserJourneyMapper';

  const handlePresetSelect = (presetKey) => {
    const preset = JOURNEY_PRESETS[presetKey];
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
          : `Analyze the ${FLOW_TYPES[selectedFlow]} for a ${USER_ROLES[selectedRole].label} role. Map out the complete user journey, identify all friction points, and generate a visual flowchart with specific recommendations for optimization.`);

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

  const generateABTests = async () => {
    if (!conversation?.messages?.length) {
      toast.error('No analysis available to generate tests from');
      return;
    }

    setGeneratingTests(true);
    try {
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      const analysisContent = lastMessage.role === 'assistant' ? lastMessage.content : '';

      const { generateABTestScenarios } = await import('@/functions/generateABTestScenarios');
      const result = await generateABTestScenarios({
        analysisContent,
        role: selectedRole,
        flow: selectedFlow
      });

      if (result.scenarios && result.scenarios.length > 0) {
        setAbTestScenarios(result.scenarios);
        toast.success(`Generated ${result.scenarios.length} A/B test scenarios`);
      } else {
        toast.error('No test scenarios could be generated');
      }
    } catch (error) {
      console.error('Failed to generate A/B tests:', error);
      toast.error('Failed to generate A/B test scenarios');
    } finally {
      setGeneratingTests(false);
    }
  };

  const handleSimulateTest = (scenario) => {
    toast.success(`Starting simulation for: ${scenario.frictionPoint}`, {
      description: 'Test simulation would be configured here with analytics tracking'
    });
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
            {Object.entries(JOURNEY_PRESETS).map(([key, preset]) => (
              <PresetCard
                key={key}
                presetKey={key}
                preset={preset}
                isSelected={selectedPreset === key}
                onSelect={handlePresetSelect}
              />
            ))}
          </div>

          {selectedPreset && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearPreset}
              className="border-white/10"
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
          
          <JourneyConfig
            selectedRole={selectedRole}
            selectedFlow={selectedFlow}
            selectedPreset={selectedPreset}
            customPrompt={customPrompt}
            analyzing={analyzing}
            onRoleChange={setSelectedRole}
            onFlowChange={setSelectedFlow}
            onPromptChange={setCustomPrompt}
            onStartAnalysis={handleStartAnalysis}
          />
        </CinematicCard>

        {/* Results Panel */}
        {conversation && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CinematicCard className="p-6">
                <AnalysisResults
                  conversation={conversation}
                  generatingTests={generatingTests}
                  onCopy={copyToClipboard}
                  onGenerateTests={generateABTests}
                />
              </CinematicCard>
            </motion.div>
          </AnimatePresence>
        )}

        {/* A/B Test Scenarios */}
        {abTestScenarios && abTestScenarios.length > 0 && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ABTestScenarios 
                scenarios={abTestScenarios}
                onSimulate={handleSimulateTest}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}