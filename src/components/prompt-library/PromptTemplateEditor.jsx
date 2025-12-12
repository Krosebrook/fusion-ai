/**
 * Prompt Template Editor
 * Create and edit custom prompt templates
 */

import React, { useState } from 'react';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { CinematicInput } from '../atoms/CinematicInput';
import { CinematicBadge } from '../atoms/CinematicBadge';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function PromptTemplateEditor({ template, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    template: template?.template || '',
    category: template?.category || 'custom',
    tags: template?.tags || [],
    variables: template?.variables || [],
  });

  const [newTag, setNewTag] = useState('');
  const [newVariable, setNewVariable] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Extract variables from template if not manually set
    const extractedVars = formData.template.match(/{{(\w+)}}/g);
    const variables = extractedVars 
      ? [...new Set(extractedVars.map(v => v.replace(/{{|}}/g, '')))]
      : formData.variables;

    onSave({
      ...formData,
      variables,
    });
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag],
      });
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const addVariable = () => {
    if (newVariable && !formData.variables.includes(newVariable)) {
      setFormData({
        ...formData,
        variables: [...formData.variables, newVariable],
      });
      setNewVariable('');
      
      // Auto-insert into template
      setFormData(prev => ({
        ...prev,
        template: prev.template + `\n{{${newVariable}}}`,
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <CinematicCard>
          <form onSubmit={handleSubmit} className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {template ? 'Edit Template' : 'New Template'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Name */}
              <CinematicInput
                label="Template Name"
                placeholder="My Custom Prompt"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <Textarea
                  placeholder="Describe what this template does..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder-slate-500"
                  rows={3}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generation">Content Generation</SelectItem>
                    <SelectItem value="api">Image Generation</SelectItem>
                    <SelectItem value="workflow">Code Assistance</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Template Text */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Prompt Template
                  <span className="text-slate-500 ml-2 text-xs">
                    Use {`{{variableName}}`} for dynamic values
                  </span>
                </label>
                <Textarea
                  placeholder="Write your prompt template here..."
                  value={formData.template}
                  onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder-slate-500 font-mono text-sm"
                  rows={10}
                  required
                />
              </div>

              {/* Variables (detected) */}
              {formData.template && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Detected Variables
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(formData.template.match(/{{(\w+)}}/g) || []).map((v, i) => (
                      <CinematicBadge key={i} variant="info">
                        {v.replace(/{{|}}/g, '')}
                      </CinematicBadge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <CinematicInput
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <CinematicButton
                    type="button"
                    variant="secondary"
                    icon={Plus}
                    onClick={addTag}
                  >
                    Add
                  </CinematicButton>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <CinematicBadge key={tag} variant="default">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </CinematicBadge>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-white/10">
              <CinematicButton
                type="button"
                variant="ghost"
                onClick={onClose}
              >
                Cancel
              </CinematicButton>
              <CinematicButton
                type="submit"
                variant="primary"
                icon={Save}
                glow
              >
                Save Template
              </CinematicButton>
            </div>
          </form>
        </CinematicCard>
      </motion.div>
    </motion.div>
  );
}

export default PromptTemplateEditor;