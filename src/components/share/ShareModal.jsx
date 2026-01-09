/**
 * Share Modal
 * Generate and display share links
 */

import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CinematicButton } from '../atoms/CinematicButton';
import { CinematicBadge } from '../atoms/CinematicBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Share2, Copy, Check, ExternalLink, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function ShareModal({ generation, open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expiresIn, setExpiresIn] = useState(7);

  const handleGenerateLink = async () => {
    try {
      setLoading(true);
      const { data } = await base44.functions.invoke('createShareLink', {
        generationId: generation.id,
        expiresIn,
      });
      setShareData(data);
      toast.success('Share link created');
    } catch (error) {
      toast.error('Failed to create share link');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareData.shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenLink = () => {
    window.open(shareData.shareUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Share2 className="w-6 h-6 text-orange-500" />
            Share Generation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!shareData ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Link expires in
                </label>
                <Select value={String(expiresIn)} onValueChange={(val) => setExpiresIn(Number(val))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-slate-300 text-sm mb-2">
                  This will create a public link that anyone can view, even without an account.
                </p>
                <p className="text-slate-400 text-xs">
                  The link will expire after {expiresIn} {expiresIn === 1 ? 'day' : 'days'}.
                </p>
              </div>

              <CinematicButton
                variant="primary"
                icon={Share2}
                onClick={handleGenerateLink}
                loading={loading}
                glow
                className="w-full"
              >
                Generate Share Link
              </CinematicButton>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <CinematicBadge variant="success" size="sm">
                  <Check className="w-3 h-3 mr-1" />
                  Link Created
                </CinematicBadge>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Expires in {expiresIn} {expiresIn === 1 ? 'day' : 'days'}
                </span>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-slate-300 text-sm font-mono break-all">
                  {shareData.shareUrl}
                </p>
              </div>

              <div className="flex gap-2">
                <CinematicButton
                  variant="primary"
                  icon={copied ? Check : Copy}
                  onClick={handleCopy}
                  className="flex-1"
                  glow
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </CinematicButton>
                <CinematicButton
                  variant="secondary"
                  icon={ExternalLink}
                  onClick={handleOpenLink}
                >
                  Open
                </CinematicButton>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShareModal;