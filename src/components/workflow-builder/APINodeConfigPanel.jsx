/**
 * API Node Configuration Panel
 * Visual editor for API calls with data mapping
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { CinematicInput } from '../atoms/CinematicInput';
import { CinematicBadge } from '../atoms/CinematicBadge';
import { 
  X, Plus, Trash2, Key, ArrowRight, Sparkles, Copy, Lock, Search 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiConnectorTemplates } from './APIConnectorTemplates';
import { cn } from '@/lib/utils';

export function APINodeConfigPanel({ nodeData, onSave, onClose }) {
  const [config, setConfig] = useState(nodeData.config || {
    connector: 'rest_api',
    action: 'custom_post',
    endpoint: '',
    method: 'POST',
    headers: {},
    body: {},
    queryParams: {},
    dataMapping: [],
    responseMapping: [],
    outputVariable: 'api_result',
  });

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const [showEndpointDiscovery, setShowEndpointDiscovery] = useState(false);
  const [discoveredEndpoints, setDiscoveredEndpoints] = useState([]);

  const handleTemplateSelect = (connectorKey, actionId) => {
    const connector = apiConnectorTemplates[connectorKey];
    const action = connector.actions.find(a => a.id === actionId);
    
    if (action) {
      setConfig({
        ...config,
        connector: connectorKey,
        action: actionId,
        endpoint: action.endpoint,
        method: action.method,
        headers: action.headers || {},
        body: action.bodyTemplate || {},
        queryParams: action.queryParams || {},
      });
      setSelectedTemplate({ connector: connectorKey, action: actionId });
    }
  };

  const handleAddHeader = () => {
    if (newHeaderKey && newHeaderValue) {
      setConfig({
        ...config,
        headers: {
          ...config.headers,
          [newHeaderKey]: newHeaderValue,
        },
      });
      setNewHeaderKey('');
      setNewHeaderValue('');
    }
  };

  const handleRemoveHeader = (key) => {
    const newHeaders = { ...config.headers };
    delete newHeaders[key];
    setConfig({ ...config, headers: newHeaders });
  };

  const handleAddDataMapping = () => {
    setConfig({
      ...config,
      dataMapping: [
        ...config.dataMapping,
        { from: '', to: '', transform: '' },
      ],
    });
  };

  const handleUpdateDataMapping = (index, field, value) => {
    const updated = [...config.dataMapping];
    updated[index][field] = value;
    setConfig({ ...config, dataMapping: updated });
  };

  const handleRemoveDataMapping = (index) => {
    setConfig({
      ...config,
      dataMapping: config.dataMapping.filter((_, i) => i !== index),
    });
  };

  const handleDiscoverEndpoints = async () => {
    if (!config.endpoint) return;
    
    setShowEndpointDiscovery(true);
    
    // Simulate API discovery - in production, this would call OpenAPI/Swagger endpoints
    try {
      const baseUrl = new URL(config.endpoint).origin;
      
      // Mock discovered endpoints based on common patterns
      const mockEndpoints = [
        { path: '/api/v1/users', method: 'GET', description: 'List users' },
        { path: '/api/v1/users', method: 'POST', description: 'Create user' },
        { path: '/api/v1/users/{id}', method: 'GET', description: 'Get user by ID' },
        { path: '/api/v1/users/{id}', method: 'PUT', description: 'Update user' },
        { path: '/api/v1/users/{id}', method: 'DELETE', description: 'Delete user' },
      ];
      
      setDiscoveredEndpoints(mockEndpoints.map(e => ({ ...e, url: `${baseUrl}${e.path}` })));
    } catch (error) {
      console.error('Failed to discover endpoints', error);
    }
  };

  const handleSelectDiscoveredEndpoint = (endpoint) => {
    setConfig({
      ...config,
      endpoint: endpoint.url,
      method: endpoint.method,
    });
    setShowEndpointDiscovery(false);
  };

  const handleSave = () => {
    onSave({ ...nodeData, config });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-auto"
      >
        <CinematicCard className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Configure API Call
              </h2>
              <p className="text-white/60 text-sm">
                Set up external API integration with data mapping
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Templates */}
          <div className="mb-8">
            <Label className="text-white mb-3 block">Quick Start Templates</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(apiConnectorTemplates).map(([key, connector]) => (
                <div key={key} className="space-y-2">
                  <div className={cn(
                    "p-4 rounded-xl border-2 transition-all cursor-pointer",
                    selectedTemplate?.connector === key
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  )}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{connector.icon}</span>
                      <span className="text-white font-semibold text-sm">
                        {connector.name}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {connector.actions.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleTemplateSelect(key, action.id)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors",
                            selectedTemplate?.action === action.id
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'hover:bg-white/5 text-white/70'
                          )}
                        >
                          {action.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Endpoint Configuration */}
          <div className="space-y-6 mb-8">
            {/* Authentication Type */}
            {selectedTemplate && apiConnectorTemplates[selectedTemplate.connector]?.authType === 'oauth2' && (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <Lock className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-semibold">OAuth 2.0 Authentication</span>
                </div>
                <p className="text-sm text-white/70">
                  This connector uses OAuth 2.0. Configure your OAuth credentials in the workflow settings.
                </p>
              </div>
            )}

            <div>
              <Label className="text-white mb-2 block">Method</Label>
              <Select value={config.method} onValueChange={(v) => setConfig({ ...config, method: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-white">Endpoint URL</Label>
                <CinematicButton
                  variant="glass"
                  size="sm"
                  icon={Search}
                  onClick={handleDiscoverEndpoints}
                  disabled={!config.endpoint}
                >
                  Discover
                </CinematicButton>
              </div>
              <CinematicInput
                placeholder="https://api.example.com/endpoint"
                value={config.endpoint}
                onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
                hint="Use {{variable}} to inject workflow data"
              />
            </div>

            {/* Endpoint Discovery Panel */}
            <AnimatePresence>
              {showEndpointDiscovery && discoveredEndpoints.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label className="text-white text-sm">Discovered Endpoints</Label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {discoveredEndpoints.map((endpoint, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectDiscoveredEndpoint(endpoint)}
                        className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <CinematicBadge variant={endpoint.method === 'GET' ? 'success' : 'info'} size="sm">
                            {endpoint.method}
                          </CinematicBadge>
                          <code className="text-sm text-white/80 font-mono flex-1">
                            {endpoint.path}
                          </code>
                        </div>
                        {endpoint.description && (
                          <p className="text-xs text-white/60 mt-1">{endpoint.description}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Headers */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-white">Headers</Label>
              <CinematicBadge variant="info" size="sm">
                {Object.keys(config.headers).length}
              </CinematicBadge>
            </div>
            
            <div className="space-y-2 mb-3">
              {Object.entries(config.headers).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <Key className="w-4 h-4 text-cyan-400" />
                  <code className="flex-1 text-white text-sm font-mono">
                    {key}: {value}
                  </code>
                  <button
                    onClick={() => handleRemoveHeader(key)}
                    className="p-1 rounded hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Header name"
                value={newHeaderKey}
                onChange={(e) => setNewHeaderKey(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40"
              />
              <input
                type="text"
                placeholder="Header value"
                value={newHeaderValue}
                onChange={(e) => setNewHeaderValue(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40"
              />
              <CinematicButton
                variant="glass"
                icon={Plus}
                onClick={handleAddHeader}
              >
                Add
              </CinematicButton>
            </div>
          </div>

          {/* Request Body */}
          {config.method !== 'GET' && (
            <div className="mb-8">
              <Label className="text-white mb-2 block">Request Body (JSON)</Label>
              <Textarea
                value={JSON.stringify(config.body, null, 2)}
                onChange={(e) => {
                  try {
                    setConfig({ ...config, body: JSON.parse(e.target.value) });
                  } catch (err) {
                    // Invalid JSON, ignore
                  }
                }}
                rows={8}
                className="bg-white/5 border-white/10 text-white font-mono text-sm"
                placeholder='{"key": "{{variable}}"}'
              />
              <p className="text-xs text-white/60 mt-2">
                Use {`{{variable}}`} syntax to inject workflow data
              </p>
            </div>
          )}

          {/* Data Mapping */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-white">Data Mapping</Label>
              <CinematicButton
                variant="glass"
                icon={Plus}
                size="sm"
                onClick={handleAddDataMapping}
              >
                Add Mapping
              </CinematicButton>
            </div>

            <div className="space-y-3">
              {config.dataMapping.map((mapping, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <input
                    type="text"
                    placeholder="From (workflow variable)"
                    value={mapping.from}
                    onChange={(e) => handleUpdateDataMapping(index, 'from', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 text-sm"
                  />
                  <ArrowRight className="w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="To (API field)"
                    value={mapping.to}
                    onChange={(e) => handleUpdateDataMapping(index, 'to', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 text-sm"
                  />
                  <button
                    onClick={() => handleRemoveDataMapping(index)}
                    className="p-2 rounded hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Output Variable */}
          <div className="mb-8">
            <CinematicInput
              label="Output Variable Name"
              placeholder="api_result"
              value={config.outputVariable}
              onChange={(e) => setConfig({ ...config, outputVariable: e.target.value })}
              hint="Variable name to store the API response"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <CinematicButton
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </CinematicButton>
            <CinematicButton
              variant="primary"
              icon={Copy}
              onClick={handleSave}
              glow
            >
              Save Configuration
            </CinematicButton>
          </div>
        </CinematicCard>
      </motion.div>
    </motion.div>
  );
}

export default APINodeConfigPanel;