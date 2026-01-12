# CI/CD Pipeline Documentation

## Overview

FlashFusion uses GitHub Actions for continuous integration and deployment. This document describes the automated pipelines and how to use them.

## Workflows

### 1. CI Pipeline (`ci.yml`)

**Trigger:** Push to `main` or `develop`, Pull Requests

**Jobs:**
- **Lint**: Runs ESLint to check code quality
- **Type Check**: Validates TypeScript/JSDoc types
- **Test**: Runs test suite with coverage reporting
- **Build**: Creates production build and uploads artifacts
- **Security**: Runs npm audit for vulnerabilities
- **Quality Gate**: Final check ensuring all jobs passed

**Status Badges:**
```markdown
[![CI Status](https://github.com/Krosebrook/fusion-ai/workflows/CI%20Pipeline/badge.svg)](https://github.com/Krosebrook/fusion-ai/actions)
```

### 2. Deploy to Staging (`deploy-staging.yml`)

**Trigger:** Push to `develop` branch, Manual dispatch

**Purpose:** Automatically deploys to staging environment for testing

**Steps:**
1. Build application with staging configuration
2. Run health checks
3. Deploy to staging server
4. Verify deployment
5. Create deployment summary

**Usage:**
```bash
# Automatic: Push to develop branch
git push origin develop

# Manual: Via GitHub Actions UI
# Go to Actions → Deploy to Staging → Run workflow
```

### 3. Deploy to Production (`deploy-production.yml`)

**Trigger:** Release published, Manual dispatch with version

**Purpose:** Deploy to production with safety checks

**Steps:**
1. Validate release version
2. Run full test suite
3. Build for production
4. Verify build integrity
5. Create backup reference
6. Deploy to production
7. Run smoke tests
8. Create deployment tag

**Usage:**
```bash
# Method 1: Create a GitHub Release
# Go to Releases → Draft new release → Publish

# Method 2: Manual workflow dispatch
# Go to Actions → Deploy to Production → Run workflow
# Enter version (e.g., v2.1.0)
```

### 4. CodeQL Security Analysis (`codeql-analysis.yml`)

**Trigger:** 
- Push to `main` or `develop`
- Pull Requests
- Weekly on Monday at 2 AM UTC

**Purpose:** Automated security scanning using GitHub CodeQL

**Features:**
- Identifies security vulnerabilities
- Detects code quality issues
- Generates SARIF reports
- Integrates with GitHub Security tab

### 5. Dependency Review (`dependency-review.yml`)

**Trigger:** Pull Requests

**Purpose:** Reviews dependency changes for security issues

**Checks:**
- Security vulnerabilities in new dependencies
- License compliance
- Outdated packages
- Dependency conflicts

## Quality Gates

All PRs must pass these checks before merging:

- ✅ Lint passes
- ✅ Type check passes
- ✅ All tests pass
- ✅ Build succeeds
- ✅ No critical security vulnerabilities
- ✅ Code coverage meets threshold

## Coverage Requirements

**Current Target:** 40% overall coverage

**Monitoring:**
- Coverage reports generated on every PR
- Uploaded to Codecov (if configured)
- Displayed in PR comments
- Warning if below target (non-blocking)

## Environment Configuration

### Staging Environment

**URL:** https://staging.flashfusion.app (configure in repository settings)

**Secrets Needed:**
- `STAGING_DEPLOY_KEY` (if using SSH)
- `VERCEL_TOKEN` or equivalent (for cloud deployments)

### Production Environment

**URL:** https://flashfusion.app (configure in repository settings)

**Secrets Needed:**
- `PRODUCTION_DEPLOY_KEY` (if using SSH)
- `VERCEL_TOKEN` or equivalent (for cloud deployments)

**Protection Rules:**
- Requires review approval
- Status checks must pass
- Branch must be up to date

## Setting Up Deployments

### Option 1: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Add token to GitHub secrets
# Get token from: https://vercel.com/account/tokens
```

Update workflow:
```yaml
- name: Deploy to Vercel
  run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Link site
netlify link

# Add token to GitHub secrets
# Get token from: https://app.netlify.com/user/applications
```

Update workflow:
```yaml
- name: Deploy to Netlify
  run: npx netlify-cli deploy --prod --dir=dist --auth=${{ secrets.NETLIFY_AUTH_TOKEN }}
```

### Option 3: AWS S3 + CloudFront

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1

- name: Deploy to S3
  run: |
    aws s3 sync dist/ s3://your-bucket-name --delete
    aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Monitoring & Debugging

### View Workflow Runs

1. Go to repository → Actions tab
2. Select workflow from left sidebar
3. Click on specific run to see details

### Debugging Failed Runs

1. **Check job logs**: Click on failed job to see detailed logs
2. **Re-run failed jobs**: Click "Re-run failed jobs" button
3. **Enable debug logging**: Add secret `ACTIONS_STEP_DEBUG` = `true`

### Common Issues

**Issue: npm ci fails**
```
Solution: Ensure package-lock.json is committed
```

**Issue: Build times out**
```
Solution: Increase timeout-minutes in workflow
```

**Issue: Tests fail on CI but pass locally**
```
Solution: Check for environment-specific issues
- Timezone differences
- Missing environment variables
- File path case sensitivity
```

## Best Practices

### Branch Strategy

```
main (production)
  ↑
develop (staging)
  ↑
feature/* (development)
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: format code
refactor: improve code structure
test: add tests
chore: update dependencies
ci: modify pipeline
```

### Pull Request Workflow

1. Create feature branch from `develop`
2. Make changes and commit
3. Push and open PR to `develop`
4. Wait for CI checks to pass
5. Request review
6. Merge after approval
7. Delete feature branch

### Release Process

1. Merge `develop` to `main`
2. Create GitHub Release with version tag
3. Production deployment triggers automatically
4. Verify deployment
5. Update CHANGELOG.md

## Performance Metrics

Monitor these metrics in Actions:

- **Lint Time**: Should be < 2 minutes
- **Test Time**: Should be < 5 minutes
- **Build Time**: Should be < 5 minutes
- **Total Pipeline**: Should be < 15 minutes

## Security

### Secrets Management

**Never commit secrets!** Use GitHub Secrets:

1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add secret name and value
4. Reference in workflow: `${{ secrets.SECRET_NAME }}`

### Required Secrets

- `CODECOV_TOKEN` (optional, for coverage reporting)
- `VERCEL_TOKEN` or hosting provider token
- `NPM_TOKEN` (if publishing packages)

## Maintenance

### Weekly Tasks

- Review and merge Dependabot PRs
- Check CodeQL security alerts
- Monitor build times

### Monthly Tasks

- Review and update dependencies
- Audit workflow efficiency
- Update documentation

### Quarterly Tasks

- Security audit
- Performance optimization
- Workflow improvements

## Support

For CI/CD issues:

1. Check [GitHub Actions Status](https://www.githubstatus.com/)
2. Review workflow logs
3. Search existing issues
4. Create new issue with `ci/cd` label

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Actions Marketplace](https://github.com/marketplace?type=actions)
- [Security Best Practices](https://docs.github.com/en/actions/security-guides)

---

**Last Updated:** January 12, 2026  
**Version:** 1.0  
**Owner:** FlashFusion DevOps Team
