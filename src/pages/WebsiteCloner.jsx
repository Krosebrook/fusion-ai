import { useState, useEffect } from 'react';
import { ClonedWebsite } from '@/entities/ClonedWebsite';
import { User } from '@/entities/User';
import CloneWebsiteForm from '@/components/openlovable/CloneWebsiteForm';
import CloneProgress from '@/components/openlovable/CloneProgress';
import ProjectCard from '@/components/openlovable/ProjectCard';
import { cloneWebsite } from '@/functions/cloneWebsite';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, History } from 'lucide-react';

export default function WebsiteClonerPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    User.me().then(setUser).catch(() => setUser(null));
    loadProjects();
  }, []);

  useEffect(() => {
    if (currentProject && ['crawling', 'generating', 'deploying'].includes(currentProject.status)) {
      // Poll for updates
      const interval = setInterval(async () => {
        const updated = await ClonedWebsite.list('-updated_date', 1);
        if (updated.length > 0 && updated[0].id === currentProject.id) {
          setCurrentProject(updated[0]);
          if (!['crawling', 'generating', 'deploying'].includes(updated[0].status)) {
            clearInterval(interval);
            setIsLoading(false);
            loadProjects();
          }
        }
      }, 2000);
      
      setPollingInterval(interval);
      return () => clearInterval(interval);
    }
  }, [currentProject?.id, currentProject?.status]);

  const loadProjects = async () => {
    if (!user) return;
    const allProjects = await ClonedWebsite.filter({ created_by: user.email }, '-created_date', 20);
    setProjects(allProjects);
  };

  const handleClone = async (formData) => {
    setIsLoading(true);
    setCurrentProject(null);

    try {
      const response = await cloneWebsite(formData);
      
      if (response.data.success) {
        // Load the created project
        const project = await ClonedWebsite.list('-created_date', 1);
        if (project.length > 0) {
          setCurrentProject(project[0]);
        }
      } else {
        alert('Clone failed: ' + (response.data.error || 'Unknown error'));
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Clone error:', error);
      alert('Clone failed: ' + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Globe className="w-10 h-10 text-blue-400" />
            Website Cloner
          </h1>
          <p className="text-gray-400 text-lg">
            Clone any website with AI-powered code generation and instant deployment
          </p>
        </div>

        <Tabs defaultValue="clone" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="clone" className="data-[state=active]:bg-gray-700">
              <Globe className="w-4 h-4 mr-2" />
              Clone New
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gray-700">
              <History className="w-4 h-4 mr-2" />
              History ({projects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clone" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <CloneWebsiteForm onSubmit={handleClone} isLoading={isLoading} />
              </div>
              
              {currentProject && (
                <div>
                  <CloneProgress 
                    status={currentProject.status} 
                    metadata={currentProject}
                  />
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {[
                {
                  title: 'AI-Powered',
                  description: 'Uses Claude 3.5 Sonnet for intelligent code generation',
                  color: 'blue',
                },
                {
                  title: 'Multiple Frameworks',
                  description: 'Support for React, Next.js, Vue, and Svelte',
                  color: 'purple',
                },
                {
                  title: 'Instant Deploy',
                  description: 'Deploy directly to Vercel with one click',
                  color: 'cyan',
                },
              ].map((feature, i) => (
                <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                  <h3 className={`text-${feature.color}-400 font-semibold mb-2`}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history">
            {projects.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 border border-gray-700 rounded-lg">
                <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No cloned websites yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Clone your first website to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}