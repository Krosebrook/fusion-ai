import { motion } from 'framer-motion';
import { 
  Database, Cloud, MessageSquare, 
  BarChart3, ShoppingCart, Code, Cpu, Globe 
} from 'lucide-react';

const INTEGRATIONS = [
  { name: 'OpenAI', icon: Cpu, color: '#10A37F' },
  { name: 'Claude', icon: Cpu, color: '#CC785C' },
  { name: 'GitHub', icon: Code, color: '#181717' },
  { name: 'Vercel', icon: Cloud, color: '#000000' },
  { name: 'Stripe', icon: ShoppingCart, color: '#635BFF' },
  { name: 'Slack', icon: MessageSquare, color: '#4A154B' },
  { name: 'PostgreSQL', icon: Database, color: '#336791' },
  { name: 'MongoDB', icon: Database, color: '#47A248' },
  { name: 'Supabase', icon: Database, color: '#3ECF8E' },
  { name: 'AWS', icon: Cloud, color: '#FF9900' },
  { name: 'Sentry', icon: BarChart3, color: '#362D59' },
  { name: 'Notion', icon: Globe, color: '#000000' },
];

export function IntegrationsShowcase() {
  return (
    <section className="py-20 px-6 bg-slate-900/90 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4 font-['Space_Grotesk']">
            Integrates with your entire stack
          </h2>
          <p className="text-gray-400">
            27+ native integrations to supercharge your workflow
          </p>
        </motion.div>

        {/* Scrolling Integration Icons */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-900 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-900 to-transparent z-10" />
          
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: '-50%' }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="flex gap-6"
          >
            {[...INTEGRATIONS, ...INTEGRATIONS].map((integration, index) => (
              <div
                key={`${integration.name}-${index}`}
                className="flex-shrink-0 w-32 h-20 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                <integration.icon className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-400">{integration.name}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <span className="text-sm text-gray-500">
            Plus n8n, Zapier, HuggingFace, Firebase, Algolia, and more...
          </span>
        </motion.div>
      </div>
    </section>
  );
}