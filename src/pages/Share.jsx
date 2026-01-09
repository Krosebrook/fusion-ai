/**
 * Public Share View
 * View shared AI generations without authentication
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '../components/atoms/CinematicCard';
import { CinematicButton } from '../components/atoms/CinematicButton';
import { CinematicBadge } from '../components/atoms/CinematicBadge';
import { motion } from 'framer-motion';
import { Sparkles, Download, Copy, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function SharePage() {
  const { token } = useParams();
  const [generation, setGeneration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGeneration();
  }, [token]);

  const loadGeneration = async () => {
    try {
      setLoading(true);
      
      // Query by share token
      const results = await base44.entities.AIGeneration.filter({ 
        share_token: token,
        is_public: true,
      });

      if (results.length === 0) {
        setError('Generation not found or link expired');
        return;
      }

      const gen = results[0];

      // Check expiration
      if (gen.share_expires_at && new Date(gen.share_expires_at) < new Date()) {
        setError('This share link has expired');
        return;
      }

      setGeneration(gen);
    } catch (err) {
      setError('Failed to load generation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generation.result);
    toast.success('Copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([generation.result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generation-${generation.id}.txt`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
    toast.success('Downloaded');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Sparkles className="w-8 h-8 text-orange-500" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <CinematicCard className="p-12 text-center max-w-md">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <CinematicButton 
            variant="primary" 
            onClick={() => window.location.href = '/'}
            glow
          >
            Go to FlashFusion
          </CinematicButton>
        </CinematicCard>
      </div>
    );
  }

  const isVisual = ['image', 'icon', 'illustration'].includes(generation?.type);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-pink-600/10" />
        <div className="relative max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Shared Generation</h1>
                <p className="text-slate-400 text-sm">Created with FlashFusion AI</p>
              </div>
            </div>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <CinematicButton variant="secondary" icon={ExternalLink}>
                Visit FlashFusion
              </CinematicButton>
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <CinematicCard>
          <div className="p-8">
            {/* Metadata */}
            <div className="flex items-center gap-4 mb-6">
              <CinematicBadge variant="primary">
                {generation.type}
              </CinematicBadge>
              <span className="text-slate-400 text-sm">
                {format(new Date(generation.created_date), 'MMMM d, yyyy')}
              </span>
            </div>

            {/* Prompt */}
            {generation.prompt && (
              <div className="mb-6">
                <p className="text-slate-400 text-sm mb-2">Prompt</p>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-slate-300">{generation.prompt}</p>
                </div>
              </div>
            )}

            {/* Result */}
            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-2">Generated Output</p>
              <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                {isVisual && generation.result ? (
                  <img src={generation.result} alt="Generated" className="w-full h-auto" />
                ) : (
                  <pre className="p-6 text-slate-300 text-sm font-mono whitespace-pre-wrap max-h-96 overflow-auto">
                    {generation.result}
                  </pre>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <CinematicButton variant="primary" icon={Download} onClick={handleDownload} glow>
                Download
              </CinematicButton>
              <CinematicButton variant="secondary" icon={Copy} onClick={handleCopy}>
                Copy
              </CinematicButton>
            </div>
          </div>
        </CinematicCard>

        {/* Branding */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Powered by <span className="text-orange-500 font-semibold">FlashFusion</span> • Transform ideas into reality with AI
          </p>
        </div>
      </div>
    </div>
  );
}