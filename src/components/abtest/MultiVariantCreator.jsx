/**
 * Multi-Variant Creator — Create A/B/C/D/... tests with N variants
 * Extends ABTestCreator to support unlimited variants
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_VARIANT = { name: '', description: '', config: {} };

export function MultiVariantCreator({ onCreated, onDismiss }) {
  const queryClient = useQueryClient();
  const [testName, setTestName] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [variants, setVariants] = useState([
    { ...DEFAULT_VARIANT, name: 'Control' },
    { ...DEFAULT_VARIANT, name: 'Variant A' }
  ]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Calculate equal traffic split
      const splitPercent = Math.floor(100 / variants.length);
      const trafficSplit = {};
      variants.forEach((v, i) => {
        trafficSplit[v.name] = i === variants.length - 1 
          ? 100 - (splitPercent * (variants.length - 1)) // Give remainder to last variant
          : splitPercent;
      });

      return await base44.entities.ABTestConfig.create({
        name: data.name,
        description: data.description,
        variants: data.variants,
        traffic_split: trafficSplit,
        success_criteria: {
          primary_metric: 'conversion_rate',
          target_improvement: 10,
          minimum_sample_size: 1000,
          confidence_threshold: 0.95
        },
        auto_promotion: {
          enabled: true,
          confidence_threshold: 0.95,
          minimum_sample_size: 1000
        },
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      toast.success('Multi-variant test created successfully');
      if (onCreated) onCreated();
    },
    onError: (error) => {
      toast.error(`Failed to create test: ${error.message}`);
    }
  });

  const addVariant = () => {
    const letter = String.fromCharCode(65 + variants.length - 1); // A, B, C, D...
    setVariants([...variants, { ...DEFAULT_VARIANT, name: `Variant ${letter}` }]);
  };

  const removeVariant = (index) => {
    if (variants.length <= 2) {
      toast.error('Must have at least 2 variants');
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleSubmit = () => {
    if (!testName.trim()) {
      toast.error('Test name is required');
      return;
    }
    if (variants.some(v => !v.name.trim())) {
      toast.error('All variants must have names');
      return;
    }
    createMutation.mutate({
      name: testName,
      description: testDescription,
      variants
    });
  };

  return (
    <CinematicCard className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Create Multi-Variant Test</h2>
          <p className="text-sm text-white/60">Test up to 26 variants simultaneously (A-Z)</p>
        </div>
        <Button
          onClick={onDismiss}
          variant="ghost"
          size="icon"
          className="text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Test Details */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm font-medium text-white/80 mb-2 block">Test Name</label>
          <Input
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Homepage Hero Test"
            className="bg-white/5 border-white/20 text-white"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-white/80 mb-2 block">Description</label>
          <Textarea
            value={testDescription}
            onChange={(e) => setTestDescription(e.target.value)}
            placeholder="Testing different hero section layouts..."
            rows={3}
            className="bg-white/5 border-white/20 text-white"
          />
        </div>
      </div>

      {/* Variants */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Variants ({variants.length})
          </h3>
          <Button
            onClick={addVariant}
            disabled={variants.length >= 26}
            variant="outline"
            size="sm"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Variant
          </Button>
        </div>

        {variants.length >= 26 && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
            <p className="text-xs text-yellow-300">Maximum 26 variants reached (A-Z)</p>
          </div>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          <AnimatePresence>
            {variants.map((variant, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <Input
                      value={variant.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      placeholder={`Variant ${String.fromCharCode(65 + index)}`}
                      className="bg-white/5 border-white/20 text-white font-medium"
                    />
                    <Textarea
                      value={variant.description}
                      onChange={(e) => updateVariant(index, 'description', e.target.value)}
                      placeholder="Describe this variant..."
                      rows={2}
                      className="bg-white/5 border-white/20 text-white text-sm"
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">
                        Traffic Split: {Math.floor(100 / variants.length)}%
                      </span>
                      {index === 0 && (
                        <span className="text-cyan-400 font-medium">Control Variant</span>
                      )}
                    </div>
                  </div>
                  {index > 0 && (
                    <Button
                      onClick={() => removeVariant(index)}
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <p className="text-sm text-white/60">
          All variants will receive equal traffic distribution
        </p>
        <div className="flex gap-3">
          <Button
            onClick={onDismiss}
            variant="outline"
            className="border-white/20 text-white/80"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || !testName.trim()}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            {createMutation.isPending ? (
              <>Creating...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Test
              </>
            )}
          </Button>
        </div>
      </div>
    </CinematicCard>
  );
}