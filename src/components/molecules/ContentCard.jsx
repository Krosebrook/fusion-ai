/**
 * Content Card - Molecule Component
 * Displays generated content with actions
 */

import React from 'react';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { CinematicBadge } from '../atoms/CinematicBadge';
import { Copy, Download, Share2, Edit, Trash2 } from 'lucide-react';
import { exportService } from '../services/ExportService';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function ContentCard({
  title,
  content,
  type = 'text',
  metadata,
  onEdit,
  onDelete,
  className,
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleCopy = async () => {
    const success = await exportService.copyToClipboard(content);
    if (success) {
      toast.success('Copied to clipboard');
    } else {
      toast.error('Failed to copy');
    }
  };

  const handleDownload = () => {
    if (type === 'text') {
      exportService.exportText(content, `${title}.txt`);
    } else if (type === 'markdown') {
      exportService.exportMarkdown(content, `${title}.md`);
    }
    toast.success('Downloaded');
  };

  const handleShare = async () => {
    try {
      await exportService.share({
        title,
        text: content,
      });
    } catch (error) {
      toast.error('Sharing not supported');
    }
  };

  const contentPreview = content.substring(0, 200);
  const needsExpansion = content.length > 200;

  return (
    <CinematicCard hover glow className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <div className="flex items-center gap-2">
              <CinematicBadge variant="primary" size="sm">
                {type}
              </CinematicBadge>
              {metadata?.wordCount && (
                <CinematicBadge variant="default" size="sm">
                  {metadata.wordCount} words
                </CinematicBadge>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <motion.div 
          className="mb-4 text-slate-300 leading-relaxed"
          animate={{ height: isExpanded ? 'auto' : 'auto' }}
        >
          <p className="whitespace-pre-wrap">
            {isExpanded ? content : contentPreview}
            {needsExpansion && !isExpanded && '...'}
          </p>
        </motion.div>

        {needsExpansion && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-orange-400 hover:text-orange-300 text-sm font-medium mb-4"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-white/10">
          <CinematicButton
            variant="ghost"
            size="sm"
            icon={Copy}
            onClick={handleCopy}
          >
            Copy
          </CinematicButton>
          
          <CinematicButton
            variant="ghost"
            size="sm"
            icon={Download}
            onClick={handleDownload}
          >
            Download
          </CinematicButton>
          
          <CinematicButton
            variant="ghost"
            size="sm"
            icon={Share2}
            onClick={handleShare}
          >
            Share
          </CinematicButton>

          <div className="flex-1" />

          {onEdit && (
            <CinematicButton
              variant="ghost"
              size="sm"
              icon={Edit}
              onClick={onEdit}
            />
          )}

          {onDelete && (
            <CinematicButton
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={onDelete}
            />
          )}
        </div>
      </div>
    </CinematicCard>
  );
}

export default ContentCard;