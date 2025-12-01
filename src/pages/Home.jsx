import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { PricingSection } from '@/components/home/PricingSection';
import { FeaturesGrid } from '@/components/home/FeaturesGrid';
import { FAQSection } from '@/components/home/FAQSection';

export default function HomePage() {
  return (
    <div 
      className="bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2070&auto=format&fit=crop')`
      }}
    >
      <HeroSection />
      <PricingSection />
      <FeaturesGrid />
      <FAQSection />
    </div>
  );
}