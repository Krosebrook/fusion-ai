/**
 * My Generations
 * History and management of all AI-generated content
 */

import React, { useState } from 'react';
import { useAuth } from '../components/hooks/useAuth';
import { ProtectedRoute } from '../components/ui-library/ProtectedRoute';
import { useEntityList, useDeleteEntity } from '../components/hooks/useEntity';
import { CinematicCard } from '../components/atoms/CinematicCard';
import { CinematicButton } from '../components/atoms/CinematicButton';
import { CinematicInput } from '../components/atoms/CinematicInput';
import { CinematicBadge } from '../components/atoms/CinematicBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Search, Filter, Download, Share2, 
  Trash2, Eye, Copy, Image, Code, FileText,
  Clock, Calendar
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { exportService } from '../components/services/ExportService';
import { toast } from 'sonner';

const TYPE_ICONS = {
  content: FileText,
  image: Image,
  code: Code,
  icon: Sparkles,
  illustration: Sparkles,
};

export default function MyGenerationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedGeneration, setSelectedGeneration] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: generations = [], isLoading } = useEntityList('AIGeneration', {
    sort: '-created_date',
    limit: 100,
  });

  const deleteMutation = useDeleteEntity('AIGeneration');

  // Filter generations
  const filteredGenerations = generations.filter(gen => {
    const matchesSearch = !searchQuery || 
      gen.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gen.result?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || gen.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
    setDeleteConfirm(null);
    toast.success('Generation deleted');
  };

  const handleExport = async (generation) => {
    try {
      if (generation.type === 'image' || generation.type === 'icon' || generation.type === 'illustration') {
        await exportService.exportImage(generation.result, `${generation.type}-${generation.id}`);
      } else {
        await exportService.exportText(generation.result, `${generation.type}-${generation.id}.txt`);
      }
      toast.success('Exported successfully');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Sparkles className="w-8 h-8 text-orange-500" />
        </motion.div>
      </div>
    );
  }

  if (!user) return <ProtectedRoute />;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-pink-600/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">My Generations</h1>
                <p className="text-slate-400 text-lg mt-1">
                  {filteredGenerations.length} {filteredGenerations.length === 1 ? 'item' : 'items'} in your library
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <CinematicCard>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <CinematicInput
                  placeholder="Search generations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={Search}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="icon">Icons</SelectItem>
                  <SelectItem value="illustration">Illustrations</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CinematicCard>

        {/* Generations Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredGenerations.map((generation, index) => (
              <GenerationCard
                key={generation.id}
                generation={generation}
                index={index}
                onView={() => setSelectedGeneration(generation)}
                onExport={() => handleExport(generation)}
                onCopy={() => handleCopy(generation.result)}
                onDelete={() => setDeleteConfirm(generation)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredGenerations.length === 0 && !isLoading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <CinematicCard className="p-12 text-center mt-6">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery || typeFilter !== 'all' ? 'No matches found' : 'No generations yet'}
              </h3>
              <p className="text-slate-400 mb-6">
                {searchQuery || typeFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Start creating with AI Studio to see your work here'
                }
              </p>
            </CinematicCard>
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedGeneration} onOpenChange={() => setSelectedGeneration(null)}>
        <DialogContent className="max-w-4xl bg-slate-900 border-white/10">
          {selectedGeneration && (
            <GenerationDetail 
              generation={selectedGeneration}
              onExport={handleExport}
              onCopy={handleCopy}
              onClose={() => setSelectedGeneration(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Generation?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-300">This action cannot be undone. The generation will be permanently deleted.</p>
            <div className="flex gap-3 justify-end">
              <CinematicButton variant="ghost" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </CinematicButton>
              <CinematicButton 
                variant="primary" 
                onClick={() => handleDelete(deleteConfirm.id)}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </CinematicButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GenerationCard({ generation, index, onView, onExport, onCopy, onDelete }) {
  const TypeIcon = TYPE_ICONS[generation.type] || Sparkles;
  const isVisual = ['image', 'icon', 'illustration'].includes(generation.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
    >
      <CinematicCard className="p-6 h-full flex flex-col group">
        {/* Preview */}
        <div className="mb-4 rounded-xl overflow-hidden bg-white/5 aspect-video flex items-center justify-center">
          {isVisual && generation.result ? (
            <img src={generation.result} alt="Generated" className="w-full h-full object-cover" />
          ) : (
            <div className="p-4 text-slate-400 text-sm line-clamp-6 font-mono">
              {generation.result?.substring(0, 200)}...
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <CinematicBadge variant="primary" size="sm">
              <TypeIcon className="w-3 h-3 mr-1" />
              {generation.type}
            </CinematicBadge>
            <span className="text-xs text-slate-500">
              {format(new Date(generation.created_date), 'MMM d, yyyy')}
            </span>
          </div>
          <p className="text-slate-300 text-sm line-clamp-2">
            {generation.prompt || 'No prompt'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
          <CinematicButton variant="ghost" size="sm" icon={Eye} onClick={onView}>View</CinematicButton>
          <CinematicButton variant="ghost" size="sm" icon={Download} onClick={onExport} />
          <CinematicButton variant="ghost" size="sm" icon={Copy} onClick={onCopy} />
          <CinematicButton variant="ghost" size="sm" icon={Trash2} onClick={onDelete} className="text-red-400 hover:text-red-300" />
        </div>
      </CinematicCard>
    </motion.div>
  );
}

function GenerationDetail({ generation, onExport, onCopy, onClose }) {
  const isVisual = ['image', 'icon', 'illustration'].includes(generation.type);

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-white">Generation Details</DialogTitle>
      </DialogHeader>

      {/* Preview */}
      <div className="rounded-xl overflow-hidden bg-white/5">
        {isVisual && generation.result ? (
          <img src={generation.result} alt="Generated" className="w-full h-auto" />
        ) : (
          <pre className="p-6 text-slate-300 text-sm font-mono whitespace-pre-wrap max-h-96 overflow-auto">
            {generation.result}
          </pre>
        )}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-slate-400 text-sm mb-1">Type</p>
          <CinematicBadge variant="primary">{generation.type}</CinematicBadge>
        </div>
        <div>
          <p className="text-slate-400 text-sm mb-1">Created</p>
          <p className="text-white">{format(new Date(generation.created_date), 'PPP')}</p>
        </div>
      </div>

      {/* Prompt */}
      {generation.prompt && (
        <div>
          <p className="text-slate-400 text-sm mb-2">Prompt</p>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-slate-300 text-sm">{generation.prompt}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <CinematicButton variant="primary" icon={Download} onClick={() => onExport(generation)} glow>
          Export
        </CinematicButton>
        <CinematicButton variant="secondary" icon={Copy} onClick={() => onCopy(generation.result)}>
          Copy
        </CinematicButton>
      </div>
    </div>
  );
}