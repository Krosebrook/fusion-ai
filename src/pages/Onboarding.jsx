
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import RoleSelector from '@/components/RoleSelector';
import RecommendedTools from '@/components/RecommendedTools';
import ProgressBar from '@/components/ProgressBar';
import { ArrowRight, ChevronsRight } from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkUser = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // If user has already completed onboarding, redirect to dashboard
      if (currentUser.onboarding_completed) {
        navigate(createPageUrl('Dashboard'));
      }
    } catch (error) {
      // Not authenticated, redirect to auth
      navigate(createPageUrl('Auth'));
    }
  }, [navigate]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (step === 1 && selectedRole) {
      // Save role to user profile
      setLoading(true);
      try {
        await User.updateMyUserData({
          role: selectedRole,
          onboarding_step: 2
        });
        setStep(2);
      } catch (error) {
        console.error('Error saving role:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTryTool = async (toolId) => {
    setLoading(true);
    try {
      // Mark onboarding as completed
      await User.updateMyUserData({
        onboarding_completed: true,
        onboarding_step: 3
      });

      // Navigate to the selected tool
      const toolPages = {
        app_builder: 'AppBuilder',
        api_generator: 'APIGenerator',
        content_studio: 'ContentStudio',
        marketing_suite: 'MarketingSuite',
        analytics: 'Analytics',
        workflows: 'Workflows'
      };

      navigate(createPageUrl(toolPages[toolId] || 'Dashboard'));
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await User.updateMyUserData({
        onboarding_completed: true,
        onboarding_skipped: true
      });
      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">FlashFusion</span>! 👋
          </h1>
          <p className="text-gray-400 text-lg">
            Let's get you set up in just a few clicks
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-2xl mx-auto mb-12">
          <ProgressBar step={step} total={2} />
        </div>

        {/* Content */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 mb-6">
          {step === 1 && (
            <>
              <RoleSelector 
                onSelect={handleRoleSelect}
                selected={selectedRole}
              />

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-white gap-2"
                  disabled={loading}
                >
                  Skip for now
                  <ChevronsRight size={16} />
                </Button>

                <Button
                  onClick={handleContinue}
                  disabled={!selectedRole || loading}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white gap-2"
                >
                  {loading ? 'Saving...' : 'Continue'}
                  <ArrowRight size={18} />
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <RecommendedTools 
                role={selectedRole}
                onTryTool={handleTryTool}
              />

              <div className="flex items-center justify-center mt-8 pt-6 border-t border-gray-700">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-white gap-2"
                  disabled={loading}
                >
                  I'll explore later
                  <ChevronsRight size={16} />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L10.5 6L16 7L12 11L13 16L8 13.5L3 16L4 11L0 7L5.5 6L8 1Z" fill="#10B981"/>
            </svg>
            <span>10,000+ creators</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#10B981" strokeWidth="2"/>
              <path d="M5 8L7 10L11 6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>50M+ lines generated</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="12" height="12" rx="2" stroke="#10B981" strokeWidth="2"/>
              <path d="M5 8L7 10L11 6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>99.9% uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
