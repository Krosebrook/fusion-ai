/**
 * Analytics Feature Tutorial Component
 * 
 * Interactive tutorials on trend analysis, cohort analysis,
 * and statistical significance testing.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, BarChart3, CheckCircle2 } from 'lucide-react';

const FEATURE_TUTORIALS = [
  {
    id: 'trends',
    title: 'Trend Analysis',
    icon: TrendingUp,
    description: 'Track how your metrics evolve over time.',
    keyPoints: [
      'View success rates across variants',
      'Monitor latency and cost metrics',
      'Identify performance patterns',
      'Compare variant performance over time',
    ],
    example: 'Watch your success rate climb from 45% on Day 1 to 52% by Day 7 as the algorithm optimizes.',
  },
  {
    id: 'cohorts',
    title: 'Cohort Analysis',
    icon: Users,
    description: 'Understand user behavior by cohort groups.',
    keyPoints: [
      'Group users by sign-up date',
      'Track retention rates per cohort',
      'Identify cohort-specific patterns',
      'Compare early vs late adopters',
    ],
    example: 'See that users from Week 1 have a 68% retention rate while Week 3 users have 52%.',
  },
  {
    id: 'significance',
    title: 'Statistical Significance',
    icon: BarChart3,
    description: 'Determine if results are statistically reliable.',
    keyPoints: [
      'Calculate p-values automatically',
      'Set confidence levels (95%, 99%)',
      'Understand margin of error',
      'Detect winner reliably',
    ],
    example: 'Variant B is 95% likely to be better than Variant A with a p-value of 0.042.',
  },
];

export function AnalyticsFeatureTutorial({ onComplete }) {
  const [currentTutorial, setCurrentTutorial] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState([]);
  const tutorial = FEATURE_TUTORIALS[currentTutorial];
  const Icon = tutorial.icon;

  const markComplete = () => {
    setCompletedTutorials(prev => [...new Set([...prev, tutorial.id])]);
    if (currentTutorial < FEATURE_TUTORIALS.length - 1) {
      setCurrentTutorial(currentTutorial + 1);
    } else {
      onComplete();
    }
  };

  const allComplete = completedTutorials.length === FEATURE_TUTORIALS.length;

  return (
    <div className="space-y-8">
      {/* Tutorial Tabs */}
      <div className="flex gap-4">
        {FEATURE_TUTORIALS.map((feat, idx) => {
          const FeatIcon = feat.icon;
          const isComplete = completedTutorials.includes(feat.id);
          const isCurrent = idx === currentTutorial;

          return (
            <motion.button
              key={feat.id}
              onClick={() => setCurrentTutorial(idx)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition ${
                isCurrent
                  ? 'border-cyan-500 bg-cyan-500/20'
                  : isComplete
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <FeatIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">{feat.title}</span>
              {isComplete && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
            </motion.button>
          );
        })}
      </div>

      {/* Tutorial Content */}
      <motion.div
        key={tutorial.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Header */}
        <CinematicCard className="p-8 bg-gradient-to-r from-cyan-500/10 to-blue-600/10" glow glowColor="cyan">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{tutorial.title}</h2>
              <p className="text-white/70 text-lg">{tutorial.description}</p>
            </div>
          </div>
        </CinematicCard>

        {/* Key Points */}
        <CinematicCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">What You'll Learn</h3>
          <div className="space-y-3">
            {tutorial.keyPoints.map((point, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">{idx + 1}</span>
                </div>
                <span className="text-white/80">{point}</span>
              </motion.div>
            ))}
          </div>
        </CinematicCard>

        {/* Real-World Example */}
        <CinematicCard className="p-6 border-l-4 border-l-green-500 bg-green-500/5">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Real-World Example
          </h3>
          <p className="text-white/70">{tutorial.example}</p>
        </CinematicCard>

        {/* Interactive Demo Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30"
        >
          <p className="text-blue-300 text-sm">
            💡 Tip: Once you create your first test, you'll see live examples of these metrics in your dashboard.
          </p>
        </motion.div>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-3 pt-6">
        <Button
          onClick={() => setCurrentTutorial(Math.max(0, currentTutorial - 1))}
          disabled={currentTutorial === 0}
          variant="outline"
          className="border-white/20 flex-1"
        >
          Previous
        </Button>

        <Button
          onClick={markComplete}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 flex-1 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {allComplete ? 'Done' : 'Got It!'}
        </Button>
      </div>

      {/* Progress */}
      <div className="text-center text-white/60 text-sm">
        Completed: {completedTutorials.length} of {FEATURE_TUTORIALS.length}
      </div>
    </div>
  );
}