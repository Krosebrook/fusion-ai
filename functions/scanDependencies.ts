import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Dependency Vulnerability Scanner
 * Scans package.json dependencies and creates auto-fix PRs
 */

const SCANNERS = {
  snyk: async (repoOwner, repoName, githubToken) => {
    const snykToken = Deno.env.get('SNYK_API_TOKEN');
    if (!snykToken) throw new Error('SNYK_API_TOKEN not configured');
    
    // Import repo to Snyk
    const importRes = await fetch('https://snyk.io/api/v1/org/default/integrations/github/import', {
      method: 'POST',
      headers: {
        'Authorization': `token ${snykToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: { owner: repoOwner, name: repoName, branch: 'main' }
      })
    });
    
    const { id: projectId } = await importRes.json();
    
    // Get vulnerabilities
    const vulnRes = await fetch(`https://snyk.io/api/v1/org/default/project/${projectId}/issues`, {
      headers: { 'Authorization': `token ${snykToken}` }
    });
    
    const { issues } = await vulnRes.json();
    
    return {
      provider: 'snyk',
      vulnerabilities: issues.vulnerabilities.map(v => ({
        package: v.packageName,
        version: v.version,
        severity: v.severity,
        title: v.title,
        fixedIn: v.fixedIn,
        cve: v.identifiers?.CVE?.[0],
        cwe: v.identifiers?.CWE?.[0],
        cvssScore: v.cvssScore,
        upgradePath: v.upgradePath
      })),
      summary: {
        critical: issues.vulnerabilities.filter(v => v.severity === 'critical').length,
        high: issues.vulnerabilities.filter(v => v.severity === 'high').length,
        medium: issues.vulnerabilities.filter(v => v.severity === 'medium').length,
        low: issues.vulnerabilities.filter(v => v.severity === 'low').length
      }
    };
  },
  
  npm_audit: async (packageJsonContent) => {
    // Parse package.json
    const packageJson = JSON.parse(packageJsonContent);
    
    // Run npm audit programmatically
    const auditRes = await fetch('https://registry.npmjs.org/-/npm/v1/security/audits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: packageJson.name,
        version: packageJson.version,
        requires: packageJson.dependencies,
        dependencies: packageJson.dependencies
      })
    });
    
    const audit = await auditRes.json();
    
    return {
      provider: 'npm_audit',
      vulnerabilities: Object.entries(audit.advisories || {}).map(([id, adv]) => ({
        package: adv.module_name,
        version: adv.findings[0]?.version,
        severity: adv.severity,
        title: adv.title,
        fixedIn: adv.patched_versions,
        cve: adv.cves?.[0],
        cwe: adv.cwe?.[0],
        cvssScore: adv.cvss?.score
      })),
      summary: {
        critical: audit.metadata?.vulnerabilities?.critical || 0,
        high: audit.metadata?.vulnerabilities?.high || 0,
        medium: audit.metadata?.vulnerabilities?.moderate || 0,
        low: audit.metadata?.vulnerabilities?.low || 0
      }
    };
  }
};

async function createFixPR(repoOwner, repoName, githubToken, vulnerabilities, scanId) {
  // Group vulnerabilities by fix type
  const fixes = new Map();
  
  for (const vuln of vulnerabilities) {
    if (vuln.fixedIn && vuln.fixedIn.length > 0) {
      const key = `${vuln.package}@${vuln.fixedIn[0]}`;
      if (!fixes.has(key)) {
        fixes.set(key, []);
      }
      fixes.get(key).push(vuln);
    }
  }
  
  if (fixes.size === 0) {
    return null; // No auto-fixable vulnerabilities
  }
  
  // Create branch
  const branchName = `security/auto-fix-${scanId}`;
  const mainRef = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/main`, {
    headers: { 'Authorization': `token ${githubToken}` }
  }).then(r => r.json());
  
  await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/git/refs`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ref: `refs/heads/${branchName}`,
      sha: mainRef.object.sha
    })
  });
  
  // Get package.json
  const packageJsonRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/package.json`, {
    headers: { 'Authorization': `token ${githubToken}` }
  });
  const packageJsonData = await packageJsonRes.json();
  const packageJson = JSON.parse(atob(packageJsonData.content));
  
  // Apply fixes
  let fixCount = 0;
  for (const [fixKey, vulns] of fixes.entries()) {
    const [pkg, version] = fixKey.split('@');
    if (packageJson.dependencies?.[pkg]) {
      packageJson.dependencies[pkg] = version;
      fixCount++;
    }
    if (packageJson.devDependencies?.[pkg]) {
      packageJson.devDependencies[pkg] = version;
      fixCount++;
    }
  }
  
  // Commit updated package.json
  await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/package.json`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `fix: update ${fixCount} vulnerable dependencies [security scan ${scanId}]`,
      content: btoa(JSON.stringify(packageJson, null, 2)),
      sha: packageJsonData.sha,
      branch: branchName
    })
  });
  
  // Create PR
  const prBody = `## 🔒 Security Vulnerability Fixes

This PR automatically updates vulnerable dependencies detected by security scan \`${scanId}\`.

### Fixed Vulnerabilities

${Array.from(fixes.entries()).map(([key, vulns]) => {
  const [pkg, version] = key.split('@');
  return `- **${pkg}** → \`${version}\` (${vulns.length} vulnerabilities fixed)
  ${vulns.map(v => `  - [${v.severity.toUpperCase()}] ${v.title} (${v.cve || 'No CVE'})`).join('\n')}`;
}).join('\n\n')}

### Summary
- Total vulnerabilities fixed: ${vulnerabilities.length}
- Critical: ${vulnerabilities.filter(v => v.severity === 'critical').length}
- High: ${vulnerabilities.filter(v => v.severity === 'high').length}

---
*Auto-generated by FlashFusion Security Scanner*`;
  
  const prRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: `🔒 Fix ${fixCount} vulnerable dependencies`,
      head: branchName,
      base: 'main',
      body: prBody
    })
  });
  
  const pr = await prRes.json();
  return { prNumber: pr.number, prUrl: pr.html_url, fixCount };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { pipelineId, provider = 'npm_audit', autoCreatePR = true } = await req.json();
    
    // Get pipeline
    const pipelines = await base44.entities.PipelineConfig.filter({ id: pipelineId });
    if (pipelines.length === 0) {
      return Response.json({ error: 'Pipeline not found' }, { status: 404 });
    }
    
    const pipeline = pipelines[0];
    const [repoOwner, repoName] = pipeline.repository_name.split('/');
    
    // Create scan record
    const scan = await base44.entities.SecurityScan.create({
      scan_type: 'dependency',
      target_type: 'pipeline',
      target_id: pipelineId,
      status: 'running',
      started_at: new Date().toISOString()
    });
    
    try {
      // Fetch package.json from GitHub
      const githubToken = Deno.env.get('GITHUB_TOKEN');
      const packageJsonRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/package.json`, {
        headers: { 'Authorization': `token ${githubToken}` }
      });
      const packageJsonData = await packageJsonRes.json();
      const packageJsonContent = atob(packageJsonData.content);
      
      // Run scan
      let results;
      if (provider === 'snyk') {
        results = await SCANNERS.snyk(repoOwner, repoName, githubToken);
      } else {
        results = await SCANNERS.npm_audit(packageJsonContent);
      }
      
      // Update scan with results
      await base44.entities.SecurityScan.update(scan.id, {
        status: 'completed',
        severity_summary: results.summary,
        findings: results.vulnerabilities.map(v => ({
          id: `${v.package}@${v.version}`,
          title: v.title,
          severity: v.severity,
          cvss_score: v.cvssScore,
          cve_id: v.cve,
          cwe_id: v.cwe,
          description: v.title,
          affected_component: v.package,
          remediation: v.fixedIn ? `Update to ${v.fixedIn}` : 'No fix available',
          status: 'open',
          first_detected: new Date().toISOString()
        })),
        completed_at: new Date().toISOString()
      });
      
      // Create fix PR if requested
      let prInfo = null;
      if (autoCreatePR && results.vulnerabilities.some(v => v.fixedIn)) {
        prInfo = await createFixPR(repoOwner, repoName, githubToken, results.vulnerabilities, scan.id);
        
        if (prInfo) {
          await base44.entities.SecurityScan.update(scan.id, {
            metadata: { autoPR: prInfo }
          });
        }
      }
      
      return Response.json({
        scanId: scan.id,
        provider: results.provider,
        summary: results.summary,
        vulnerabilities: results.vulnerabilities,
        prCreated: !!prInfo,
        prInfo,
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
    console.error('Dependency scan failed:', error);
    return Response.json({ error: 'Scan failed', details: error.message }, { status: 500 });
  }
});