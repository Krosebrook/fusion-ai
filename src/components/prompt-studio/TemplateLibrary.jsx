import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, TrendingUp, Clock } from 'lucide-react';
import { CinematicCard } from '../atoms/CinematicCard';
import { toast } from 'sonner';

const TASK_PRESETS = {
  'user-journey-analysis': {
    name: 'User Journey Analysis',
    category: 'analysis',
    description: 'Analyze user flows and identify friction points',
    template: `You are a UX researcher analyzing user journeys. Given the following user flow:

{{user_flow}}

Analyze this journey and:
1. Map out all steps in the flow
2. Identify friction points and pain points
3. Suggest specific improvements
4. Estimate impact of each improvement

Output your analysis in a structured format with actionable recommendations.`,
    variables: [
      { name: 'user_flow', type: 'string', required: true }
    ],
    icon: '🔍'
  },
  'ab-test-hypothesis': {
    name: 'A/B Test Hypothesis Generator',
    category: 'generation',
    description: 'Generate testable hypotheses from friction points',
    template: `Based on this friction point in the user experience:

{{friction_point}}

Generate 3 A/B test hypotheses following this structure:
1. Hypothesis statement (If we change X, then Y will happen because Z)
2. Variant A (control) description
3. Variant B (treatment) description
4. Success metrics
5. Required sample size estimate
6. Test duration recommendation

Make hypotheses specific, measurable, and actionable.`,
    variables: [
      { name: 'friction_point', type: 'string', required: true }
    ],
    icon: '🧪'
  },
  'code-review': {
    name: 'Code Review Assistant',
    category: 'analysis',
    description: 'Review code for quality, security, and best practices',
    template: `Review the following {{language}} code:

\`\`\`{{language}}
{{code}}
\`\`\`

Provide:
1. Code quality assessment (1-10)
2. Security vulnerabilities found
3. Performance issues
4. Best practice violations
5. Specific refactoring suggestions with code examples

Be thorough but constructive.`,
    variables: [
      { name: 'code', type: 'string', required: true },
      { name: 'language', type: 'string', required: true }
    ],
    icon: '💻'
  },
  'content-optimizer': {
    name: 'Content Optimizer',
    category: 'generation',
    description: 'Optimize content for clarity, engagement, and SEO',
    template: `Optimize the following content for {{target_audience}}:

{{content}}

Goals:
- {{goals}}

Provide:
1. Improved version with track changes
2. Readability score improvement
3. SEO keywords added
4. Engagement hooks identified
5. Call-to-action suggestions`,
    variables: [
      { name: 'content', type: 'string', required: true },
      { name: 'target_audience', type: 'string', required: true },
      { name: 'goals', type: 'string', required: false }
    ],
    icon: '✍️'
  },
  'data-synthesis': {
    name: 'Data Synthesis',
    category: 'analysis',
    description: 'Synthesize insights from multiple data sources',
    template: `Synthesize insights from these data sources:

{{data_sources}}

Create:
1. Executive summary (3-5 key findings)
2. Trend analysis
3. Anomalies or outliers detected
4. Actionable recommendations
5. Next steps

Focus on {{focus_area}} if specified.`,
    variables: [
      { name: 'data_sources', type: 'string', required: true },
      { name: 'focus_area', type: 'string', required: false }
    ],
    icon: '📊'
  }
};

export function TemplateLibrary({ onSelectTemplate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: templates = [] } = useQuery({
    queryKey: ['prompt-templates'],
    queryFn: () => base44.entities.PromptTemplate.list('-created_date', 100)
  });

  const copyPreset = (presetKey) => {
    const preset = TASK_PRESETS[presetKey];
    onSelectTemplate({
      name: preset.name,
      description: preset.description,
      template: preset.template,
      category: preset.category,
      variables: preset.variables
    });
    toast.success(`Loaded template: ${preset.name}`);
  };

  const filteredPresets = Object.entries(TASK_PRESETS).filter(([key, preset]) => {
    const matchesSearch = preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         preset.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || preset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="bg-slate-800/50 border-white/10 text-white pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48 bg-slate-800/50 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="analysis">Analysis</SelectItem>
            <SelectItem value="generation">Generation</SelectItem>
            <SelectItem value="chain">Chain</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Preset Templates */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Task Presets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPresets.map(([key, preset]) => (
            <CinematicCard 
              key={key}
              className="p-4 cursor-pointer hover:border-purple-500/30 transition-colors"
              onClick={() => copyPreset(key)}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{preset.icon}</span>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                  {preset.category}
                </Badge>
              </div>
              <h4 className="text-white font-semibold mb-1">{preset.name}</h4>
              <p className="text-white/60 text-sm mb-3 line-clamp-2">{preset.description}</p>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <FileText className="w-3 h-3" />
                <span>{preset.variables.length} variables</span>
              </div>
            </CinematicCard>
          ))}
        </div>
      </div>

      {/* User Templates */}
      {templates.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Your Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <CinematicCard 
                key={template.id}
                className="p-4 cursor-pointer hover:border-purple-500/30 transition-colors"
                onClick={() => onSelectTemplate(template)}
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge className="bg-slate-700/50 border-white/10 text-xs">
                    {template.category}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {template.usage_count > 0 && (
                      <div className="flex items-center gap-1 text-white/60 text-xs">
                        <TrendingUp className="w-3 h-3" />
                        {template.usage_count}
                      </div>
                    )}
                  </div>
                </div>
                <h4 className="text-white font-semibold mb-1">{template.name}</h4>
                <p className="text-white/60 text-sm mb-3 line-clamp-2">{template.description}</p>
                <div className="flex items-center justify-between text-xs text-white/40">
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>{template.variables?.length || 0} variables</span>
                  </div>
                  {template.avg_latency_ms && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{template.avg_latency_ms}ms</span>
                    </div>
                  )}
                </div>
              </CinematicCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}