/**
 * Review Step
 * Summary of all preferences with edit shortcuts
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Edit2 } from 'lucide-react';

export function ReviewStep({ data = {} }) {
  const { deal_sourcing = {}, portfolio_goals = {}, community_preferences = {} } = data;

  const SectionRow = ({ label, value, icon }) => (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/5 border border-white/10">
      <div>
        <p className="text-white/60 text-sm">{label}</p>
        <p className="text-white font-semibold">{value}</p>
      </div>
      {icon && <span className="text-2xl">{icon}</span>}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Deal Sourcing Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-xl font-bold text-white mb-4">📊 Deal Sourcing</h3>
        <div className="space-y-3">
          <SectionRow
            label="Target Industries"
            value={deal_sourcing.target_industries?.join(', ') || 'Not set'}
          />
          <SectionRow
            label="Investment Range"
            value={
              deal_sourcing.investment_range?.min_usd
                ? `$${(deal_sourcing.investment_range.min_usd / 1000).toFixed(0)}K - $${(deal_sourcing.investment_range.max_usd / 1000).toFixed(0)}K`
                : 'Not set'
            }
          />
          <SectionRow
            label="Deal Structures"
            value={deal_sourcing.preferred_structures?.join(', ') || 'Not set'}
          />
          <SectionRow
            label="Geographic Focus"
            value={deal_sourcing.geography?.join(', ') || 'Not set'}
          />
          <SectionRow
            label="Risk Tolerance"
            value={
              deal_sourcing.risk_tolerance
                ? deal_sourcing.risk_tolerance.charAt(0).toUpperCase() + deal_sourcing.risk_tolerance.slice(1)
                : 'Not set'
            }
          />
        </div>
      </motion.div>

      {/* Portfolio Goals Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-xl font-bold text-white mb-4">🎯 Portfolio Goals</h3>
        <div className="space-y-3">
          <SectionRow
            label="Time Horizon"
            value={
              portfolio_goals.time_horizon
                ? {
                    short_term: '1–3 years',
                    medium_term: '3–7 years',
                    long_term: '7+ years'
                  }[portfolio_goals.time_horizon]
                : 'Not set'
            }
          />
          <SectionRow
            label="Target Annual Return"
            value={portfolio_goals.target_annual_return ? `${portfolio_goals.target_annual_return}% IRR` : 'Not set'}
          />
          <SectionRow
            label="Diversification Strategy"
            value={
              portfolio_goals.diversification_preference
                ? {
                    high: 'High (15+ positions)',
                    moderate: 'Moderate (5–10 positions)',
                    focused: 'Focused (1–4 positions)'
                  }[portfolio_goals.diversification_preference]
                : 'Not set'
            }
          />
          <SectionRow
            label="Asset Classes"
            value={portfolio_goals.asset_class_focus?.join(', ') || 'Not set'}
          />
        </div>
      </motion.div>

      {/* Community Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="text-xl font-bold text-white mb-4">👥 Community & Privacy</h3>
        <div className="space-y-3">
          <SectionRow
            label="Peer Network Interests"
            value={community_preferences.peer_group_interests?.join(', ') || 'Not set'}
          />
          <SectionRow
            label="Engagement Mode"
            value={
              community_preferences.engagement_mode
                ? community_preferences.engagement_mode.replace(/_/g, ' ').toUpperCase()
                : 'Not set'
            }
          />
          <SectionRow
            label="Notification Frequency"
            value={
              community_preferences.notification_frequency
                ? community_preferences.notification_frequency.replace(/_/g, ' ').replace('Bi Weekly', 'Bi-Weekly').toUpperCase()
                : 'Not set'
            }
          />
          <SectionRow
            label="Privacy Level"
            value={
              {
                public: '🌐 Public',
                community_only: '👥 Community Only',
                private: '🔒 Private'
              }[community_preferences.privacy_tier] || 'Not set'
            }
          />
          <div className="pt-3 space-y-2 text-white/60 text-sm">
            {community_preferences.share_portfolio && <p>✓ Portfolio sharing enabled</p>}
            {community_preferences.share_insights && <p>✓ Deal insights sharing enabled</p>}
          </div>
        </div>
      </motion.div>

      {/* Final CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-lg p-6 text-center"
      >
        <p className="text-white/80 mb-2">
          Ready to get started? Complete your setup and start discovering personalized opportunities.
        </p>
        <p className="text-sm text-white/60">You can update these preferences anytime in Settings.</p>
      </motion.div>
    </div>
  );
}

export default ReviewStep;