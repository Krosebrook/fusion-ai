import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DeploymentPipeline from "@/components/deployment/DeploymentPipeline";
import DeploymentHistory from "@/components/deployment/DeploymentHistory";
import EnvironmentConfig from "@/components/deployment/EnvironmentConfig";
import { 
  Rocket, Globe, CheckCircle2, 
  Clock, Activity 
} from "lucide-react";

const easeInOutCubic = [0.4, 0, 0.2, 1];

export default function AIDeploymentPage() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [environment, setEnvironment] = useState("production");
  const [deploying, setDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const userProjects = await base44.entities.Project.filter({ 
        created_by: currentUser.email,
        status: "completed" 
      });
      setProjects(userProjects);
      
      if (userProjects.length > 0) {
        setSelectedProject(userProjects[0].id);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const startDeployment = async () => {
    setDeploying(true);
    setDeploymentStatus({
      stage: "analyzing",
      progress: 0,
      logs: []
    });

    try {
      const project = projects.find(p => p.id === selectedProject);
      
      // Simulate deployment stages
      const stages = [
        { name: "analyzing", label: "Analyzing project structure", duration: 2000 },
        { name: "building", label: "Building application", duration: 3000 },
        { name: "testing", label: "Running tests", duration: 2000 },
        { name: "deploying", label: "Deploying to " + environment, duration: 3000 },
        { name: "verifying", label: "Verifying deployment", duration: 1500 }
      ];

      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        setDeploymentStatus(prev => ({
          ...prev,
          stage: stage.name,
          progress: ((i + 1) / stages.length) * 100,
          logs: [...prev.logs, { time: new Date(), message: stage.label, type: "info" }]
        }));
        
        await new Promise(resolve => setTimeout(resolve, stage.duration));
      }

      setDeploymentStatus(prev => ({
        ...prev,
        stage: "completed",
        progress: 100,
        logs: [...prev.logs, { 
          time: new Date(), 
          message: `Deployment successful! Live at https://${project.name.toLowerCase().replace(/\s/g, '-')}.buildbuddy.app`, 
          type: "success" 
        }]
      }));

      await base44.entities.Project.update(selectedProject, {
        status: "deployed",
        metadata: {
          ...project.metadata,
          lastDeployment: new Date().toISOString(),
          deploymentUrl: `https://${project.name.toLowerCase().replace(/\s/g, '-')}.buildbuddy.app`
        }
      });

    } catch (error) {
      setDeploymentStatus(prev => ({
        ...prev,
        stage: "failed",
        logs: [...prev.logs, { time: new Date(), message: `Deployment failed: ${error.message}`, type: "error" }]
      }));
    } finally {
      setDeploying(false);
    }
  };

  const stats = [
    { label: "Total Deployments", value: "127", icon: Rocket, color: "#FF7B00" },
    { label: "Success Rate", value: "98.4%", icon: CheckCircle2, color: "#10B981" },
    { label: "Avg Deploy Time", value: "2m 14s", icon: Clock, color: "#00B4D8" },
    { label: "Active Projects", value: projects.length.toString(), icon: Globe, color: "#8B5CF6" }
  ];

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeInOutCubic }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-orange-500/30"
            >
              <Rocket className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                AI Deployment Pipeline
              </h1>
              <p className="text-gray-400 mt-1">Deploy projects with zero-config automation</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, ease: easeInOutCubic }}
              className="rounded-xl border border-white/10 p-6"
              style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
                backdropFilter: "blur(20px)"
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Deploy Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/10 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
          }}
        >
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Deploy Project
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Select Project</label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Choose a project" />
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
                <label className="text-sm text-gray-400 mb-2 block">Environment</label>
                <Select value={environment} onValueChange={setEnvironment}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={startDeployment}
              disabled={deploying || !selectedProject}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg shadow-orange-500/30"
            >
              {deploying ? (
                <>
                  <Activity className="w-5 h-5 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Deployment
                </>
              )}
            </Button>
          </div>

          {/* Deployment Pipeline */}
          <AnimatePresence>
            {deploymentStatus && (
              <DeploymentPipeline status={deploymentStatus} />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Additional Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          <EnvironmentConfig environment={environment} />
          <DeploymentHistory projectId={selectedProject} />
        </div>
      </div>
    </div>
  );
}