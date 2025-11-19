import React from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function ImpactMatrix({ features }) {
  const impactValues = { high: 3, medium: 2, low: 1 };
  const effortValues = { small: 1, medium: 2, large: 3 };

  const categorizedFeatures = {
    quickWins: [],
    majorProjects: [],
    fillIns: [],
    timeWasters: []
  };

  features.forEach(feature => {
    const impact = impactValues[feature.impact] || 2;
    const effort = feature.effort_hours < 8 ? 1 : feature.effort_hours < 24 ? 2 : 3;

    if (impact >= 2 && effort <= 2) {
      categorizedFeatures.quickWins.push(feature);
    } else if (impact >= 2 && effort >= 2) {
      categorizedFeatures.majorProjects.push(feature);
    } else if (impact <= 2 && effort <= 2) {
      categorizedFeatures.fillIns.push(feature);
    } else {
      categorizedFeatures.timeWasters.push(feature);
    }
  });

  const quadrants = [
    { 
      title: "Quick Wins", 
      features: categorizedFeatures.quickWins, 
      color: "#10B981",
      description: "High impact, low effort"
    },
    { 
      title: "Major Projects", 
      features: categorizedFeatures.majorProjects, 
      color: "#F59E0B",
      description: "High impact, high effort"
    },
    { 
      title: "Fill-Ins", 
      features: categorizedFeatures.fillIns, 
      color: "#00B4D8",
      description: "Low impact, low effort"
    },
    { 
      title: "Reconsider", 
      features: categorizedFeatures.timeWasters, 
      color: "#6B7280",
      description: "Low impact, high effort"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 p-8"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
        backdropFilter: "blur(20px)"
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-green-400" />
        <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Impact vs. Effort Matrix
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {quadrants.map((quadrant, idx) => (
          <motion.div
            key={quadrant.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-xl border border-white/10 p-6"
            style={{ 
              background: `linear-gradient(135deg, ${quadrant.color}10 0%, ${quadrant.color}05 100%)`,
              borderColor: `${quadrant.color}30`
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-lg font-bold text-white">{quadrant.title}</h4>
                <p className="text-xs text-gray-400">{quadrant.description}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${quadrant.color}20` }}>
                <span className="text-xl font-bold" style={{ color: quadrant.color }}>
                  {quadrant.features.length}
                </span>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {quadrant.features.map((feature, featureIdx) => (
                <motion.div
                  key={featureIdx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 + featureIdx * 0.05 }}
                  className="p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <p className="text-sm font-medium text-white mb-1">{feature.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{feature.effort_hours}h</span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-gray-400 capitalize">{feature.impact} impact</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}