/**
 * Prompt Template Library
 * User interface for managing custom prompt templates
 */

import React, { useState, useEffect } from 'react';
import { promptService } from '../services/PromptService';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { CinematicInput } from '../atoms/CinematicInput';
import { CinematicBadge } from '../atoms/CinematicBadge';
import { 
  Search, Plus, Edit, Trash2, Copy, Sparkles, 
  FileText, Image, Code, TrendingUp, Filter 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PromptTemplateEditor } from './PromptTemplateEditor';
import { PromptOptimizer } from './PromptOptimizer';

const categories = [
  { id: 'all', name: 'All Templates', icon: FileText },
  { id: 'generation', name: 'Content Generation', icon: FileText },
  { id: 'api', name: 'Image Generation', icon: Image },
  { id: 'workflow', name: 'Code Assistance', icon: Code },
  { id: 'custom', name: 'Custom', icon: Sparkles },
];

export function PromptTemplateLibrary() {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedCategory]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const userTemplates = await promptService.loadUserTemplates();
      setTemplates(userTemplates);
    } catch (error) {
      toast.error('Failed to load templates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = async () => {
    try {
      const results = await promptService.searchTemplates({
        query: searchQuery,
        category: selectedCategory,
      });
      setFilteredTemplates(results);
    } catch (error) {
      console.error('Filter error:', error);
      setFilteredTemplates(templates);
    }
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setShowEditor(true);
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setShowEditor(true);
  };

  const handleDelete = async (templateId) => {
    if (!confirm('Delete this template?')) return;

    try {
      await promptService.deleteTemplate(templateId);
      toast.success('Template deleted');
      loadTemplates();
    } catch (error) {
      toast.error('Failed to delete template');
      console.error(error);
    }
  };

  const handleDuplicate = async (templateId) => {
    try {
      await promptService.duplicateTemplate(templateId);
      toast.success('Template duplicated');
      loadTemplates();
    } catch (error) {
      toast.error('Failed to duplicate template');
      console.error(error);
    }
  };

  const handleOptimize = (template) => {
    setSelectedTemplate(template);
    setShowOptimizer(true);
  };

  const handleSave = async (templateData) => {
    try {
      if (selectedTemplate) {
        await promptService.updateTemplate(selectedTemplate.id, templateData);
        toast.success('Template updated');
      } else {
        await promptService.saveTemplate(templateData);
        toast.success('Template created');
      }
      setShowEditor(false);
      loadTemplates();
    } catch (error) {
      toast.error('Failed to save template');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Prompt Template Library
          </h1>
          <p className="text-slate-400">
            Manage and optimize your custom AI prompt templates
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <CinematicInput
              icon={Search}
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <CinematicButton
            variant="primary"
            icon={Plus}
            onClick={handleCreate}
            glow
          >
            New Template
          </CinematicButton>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="bg-white/5 border border-white/10">
            {categories.map(cat => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id}
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                <cat.icon className="w-4 h-4 mr-2" />
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Templates Grid */}
        {loading ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <CinematicCard key={i} className="h-64 animate-pulse" />
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <CinematicCard className="p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-orange-500" />
            <h3 className="text-xl font-bold text-white mb-2">No templates yet</h3>
            <p className="text-slate-400 mb-6">
              Create your first prompt template to get started
            </p>
            <CinematicButton variant="primary" icon={Plus} onClick={handleCreate}>
              Create Template
            </CinematicButton>
          </CinematicCard>
        ) : (
          <motion.div 
            className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            layout
          >
            <AnimatePresence>
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={() => handleEdit(template)}
                  onDelete={() => handleDelete(template.id)}
                  onDuplicate={() => handleDuplicate(template.id)}
                  onOptimize={() => handleOptimize(template)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <PromptTemplateEditor
          template={selectedTemplate}
          onSave={handleSave}
          onClose={() => setShowEditor(false)}
        />
      )}

      {/* Optimizer Modal */}
      {showOptimizer && selectedTemplate && (
        <PromptOptimizer
          template={selectedTemplate}
          onApply={async (optimized) => {
            await handleSave({ template: optimized });
            setShowOptimizer(false);
          }}
          onClose={() => setShowOptimizer(false)}
        />
      )}
    </div>
  );
}

function TemplateCard({ template, onEdit, onDelete, onDuplicate, onOptimize }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <CinematicCard hover glow className="h-full">
        <div className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">
                {template.name}
              </h3>
              <p className="text-sm text-slate-400 line-clamp-2">
                {template.description}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <CinematicBadge variant="primary" size="sm">
              {template.category}
            </CinematicBadge>
            {template.usage_count > 0 && (
              <CinematicBadge variant="info" size="sm">
                <TrendingUp className="w-3 h-3" />
                {template.usage_count} uses
              </CinematicBadge>
            )}
          </div>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {template.tags.slice(0, 3).map(tag => (
                <CinematicBadge key={tag} variant="default" size="sm">
                  {tag}
                </CinematicBadge>
              ))}
              {template.tags.length > 3 && (
                <CinematicBadge variant="default" size="sm">
                  +{template.tags.length - 3}
                </CinematicBadge>
              )}
            </div>
          )}

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 border-t border-white/10">
            <CinematicButton
              variant="ghost"
              size="sm"
              icon={Sparkles}
              onClick={onOptimize}
            >
              Optimize
            </CinematicButton>
            <CinematicButton
              variant="ghost"
              size="sm"
              icon={Edit}
              onClick={onEdit}
            />
            <CinematicButton
              variant="ghost"
              size="sm"
              icon={Copy}
              onClick={onDuplicate}
            />
            <CinematicButton
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={onDelete}
            />
          </div>
        </div>
      </CinematicCard>
    </motion.div>
  );
}

export default PromptTemplateLibrary;