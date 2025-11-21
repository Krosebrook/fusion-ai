import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { description } = await req.json();

    if (!description) {
      return Response.json({ error: 'Description required' }, { status: 400 });
    }

    // AI prompt for pipeline generation
    const prompt = `You are a CI/CD expert. Generate a complete pipeline configuration from this description:

"${description}"

Based on this description, create a detailed pipeline configuration including:
1. Detect the project type (react, nextjs, vue, node, python, docker)
2. Build commands appropriate for the project type
3. Test commands
4. Deploy commands
5. Trigger settings (push, pullRequest, manual, schedule)
6. Quality gate settings with appropriate tools
7. Auto-scaling and notification preferences
8. Branch name if mentioned, default to "main"
9. Environment if mentioned (development, staging, production)

Be intelligent about inferring:
- If Docker is mentioned, use docker commands
- If testing is mentioned, enable quality gates
- If security scanning is mentioned, include snyk in quality tools
- If linting is mentioned, include eslint
- If specific deployment targets are mentioned (AWS, Vercel, Kubernetes), adapt deploy command

Return a valid JSON configuration object.`;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          projectType: {
            type: "string",
            enum: ["react", "nextjs", "vue", "node", "python", "docker"]
          },
          branch: {
            type: "string",
            default: "main"
          },
          environment: {
            type: "string",
            enum: ["development", "staging", "production"],
            default: "production"
          },
          buildCommand: {
            type: "string"
          },
          testCommand: {
            type: "string"
          },
          deployCommand: {
            type: "string"
          },
          triggers: {
            type: "object",
            properties: {
              push: { type: "boolean" },
              pullRequest: { type: "boolean" },
              manual: { type: "boolean" },
              schedule: { type: "boolean" }
            }
          },
          quality_gates: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
              min_coverage: { type: "number" },
              max_critical_issues: { type: "number" },
              max_high_issues: { type: "number" },
              tools: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["eslint", "snyk", "sonarqube", "prettier"]
                }
              }
            }
          },
          autoScale: {
            type: "boolean"
          },
          notifications: {
            type: "boolean"
          },
          explanation: {
            type: "string",
            description: "Brief explanation of the configuration choices"
          }
        },
        required: ["projectType", "buildCommand", "testCommand", "deployCommand", "triggers"]
      }
    });

    return Response.json({
      success: true,
      config: aiResponse,
      description
    });

  } catch (error) {
    console.error('Pipeline generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});