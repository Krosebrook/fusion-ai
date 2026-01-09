/**
 * Pipeline Security Service
 * AI-powered security analysis for CI/CD pipelines
 */

import { aiService } from './AIService';
import { errorService } from './ErrorService';

class PipelineSecurityService {
  async analyzePipelineSecurity(pipeline) {
    try {
      const prompt = `You are a DevSecOps expert. Analyze this CI/CD pipeline configuration for security vulnerabilities.

PIPELINE CONFIGURATION:
${JSON.stringify(pipeline, null, 2)}

Perform comprehensive security analysis:

1. **Configuration Vulnerabilities:**
   - Exposed secrets or credentials in plain text
   - Insecure environment variables
   - Overly permissive triggers (e.g., any PR can trigger)
   - Missing branch protections
   - Insecure artifact handling

2. **Command Injection Risks:**
   - Unsafe shell command execution
   - Unvalidated user input in commands
   - Dynamic script generation vulnerabilities

3. **Dependency Security:**
   - Use of outdated or vulnerable packages
   - Missing dependency pinning
   - Lack of security scanning tools

4. **Access Control Issues:**
   - Excessive permissions in deployment stages
   - Missing approval gates for production
   - Insecure credential management

5. **Code Security Flaws:**
   - Missing SAST/DAST scanners
   - No container image scanning
   - Absence of vulnerability checks

Return JSON:
{
  "vulnerabilities": [
    {
      "id": "vuln-id",
      "severity": "critical|high|medium|low",
      "category": "secrets|injection|dependencies|access|code",
      "title": "vulnerability name",
      "description": "what is the issue",
      "location": "where in pipeline (stage/node)",
      "cwe_id": "CWE-XXX if applicable",
      "impact": "what could happen",
      "remediation": "how to fix",
      "auto_fixable": true|false,
      "fix_config": {}
    }
  ],
  "security_score": number (0-100),
  "risk_level": "critical|high|medium|low",
  "compliance": {
    "soc2": "pass|fail|partial",
    "pci_dss": "pass|fail|partial|na",
    "gdpr": "pass|fail|partial"
  },
  "recommendations": [
    {
      "priority": "critical|high|medium|low",
      "title": "recommendation",
      "description": "what to do",
      "category": "secrets|scanning|access|hardening"
    }
  ]
}`;

      const analysis = await aiService.invokeLLM({
        prompt,
        schema: {
          type: 'object',
          properties: {
            vulnerabilities: { type: 'array' },
            security_score: { type: 'number' },
            risk_level: { type: 'string' },
            compliance: { type: 'object' },
            recommendations: { type: 'array' },
          },
        },
      });

      return {
        status: 'success',
        pipeline_id: pipeline.id || 'new',
        analysis,
        analyzed_at: new Date().toISOString(),
      };
    } catch (error) {
      errorService.handle(error, { action: 'analyzePipelineSecurity' }, 'high');
      throw error;
    }
  }

  async applySecurityFix(pipeline, vulnerability) {
    try {
      if (!vulnerability.auto_fixable || !vulnerability.fix_config) {
        throw new Error('Vulnerability is not auto-fixable');
      }

      const { stage_id, action, value } = vulnerability.fix_config;

      let updatedPipeline = { ...pipeline };

      switch (action) {
        case 'remove_secret':
          updatedPipeline.nodes = pipeline.nodes.map(node => {
            if (node.id === stage_id) {
              const config = { ...node.data.config };
              delete config[value];
              return { ...node, data: { ...node.data, config } };
            }
            return node;
          });
          break;

        case 'add_approval':
          updatedPipeline.nodes = pipeline.nodes.map(node => {
            if (node.id === stage_id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  config: {
                    ...node.data.config,
                    requires_approval: true,
                  },
                },
              };
            }
            return node;
          });
          break;

        case 'add_scanner':
          const scannerNode = {
            id: `security-scan-${Date.now()}`,
            type: 'custom',
            position: { x: 100, y: 200 },
            data: {
              label: value.name || 'Security Scan',
              config: value.config || {},
            },
          };
          updatedPipeline.nodes = [...pipeline.nodes, scannerNode];
          break;

        case 'update_trigger':
          updatedPipeline.triggers = {
            ...pipeline.triggers,
            ...value,
          };
          break;

        default:
          throw new Error(`Unknown fix action: ${action}`);
      }

      return { success: true, updatedPipeline, fixed: vulnerability.title };
    } catch (error) {
      errorService.handle(error, { action: 'applySecurityFix' }, 'medium');
      throw error;
    }
  }

  getSeverityColor(severity) {
    const colors = {
      critical: 'from-red-600 to-red-700',
      high: 'from-orange-600 to-orange-700',
      medium: 'from-yellow-600 to-yellow-700',
      low: 'from-blue-600 to-blue-700',
    };
    return colors[severity] || colors.low;
  }

  getRiskIcon(risk) {
    const icons = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢',
    };
    return icons[risk] || '⚪';
  }
}

export const pipelineSecurityService = new PipelineSecurityService();
export default pipelineSecurityService;