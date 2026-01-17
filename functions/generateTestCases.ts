/**
 * AI-Driven Test Case Generation
 * Automatically generate test cases from code changes
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { diffContent, filePath, language } = await req.json();

    // Use LLM to generate test cases
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate comprehensive test cases for these code changes:
File: ${filePath} (${language})
Changes:
${diffContent}

Create test cases covering:
1. Happy path scenarios
2. Edge cases
3. Error handling
4. Performance considerations

Format as Jest/Vitest test suite.`,
      response_json_schema: {
        type: 'object',
        properties: {
          testCases: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                code: { type: 'string' },
                type: { type: 'string', enum: ['unit', 'integration', 'performance'] },
              },
            },
          },
          coverage: { type: 'number' },
        },
      },
    });

    return Response.json({ success: true, testCases: result.testCases, coverage: result.coverage });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});