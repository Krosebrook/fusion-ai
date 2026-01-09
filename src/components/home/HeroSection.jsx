import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { PlayCircle, Users, Gift, Clock } from 'lucide-react';
import InteractiveDemoPreview from '@/components/InteractiveDemoPreview';

const FLOATING_FEATURES = [
  { icon: '⚡', text: '10x Faster Development' },
  { icon: '🛡️', text: 'Enterprise Security' },
  { icon: '💰', text: 'Built-in Monetization' },
];

export function HeroSection() {
  return (
    <section className="relative py-20 px-6 overflow-hidden bg-slate-900/60 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Top Banners */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 bg-gray-800/50 border border-gray-700 rounded-full px-4 py-2"
          >
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 text-sm font-medium">Join 10,000+ creators building the future</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-3 bg-purple-900/50 border border-purple-700 rounded-full px-4 py-2 text-sm"
          >
            <Gift className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-white">Limited Time Launch Offer:</span>
            <span className="font-bold text-pink-400">50% OFF</span>
            <span className="text-gray-300">for 4 months</span>
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Limited spots available</span>
          </motion.div>
        </div>

        {/* Hero Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-['Space_Grotesk']">
            <span className="text-white">Transform Ideas Into </span>
            <span className="bg-gradient-to-r from-yellow-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Reality With AI
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            The most advanced AI development platform that turns your concepts into{' '}
            <span className="text-orange-400 font-semibold">production-ready applications</span>,
            content, and revenue streams in minutes, not months.
          </p>
        </motion.div>
        
        {/* Interactive Demo */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative max-w-4xl mx-auto"
        >
          <InteractiveDemoPreview />

          {/* Floating Feature Tags */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {FLOATING_FEATURES.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="absolute flex items-center gap-2 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-full px-4 py-2 text-cyan-400"
                style={{
                  transform: `rotate(${i * 60 - 60}deg) translate(250px) rotate(${-(i * 60 - 60)}deg)`,
                  animation: `float ${6 + i*2}s ease-in-out infinite alternate`
                }}
              >
                <span>{feature.icon}</span>
                <span className="text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12"
        >
          <div className="relative">
            <Button
              onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg px-10 py-8 rounded-xl shadow-2xl shadow-orange-500/30"
            >
              <div className="flex flex-col items-center">
                <span className="font-bold">Get 50% Off - Start Building</span>
                <span className="text-xs text-orange-200 mt-1">4 months promotional pricing</span>
              </div>
            </Button>
            <div className="absolute -top-3 -right-3 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full transform rotate-12">
              50% OFF
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => document.querySelector('#demo')?.scrollIntoView({ behavior: 'smooth' })}
            className="border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white text-lg px-10 py-8 rounded-xl"
          >
            <div className="flex flex-col items-center">
              <span className="font-bold flex items-center gap-2">
                <PlayCircle className="w-5 h-5"/> Try Interactive Demo
              </span>
              <span className="text-xs text-gray-500 mt-1">No signup required</span>
            </div>
          </Button>
        </motion.div>
      </div>

      <style>{`
        @keyframes float {
          from { transform: translateY(0px); }
          to { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  );
}