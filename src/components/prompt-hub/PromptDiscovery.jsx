/**
 * Prompt Discovery
 * Browse, search, and filter prompt templates
 */

import { useState } from 'react';
import { usePromptTemplates } from '../hooks/usePromptTemplates';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { CinematicInput } from '../atoms/CinematicInput';
import { CinematicBadge } from '../atoms/CinematicBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Star, TrendingUp, Clock, 
  Sparkles, Copy, Eye, Plus
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PromptTemplateEditor } from '../prompt-library/PromptTemplateEditor';
import { PromptOptimizer } from '../prompt-library/PromptOptimizer';
import { toast } from 'sonner';

const CATEGORIES = [
  { id: 'all', name: 'All Templates', icon: Sparkles },
  { id: 'generation', name: 'Content Generation', icon: Copy },
  { id: 'api', name: 'Image Generation', icon: Eye },
  { id: 'workflow', name: 'Code Assistance', icon: Plus },
  { id: 'custom', name: 'Custom', icon: Star },
];

export function PromptDiscovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showEditor, setShowEditor] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const {
    templates,
    isLoading,
    createTemplate,
    duplicateTemplate,
    optimizeTemplate,
  } = usePromptTemplates();

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sort templates
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.usage_count || 0) - (a.usage_count || 0);
      case 'recent':
        return new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setShowEditor(true);
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setShowEditor(true);
  };

  const handleOptimize = (template) => {
    setSelectedTemplate(template);
    setShowOptimizer(true);
  };

  const handleDuplicate = (template) => {
    duplicateTemplate(template.id);
  };

  const handleSaveTemplate = (data) => {
    if (selectedTemplate) {
      // Update logic handled by editor component
    } else {
      createTemplate(data);
    }
    setShowEditor(false);
    setSelectedTemplate(null);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <CinematicCard>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <CinematicInput
                placeholder="Search templates, tags, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Most Popular
                  </div>
                </SelectItem>
                <SelectItem value="recent">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recently Updated
                  </div>
                </SelectItem>
                <SelectItem value="name">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Alphabetical
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CinematicCard>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedCategory(category.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl border transition-all
              ${selectedCategory === category.id
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
              }
            `}
          >
            <category.icon className="w-4 h-4" />
            <span className="text-sm font-medium whitespace-nowrap">{category.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400">
          {sortedTemplates.length} template{sortedTemplates.length !== 1 ? 's' : ''} found
        </p>
        <CinematicButton
          variant="primary"
          icon={Plus}
          onClick={handleCreateNew}
          glow
        >
          Create Template
        </CinematicButton>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {sortedTemplates.map((template, index) => (
            <TemplateCard
              key={template.id}
              template={template}
              index={index}
              onEdit={handleEdit}
              onOptimize={handleOptimize}
              onDuplicate={handleDuplicate}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {sortedTemplates.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CinematicCard className="p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-semibold text-white mb-2">No templates found</h3>
            <p className="text-slate-400 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first prompt template to get started'
              }
            </p>
            <CinematicButton variant="primary" icon={Plus} onClick={handleCreateNew}>
              Create Template
            </CinematicButton>
          </CinematicCard>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showEditor && (
          <PromptTemplateEditor
            template={selectedTemplate}
            onSave={handleSaveTemplate}
            onClose={() => {
              setShowEditor(false);
              setSelectedTemplate(null);
            }}
          />
        )}
        {showOptimizer && selectedTemplate && (
          <PromptOptimizer
            template={selectedTemplate}
            onApply={(optimized) => {
              // Handle optimized prompt
              toast.success('Optimization applied');
              setShowOptimizer(false);
            }}
            onClose={() => {
              setShowOptimizer(false);
              setSelectedTemplate(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TemplateCard({ template, index, onEdit, onOptimize, onDuplicate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
    >
      <CinematicCard className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              {template.name}
            </h3>
            <p className="text-slate-400 text-sm line-clamp-2">
              {template.description || 'No description'}
            </p>
          </div>
        </div>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
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

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{template.usage_count || 0} uses</span>
          </div>
          {template.avg_latency_ms && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{template.avg_latency_ms}ms</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-4 border-t border-white/10">
          <CinematicButton
            variant="ghost"
            size="sm"
            onClick={() => onEdit(template)}
            className="flex-1"
          >
            Edit
          </CinematicButton>
          <CinematicButton
            variant="secondary"
            size="sm"
            icon={Sparkles}
            onClick={() => onOptimize(template)}
            className="flex-1"
          >
            Optimize
          </CinematicButton>
          <CinematicButton
            variant="ghost"
            size="sm"
            icon={Copy}
            onClick={() => onDuplicate(template)}
          >
            Duplicate
          </CinematicButton>
        </div>
      </CinematicCard>
    </motion.div>
  );
}

export default PromptDiscovery;