import { motion } from 'framer-motion';
import { Star, Users, Zap, Shield } from 'lucide-react';

const STATS = [
  { icon: Users, value: '10,000+', label: 'Active Creators', color: '#00B4D8' },
  { icon: Zap, value: '1M+', label: 'AI Generations', color: '#FF7B00' },
  { icon: Star, value: '4.9/5', label: 'User Rating', color: '#F59E0B' },
  { icon: Shield, value: '99.9%', label: 'Uptime SLA', color: '#10B981' },
];

const LOGOS = [
  { name: 'TechCrunch', opacity: 0.6 },
  { name: 'ProductHunt', opacity: 0.6 },
  { name: 'YCombinator', opacity: 0.6 },
  { name: 'Forbes', opacity: 0.6 },
];

export function SocialProof() {
  return (
    <section className="py-16 px-6 bg-slate-900/80 border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div 
                className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-white/5"
        >
          <span className="text-sm text-gray-500 uppercase tracking-wider">Featured in</span>
          {LOGOS.map((logo) => (
            <div 
              key={logo.name}
              className="text-lg font-bold text-gray-500"
              style={{ opacity: logo.opacity }}
            >
              {logo.name}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}