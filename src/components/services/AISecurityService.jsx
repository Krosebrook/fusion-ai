/**
 * AI Security Service
 * AI-powered dependency and vulnerability analysis
 */

import { base44 } from '@/api/base44Client';

class AISecurityService {
  /**
   * Analyze dependencies for security vulnerabilities
   */
  async analyzeDependencies(dependencies, packageManager = 'npm') {
    const prompt = `Analyze the following ${packageManager} dependencies for security vulnerabilities, outdated packages, and insecure patterns:

${JSON.stringify(dependencies, null, 2)}

For each vulnerable dependency, provide:
1. Severity level (critical, high, medium, low)
2. CVE ID if applicable
3. Exact vulnerable version
4. Recommended safe version
5. Brief explanation of the vulnerability
6. Auto-fix command (e.g., "npm install package@version")

Return a JSON array of findings.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            findings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  package_name: { type: 'string' },
                  current_version: { type: 'string' },
                  safe_version: { type: 'string' },
                  severity: { type: 'string' },
                  cve_id: { type: 'string' },
                  description: { type: 'string' },
                  fix_command: { type: 'string' },
                },
              },
            },
            summary: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                critical: { type: 'number' },
                high: { type: 'number' },
                medium: { type: 'number' },
                low: { type: 'number' },
              },
            },
          },
        },
      });

      return result;
    } catch (error) {
      console.error('AI dependency analysis failed:', error);
      return {
        findings: [],
        summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
      };
    }
  }

  /**
   * Generate fix script for vulnerable dependencies
   */
  async generateFixScript(findings) {
    const commands = findings
      .filter(f => f.fix_command)
      .map(f => f.fix_command);

    if (commands.length === 0) return null;

    const script = `#!/bin/bash
# Auto-generated security fix script
# Generated: ${new Date().toISOString()}

echo "🔒 Applying security fixes..."

${commands.join('\n')}

echo "✅ Security fixes applied"
echo "⚠️  Please test your application after these updates"
`;

    return script;
  }

  /**
   * Analyze code for security patterns
   */
  async analyzeCodeSecurity(codeContent, language = 'javascript') {
    const prompt = `Analyze this ${language} code for security vulnerabilities:

\`\`\`${language}
${codeContent}
\`\`\`

Identify:
1. SQL injection risks
2. XSS vulnerabilities
3. Insecure authentication patterns
4. Hardcoded secrets or API keys
5. Unsafe cryptographic practices
6. CSRF vulnerabilities
7. Insecure deserialization
8. Path traversal risks

For each issue found, provide line number, severity, description, and fix suggestion.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            issues: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  line: { type: 'number' },
                  severity: { type: 'string' },
                  type: { type: 'string' },
                  description: { type: 'string' },
                  fix_suggestion: { type: 'string' },
                },
              },
            },
            risk_score: { type: 'number' },
          },
        },
      });

      return result;
    } catch (error) {
      console.error('Code security analysis failed:', error);
      return { issues: [], risk_score: 0 };
    }
  }

  /**
   * Suggest security improvements for pipeline
   */
  async suggestPipelineSecurityEnhancements(pipelineConfig) {
    const prompt = `Review this CI/CD pipeline configuration and suggest security enhancements:

${JSON.stringify(pipelineConfig, null, 2)}

Provide recommendations for:
1. Secrets management improvements
2. Build isolation and sandboxing
3. Dependency scanning integration
4. SAST/DAST tool integration
5. Security gate enforcement
6. Audit logging

Return actionable recommendations with priority levels.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  priority: { type: 'string' },
                  category: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  implementation: { type: 'string' },
                },
              },
            },
          },
        },
      });

      return result.recommendations || [];
    } catch (error) {
      console.error('Pipeline security analysis failed:', error);
      return [];
    }
  }
}

export const aiSecurityService = new AISecurityService();