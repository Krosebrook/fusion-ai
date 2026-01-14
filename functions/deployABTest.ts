import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scenario, config } = await req.json();

    if (!scenario || !config) {
      return Response.json({ error: 'Scenario and config required' }, { status: 400 });
    }

    // Generate deployment code using AI
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert full-stack engineer specializing in A/B testing infrastructure and analytics integration.

Generate production-ready code to deploy this A/B test:

SCENARIO:
${JSON.stringify(scenario, null, 2)}

CONFIGURATION:
- Traffic Allocation: ${config.trafficAllocation}% to variant B
- Duration: ${config.duration} days
- Analytics Platform: ${config.analyticsProvider}
- Tracking Events: ${config.trackingEvents?.join(', ') || 'All interactions'}

Generate the following:

1. **React Component Code** - Implementation of both variants with feature flag logic
2. **Analytics Integration** - Event tracking code for ${config.analyticsProvider}
3. **Feature Flag Logic** - Traffic splitting algorithm with user bucketing
4. **Backend API** - Endpoint for test assignment and metrics collection
5. **Database Schema** - Track user assignments and test results
6. **Configuration File** - Test metadata and settings

Include:
- User bucketing (consistent assignment based on user ID hash)
- Cookie/localStorage persistence for consistent experience
- Analytics event firing for all interactions
- Graceful degradation if test fails
- Test winner declaration logic based on statistical significance

Make code production-ready, TypeScript-compatible, and follow React best practices.`,
      response_json_schema: {
        type: "object",
        properties: {
          reactComponent: { type: "string" },
          analyticsCode: { type: "string" },
          featureFlagLogic: { type: "string" },
          backendAPI: { type: "string" },
          databaseSchema: { type: "string" },
          configFile: { type: "string" },
          deploymentSteps: {
            type: "array",
            items: { type: "string" }
          },
          testingInstructions: { type: "string" },
          monitoringGuide: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      deployment: result,
      testId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      config: {
        ...config,
        createdAt: new Date().toISOString(),
        createdBy: user.email
      }
    });

  } catch (error) {
    console.error('Error generating deployment:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate deployment code' 
    }, { status: 500 });
  }
});