/**
 * Prompt Policy Check - Validates prompt against governance policies
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { version_id, policies } = await req.json();

    // Fetch version
    const versions = await base44.entities.PromptTemplateVersion.list();
    const version = versions.find(v => v.id === version_id);

    if (!version) {
      return Response.json({
        passed: false,
        violations: ['Version not found']
      });
    }

    const violations = [];

    // Check each policy
    for (const policy of policies) {
      if (!policy.enabled) continue;

      switch (policy.type) {
        case 'review':
          if (!version.reviewed_at || version.review_status !== 'approved') {
            violations.push(`${policy.name}: Requires approved code review`);
          }
          break;

        case 'validation':
          if (policy.config.max_tokens) {
            const tokenCount = version.template?.split(' ').length || 0;
            if (tokenCount > policy.config.max_tokens) {
              violations.push(`${policy.name}: Exceeds ${policy.config.max_tokens} tokens`);
            }
          }
          break;

        case 'security':
          if (policy.config.patterns) {
            const piiPatterns = {
              email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
              phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
              ssn: /\b\d{3}-\d{2}-\d{4}\b/,
              credit_card: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/
            };

            for (const pattern of policy.config.patterns) {
              if (piiPatterns[pattern]?.test(version.template)) {
                violations.push(`${policy.name}: Contains ${pattern} data`);
              }
            }
          }
          break;

        case 'compliance':
          if (policy.config.require_change_summary) {
            if (!version.change_summary || 
                version.change_summary.length < (policy.config.min_summary_length || 10)) {
              violations.push(`${policy.name}: Missing or insufficient change summary`);
            }
          }
          break;
      }
    }

    return Response.json({
      passed: violations.length === 0,
      violations,
      checked_policies: policies.length
    });
  } catch (error) {
    return Response.json({ 
      error: error.message,
      passed: false,
      violations: ['Policy check failed']
    }, { status: 500 });
  }
});