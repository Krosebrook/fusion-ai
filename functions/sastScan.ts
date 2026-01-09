import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Static Application Security Testing (SAST) Scan
 * Integrates with Snyk, SonarQube, and Semgrep for code vulnerability scanning
 */

const SAST_PROVIDERS = {
  snyk: async (repoUrl, token) => {
    const response = await fetch('https://snyk.io/api/v1/test', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        repository: repoUrl,
        test: 'code'
      })
    });
    
    if (!response.ok) throw new Error(`Snyk scan failed: ${response.statusText}`);
    const data = await response.json();
    
    return {
      provider: 'snyk',
      vulnerabilities: data.issues.map(issue => ({
        severity: issue.severity,
        title: issue.title,
        file: issue.from[0],
        line: issue.lineNumber,
        cwe: issue.identifiers?.CWE?.[0],
        cvss: issue.cvssScore,
        remediation: issue.remediation
      })),
      summary: {
        critical: data.issues.filter(i => i.severity === 'critical').length,
        high: data.issues.filter(i => i.severity === 'high').length,
        medium: data.issues.filter(i => i.severity === 'medium').length,
        low: data.issues.filter(i => i.severity === 'low').length
      }
    };
  },
  
  semgrep: async (codebase) => {
    const response = await fetch('https://semgrep.dev/api/v1/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: codebase,
        rules: ['javascript', 'typescript', 'react', 'node']
      })
    });
    
    if (!response.ok) throw new Error(`Semgrep scan failed: ${response.statusText}`);
    const data = await response.json();
    
    return {
      provider: 'semgrep',
      vulnerabilities: data.results.map(result => ({
        severity: result.extra.severity,
        title: result.check_id,
        file: result.path,
        line: result.start.line,
        cwe: result.extra.metadata?.cwe,
        remediation: result.extra.message
      })),
      summary: {
        critical: data.results.filter(r => r.extra.severity === 'ERROR').length,
        high: data.results.filter(r => r.extra.severity === 'WARNING').length,
        medium: data.results.filter(r => r.extra.severity === 'INFO').length,
        low: 0
      }
    };
  },
  
  custom_rules: async (files) => {
    const vulnerabilities = [];
    
    // Custom security rules
    const patterns = [
      { regex: /eval\(/, severity: 'critical', title: 'Dangerous eval() usage', cwe: 'CWE-95' },
      { regex: /innerHTML\s*=/, severity: 'high', title: 'Potential XSS via innerHTML', cwe: 'CWE-79' },
      { regex: /localStorage\.setItem.*password/i, severity: 'critical', title: 'Password in localStorage', cwe: 'CWE-312' },
      { regex: /console\.log.*\bpassword\b/i, severity: 'high', title: 'Password logged to console', cwe: 'CWE-532' },
      { regex: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i, severity: 'critical', title: 'Hardcoded API key', cwe: 'CWE-798' },
      { regex: /Math\.random\(\).*security|random\(\).*token/i, severity: 'medium', title: 'Weak random for security', cwe: 'CWE-330' }
    ];
    
    for (const file of files) {
      const lines = file.content.split('\n');
      lines.forEach((line, idx) => {
        patterns.forEach(pattern => {
          if (pattern.regex.test(line)) {
            vulnerabilities.push({
              severity: pattern.severity,
              title: pattern.title,
              file: file.path,
              line: idx + 1,
              cwe: pattern.cwe,
              code: line.trim()
            });
          }
        });
      });
    }
    
    return {
      provider: 'custom_rules',
      vulnerabilities,
      summary: {
        critical: vulnerabilities.filter(v => v.severity === 'critical').length,
        high: vulnerabilities.filter(v => v.severity === 'high').length,
        medium: vulnerabilities.filter(v => v.severity === 'medium').length,
        low: vulnerabilities.filter(v => v.severity === 'low').length
      }
    };
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { targetType, targetId, provider = 'custom_rules', codeFiles } = await req.json();
    
    // Create scan record
    const scan = await base44.entities.SecurityScan.create({
      scan_type: 'sast',
      target_type: targetType,
      target_id: targetId,
      status: 'running',
      started_at: new Date().toISOString()
    });
    
    try {
      let results;
      
      if (provider === 'custom_rules' && codeFiles) {
        results = await SAST_PROVIDERS.custom_rules(codeFiles);
      } else if (provider === 'snyk') {
        const snykToken = Deno.env.get('SNYK_API_TOKEN');
        if (!snykToken) throw new Error('SNYK_API_TOKEN not configured');
        results = await SAST_PROVIDERS.snyk(codeFiles?.repoUrl, snykToken);
      } else if (provider === 'semgrep') {
        results = await SAST_PROVIDERS.semgrep(codeFiles);
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }
      
      // Calculate risk score (0-100)
      const riskScore = Math.min(100, 
        results.summary.critical * 25 + 
        results.summary.high * 10 + 
        results.summary.medium * 3 + 
        results.summary.low * 1
      );
      
      // Update scan with results
      await base44.entities.SecurityScan.update(scan.id, {
        status: 'completed',
        severity_summary: results.summary,
        findings: results.vulnerabilities.map(v => ({
          id: `${v.file}:${v.line}`,
          title: v.title,
          severity: v.severity,
          cvss_score: v.cvss || null,
          cve_id: null,
          cwe_id: v.cwe,
          description: v.title,
          affected_component: v.file,
          file_path: v.file,
          line_number: v.line,
          remediation: v.remediation || 'Review and fix according to security best practices',
          status: 'open',
          first_detected: new Date().toISOString()
        })),
        risk_score: riskScore,
        completed_at: new Date().toISOString(),
        scan_duration_seconds: Math.floor((Date.now() - new Date(scan.started_at).getTime()) / 1000)
      });
      
      // Trigger alert if critical vulnerabilities found
      if (results.summary.critical > 0) {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `🚨 Critical Security Vulnerabilities Detected`,
          body: `SAST scan found ${results.summary.critical} critical vulnerabilities in ${targetType} ${targetId}. Review immediately: ${process.env.APP_URL}/security-scans/${scan.id}`
        });
      }
      
      return Response.json({
        scanId: scan.id,
        provider: results.provider,
        summary: results.summary,
        riskScore,
        vulnerabilities: results.vulnerabilities,
        completedAt: new Date().toISOString()
      });
      
    } catch (scanError) {
      await base44.entities.SecurityScan.update(scan.id, {
        status: 'failed',
        completed_at: new Date().toISOString()
      });
      throw scanError;
    }
    
  } catch (error) {
    console.error('SAST scan failed:', error);
    return Response.json({ 
      error: 'SAST scan failed', 
      details: error.message 
    }, { status: 500 });
  }
});