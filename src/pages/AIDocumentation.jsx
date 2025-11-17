import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DocumentationPreview from "@/components/documentation/DocumentationPreview";
import DocumentationSettings from "@/components/documentation/DocumentationSettings";
import { 
  BookOpen, Download, FileText, Code, Users, 
  Package, Settings, Sparkles, CheckCircle2 
} from "lucide-react";

const easeInOutCubic = [0.4, 0, 0.2, 1];

export default function AIDocumentationPage() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [documentation, setDocumentation] = useState(null);
  const [docFormat, setDocFormat] = useState("markdown");
  const [docStyle, setDocStyle] = useState("detailed");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const userProjects = await base44.entities.Project.filter({ 
        created_by: currentUser.email 
      });
      setProjects(userProjects);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const generateDocumentation = async () => {
    if (!selectedProject) return;
    
    setGenerating(true);
    const project = projects.find(p => p.id === selectedProject);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate comprehensive ${docStyle} documentation for this project:
        
        Project: ${project.name}
        Description: ${project.output_data?.description}
        Tech Stack: ${JSON.stringify(project.configuration?.techStack)}
        File Structure: ${JSON.stringify(project.output_data?.fileStructure)}
        
        Include:
        1. Project Overview
        2. Installation & Setup
        3. Architecture & Structure
        4. API Reference
        5. Usage Examples
        6. Configuration Guide
        7. Troubleshooting
        8. Contributing Guidelines
        
        Format: ${docFormat}
        Style: ${docStyle}`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  subsections: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        content: { type: "string" }
                      }
                    }
                  }
                }
              }
            },
            metadata: {
              type: "object",
              properties: {
                version: { type: "string" },
                lastUpdated: { type: "string" },
                contributors: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setDocumentation(result);
    } catch (error) {
      console.error("Error generating documentation:", error);
    } finally {
      setGenerating(false);
    }
  };

  const downloadDocumentation = () => {
    if (!documentation) return;
    
    let content = `# ${documentation.title}\n\n`;
    documentation.sections.forEach(section => {
      content += `## ${section.title}\n\n${section.content}\n\n`;
      if (section.subsections) {
        section.subsections.forEach(sub => {
          content += `### ${sub.title}\n\n${sub.content}\n\n`;
        });
      }
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentation.title.replace(/\s+/g, '-')}.md`;
    a.click();
  };

  const features = [
    { icon: FileText, label: "Auto-generated", color: "#FF7B00" },
    { icon: Code, label: "Code Examples", color: "#00B4D8" },
    { icon: Users, label: "Team Ready", color: "#10B981" },
    { icon: Package, label: "Multi-format", color: "#8B5CF6" }
  ];

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeInOutCubic }}
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30"
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                AI Documentation Generator
              </h1>
              <p className="text-gray-400 mt-1">Create professional docs instantly</p>
            </div>
          </div>

          {/* Features */}
          <div className="flex gap-4 flex-wrap">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10"
              >
                <feature.icon className="w-4 h-4" style={{ color: feature.color }} />
                <span className="text-sm text-gray-300">{feature.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Configuration */}
        {!documentation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/10 p-8"
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
            }}
          >
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Generate Documentation
            </h2>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Select Project</label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Choose project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Format</label>
                <Select value={docFormat} onValueChange={setDocFormat}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Style</label>
                <Select value={docStyle} onValueChange={setDocStyle}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brief">Brief</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={generateDocumentation}
              disabled={generating || !selectedProject}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/30"
            >
              {generating ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                  Generating Documentation...
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5 mr-2" />
                  Generate Documentation
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Documentation Preview */}
        {documentation && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/30"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-white">Documentation Generated Successfully</p>
                  <p className="text-xs text-gray-400">{documentation.sections.length} sections created</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={downloadDocumentation} className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => setDocumentation(null)} variant="outline" className="border-white/10 text-gray-300">
                  Generate New
                </Button>
              </div>
            </motion.div>

            <DocumentationPreview documentation={documentation} />
          </>
        )}
      </div>
    </div>
  );
}