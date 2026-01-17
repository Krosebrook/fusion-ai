/**
 * Community Preferences Step
 * Peer groups, engagement, notifications, privacy settings
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

const PEER_GROUPS = [
  'Angel Investors',
  'Institutional (Family Offices, Funds)',
  'Operators & Founders',
  'Subject Matter Experts',
  'Industry Professionals'
];

export function CommunityPreferencesStep({ data = {}, onChange }) {
  const [showHelp, setShowHelp] = useState({});

  const handlePeerToggle = (group) => {
    const current = data.peer_group_interests || [];
    const updated = current.includes(group)
      ? current.filter(g => g !== group)
      : [...current, group];
    onChange({ peer_group_interests: updated });
  };

  return (
    <div className="space-y-8">
      {/* Peer Groups */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <label className="text-lg font-semibold text-white">Types of Peer Networks</label>
          <button
            onClick={() => setShowHelp(p => ({ ...p, peers: !p.peers }))}
            className="text-white/60 hover:text-white/80"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {showHelp.peers && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 mb-4 text-sm text-white/70">
            💡 <strong>Networking groups:</strong> Angels exchange referrals & insights. <strong>Knowledge-sharing:</strong> Industry expert panels & research.
          </div>
        )}

        <div className="space-y-2">
          {PEER_GROUPS.map(group => (
            <button
              key={group}
              onClick={() => handlePeerToggle(group)}
              className={`w-full p-4 text-left rounded-lg transition-all font-medium ${
                (data.peer_group_interests || []).includes(group)
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-white/70'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Engagement Mode */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <label className="text-lg font-semibold text-white mb-4 block">Primary Engagement Mode</label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'networking', label: 'Networking', desc: 'Make connections, find deals' },
            { value: 'knowledge_sharing', label: 'Knowledge-Sharing', desc: 'Learn from experts' },
            { value: 'both', label: 'Both', desc: 'Mix of both' }
          ].map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => onChange({ engagement_mode: value })}
              className={`p-4 rounded-lg transition-all text-center ${
                data.engagement_mode === value
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-white/70'
              }`}
            >
              <div className="font-semibold">{label}</div>
              <div className="text-xs text-white/60 mt-1">{desc}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notification Frequency */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-4">
          <label className="text-lg font-semibold text-white">Communication Frequency</label>
          <button
            onClick={() => setShowHelp(p => ({ ...p, notif: !p.notif }))}
            className="text-white/60 hover:text-white/80"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {showHelp.notif && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 mb-4 text-sm text-white/70">
            💡 Choose what works for your workflow. You can always adjust later.
          </div>
        )}

        <div className="space-y-2">
          {[
            { value: 'daily', label: '📨 Daily Digest' },
            { value: 'weekly', label: '📋 Weekly Roundup' },
            { value: 'bi_weekly', label: '📌 Bi-Weekly' },
            { value: 'monthly', label: '📅 Monthly' },
            { value: 'as_needed', label: '⏸ As Needed Only' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onChange({ notification_frequency: value })}
              className={`w-full p-3 text-left rounded-lg transition-all font-medium ${
                data.notification_frequency === value
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-white/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Privacy Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <label className="text-lg font-semibold text-white mb-4 block">Privacy & Sharing</label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all cursor-pointer">
            <input
              type="checkbox"
              checked={data.share_portfolio || false}
              onChange={(e) => onChange({ share_portfolio: e.target.checked })}
              className="w-5 h-5 accent-teal-500"
            />
            <div>
              <div className="font-semibold text-white">Share Portfolio (Anonymized)</div>
              <div className="text-xs text-white/60">Allow peers to see your holdings & allocation (names hidden)</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all cursor-pointer">
            <input
              type="checkbox"
              checked={data.share_insights || false}
              onChange={(e) => onChange({ share_insights: e.target.checked })}
              className="w-5 h-5 accent-teal-500"
            />
            <div>
              <div className="font-semibold text-white">Share Deal Insights</div>
              <div className="text-xs text-white/60">Share your due diligence notes & findings with the community</div>
            </div>
          </label>
        </div>

        <div className="mt-6">
          <label className="text-lg font-semibold text-white mb-3 block">Privacy Tier</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'public', label: '🌐 Public', desc: 'Visible to all' },
              { value: 'community_only', label: '👥 Community', desc: 'Members only' },
              { value: 'private', label: '🔒 Private', desc: 'Profile hidden' }
            ].map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => onChange({ privacy_tier: value })}
                className={`p-3 rounded-lg transition-all text-center ${
                  data.privacy_tier === value
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-white/70'
                }`}
              >
                <div className="font-semibold text-sm">{label}</div>
                <div className="text-xs text-white/60 mt-1">{desc}</div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CommunityPreferencesStep;