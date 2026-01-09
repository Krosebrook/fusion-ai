import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Sparkles, Code, Server, Package, Box, Trash2, 
  Search, TrendingUp, CheckCircle2, Zap
} from "lucide-react";

const projectIcons = {
  react: Code,
  nextjs: Zap,
  vue: Code,
  node: Server,
  python: Package,
  docker: Box
};

const projectColors = {
  react: "#61DAFB",
  nextjs: "#000000",
  vue: "#42B883",
  node: "#339933",
  python: "#3776AB",
  docker: "#2496ED"
};

export default function TemplateLibrary({ onSelectTemplate, onClose }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: templates = [] } = useQuery({
    queryKey: ['pipelineTemplates'],
    queryFn: () => base44.entities.PipelineTemplate.list('-usage_count')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PipelineTemplate.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['pipelineTemplates'])
  });

  const selectMutation = useMutation({
    mutationFn: async (template) => {
      await base44.entities.PipelineTemplate.update(template.id, {
        usage_count: (template.usage_count || 0) + 1
      });
      return template;
    },
    onSuccess: (template) => {
      queryClient.invalidateQueries(['pipelineTemplates']);
      onSelectTemplate(template.configuration);
    }
  });

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.project_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const defaultTemplates = filteredTemplates.filter(t => t.is_default);
  const userTemplates = filteredTemplates.filter(t => !t.is_default);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-white/10 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
        backdropFilter: "blur(20px)"
      }}
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Pipeline Templates
            </h3>
            <p className="text-sm text-gray-400 mt-1">Pre-configured setups for faster pipeline creation</p>
          </div>
          {onClose && (
            <Button variant="ghost" onClick={onClose} className="text-gray-400">
              Close
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
        {/* Default Templates */}
        {defaultTemplates.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-semibold text-white uppercase tracking-wide">System Templates</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {defaultTemplates.map((template, idx) => {
                const Icon = projectIcons[template.project_type] || Code;
                const color = template.color || projectColors[template.project_type];

                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group rounded-xl border border-white/10 p-6 hover:border-purple-500/30 transition-all cursor-pointer"
                    style={{ background: "rgba(15, 23, 42, 0.5)" }}
                    onClick={() => selectMutation.mutate(template)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="w-6 h-6" style={{ color }} />
                      </div>
                      {template.usage_count > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <TrendingUp className="w-3 h-3" />
                          {template.usage_count}
                        </div>
                      )}
                    </div>
                    <h5 className="text-lg font-bold text-white mb-2">{template.name}</h5>
                    <p className="text-sm text-gray-400 mb-4">{template.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {template.configuration.quality_gates?.enabled && (
                        <span className="px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Quality Gates
                        </span>
                      )}
                      {template.configuration.auto_scale && (
                        <span className="px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Auto-Scale
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Use Template
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* User Templates */}
        {userTemplates.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">My Templates</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {userTemplates.map((template, idx) => {
                const Icon = projectIcons[template.project_type] || Code;
                const color = template.color || projectColors[template.project_type];

                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group rounded-xl border border-white/10 p-6 hover:border-blue-500/30 transition-all"
                    style={{ background: "rgba(15, 23, 42, 0.5)" }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="w-6 h-6" style={{ color }} />
                      </div>
                      <div className="flex items-center gap-2">
                        {template.usage_count > 0 && (
                          <span className="text-xs text-gray-400">{template.usage_count}×</span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(template.id);
                          }}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <h5 className="text-lg font-bold text-white mb-2">{template.name}</h5>
                    <p className="text-sm text-gray-400 mb-4">{template.description}</p>
                    
                    <Button
                      size="sm"
                      onClick={() => selectMutation.mutate(template)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
                    >
                      Use Template
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No templates found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}