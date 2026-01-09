import { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Zap, Search, CheckCircle2, Settings,
  Workflow, Database, Cloud, Bot, MessageSquare, ShoppingCart,
  Mail, Shield, Globe, GitBranch, Sparkles,
  Plus, ExternalLink, Activity
} from "lucide-react";
import { toast } from "sonner";

const INTEGRATION_CATALOG = [
  {
    slug: 'n8n',
    name: 'n8n.io',
    category: 'automation',
    icon: Workflow,
    color: '#FF6D5A',
    description: 'Workflow automation platform with 400+ integrations',
    capabilities: ['workflows', 'executions', 'webhooks', 'credentials'],
    function: 'n8nIntegration',
    docsUrl: 'https://docs.n8n.io/api/',
    popular: true
  },
  {
    slug: 'zapier',
    name: 'Zapier',
    category: 'automation',
    icon: Zap,
    color: '#FF4A00',
    description: 'Connect 6000+ apps with automated workflows',
    capabilities: ['zaps', 'tasks', 'webhooks', 'nla'],
    function: 'zapierIntegration',
    popular: true
  },
  {
    slug: 'notion',
    name: 'Notion',
    category: 'productivity',
    icon: Database,
    color: '#000000',
    description: 'All-in-one workspace for notes and knowledge',
    capabilities: ['pages', 'databases', 'blocks', 'search'],
    function: 'notionIntegration',
    popular: true
  },
  {
    slug: 'google',
    name: 'Google Ecosystem',
    category: 'productivity',
    icon: Globe,
    color: '#4285F4',
    description: 'Drive, Sheets, Docs, Calendar, Gmail, Analytics',
    capabilities: ['drive', 'sheets', 'docs', 'calendar', 'gmail', 'analytics'],
    function: 'googleIntegration',
    popular: true
  },
  {
    slug: 'github',
    name: 'GitHub',
    category: 'deployment',
    icon: GitBranch,
    color: '#181717',
    description: 'Version control and CI/CD automation',
    capabilities: ['repos', 'issues', 'prs', 'actions', 'releases'],
    function: 'githubIntegration',
    popular: true
  },
  {
    slug: 'redis',
    name: 'Redis',
    category: 'database',
    icon: Database,
    color: '#DC382D',
    description: 'In-memory data store for caching and queues',
    capabilities: ['strings', 'hashes', 'lists', 'sets', 'streams'],
    function: 'redisIntegration'
  },
  {
    slug: 'openai',
    name: 'OpenAI',
    category: 'ai',
    icon: Sparkles,
    color: '#10A37F',
    description: 'GPT models, images, audio, embeddings',
    capabilities: ['chat', 'images', 'audio', 'embeddings', 'assistants'],
    function: 'openaiIntegration',
    popular: true
  },
  {
    slug: 'claude',
    name: 'Anthropic Claude',
    category: 'ai',
    icon: Bot,
    color: '#D97757',
    description: 'Advanced AI with vision and tool use',
    capabilities: ['messages', 'vision', 'tools', 'code'],
    function: 'claudeIntegration',
    popular: true
  },
  {
    slug: 'gemini',
    name: 'Google Gemini',
    category: 'ai',
    icon: Sparkles,
    color: '#8E75B4',
    description: 'Multimodal AI for text, vision, code',
    capabilities: ['text', 'vision', 'code', 'embeddings'],
    function: 'geminiIntegration'
  },
  {
    slug: 'vercel',
    name: 'Vercel',
    category: 'deployment',
    icon: Cloud,
    color: '#000000',
    description: 'Deploy and scale web applications',
    capabilities: ['projects', 'deployments', 'domains', 'env'],
    function: 'vercelIntegration',
    popular: true
  },
  {
    slug: 'sentry',
    name: 'Sentry',
    category: 'monitoring',
    icon: Shield,
    color: '#362D59',
    description: 'Error monitoring and performance tracking',
    capabilities: ['issues', 'events', 'releases', 'alerts'],
    function: 'sentryIntegration'
  },
  {
    slug: 'slack',
    name: 'Slack',
    category: 'communication',
    icon: MessageSquare,
    color: '#4A154B',
    description: 'Team messaging and collaboration',
    capabilities: ['messages', 'channels', 'users', 'files'],
    function: 'slackIntegration'
  },
  {
    slug: 'discord',
    name: 'Discord',
    category: 'communication',
    icon: MessageSquare,
    color: '#5865F2',
    description: 'Community chat and voice',
    capabilities: ['messages', 'channels', 'guilds', 'webhooks'],
    function: 'discordIntegration'
  },
  {
    slug: 'linear',
    name: 'Linear',
    category: 'productivity',
    icon: Activity,
    color: '#5E6AD2',
    description: 'Project management for software teams',
    capabilities: ['issues', 'projects', 'teams', 'cycles'],
    function: 'linearIntegration'
  },
  {
    slug: 'stripe',
    name: 'Stripe',
    category: 'commerce',
    icon: ShoppingCart,
    color: '#635BFF',
    description: 'Payment processing and billing',
    capabilities: ['customers', 'products', 'subscriptions', 'invoices'],
    function: 'stripeIntegration'
  },
  {
    slug: 'supabase',
    name: 'Supabase',
    category: 'database',
    icon: Database,
    color: '#3ECF8E',
    description: 'Open source Firebase alternative',
    capabilities: ['database', 'auth', 'storage', 'functions'],
    function: 'supabaseIntegration'
  },
  {
    slug: 'twilio',
    name: 'Twilio',
    category: 'communication',
    icon: MessageSquare,
    color: '#F22F46',
    description: 'SMS, voice, WhatsApp communications',
    capabilities: ['sms', 'voice', 'whatsapp', 'verify'],
    function: 'twilioIntegration'
  },
  {
    slug: 'airtable',
    name: 'Airtable',
    category: 'database',
    icon: Database,
    color: '#18BFFF',
    description: 'Flexible spreadsheet-database hybrid',
    capabilities: ['bases', 'tables', 'records', 'webhooks'],
    function: 'airtableIntegration'
  },
  {
    slug: 'sendgrid',
    name: 'SendGrid',
    category: 'communication',
    icon: Mail,
    color: '#1A82E2',
    description: 'Email delivery and marketing platform',
    capabilities: ['mail', 'templates', 'contacts', 'stats'],
    function: 'sendgridIntegration'
  },
  {
    slug: 'aws',
    name: 'Amazon Web Services',
    category: 'cloud',
    icon: Cloud,
    color: '#FF9900',
    description: 'S3, Lambda, SES, SNS, SQS, DynamoDB',
    capabilities: ['s3', 'lambda', 'ses', 'sns', 'sqs', 'dynamodb'],
    function: 'awsIntegration'
  },
  {
    slug: 'replicate',
    name: 'Replicate',
    category: 'ai',
    icon: Sparkles,
    color: '#000000',
    description: 'Run AI models in the cloud',
    capabilities: ['predictions', 'models', 'deployments'],
    function: 'replicateIntegration'
  },
  {
    slug: 'huggingface',
    name: 'HuggingFace',
    category: 'ai',
    icon: Bot,
    color: '#FFD21E',
    description: 'ML models and datasets',
    capabilities: ['inference', 'models', 'datasets', 'spaces'],
    function: 'huggingfaceIntegration'
  },
  {
    slug: 'postgres',
    name: 'PostgreSQL',
    category: 'database',
    icon: Database,
    color: '#336791',
    description: 'Advanced relational database',
    capabilities: ['query', 'insert', 'update', 'delete', 'transactions'],
    function: 'postgresIntegration'
  },
  {
    slug: 'mongodb',
    name: 'MongoDB',
    category: 'database',
    icon: Database,
    color: '#47A248',
    description: 'NoSQL document database',
    capabilities: ['find', 'insert', 'update', 'delete', 'aggregate'],
    function: 'mongodbIntegration'
  },
  {
    slug: 'shopify',
    name: 'Shopify',
    category: 'commerce',
    icon: ShoppingCart,
    color: '#96BF48',
    description: 'E-commerce platform',
    capabilities: ['products', 'orders', 'customers', 'inventory'],
    function: 'shopifyIntegration'
  },
  {
    slug: 'firebase',
    name: 'Firebase',
    category: 'cloud',
    icon: Cloud,
    color: '#FFCA28',
    description: 'Google app development platform',
    capabilities: ['firestore', 'realtime-db', 'auth', 'storage', 'messaging'],
    function: 'firebaseIntegration'
  },
  {
    slug: 'algolia',
    name: 'Algolia',
    category: 'database',
    icon: Search,
    color: '#5468FF',
    description: 'Search and discovery API',
    capabilities: ['search', 'indexing', 'analytics', 'rules'],
    function: 'algoliaIntegration'
  }
];

const CATEGORY_CONFIG = {
  automation: { color: '#FF7B00', label: 'Automation' },
  ai: { color: '#8B5CF6', label: 'AI & ML' },
  database: { color: '#00B4D8', label: 'Database' },
  deployment: { color: '#10B981', label: 'Deployment' },
  monitoring: { color: '#EF4444', label: 'Monitoring' },
  productivity: { color: '#F59E0B', label: 'Productivity' },
  communication: { color: '#EC4899', label: 'Communication' },
  commerce: { color: '#14B8A6', label: 'Commerce' },
  cloud: { color: '#6366F1', label: 'Cloud' }
};

export default function IntegrationsHubPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showConnected, setShowConnected] = useState(false);

  const { data: integrations = [] } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => base44.entities.Integration?.list?.('-created_date') || []
  });

  const { data: actions = [] } = useQuery({
    queryKey: ['integrationActions'],
    queryFn: () => base44.entities.IntegrationAction?.list?.('-created_date', 50) || []
  });

  const connectMutation = useMutation({
    mutationFn: async (integration) => {
      return base44.entities.Integration.create({
        name: integration.name,
        slug: integration.slug,
        category: integration.category,
        provider: integration.name,
        description: integration.description,
        icon_url: integration.icon,
        color: integration.color,
        status: 'pending',
        auth_type: 'api_key',
        capabilities: integration.capabilities
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations']);
      toast.success('Integration added');
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return base44.entities.Integration.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations']);
    }
  });

  const connectedSlugs = integrations.filter(i => i.status === 'connected').map(i => i.slug);

  const filteredCatalog = INTEGRATION_CATALOG.filter(int => {
    const matchesSearch = int.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         int.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || int.category === categoryFilter;
    const matchesConnected = !showConnected || connectedSlugs.includes(int.slug);
    return matchesSearch && matchesCategory && matchesConnected;
  });

  const stats = {
    total: INTEGRATION_CATALOG.length,
    connected: connectedSlugs.length,
    actionsToday: actions.filter(a => new Date(a.created_date).toDateString() === new Date().toDateString()).length,
    categories: Object.keys(CATEGORY_CONFIG).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-medium">27 Integrations</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Integrations Hub
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Connect FlashFusion with your entire tech stack. Deep integrations built at maximum depth.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-4"
        >
          {[
            { label: 'Available', value: stats.total, icon: Zap, color: '#FF7B00' },
            { label: 'Connected', value: stats.connected, icon: CheckCircle2, color: '#10B981' },
            { label: 'Actions Today', value: stats.actionsToday, icon: Activity, color: '#00B4D8' },
            { label: 'Categories', value: stats.categories, icon: Settings, color: '#8B5CF6' }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              className="rounded-xl border border-white/10 p-4"
              style={{ background: `linear-gradient(135deg, ${stat.color}10 0%, rgba(30, 41, 59, 0.9) 100%)` }}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                <span className="text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-4 items-center"
        >
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={categoryFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setCategoryFilter('all')}
              className={categoryFilter === 'all' ? '' : 'border-white/10 text-gray-400'}
            >
              All
            </Button>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <Button
                key={key}
                size="sm"
                variant={categoryFilter === key ? 'default' : 'outline'}
                onClick={() => setCategoryFilter(key)}
                className={categoryFilter === key ? '' : 'border-white/10 text-gray-400'}
                style={categoryFilter === key ? { background: config.color } : {}}
              >
                {config.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={showConnected} onCheckedChange={setShowConnected} />
            <span className="text-sm text-gray-400">Connected only</span>
          </div>
        </motion.div>

        {/* Integration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCatalog.map((integration, idx) => {
            const isConnected = connectedSlugs.includes(integration.slug);
            const IntegrationIcon = integration.icon;
            const connected = integrations.find(i => i.slug === integration.slug);

            return (
              <motion.div
                key={integration.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all"
                style={{ background: `linear-gradient(135deg, ${integration.color}08 0%, rgba(30, 41, 59, 0.95) 100%)` }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                           style={{ background: `${integration.color}20` }}>
                        <IntegrationIcon className="w-6 h-6" style={{ color: integration.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          {integration.name}
                          {integration.popular && (
                            <Badge className="bg-orange-500/20 text-orange-400 border-0 text-xs">Popular</Badge>
                          )}
                        </h3>
                        <Badge className="text-xs mt-1" style={{ background: `${CATEGORY_CONFIG[integration.category].color}20`, color: CATEGORY_CONFIG[integration.category].color }}>
                          {CATEGORY_CONFIG[integration.category].label}
                        </Badge>
                      </div>
                    </div>
                    {isConnected && (
                      <Badge className="bg-green-500/20 text-green-400 border-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{integration.description}</p>

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {integration.capabilities.slice(0, 4).map(cap => (
                      <span key={cap} className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-300">
                        {cap}
                      </span>
                    ))}
                    {integration.capabilities.length > 4 && (
                      <span className="text-xs text-gray-500">+{integration.capabilities.length - 4}</span>
                    )}
                  </div>

                  {/* Usage Stats */}
                  {connected?.usage && (
                    <div className="flex gap-3 text-xs text-gray-500 mb-4 pb-3 border-b border-white/5">
                      <span>{connected.usage.api_calls_today || 0} calls today</span>
                      <span>{connected.usage.api_calls_month || 0} this month</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!isConnected ? (
                      <Button
                        onClick={() => connectMutation.mutate(integration)}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-sm"
                        size="sm"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Connect
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => toggleMutation.mutate({ id: connected.id, status: connected.status === 'connected' ? 'disconnected' : 'connected' })}
                          variant="outline"
                          className="flex-1 border-white/10 text-sm"
                          size="sm"
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Configure
                        </Button>
                        <Button
                          variant="outline"
                          className="border-white/10 text-sm"
                          size="sm"
                          onClick={() => window.open(integration.docsUrl, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredCatalog.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No integrations found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}