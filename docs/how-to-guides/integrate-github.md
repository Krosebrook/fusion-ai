# How to Integrate with GitHub

Learn how to connect FlashFusion with GitHub for automated code management, pipeline execution, and deployment workflows.

**Time Required:** 15 minutes  
**Difficulty:** Intermediate  
**Prerequisites:** GitHub account, repository access

---

## Overview

GitHub integration enables:
- ✅ Automated code commits and PR creation
- ✅ CI/CD pipeline execution via GitHub Actions
- ✅ Repository analysis and insights
- ✅ Automated code reviews on pull requests
- ✅ Issue and project management
- ✅ Deployment automation

---

## Step 1: Generate GitHub Personal Access Token

### Create Token

1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Click **"Generate new token (classic)"**
3. Give it a descriptive name: "FlashFusion Integration"
4. Set expiration (recommended: 90 days)

### Select Scopes

Enable these permissions:

**Repository Access:**
- [x] `repo` - Full control of private repositories
  - [x] `repo:status` - Access commit status
  - [x] `repo_deployment` - Access deployment status
  - [x] `public_repo` - Access public repositories

**Workflow:**
- [x] `workflow` - Update GitHub Action workflows

**Organization:**
- [x] `read:org` - Read org and team membership

**User:**
- [x] `user:email` - Access user email addresses

### Save Token

1. Click **"Generate token"**
2. **Copy the token immediately** (you won't see it again)
3. Save it securely (password manager recommended)

---

## Step 2: Configure FlashFusion

### Add Token to Environment

```bash
# In your .env file
GITHUB_TOKEN=ghp_your_token_here
```

### Configure in UI

Alternatively, add via FlashFusion UI:

1. Navigate to **Settings** → **Integrations**
2. Find **GitHub** integration
3. Click **"Connect"**
4. Paste your Personal Access Token
5. Click **"Authorize"**

### Test Connection

```bash
# Verify connection works
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/user
```

Expected response:
```json
{
  "login": "yourusername",
  "id": 123456,
  ...
}
```

---

## Step 3: Connect Repository

### Option A: Via UI

1. Go to **Integrations** → **GitHub**
2. Click **"Connect Repository"**
3. Select organization (if applicable)
4. Choose repository from dropdown
5. Set default branch (usually `main` or `master`)
6. Click **"Connect"**

### Option B: Via API

```javascript
const response = await fetch('/api/integrations/github/connect', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  },
  body: JSON.stringify({
    owner: 'yourusername',
    repo: 'your-repo-name',
    branch: 'main'
  })
});
```

---

## Step 4: Set Up GitHub Actions

### Generate Workflow File

Using FlashFusion AI Pipeline Generator:

1. Navigate to **AI Pipeline Generator**
2. Describe your workflow:
   ```
   Create GitHub Actions workflow for React app:
   - Trigger on push to main and PRs
   - Run ESLint and Prettier
   - Execute Jest tests
   - Build production bundle
   - Deploy to Vercel
   ```
3. Click **"Generate"**
4. Download generated `.github/workflows/ci.yml`

### Example Generated Workflow

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm test -- --coverage
      
      - name: Build
        run: npm run build
  
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Add to Repository

```bash
# Create workflow directory
mkdir -p .github/workflows

# Add workflow file
cp ci.yml .github/workflows/

# Commit and push
git add .github/workflows/ci.yml
git commit -m "Add CI/CD workflow"
git push origin main
```

---

## Step 5: Configure Secrets

### Required Secrets

Add these in GitHub repository settings:

1. Go to repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add each secret:

**For Vercel Deployment:**
```
VERCEL_TOKEN=your_vercel_token
ORG_ID=your_vercel_org_id
PROJECT_ID=your_vercel_project_id
```

**For FlashFusion Integration:**
```
FLASHFUSION_API_KEY=your_flashfusion_api_key
```

**For Notifications:**
```
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

---

## Step 6: Enable Automated Code Reviews

### Set Up Review Automation

1. Navigate to **AI Code Review** settings
2. Enable **"Auto-review on PRs"**
3. Configure review criteria:
   - Code quality threshold: **70%**
   - Security scan: **Enabled**
   - Performance check: **Enabled**
   - Best practices: **Enabled**

### Add GitHub Action

Create `.github/workflows/code-review.yml`:

```yaml
name: Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: AI Code Review
        uses: flashfusion/code-review-action@v1
        with:
          flashfusion-api-key: ${{ secrets.FLASHFUSION_API_KEY }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          min-score: 70
```

### Review Process

When a PR is created:
1. ✅ Action automatically triggers
2. ✅ AI analyzes the code changes
3. ✅ Comments are posted on PR
4. ✅ Quality score is displayed
5. ✅ Approval/rejection based on threshold

---

## Step 7: Repository Analysis

### Analyze Codebase

Use FlashFusion to analyze your repository:

```javascript
// Via API
const analysis = await fetch('/api/github/analyze', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    owner: 'yourusername',
    repo: 'your-repo',
    analysis: ['quality', 'security', 'performance', 'architecture']
  })
});

const result = await analysis.json();
```

### Analysis Results

```json
{
  "quality": {
    "score": 85,
    "issues": [
      {
        "file": "src/components/App.jsx",
        "line": 45,
        "severity": "medium",
        "message": "Component complexity too high"
      }
    ]
  },
  "security": {
    "score": 92,
    "vulnerabilities": []
  },
  "performance": {
    "score": 78,
    "recommendations": [
      "Implement code splitting",
      "Optimize bundle size"
    ]
  }
}
```

---

## Step 8: Automated Deployments

### Configure Deployment Triggers

Set up automatic deployments:

1. Go to **Deployment Center**
2. Click **"New Deployment"**
3. Select **GitHub** as source
4. Choose repository and branch
5. Set deployment target (Vercel, AWS, etc.)
6. Configure triggers:
   - [x] On push to main
   - [x] On tag creation
   - [ ] Manual only

### Example Deployment Config

```yaml
deployment:
  provider: vercel
  project: flashfusion-demo
  production:
    branch: main
    auto_deploy: true
  preview:
    branches: [develop, staging]
    auto_deploy: true
```

---

## Advanced Features

### Webhook Integration

Set up webhooks for real-time events:

1. Go to repository **Settings** → **Webhooks**
2. Click **"Add webhook"**
3. Configure:
   - **Payload URL:** `https://your-flashfusion.com/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Generate and save securely
4. Select events:
   - [x] Push events
   - [x] Pull requests
   - [x] Issues
   - [x] Releases

### Branch Protection Rules

Enforce quality gates:

1. Go to repository **Settings** → **Branches**
2. Add rule for `main` branch
3. Enable:
   - [x] Require pull request reviews
   - [x] Require status checks to pass
     - [x] CI/CD
     - [x] Code Review
   - [x] Require branches to be up to date
   - [x] Include administrators

---

## Monitoring & Maintenance

### Check Integration Health

```bash
# Test GitHub API connection
npm run test:github-integration

# View recent activity
npm run github:activity

# Check webhook deliveries
npm run github:webhooks
```

### Common Issues

**Issue:** "Bad credentials" error

**Solution:**
1. Verify token hasn't expired
2. Check token has required scopes
3. Regenerate if necessary

**Issue:** Workflow not triggering

**Solution:**
1. Check workflow file syntax
2. Verify branch name in triggers
3. Check GitHub Actions are enabled

**Issue:** Rate limit exceeded

**Solution:**
1. Use authenticated requests
2. Implement caching
3. Consider GitHub App instead of PAT

---

## Best Practices

### Security

- ✅ Use short-lived tokens (90 days max)
- ✅ Store tokens in secure vaults
- ✅ Never commit tokens to repository
- ✅ Use minimal required scopes
- ✅ Rotate tokens regularly
- ✅ Monitor token usage

### Performance

- ✅ Cache repository data
- ✅ Use webhooks instead of polling
- ✅ Batch API requests
- ✅ Respect rate limits
- ✅ Implement retry logic

### Maintenance

- ✅ Monitor workflow runs
- ✅ Review failed deployments
- ✅ Update dependencies regularly
- ✅ Clean up old branches
- ✅ Archive unused workflows

---

## Troubleshooting

### Enable Debug Logging

```yaml
# In workflow file
- name: Debug GitHub Integration
  run: npm run debug:github
  env:
    DEBUG: 'github:*'
```

### Check Logs

```bash
# View FlashFusion logs
npm run logs:github

# View GitHub Actions logs
gh run list
gh run view <run-id> --log
```

---

## Next Steps

- [How to Deploy to AWS](./deploy-to-aws.md)
- [How to Create Custom Agents](./create-custom-agents.md)
- [Optimizing CI/CD Performance](./optimize-cicd.md)

---

## Resources

- [GitHub REST API Docs](https://docs.github.com/en/rest)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [FlashFusion API Reference](../reference/api/)
- [Integration Troubleshooting](../reference/troubleshooting.md)

---

*Last Updated: 2025-12-30*
