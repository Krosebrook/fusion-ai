/**
 * First A/B Test Guide Component
 * 
 * Step-by-step guided creation of the user's first A/B test.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { AuditService } from '@/components/services/AuditService';

const TEST_STEPS = [
  {
    id: 'name',
    title: 'Name Your Test',
    description: 'Give your test a clear, descriptive name.',
    placeholder: 'e.g., "Homepage CTA Button Color"',
  },
  {
    id: 'description',
    title: 'What Are You Testing?',
    description: 'Describe what you\'re testing and why.',
    placeholder: 'e.g., "Testing red vs blue button to improve conversion"',
  },
  {
    id: 'variants',
    title: 'Define Your Variants',
    description: 'Control (A) is your current version. Test (B) is your variation.',
  },
];

export function FirstABTestGuide({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const createTestMutation = useMutation({
    mutationFn: async () => {
      const test = await base44.entities.ABTestConfig.create({
        name: formData.name,
        description: formData.description,
        pipeline_id: 'onboarding-sample',
        variant_a_id: 'control-variant',
        variant_b_id: 'test-variant',
        status: 'draft',
        traffic_split: {
          variant_a_percentage: 50,
          variant_b_percentage: 50,
          split_strategy: 'percentage',
        },
        success_criteria: [
          {
            metric: 'success_rate',
            operator: 'higher_is_better',
            threshold: 5,
            weight: 1,
          },
        ],
        auto_promote: {
          enabled: true,
          confidence_level: 0.95,
          min_samples: 1000,
          promotion_delay_hours: 24,
        },
      });

      // Log audit event
      await AuditService.logTestCreated(test.id, formData.name, test);

      return test;
    },
    onSuccess: () => {
      toast.success('Your first test created! 🎉');
      setTimeout(() => onComplete(), 1500);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create test');
    },
  });

  const handleNext = () => {
    if (currentStep < TEST_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (!formData.name) {
        toast.error('Test name is required');
        return;
      }
      createTestMutation.mutate();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = TEST_STEPS[currentStep];
  const progress = ((currentStep + 1) / TEST_STEPS.length) * 100;

  return (
    <div className="space-y-8">
      {/* Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Create Your First Test</h3>
          <span className="text-sm text-white/60">Step {currentStep + 1} of {TEST_STEPS.length}</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
          />
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        key={step.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <CinematicCard className="p-8">
          <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
          <p className="text-white/70 mb-6">{step.description}</p>

          {/* Step Content */}
          {step.id === 'name' && (
            <div className="space-y-4">
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={step.placeholder}
                className="bg-slate-800/50 border-white/10 text-white text-lg py-3"
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30"
              >
                <p className="text-cyan-300 text-sm">
                  💡 Good test names are specific and action-oriented. Avoid generic names like "Test 1".
                </p>
              </motion.div>
            </div>
          )}

          {step.id === 'description' && (
            <div className="space-y-4">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={step.placeholder}
                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-white/10 text-white placeholder:text-white/40 resize-none"
                rows={4}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30"
              >
                <p className="text-blue-300 text-sm">
                  📝 Include the business hypothesis. Why do you think this change will improve your metric?
                </p>
              </motion.div>
            </div>
          )}

          {step.id === 'variants' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border-2 border-green-500/50 bg-green-500/10">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Variant A (Control)
                  </h4>
                  <p className="text-white/70 text-sm">
                    Your current version. This is the baseline for comparison.
                  </p>
                </div>
                <div className="p-4 rounded-lg border-2 border-cyan-500/50 bg-cyan-500/10">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    Variant B (Test)
                  </h4>
                  <p className="text-white/70 text-sm">
                    Your experimental version with the proposed changes.
                  </p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30"
              >
                <p className="text-purple-300 text-sm">
                  ⚡ Pro Tip: Split traffic 50/50 to get the most statistical power. Once you have enough samples, you can analyze the results and promote the winner.
                </p>
              </motion.div>
            </div>
          )}
        </CinematicCard>
      </motion.div>

      {/* Test Preview */}
      {formData.name && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CinematicCard className="p-6 border-l-4 border-l-cyan-500">
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-3">
              Preview
            </h4>
            <div className="space-y-2">
              <p className="text-white">
                <span className="text-white/60">Name: </span>
                <span className="font-semibold">{formData.name}</span>
              </p>
              {formData.description && (
                <p className="text-white">
                  <span className="text-white/60">Description: </span>
                  <span className="font-semibold">{formData.description}</span>
                </p>
              )}
              <p className="text-white/60 text-sm mt-3">
                ✓ Ready to create? We'll set this to draft mode so you can review it first.
              </p>
            </div>
          </CinematicCard>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          variant="outline"
          className="border-white/20"
        >
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={createTestMutation.isPending}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center gap-2"
        >
          {createTestMutation.isPending ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : currentStep === TEST_STEPS.length - 1 ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Create Test
            </>
          ) : (
            'Next'
          )}
        </Button>
      </div>
    </div>
  );
}