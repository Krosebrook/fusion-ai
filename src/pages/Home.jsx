import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { SocialProof } from '@/components/home/SocialProof';
import { FeaturesGrid } from '@/components/home/FeaturesGrid';
import { IntegrationsShowcase } from '@/components/home/IntegrationsShowcase';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { PricingSection } from '@/components/home/PricingSection';
import { FAQSection } from '@/components/home/FAQSection';
import { CTASection } from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <div className="bg-slate-900">
      <HeroSection />
      <SocialProof />
      <FeaturesGrid />
      <IntegrationsShowcase />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}