import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generate personalized insights using AI based on user behavior
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile and onboarding data
    const [profile, onboarding, behaviors] = await Promise.all([
      base44.entities.UserProfile.filter({ user_id: user.id }).then(r => r[0]),
      base44.entities.UserOnboarding.filter({ user_id: user.id }).then(r => r[0]),
      base44.entities.UserBehavior.filter({ user_id: user.id }, '-created_date', 50)
    ]);

    // Analyze behavior patterns
    const behaviorSummary = analyzeBehaviors(behaviors);

    // Generate AI insights
    const insights = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a UX personalization AI. Analyze this user's behavior and profile to generate personalized insights.

User Profile:
- Type: ${onboarding?.user_type || 'undecided'}
- Experience: ${onboarding?.experience_level || 'beginner'}
- Interests: ${onboarding?.interests?.join(', ') || 'none specified'}
- Time Spent: ${behaviorSummary.totalTimeSpent} seconds
- Most Used Features: ${behaviorSummary.topFeatures.join(', ')}
- Most Viewed Pages: ${behaviorSummary.topPages.join(', ')}
- Recent Searches: ${behaviorSummary.recentSearches.join(', ')}

Generate:
1. 3 personalized app recommendations from marketplace (specific app names)
2. 2 workflow suggestions that match their usage pattern
3. 1 feature spotlight they haven't discovered yet
4. Overall insight about their journey

Format as structured JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          recommended_apps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                app_name: { type: "string" },
                reason: { type: "string" },
                priority: { type: "string", enum: ["high", "medium", "low"] }
              }
            }
          },
          workflow_suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                steps: { type: "array", items: { type: "string" } }
              }
            }
          },
          feature_spotlight: {
            type: "object",
            properties: {
              feature: { type: "string" },
              benefit: { type: "string" },
              cta: { type: "string" }
            }
          },
          journey_insight: { type: "string" }
        }
      }
    });

    return Response.json({
      insights,
      behavior_summary: behaviorSummary,
      profile_completeness: calculateProfileCompleteness(onboarding),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Personalization error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function analyzeBehaviors(behaviors) {
  const pageViews = {};
  const featureUses = {};
  const searches = [];
  let totalTimeSpent = 0;

  behaviors.forEach(b => {
    if (b.event_type === 'page_view' && b.event_data?.page) {
      pageViews[b.event_data.page] = (pageViews[b.event_data.page] || 0) + 1;
    }
    if (b.event_type === 'feature_use' && b.event_data?.feature) {
      featureUses[b.event_data.feature] = (featureUses[b.event_data.feature] || 0) + 1;
    }
    if (b.event_type === 'search_query' && b.event_data?.query) {
      searches.push(b.event_data.query);
    }
    if (b.event_data?.duration_seconds) {
      totalTimeSpent += b.event_data.duration_seconds;
    }
  });

  return {
    topPages: Object.entries(pageViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([page]) => page),
    topFeatures: Object.entries(featureUses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([feature]) => feature),
    recentSearches: searches.slice(-5),
    totalTimeSpent,
    behaviorCount: behaviors.length
  };
}

function calculateProfileCompleteness(onboarding) {
  if (!onboarding) return 0;
  
  let score = 0;
  if (onboarding.user_type && onboarding.user_type !== 'undecided') score += 25;
  if (onboarding.experience_level) score += 25;
  if (onboarding.interests?.length > 0) score += 25;
  if (onboarding.status === 'completed') score += 25;
  
  return score;
}