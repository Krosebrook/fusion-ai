import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/components/hooks/useAuth";
import { useEntityList } from "@/components/hooks/useEntity";
import { LoadingScreen, EmptyState, GlassmorphicCard } from "@/components/ui-library";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { AIToolsGrid } from "@/components/dashboard/AIToolsGrid";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { onboardingService } from "@/components/services/OnboardingService";
import { 
  Code, Plus, CheckCircle, AlertCircle, ArrowRight, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  
  const { data: projects, isLoading, error } = useEntityList(
    'Project',
    user ? { created_by: user.email } : {},
    '-created_date',
    10
  );

  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    try {
      if (user) {
        const onboarding = await onboardingService.getOrCreateOnboarding(user.id);
        setShowOnboarding(onboarding.status === 'not_started');
      }
    } catch (error) {
      console.error('Failed to check onboarding status', error);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} style={{ color: '#10B981' }} />;
      case 'generating': return <Clock size={16} style={{ color: '#F59E0B' }} />;
      case 'draft': return <AlertCircle size={16} style={{ color: '#94A3B8' }} />;
      default: return <Clock size={16} style={{ color: '#94A3B8' }} />;
    }
  };

  if (checkingOnboarding || isLoading) return <LoadingScreen message="Loading dashboard..." />;
  if (error) return <EmptyState icon={AlertCircle} title="Failed to load" description={error.message} />;

  if (showOnboarding) {
    return (
      <OnboardingWizard
        onComplete={() => {
          setShowOnboarding(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-2 font-['Space_Grotesk']">
            Welcome back, {user?.full_name || 'there'}! 👋
          </h1>
          <p className="text-xl text-gray-400">
            Let's build something amazing today
          </p>
        </div>

        <DashboardStats projectCount={projects.length} />

        {/* AI Tools Grid */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white font-['Space_Grotesk']">
              AI-Powered Tools
            </h2>
            <Link to={createPageUrl("Tools")}>
              <Button variant="outline" className="border-white/10 text-gray-300">
                View All Tools <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <AIToolsGrid />
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white font-['Space_Grotesk']">
              Recent Projects
            </h2>
            <Link to={createPageUrl("AppBuilder")}>
              <Button className="bg-gradient-to-r from-orange-500 to-pink-500">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </Link>
          </div>

          {projects.length === 0 ? (
            <EmptyState
              icon={Code}
              title="No projects yet"
              description="Start by creating your first AI-powered project"
              action={() => window.location.href = createPageUrl("AppBuilder")}
              actionLabel="Create Your First Project"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <GlassmorphicCard key={project.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white">
                      {project.name}
                    </h3>
                    {getStatusIcon(project.status)}
                  </div>

                  <p className="text-sm text-gray-400 mb-3 capitalize">
                    {project.type?.replace('_', ' ')}
                  </p>

                  <div className="inline-block px-3 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-xs font-semibold capitalize">
                    {project.status}
                  </div>
                </GlassmorphicCard>
              ))}
            </div>
          )}
        </div>
      </div>


    </div>
  );
}