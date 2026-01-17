/**
 * Onboarding Page
 * Entry point for investor profile setup
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { createPageUrl } from '@/utils';

export default function OnboardingPage() {
  const navigate = useNavigate();

  const handleComplete = async (profile) => {
    // Redirect to dashboard
    setTimeout(() => {
      navigate(createPageUrl('Dashboard'));
    }, 1500);
  };

  return <OnboardingWizard onComplete={handleComplete} />;
}