import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Check } from 'lucide-react';

const PRICING_PLANS = {
  monthly: [
    { 
      name: "Starter Pro", 
      price: "$29", 
      description: "Perfect for individual creators",
      features: ["50 AI generations/month", "Basic deployment tools", "Community support", "1 team member", "Standard security"], 
      cta: "Start Free Trial", 
      popular: false 
    },
    { 
      name: "Professional Pro", 
      price: "$99", 
      description: "Best for growing businesses",
      features: ["Unlimited AI generations", "Advanced deployment", "Priority support", "10 team members", "Enhanced security", "Custom integrations", "API access"], 
      cta: "Get Started", 
      popular: true 
    },
    { 
      name: "Enterprise Pro", 
      price: "Custom", 
      description: "For large organizations",
      features: ["Everything in Professional", "Dedicated account manager", "Custom AI training", "Unlimited team members", "SLA guarantee", "On-premise deployment"], 
      cta: "Contact Sales", 
      popular: false 
    }
  ],
  annual: [
    { name: "Starter Pro", price: "$24", description: "Perfect for individual creators", features: ["50 AI generations/month", "Basic deployment tools", "Community support", "1 team member", "Standard security"], cta: "Start Free Trial", popular: false },
    { name: "Professional Pro", price: "$83", description: "Best for growing businesses", features: ["Unlimited AI generations", "Advanced deployment", "Priority support", "10 team members", "Enhanced security", "Custom integrations", "API access"], cta: "Get Started", popular: true },
    { name: "Enterprise Pro", price: "Custom", description: "For large organizations", features: ["Everything in Professional", "Dedicated account manager", "Custom AI training", "Unlimited team members", "SLA guarantee", "On-premise deployment"], cta: "Contact Sales", popular: false }
  ]
};

export function PricingSection() {
  const [pricingTier, setPricingTier] = useState('monthly');

  return (
    <section id="pricing" className="py-32 px-6 bg-gradient-to-b from-slate-900/90 to-slate-800/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-bold mb-4 text-white font-['Space_Grotesk']"
          >
            Choose Your Plan
          </motion.h2>
          <p className="text-xl text-gray-400 mb-8">
            All plans include our core AI development platform with premium support.
          </p>
          <div className="flex items-center justify-center gap-4">
            <span className={`font-medium ${pricingTier === 'monthly' ? 'text-orange-400' : 'text-gray-400'}`}>Monthly</span>
            <Switch
              checked={pricingTier === 'annual'}
              onCheckedChange={(checked) => setPricingTier(checked ? 'annual' : 'monthly')}
            />
            <span className={`font-medium ${pricingTier === 'annual' ? 'text-orange-400' : 'text-gray-400'}`}>
              Annually <span className="text-green-400 text-sm">(Save 15%)</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PRICING_PLANS[pricingTier].map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-2xl border p-10 relative backdrop-blur-sm"
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                borderColor: plan.popular ? '#FF7B00' : 'rgba(255, 255, 255, 0.1)',
                borderWidth: plan.popular ? '2px' : '1px'
              }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase">
                  Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

              <div className="mb-8">
                <span className="text-5xl font-bold text-white">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-gray-400 text-lg">/month</span>}
              </div>

              <button
                className={`w-full py-3.5 rounded-xl font-semibold transition-all mb-8 ${
                  plan.popular 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                {plan.cta}
              </button>

              <div className="border-t border-white/10 pt-6 space-y-3">
                {plan.features.map(feature => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check size={18} className="text-green-500 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}