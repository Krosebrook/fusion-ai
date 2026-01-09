/**
 * Community Templates
 * Share and discover community-created prompts
 */

import { useState } from 'react';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { CinematicBadge } from '../atoms/CinematicBadge';
import { motion } from 'framer-motion';
import { 
  Users, Heart, Star, Download, Share2
} from 'lucide-react';
import { toast } from 'sonner';

// Mock community data
const FEATURED_TEMPLATES = [
  {
    id: '1',
    name: 'Product Description Generator',
    author: 'Sarah Chen',
    description: 'E-commerce optimized product descriptions with SEO keywords',
    category: 'Marketing',
    likes: 1247,
    downloads: 3891,
    rating: 4.8,
    tags: ['e-commerce', 'seo', 'marketing'],
  },
  {
    id: '2',
    name: 'Code Reviewer Pro',
    author: 'Alex Kumar',
    description: 'Comprehensive code review with security and performance analysis',
    category: 'Development',
    likes: 892,
    downloads: 2156,
    rating: 4.9,
    tags: ['code', 'review', 'security'],
  },
  {
    id: '3',
    name: 'Social Media Content Pack',
    author: 'Maria Garcia',
    description: 'Multi-platform social media posts with hashtag optimization',
    category: 'Marketing',
    likes: 1563,
    downloads: 4721,
    rating: 4.7,
    tags: ['social', 'content', 'engagement'],
  },
];

export function CommunityTemplates() {
  const [filter, setFilter] = useState('trending');

  const handleLike = (templateId) => {
    toast.success('Template liked');
  };

  const handleDownload = (templateId) => {
    toast.success('Template added to your library');
  };

  const handleShare = (templateId) => {
    navigator.clipboard.writeText(`https://flashfusion.app/prompts/${templateId}`);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Community Templates
          </h2>
          <p className="text-slate-400">
            Discover and share prompts with the FlashFusion community
          </p>
        </div>
        <CinematicButton variant="primary" icon={Share2} glow>
          Share Template
        </CinematicButton>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['Trending', 'Popular', 'Recent', 'Top Rated'].map(f => (
          <motion.button
            key={f}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter(f.toLowerCase())}
            className={`
              px-4 py-2 rounded-xl border transition-all text-sm font-medium
              ${filter === f.toLowerCase()
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
              }
            `}
          >
            {f}
          </motion.button>
        ))}
      </div>

      {/* Featured Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-orange-500" />
          Featured Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_TEMPLATES.map((template, index) => (
            <CommunityTemplateCard
              key={template.id}
              template={template}
              index={index}
              onLike={handleLike}
              onDownload={handleDownload}
              onShare={handleShare}
            />
          ))}
        </div>
      </div>

      {/* Stats Banner */}
      <CinematicCard>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatItem
              icon={Users}
              label="Active Contributors"
              value="1,247"
              color="orange"
            />
            <StatItem
              icon={Download}
              label="Total Downloads"
              value="15.3K"
              color="blue"
            />
            <StatItem
              icon={Heart}
              label="Community Likes"
              value="8,921"
              color="pink"
            />
            <StatItem
              icon={Star}
              label="Avg Rating"
              value="4.8/5"
              color="purple"
            />
          </div>
        </div>
      </CinematicCard>

      {/* Community Guidelines */}
      <CinematicCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            🌟 Community Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GuidelineItem
              title="Quality First"
              description="Share well-tested, effective prompts that provide value"
            />
            <GuidelineItem
              title="Clear Documentation"
              description="Include descriptions, use cases, and variable explanations"
            />
            <GuidelineItem
              title="Respect IP"
              description="Only share original work or properly attributed content"
            />
            <GuidelineItem
              title="Engage Positively"
              description="Provide constructive feedback and help improve templates"
            />
          </div>
        </div>
      </CinematicCard>
    </div>
  );
}

function CommunityTemplateCard({ template, index, onLike, onDownload, onShare }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <CinematicCard className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CinematicBadge variant="primary" size="sm">
              {template.category}
            </CinematicBadge>
            <div className="flex items-center gap-1 text-yellow-500 text-sm">
              <Star className="w-3 h-3 fill-current" />
              <span className="font-medium">{template.rating}</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {template.name}
          </h3>
          <p className="text-slate-400 text-sm mb-2">
            by {template.author}
          </p>
          <p className="text-slate-300 text-sm line-clamp-2">
            {template.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {template.tags.map(tag => (
            <CinematicBadge key={tag} variant="default" size="sm">
              {tag}
            </CinematicBadge>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{template.likes.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span>{template.downloads.toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-4 border-t border-white/10">
          <CinematicButton
            variant="ghost"
            size="sm"
            icon={Heart}
            onClick={() => onLike(template.id)}
            className="flex-1"
          >
            Like
          </CinematicButton>
          <CinematicButton
            variant="primary"
            size="sm"
            icon={Download}
            onClick={() => onDownload(template.id)}
            className="flex-1"
          >
            Use
          </CinematicButton>
          <CinematicButton
            variant="ghost"
            size="sm"
            icon={Share2}
            onClick={() => onShare(template.id)}
          />
        </div>
      </CinematicCard>
    </motion.div>
  );
}

function StatItem({ icon: Icon, label, value, color }) {
  const colorClasses = {
    orange: 'from-orange-500 to-pink-600',
    blue: 'from-blue-500 to-cyan-600',
    pink: 'from-pink-500 to-rose-600',
    purple: 'from-purple-500 to-pink-600',
  };

  return (
    <div className="text-center">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mx-auto mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-slate-400 text-sm">{label}</p>
    </div>
  );
}

function GuidelineItem({ title, description }) {
  return (
    <div className="flex gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
      <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
      <div>
        <h4 className="text-white font-medium mb-1">{title}</h4>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  );
}

export default CommunityTemplates;