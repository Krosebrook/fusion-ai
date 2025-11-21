import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pipeline_config_id } = await req.json();

    // Fetch pipeline runs for analysis
    const runs = await base44.asServiceRole.entities.PipelineRun.filter({
      pipeline_config_id
    });

    const pipelineConfig = await base44.asServiceRole.entities.PipelineConfig.filter({
      id: pipeline_config_id
    });

    if (!pipelineConfig || pipelineConfig.length === 0) {
      return Response.json({ error: 'Pipeline not found' }, { status: 404 });
    }

    const config = pipelineConfig[0];

    // Calculate metrics
    const successfulRuns = runs.filter(r => r.status === 'success');
    const failedRuns = runs.filter(r => r.status === 'failed');
    const avgDuration = runs.length > 0
      ? runs.reduce((sum, r) => sum + (r.duration_seconds || 0), 0) / runs.length
      : 0;
    const successRate = runs.length > 0
      ? (successfulRuns.length / runs.length) * 100
      : 0;

    // Find common failure points
    const failurePatterns = failedRuns
      .map(r => r.steps?.filter(s => s.status === 'failed').map(s => s.name))
      .flat()
      .reduce((acc, step) => {
        acc[step] = (acc[step] || 0) + 1;
        return acc;
      }, {});

    // Prepare analysis prompt
    const analysisPrompt = `Analyze this CI/CD pipeline and suggest optimizations:

Pipeline: ${config.name}
Type: ${config.project_type}
Branch: ${config.branch}

Current Performance:
- Average Duration: ${Math.round(avgDuration / 60)} minutes
- Success Rate: ${successRate.toFixed(1)}%
- Total Runs: ${runs.length}
- Failed Runs: ${failedRuns.length}

Commands:
- Build: ${config.build_command}
- Test: ${config.test_command}
- Deploy: ${config.deploy_command}

Common Failure Points:
${Object.entries(failurePatterns).map(([step, count]) => `- ${step}: ${count} failures`).join('\n')}

Based on this data, suggest 3-5 specific optimizations that could:
1. Reduce execution time
2. Improve reliability
3. Optimize resource usage

For each optimization, provide:
- Type (parallelization, caching, resource_allocation, etc.)
- Title (brief, actionable)
- Description (what and why)
- Current vs Projected metrics
- Implementation steps
- Code changes (if applicable)
- Confidence score (0-100)`;

    // Call AI for analysis
    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          optimizations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                current_metrics: {
                  type: "object",
                  properties: {
                    avg_duration: { type: "number" },
                    success_rate: { type: "number" }
                  }
                },
                projected_metrics: {
                  type: "object",
                  properties: {
                    avg_duration: { type: "number" },
                    success_rate: { type: "number" },
                    time_saved: { type: "number" }
                  }
                },
                implementation_steps: {
                  type: "array",
                  items: { type: "string" }
                },
                code_changes: { type: "object" },
                confidence_score: { type: "number" }
              }
            }
          }
        }
      }
    });

    // Store optimizations
    const savedOptimizations = [];
    for (const opt of aiResponse.optimizations) {
      const saved = await base44.asServiceRole.entities.PipelineOptimization.create({
        pipeline_config_id,
        optimization_type: opt.type,
        title: opt.title,
        description: opt.description,
        current_metrics: opt.current_metrics,
        projected_metrics: opt.projected_metrics,
        implementation_steps: opt.implementation_steps,
        code_changes: opt.code_changes || {},
        confidence_score: opt.confidence_score,
        status: 'pending'
      });
      savedOptimizations.push(saved);
    }

    return Response.json({
      success: true,
      optimizations: savedOptimizations,
      analysis_summary: {
        total_runs: runs.length,
        avg_duration_minutes: Math.round(avgDuration / 60),
        success_rate: successRate.toFixed(1),
        potential_time_saved: savedOptimizations.reduce((sum, opt) => 
          sum + (opt.projected_metrics?.time_saved || 0), 0
        )
      }
    });

  } catch (error) {
    console.error('Pipeline analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});