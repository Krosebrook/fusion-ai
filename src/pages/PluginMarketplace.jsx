/**
 * Plugin Marketplace
 * Browse and install plugins to extend FlashFusion
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '../components/atoms/CinematicCard';
import { CinematicButton } from '../components/atoms/CinematicButton';
import { useEntity } from '../components/hooks/useEntity';
import { pluginService } from '../components/services/PluginService';
import { 
  Package, 
  Search, 
  Star, 
  Download,
  Zap,
  Shield,
  BarChart3,
  Bot,
  Link as LinkIcon,
  Wrench,
  Rocket,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const categories = [
  { value: 'all', label: 'All Plugins', icon: Package },
  { value: 'ai_model', label: 'AI Models', icon: Bot },
  { value: 'integration', label: 'Integrations', icon: LinkIcon },
  { value: 'analytics', label: 'Analytics', icon: BarChart3 },
  { value: 'security', label: 'Security', icon: Shield },
  { value: 'workflow', label: 'Workflow', icon: Zap },
  { value: 'cicd', label: 'CI/CD', icon: Rocket },
  { value: 'utility', label: 'Utilities', icon: Wrench },
];

export default function PluginMarketplacePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [installing, setInstalling] = useState(null);

  const { data: plugins, isLoading } = useEntity({
    entityName: 'Plugin',
    filters: { is_public: true, status: 'active' },
  });

  const { data: installations } = useEntity({
    entityName: 'PluginInstallation',
  });

  const filteredPlugins = plugins?.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(search.toLowerCase()) ||
                         plugin.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || plugin.category === category;
    return matchesSearch && matchesCategory;
  }) || [];

  const isInstalled = (pluginId) => {
    return installations?.some(i => i.plugin_id === pluginId && i.status === 'active');
  };

  const handleInstall = async (plugin) => {
    setInstalling(plugin.id);
    try {
      const result = await pluginService.installPlugin(plugin.id, {});
      toast.success(`✅ ${plugin.name} installed successfully!`);
      
      toast.info(`API Key: ${result.apiKey}`, {
        duration: 10000,
        description: 'Save this key - it will not be shown again',
      });
    } catch (error) {
      console.error('Failed to install plugin', error);
      toast.error('Failed to install plugin');
    } finally {
      setInstalling(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <Package className="w-10 h-10 text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Plugin Marketplace</h1>
              <p className="text-white/60">Extend FlashFusion with third-party tools and custom AI models</p>
            </div>
          </motion.div>

          {/* Search & Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search plugins..."
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                category === cat.value
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Plugins Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white/60 mt-4">Loading plugins...</p>
          </div>
        ) : filteredPlugins.length === 0 ? (
          <CinematicCard className="p-12 text-center">
            <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No plugins found</h3>
            <p className="text-white/60">Try adjusting your search or filters</p>
          </CinematicCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlugins.map((plugin) => (
              <motion.div
                key={plugin.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CinematicCard className="p-6 h-full flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl flex-shrink-0">
                      {pluginService.getCategoryIcon(plugin.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 truncate">
                        {plugin.name}
                      </h3>
                      <p className="text-white/60 text-sm">{plugin.author}</p>
                    </div>
                  </div>

                  <p className="text-white/70 text-sm mb-4 flex-1">
                    {plugin.description}
                  </p>

                  <div className="flex items-center gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{plugin.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/60">
                      <Download className="w-4 h-4" />
                      <span>{plugin.installation_count || 0}</span>
                    </div>
                    <div className="text-white/40 text-xs ml-auto">
                      v{plugin.version}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 rounded-lg bg-white/10 text-white/80 text-xs">
                      {plugin.category}
                    </span>
                    {plugin.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-1 rounded-lg bg-white/5 text-white/60 text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {isInstalled(plugin.id) ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 text-sm font-semibold">
                      <Shield className="w-4 h-4" />
                      Installed
                    </div>
                  ) : (
                    <CinematicButton
                      variant="primary"
                      onClick={() => handleInstall(plugin)}
                      disabled={installing !== null}
                      glow
                    >
                      {installing === plugin.id ? 'Installing...' : 'Install'}
                    </CinematicButton>
                  )}
                </CinematicCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}