import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysisContent, role, flow } = await req.json();

    if (!analysisContent) {
      return Response.json({ error: 'Analysis content required' }, { status: 400 });
    }

    // Use AI to extract friction points and generate A/B test scenarios
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert UX researcher and A/B testing strategist. Based on the following user journey analysis, generate concrete A/B test scenarios to address identified friction points.

USER JOURNEY ANALYSIS:
${analysisContent}

USER ROLE: ${role}
FLOW TYPE: ${flow}

For each major friction point identified, generate an A/B test scenario with:

1. Friction Point: Clear description of the UX problem
2. Hypothesis: What we believe will improve the experience
3. Variant A (Control): Current design/flow
4. Variant B (Treatment): Proposed improvement with specific design changes
5. Success Metrics: How to measure if the variant is better (conversion rate, time on task, error rate, etc.)
6. Implementation Details: Specific UI/UX changes needed
7. Test Duration: Recommended timeline and sample size
8. Risk Assessment: Potential negative impacts to watch for

Provide 3-5 high-impact A/B test scenarios. Be specific about design changes (layout, copy, colors, interactions) and measurable outcomes.

Format the output as a structured JSON array.`,
      response_json_schema: {
        type: "object",
        properties: {
          scenarios: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                frictionPoint: { type: "string" },
                hypothesis: { type: "string" },
                variantA: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    designDetails: { type: "array", items: { type: "string" } }
                  }
                },
                variantB: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    designDetails: { type: "array", items: { type: "string" } },
                    keyChanges: { type: "array", items: { type: "string" } }
                  }
                },
                successMetrics: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      metric: { type: "string" },
                      target: { type: "string" },
                      priority: { type: "string" }
                    }
                  }
                },
                implementationDetails: { type: "string" },
                testDuration: { type: "string" },
                recommendedSampleSize: { type: "string" },
                riskAssessment: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          summary: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      scenarios: result.scenarios || [],
      summary: result.summary || 'A/B test scenarios generated successfully'
    });

  } catch (error) {
    console.error('Error generating A/B test scenarios:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate A/B test scenarios' 
    }, { status: 500 });
  }
});