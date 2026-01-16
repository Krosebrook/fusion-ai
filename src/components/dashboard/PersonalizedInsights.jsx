import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PersonalizationService } from "@/components/services/PersonalizationService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Lightbulb, TrendingUp, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

/**
 * PersonalizedInsights - AI-generated recommendations and insights
 */
export default function PersonalizedInsights() {
  const [isVisible, setIsVisible] = useState(true);

  const { data: insights, isLoading } = useQuery({
    queryKey: ['personalized-insights'],
    queryFn: () => PersonalizationService.getPersonalizedInsights(),
    staleTime: 5 * 60 * 1000, // Refresh every 5 minutes
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    PersonalizationService.trackFeatureUse('personalized_insights_view');
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border-purple-500/30">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Personalized for You</h2>
              <p className="text-sm text-slate-400">AI-powered recommendations</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-slate-400"
          >
            Dismiss
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : insights?.insights ? (
          <div className="space-y-6">
            {/* Journey Insight */}
            {insights.insights.journey_insight && (
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {insights.insights.journey_insight}
                  </p>
                </div>
              </div>
            )}

            {/* Recommended Apps */}
            {insights.insights.recommended_apps?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Recommended Apps
                </h3>
                <div className="space-y-2">
                  {insights.insights.recommended_apps.map((app, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Link
                        to={createPageUrl("Marketplace")}
                        className="block p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-purple-500/50 transition-all group"
                        onClick={() => PersonalizationService.trackFeatureUse('recommended_app_click')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-medium">{app.app_name}</span>
                              <Badge className="text-xs" variant={
                                app.priority === 'high' ? 'default' : 'secondary'
                              }>
                                {app.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-400">{app.reason}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Workflow Suggestions */}
            {insights.insights.workflow_suggestions?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Suggested Workflows
                </h3>
                <div className="space-y-2">
                  {insights.insights.workflow_suggestions.map((workflow, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                      <h4 className="text-white font-medium mb-1">{workflow.title}</h4>
                      <p className="text-sm text-slate-400 mb-2">{workflow.description}</p>
                      {workflow.steps?.length > 0 && (
                        <ol className="text-xs text-slate-500 space-y-1 ml-4">
                          {workflow.steps.map((step, i) => (
                            <li key={i}>{i + 1}. {step}</li>
                          ))}
                        </ol>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Feature Spotlight */}
            {insights.insights.feature_spotlight && (
              <div className="p-4 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 rounded-lg border border-cyan-500/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">
                      💡 {insights.insights.feature_spotlight.feature}
                    </h4>
                    <p className="text-sm text-slate-300 mb-3">
                      {insights.insights.feature_spotlight.benefit}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-cyan-500 to-purple-500"
                  onClick={() => PersonalizationService.trackFeatureUse('feature_spotlight_click')}
                >
                  {insights.insights.feature_spotlight.cta || 'Explore Feature'}
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </Card>
    </motion.div>
  );
}