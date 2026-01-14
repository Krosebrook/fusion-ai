/**
 * Prompt Library
 * Browse and select from saved prompt templates
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, Star, Clock, TrendingUp, 
  Edit, Copy, Trash, Layers 
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export function PromptLibrary({ templates, onSelectTemplate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredTemplates = templates
    .filter(t => 
      searchTerm === '' || 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(t => categoryFilter === 'all' || t.category === categoryFilter);

  const categories = ['all', 'agent', 'api', 'workflow', 'analysis', 'generation', 'custom'];

  const duplicateTemplate = async (template) => {
    try {
      await base44.entities.PromptTemplate.create({
        ...template,
        name: `${template.name} (Copy)`,
        id: undefined,
        created_date: undefined
      });
      toast.success('Template duplicated');
    } catch (error) {
      toast.error('Failed to duplicate template');
    }
  };

  const deleteTemplate = async (id) => {
    if (!confirm('Delete this template?')) return;
    
    try {
      await base44.entities.PromptTemplate.delete(id);
      toast.success('Template deleted');
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <CinematicCard className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </CinematicCard>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <CinematicCard className="p-6 h-full hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <Badge className="bg-purple-500/20 text-purple-300 capitalize">
                  {template.category}
                </Badge>
                {template.is_public && (
                  <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                )}
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{template.name}</h3>
              {template.description && (
                <p className="text-white/60 text-sm mb-4 line-clamp-2">{template.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(template.created_date).toLocaleDateString()}
                </div>
                {template.usage_count > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {template.usage_count} uses
                  </div>
                )}
              </div>

              {template.success_rate !== undefined && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white/60">Success Rate</span>
                    <span className="text-green-400 font-semibold">
                      {(template.success_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{ width: `${template.success_rate * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => onSelectTemplate(template)}
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateTemplate(template);
                  }}
                  size="sm"
                  variant="outline"
                  className="border-white/10"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTemplate(template.id);
                  }}
                  size="sm"
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                >
                  <Trash className="w-3 h-3" />
                </Button>
              </div>
            </CinematicCard>
          </motion.div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <CinematicCard className="p-12 text-center">
          <Layers className="w-16 h-16 mx-auto mb-4 text-white/40" />
          <h3 className="text-xl font-bold text-white mb-2">No Templates Found</h3>
          <p className="text-white/60">Try adjusting your filters or create a new template</p>
        </CinematicCard>
      )}
    </div>
  );
}