/**
 * Generate Test Hypotheses Function
 * 
 * AI-powered generation of test hypotheses based on
 * observed user behavior and performance data.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, behaviourType = 'all' } = await req.json();

    // Fetch user behaviors and recent tests
    const behaviors = await base44.entities.UserBehavior.filter({}, '-timestamp', 500);
    const tests = await base44.entities.ABTestConfig.list('-created_date', 20);
    const analytics = await base44.entities.AnalyticsSnapshot.list('-timestamp', 100);

    // Analyze behavior patterns
    const patterns = analyzeBehaviorPatterns(behaviors);
    const gaps = identifyOpportunities(tests, patterns);

    // Generate hypotheses using AI
    const hypotheses = await generateHypotheses(
      patterns,
      gaps,
      behaviors,
      base44
    );

    return Response.json({
      success: true,
      hypotheses,
      patternsAnalyzed: patterns,
      opportunities: gaps,
    });
  } catch (error) {
    console.error('Hypothesis generation error:', error);
    return Response.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
});

/**
 * Analyze behavior patterns from user data
 */
function analyzeBehaviorPatterns(behaviors) {
  const patterns = {
    commonPaths: {},
    dropoffPoints: {},
    timeSpent: {},
    deviceBehaviors: {},
  };

  // Track common user journeys
  const journeys = {};
  behaviors.forEach(b => {
    const userId = b.user_id;
    if (!journeys[userId]) journeys[userId] = [];
    journeys[userId].push({
      event: b.event_type,
      page: b.event_data?.page,
      time: b.timestamp,
    });
  });

  // Identify common sequences
  const sequences = {};
  Object.values(journeys).forEach(journey => {
    const path = journey.map(j => j.event).slice(0, 5).join(' -> ');
    sequences[path] = (sequences[path] || 0) + 1;
  });

  patterns.commonPaths = Object.entries(sequences)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .reduce((acc, [path, count]) => {
      acc[path] = count;
      return acc;
    }, {});

  // Identify drop-off points
  behaviors.forEach(b => {
    const page = b.event_data?.page;
    if (b.event_type === 'page_view' && page) {
      patterns.dropoffPoints[page] = (patterns.dropoffPoints[page] || 0) + 1;
    }
  });

  // Time spent analysis
  const timeData = behaviors.filter(b => b.event_data?.duration_seconds);
  if (timeData.length > 0) {
    const avgTime = timeData.reduce((sum, b) => sum + (b.event_data.duration_seconds || 0), 0) / timeData.length;
    patterns.timeSpent.average = avgTime;
  }

  return patterns;
}

/**
 * Identify testing opportunities
 */
function identifyOpportunities(tests, patterns) {
  const opportunities = [];

  // Highest drop-off pages are good test candidates
  Object.entries(patterns.dropoffPoints)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .forEach(([page, count]) => {
      opportunities.push({
        type: 'high_dropoff_page',
        page,
        priority: 'high',
        reasoning: `Page visited ${count} times with high drop-off rate`,
      });
    });

  // Common paths can be optimized
  Object.keys(patterns.commonPaths).slice(0, 2).forEach(path => {
    opportunities.push({
      type: 'common_path_optimization',
      path,
      priority: 'medium',
      reasoning: 'Optimize frequent user journey',
    });
  });

  return opportunities;
}

/**
 * Generate hypotheses using AI
 */
async function generateHypotheses(patterns, opportunities, behaviors, base44) {
  try {
    const prompt = `Based on user behavior analysis, generate 5 specific A/B test hypotheses:

User Behavior Patterns:
- Common paths: ${JSON.stringify(patterns.commonPaths)}
- Drop-off points: ${JSON.stringify(patterns.dropoffPoints)}
- Avg time spent: ${patterns.timeSpent.average?.toFixed(2)} seconds

Testing Opportunities:
${opportunities.map(o => `- ${o.type}: ${o.reasoning}`).join('\n')}

For each hypothesis, provide:
1. Clear hypothesis statement
2. What to test (control vs variant)
3. Success metric
4. Expected uplift
5. Effort to implement (1-5)
6. Confidence level (0-100%)`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          hypotheses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                statement: { type: 'string' },
                control: { type: 'string' },
                variant: { type: 'string' },
                metric: { type: 'string' },
                expectedUplift: { type: 'number' },
                effort: { type: 'number' },
                confidence: { type: 'number' },
                rationale: { type: 'string' },
              },
            },
          },
        },
      },
    });

    // Enhance with data-driven scoring
    return result.hypotheses?.map(h => ({
      ...h,
      dataScore: calculateDataScore(h, patterns),
      priorityScore: calculatePriorityScore(h),
    })) || [];
  } catch (error) {
    console.error('AI hypothesis generation failed:', error);
    return [];
  }
}

/**
 * Calculate data-driven score for hypothesis
 */
function calculateDataScore(hypothesis, patterns) {
  let score = 0;

  // Check if metric is a common drop-off
  if (Object.keys(patterns.dropoffPoints).length > 0) {
    score += 30;
  }

  // Check confidence level
  score += hypothesis.confidence / 5;

  return Math.min(100, score);
}

/**
 * Calculate priority based on effort vs expected impact
 */
function calculatePriorityScore(hypothesis) {
  const effortScore = (6 - hypothesis.effort) * 10; // 50-10 for effort 1-5
  const impactScore = hypothesis.expectedUplift * 100;
  
  return Math.round((effortScore + impactScore) / 2);
}