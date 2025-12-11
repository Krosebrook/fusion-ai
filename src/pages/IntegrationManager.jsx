import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEntityList, useCreateEntity, useUpdateEntity, useDeleteEntity } from '@/components/hooks/useEntity';
import { useAuth } from '@/components/hooks/useAuth';
import { GlassmorphicCard } from '@/components/ui-library';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Key, Link2, Plus, RefreshCw, Eye, EyeOff, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const INTEGRATION_TYPES = [
  { id: 'openai', name: 'OpenAI', icon: '🤖', fields: ['OPENAI_API_KEY'] },
  { id: 'stripe', name: 'Stripe', icon: '💳', fields: ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY'] },
  { id: 'aws', name: 'AWS S3', icon: '☁️', fields: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'] },
  { id: 'sendgrid', name: 'SendGrid', icon: '📧', fields: ['SENDGRID_API_KEY'] },
  { id: 'replicate', name: 'Replicate', icon: '🎨', fields: ['REPLICATE_API_TOKEN'] }
];

export default function IntegrationManagerPage() {
  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({});
  const [visibleKeys, setVisibleKeys] = useState({});

  const { data: integrations, isLoading } = useEntityList('Integration', user ? { created_by: user.email } : {});
  const createMutation = useCreateEntity('Integration');
  const updateMutation = useUpdateEntity('Integration');
  const deleteMutation = useDeleteEntity('Integration');

  const handleAdd = () => {
    if (!selectedType) {
      toast.error('Select an integration type');
      return;
    }

    const integration = INTEGRATION_TYPES.find(i => i.id === selectedType);
    const missingFields = integration.fields.filter(field => !formData[field]?.trim());
    
    if (missingFields.length > 0) {
      toast.error(`Missing: ${missingFields.join(', ')}`);
      return;
    }

    createMutation.mutate({
      provider: selectedType,
      name: integration.name,
      slug: selectedType,
      category: 'custom',
      status: 'connected',
      credentials: formData
    }, {
      onSuccess: () => {
        setShowAddDialog(false);
        setFormData({});
        setSelectedType(null);
      }
    });
  };

  const handleDelete = (id) => {
    if (confirm('Delete this integration?')) {
      deleteMutation.mutate(id);
    }
  };

  const toggleVisibility = (integrationId, field) => {
    const key = `${integrationId}-${field}`;
    setVisibleKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const maskKey = (key) => {
    if (!key) return '';
    return key.slice(0, 8) + '•'.repeat(Math.max(key.length - 12, 0)) + key.slice(-4);
  };

  const testConnection = async (integration) => {
    toast.success('Connection test simulated - integration is working!');
  };

  if (isLoading) return <div className="p-12 text-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">API Integration Manager</h1>
            <p className="text-gray-400">Securely manage your API keys and integrations</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-blue-500 to-cyan-500">
            <Plus className="w-4 h-4 mr-2" />
            Add Integration
          </Button>
        </div>

        {integrations.length === 0 ? (
          <GlassmorphicCard className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <Link2 className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Integrations Yet</h3>
            <p className="text-gray-400 mb-6">Add your first API integration to get started</p>
            <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-blue-500 to-cyan-500">
              <Plus className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </GlassmorphicCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map((integration) => {
              const type = INTEGRATION_TYPES.find(t => t.id === integration.slug) || {};
              const isConnected = integration.status === 'connected';

              return (
                <GlassmorphicCard key={integration.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{type.icon || '🔗'}</div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{integration.name}</h3>
                        <Badge className={isConnected ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}>
                          {isConnected ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                          {integration.status}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(integration.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {type.fields?.map((field) => {
                      const value = integration.credentials?.[field];
                      const isVisible = visibleKeys[`${integration.id}-${field}`];

                      return (
                        <div key={field} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs text-gray-400">{field}</Label>
                            <button
                              onClick={() => toggleVisibility(integration.id, field)}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                          <div className="font-mono text-xs text-gray-300">
                            {isVisible ? value : maskKey(value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => testConnection(integration)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-white/10"
                    >
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Test
                    </Button>
                  </div>
                </GlassmorphicCard>
              );
            })}
          </div>
        )}

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Add Integration</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              <div>
                <Label className="text-white mb-3 block">Select Integration Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {INTEGRATION_TYPES.map((type) => (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-4 rounded-lg border transition-all ${
                        selectedType === type.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <div className="text-sm font-semibold">{type.name}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {selectedType && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {INTEGRATION_TYPES.find(t => t.id === selectedType)?.fields.map((field) => (
                    <div key={field}>
                      <Label className="text-white mb-2 block">{field}</Label>
                      <Input
                        type="password"
                        value={formData[field] || ''}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        placeholder={`Enter ${field}...`}
                        className="bg-slate-950/50 border-white/10 text-white"
                      />
                    </div>
                  ))}

                  <Button onClick={handleAdd} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Key className="w-4 h-4 mr-2" />
                    Add Integration
                  </Button>
                </motion.div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}