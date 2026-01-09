import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  ShoppingCart, Gamepad2, Megaphone, Smartphone, 
  Video, BookOpen, Wallet, BarChart3, Wand2
} from "lucide-react";

const easeInOutCubic = [0.4, 0, 0.2, 1];

const presetTemplates = [
  {
    id: "ecommerce",
    name: "E-Commerce Platform",
    description: "Full-featured online store with cart, payments, and admin dashboard",
    icon: ShoppingCart,
    color: "#10B981",
    prompt: "Build a complete e-commerce platform with product catalog, shopping cart, secure checkout with Stripe integration, order management, user accounts, and admin dashboard for inventory and analytics"
  },
  {
    id: "mobile-game",
    name: "Mobile Game",
    description: "Cross-platform mobile game with leaderboards and in-app purchases",
    icon: Gamepad2,
    color: "#8B5CF6",
    prompt: "Create a mobile game with Unity/React Native, player progression system, leaderboards, achievements, in-app purchases, social sharing, and backend API for multiplayer features"
  },
  {
    id: "marketing",
    name: "Content Marketing Campaign",
    description: "Multi-channel campaign with landing pages, email automation, and analytics",
    icon: Megaphone,
    color: "#FF7B00",
    prompt: "Design a comprehensive content marketing campaign with landing pages, email automation sequences, social media integration, A/B testing, conversion tracking, and detailed analytics dashboard"
  },
  {
    id: "saas",
    name: "SaaS Application",
    description: "Software as a Service platform with subscriptions and API",
    icon: BarChart3,
    color: "#00B4D8",
    prompt: "Build a SaaS application with user authentication, subscription billing, API endpoints, webhook integrations, admin panel, usage analytics, and customer onboarding flows"
  },
  {
    id: "mobile-app",
    name: "Mobile App",
    description: "Native iOS/Android app with push notifications and cloud sync",
    icon: Smartphone,
    color: "#E91E63",
    prompt: "Develop a mobile application with native iOS and Android support, push notifications, cloud data synchronization, offline mode, biometric authentication, and real-time updates"
  },
  {
    id: "video-platform",
    name: "Video Streaming Platform",
    description: "Netflix-style platform with video hosting and recommendations",
    icon: Video,
    color: "#F59E0B",
    prompt: "Create a video streaming platform with video upload and encoding, adaptive bitrate streaming, content recommendations, user profiles, watchlists, comments, and monetization options"
  },
  {
    id: "learning",
    name: "E-Learning Platform",
    description: "Online course platform with quizzes, certificates, and progress tracking",
    icon: BookOpen,
    color: "#06B6D4",
    prompt: "Build an e-learning platform with course management, video lessons, interactive quizzes, progress tracking, certificates, discussion forums, and instructor dashboard"
  },
  {
    id: "fintech",
    name: "FinTech Application",
    description: "Financial app with transactions, budgeting, and investment tracking",
    icon: Wallet,
    color: "#14B8A6",
    prompt: "Develop a fintech application with bank account integration, transaction tracking, budget planning, investment portfolio management, bill reminders, and financial insights dashboard"
  }
];

export default function TemplateSelector({ onGenerate, disabled }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customDescription, setCustomDescription] = useState("");
  const [mode, setMode] = useState("presets"); // "presets" or "custom"

  const handleGenerate = () => {
    const description = mode === "custom" 
      ? customDescription 
      : selectedTemplate?.prompt;
    
    if (description) {
      onGenerate(description);
    }
  };

  return (
    <div className="space-y-8">
      {/* Mode Toggle */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => setMode("presets")}
          variant={mode === "presets" ? "default" : "outline"}
          className={mode === "presets" 
            ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white" 
            : "border-white/10 text-gray-300"}
        >
          Choose Template
        </Button>
        <Button
          onClick={() => setMode("custom")}
          variant={mode === "custom" ? "default" : "outline"}
          className={mode === "custom" 
            ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white" 
            : "border-white/10 text-gray-300"}
        >
          Describe Custom Project
        </Button>
      </div>

      {/* Preset Templates */}
      {mode === "presets" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {presetTemplates.map((template, idx) => (
            <motion.button
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, ease: easeInOutCubic }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTemplate(template)}
              className={`rounded-2xl border p-6 text-left transition-all ${
                selectedTemplate?.id === template.id
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
              style={{
                background: selectedTemplate?.id === template.id
                  ? `linear-gradient(135deg, ${template.color}15, transparent)`
                  : undefined
              }}
            >
              <div
                className="w-14 h-14 rounded-xl mb-4 flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${template.color}40, ${template.color}20)`,
                  boxShadow: `0 8px 24px ${template.color}30`
                }}
              >
                <template.icon className="w-7 h-7" style={{ color: template.color }} />
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {template.name}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {template.description}
              </p>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Custom Description */}
      {mode === "custom" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-white/10 p-8"
          style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
          }}
        >
          <label className="block text-lg font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Describe Your Project
          </label>
          <Textarea
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            placeholder="Example: Build a real-time collaboration tool like Figma with vector editing, multiplayer cursors, comments, version history, and team workspace management..."
            rows={8}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-base leading-relaxed resize-none"
          />
          <p className="text-sm text-gray-400 mt-3">
            Be as detailed as possible. Include features, technologies, and user flows you envision.
          </p>
        </motion.div>
      )}

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center"
      >
        <Button
          onClick={handleGenerate}
          disabled={disabled || (mode === "presets" ? !selectedTemplate : !customDescription.trim())}
          className="h-16 px-12 text-lg font-bold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl shadow-2xl shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wand2 className="w-6 h-6 mr-3" />
          Generate AI Project Template
        </Button>
      </motion.div>
    </div>
  );
}