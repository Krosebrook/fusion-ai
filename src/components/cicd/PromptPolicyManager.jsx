/**
 * Prompt Policy Manager - Define and manage governance policies
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, Save, Trash2, CheckCircle, Shield, 
  FileText, Lock
} from 'lucide-react';
import { toast } from 'sonner';

export function PromptPolicyManager() {
  const [policies, setPolicies] = useState([
    {
      id: 'mandatory-review',
      name: 'Mandatory Code Review',
      description: 'All prompt changes require at least 1 approved review',
      type: 'review',
      enabled: true,
      config: { min_approvals: 1, required_reviewers: [] }
    },
    {
      id: 'max-length',
      name: 'Maximum Prompt Length',
      description: 'Prompts cannot exceed 2000 tokens',
      type: 'validation',
      enabled: true,
      config: { max_tokens: 2000 }
    },
    {
      id: 'no-pii',
      name: 'PII Detection',
      description: 'Block prompts containing personally identifiable information',
      type: 'security',
      enabled: true,
      config: { patterns: ['email', 'phone', 'ssn', 'credit_card'] }
    },
    {
      id: 'version-control',
      name: 'Version Control Required',
      description: 'All prompts must have version history and change summaries',
      type: 'compliance',
      enabled: true,
      config: { require_change_summary: true, min_summary_length: 10 }
    }
  ]);

  const [showNewPolicy, setShowNewPolicy] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    description: '',
    type: 'validation',
    enabled: true
  });

  const togglePolicy = (policyId) => {
    setPolicies(prev => prev.map(p => 
      p.id === policyId ? { ...p, enabled: !p.enabled } : p
    ));
    toast.success('Policy updated');
  };

  const deletePolicy = (policyId) => {
    setPolicies(prev => prev.filter(p => p.id !== policyId));
    toast.success('Policy deleted');
  };

  const addPolicy = () => {
    if (!newPolicy.name || !newPolicy.description) {
      toast.error('Name and description required');
      return;
    }

    const policy = {
      ...newPolicy,
      id: newPolicy.name.toLowerCase().replace(/\s+/g, '-'),
      config: {}
    };

    setPolicies(prev => [...prev, policy]);
    setNewPolicy({ name: '', description: '', type: 'validation', enabled: true });
    setShowNewPolicy(false);
    toast.success('Policy created');
  };

  const getPolicyIcon = (type) => {
    const icons = {
      review: FileText,
      validation: CheckCircle,
      security: Shield,
      compliance: Lock
    };
    return icons[type] || CheckCircle;
  };

  const getPolicyColor = (type) => {
    const colors = {
      review: 'from-blue-500 to-cyan-500',
      validation: 'from-green-500 to-emerald-500',
      security: 'from-red-500 to-pink-500',
      compliance: 'from-purple-500 to-indigo-500'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Policy Management</h2>
          <p className="text-white/60 text-sm">Define governance rules for prompt deployments</p>
        </div>
        <Button 
          onClick={() => setShowNewPolicy(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Policy
        </Button>
      </div>

      {/* New Policy Form */}
      <AnimatePresence>
        {showNewPolicy && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CinematicCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Create New Policy</h3>
              <div className="space-y-4">
                <Input
                  placeholder="Policy Name"
                  value={newPolicy.name}
                  onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
                <Textarea
                  placeholder="Description"
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
                <select
                  value={newPolicy.type}
                  onChange={(e) => setNewPolicy({ ...newPolicy, type: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value="validation">Validation</option>
                  <option value="review">Review</option>
                  <option value="security">Security</option>
                  <option value="compliance">Compliance</option>
                </select>
                <div className="flex gap-2">
                  <Button onClick={addPolicy} className="flex-1 bg-green-600">
                    <Save className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                  <Button 
                    onClick={() => setShowNewPolicy(false)} 
                    variant="outline"
                    className="flex-1 border-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CinematicCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Policies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policies.map((policy, idx) => {
          const Icon = getPolicyIcon(policy.type);
          return (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <CinematicCard className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getPolicyColor(policy.type)} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{policy.name}</p>
                      <p className="text-white/60 text-sm mt-1">{policy.description}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deletePolicy(policy.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className="text-xs capitalize">{policy.type}</Badge>
                  <button
                    onClick={() => togglePolicy(policy.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      policy.enabled
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {policy.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </CinematicCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}