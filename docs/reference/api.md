# API Reference

## Overview

This directory contains the complete API reference documentation for FlashFusion.

**Status:** 📝 In Progress  
**Last Updated:** January 8, 2026

---

## Table of Contents

### Backend Functions

All backend functions are implemented as Deno serverless functions with the Base44 SDK.

#### AI & Code Generation
- [generatePipeline](./functions/generatePipeline.md) - AI-powered CI/CD pipeline generation
- [generateCode](./functions/generateCode.md) *(Coming Soon)* - AI code generation
- [aiCodeReview](./functions/aiCodeReview.md) *(Coming Soon)* - Automated code review
- [generateDocumentation](./functions/generateDocumentation.md) *(Coming Soon)* - Documentation generation

#### Git Integration
- [fetchGitHubPipelines](./functions/fetchGitHubPipelines.md) *(Coming Soon)* - Fetch GitHub Actions workflows
- [triggerGitHubWorkflow](./functions/triggerGitHubWorkflow.md) *(Coming Soon)* - Trigger workflow execution
- [generateGitHubWorkflow](./functions/generateGitHubWorkflow.md) *(Coming Soon)* - Generate GitHub Actions YAML
- [gitIntegration](./functions/gitIntegration.md) *(Coming Soon)* - General Git operations

#### Pipeline & Deployment
- [analyzePipeline](./functions/analyzePipeline.md) *(Coming Soon)* - Pipeline performance analysis
- [applyOptimization](./functions/applyOptimization.md) *(Coming Soon)* - Apply pipeline optimizations
- [apiTriggerPipeline](./functions/apiTriggerPipeline.md) *(Coming Soon)* - API-based pipeline trigger
- [fetchPipelineDetails](./functions/fetchPipelineDetails.md) *(Coming Soon)* - Get pipeline details

#### Utilities
- [createAPIKey](./functions/createAPIKey.md) *(Coming Soon)* - API key generation
- [createShareLink](./functions/createShareLink.md) *(Coming Soon)* - Create shareable links
- [getRepoStructure](./functions/getRepoStructure.md) *(Coming Soon)* - Analyze repository structure
- [trackEvent](./functions/trackEvent.md) *(Coming Soon)* - Event tracking
- [sendWebhook](./functions/sendWebhook.md) *(Coming Soon)* - Send webhook notifications

#### Content & Media
- [cloneWebsite](./functions/cloneWebsite.md) *(Coming Soon)* - Website cloning
- [flashfusionAPI](./functions/flashfusionAPI.md) *(Coming Soon)* - Main API endpoints

#### Plugin System
- [pluginAPI](./functions/pluginAPI.md) *(Coming Soon)* - Plugin management API
- [seedTemplates](./functions/seedTemplates.md) *(Coming Soon)* - Template seeding

---

## Function Documentation Template

Each function is documented with:

### Function Name

**Endpoint:** `POST /functions/functionName`  
**Authentication:** Required

#### Description
Brief description of what the function does.

#### Request Schema
```typescript
interface RequestBody {
  param1: string;
  param2?: number;
}
```

#### Response Schema
```typescript
interface Response {
  success: boolean;
  data: any;
  error?: string;
}
```

#### Example Usage
```javascript
const response = await fetch('/functions/functionName', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    param1: 'value'
  })
});

const result = await response.json();
```

#### Error Codes
| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing or invalid token |
| 500 | Internal Server Error |

---

## Integration APIs

### GitHub Integration

**Base URL:** `/api/integrations/github`

#### Endpoints
- `POST /connect` - Connect GitHub repository
- `GET /repos` - List accessible repositories
- `GET /workflows/:owner/:repo` - List workflows
- `POST /trigger/:owner/:repo/:workflow` - Trigger workflow
- `GET /runs/:owner/:repo` - List workflow runs

### Slack Integration

**Base URL:** `/api/integrations/slack`

#### Endpoints
- `POST /connect` - Connect Slack workspace
- `POST /message` - Send message to channel
- `POST /webhook` - Webhook handler

### AWS Integration

**Base URL:** `/api/integrations/aws`

#### Endpoints
- `POST /connect` - Connect AWS account
- `GET /services` - List available services
- `POST /deploy` - Deploy to AWS

*More integration APIs documented in their respective integration guides.*

---

## REST API Conventions

### Authentication

All API requests require authentication via Bearer token:

```bash
Authorization: Bearer your_token_here
```

### Request Format

```json
{
  "param": "value",
  "options": {
    "option1": true
  }
}
```

### Response Format

Success response:
```json
{
  "success": true,
  "data": { ... }
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Rate Limiting

- **Limit:** 60 requests per minute per user
- **Headers:**
  - `X-RateLimit-Limit: 60`
  - `X-RateLimit-Remaining: 45`
  - `X-RateLimit-Reset: 1640000000`

### Pagination

For list endpoints:

**Request:**
```
GET /api/items?page=1&perPage=20
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## SDK Usage

### JavaScript/TypeScript

```typescript
import { FlashFusionClient } from '@flashfusion/sdk';

const client = new FlashFusionClient({
  apiKey: process.env.FLASHFUSION_API_KEY,
  baseURL: 'https://api.flashfusion.dev'
});

// Generate pipeline
const pipeline = await client.pipelines.generate({
  description: 'React app with Jest tests',
  environment: 'production'
});

// Trigger workflow
const run = await client.github.triggerWorkflow({
  owner: 'username',
  repo: 'my-repo',
  workflow: 'ci.yml'
});
```

### Python

```python
from flashfusion import FlashFusionClient

client = FlashFusionClient(
    api_key=os.environ['FLASHFUSION_API_KEY']
)

# Generate pipeline
pipeline = client.pipelines.generate(
    description='React app with Jest tests',
    environment='production'
)
```

---

## Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Malformed request body |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Retry Logic

Implement exponential backoff for failed requests:

```javascript
async function requestWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

---

## Webhooks

### Webhook Events

FlashFusion can send webhooks for various events:

- `pipeline.created`
- `pipeline.completed`
- `pipeline.failed`
- `deployment.started`
- `deployment.completed`
- `code_review.completed`

### Webhook Payload

```json
{
  "event": "pipeline.completed",
  "timestamp": "2025-12-30T12:00:00Z",
  "data": {
    "pipelineId": "abc123",
    "status": "success",
    "duration": 120
  }
}
```

### Webhook Security

Verify webhook signatures:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}
```

---

## GraphQL API

**Status:** 📝 Planned for future release

### Example Query

```graphql
query {
  pipelines {
    id
    name
    status
    lastRun {
      status
      duration
    }
  }
}
```

---

## API Changelog

### v2.0.0 (2025-12-30)
- Initial API release
- 26 backend functions
- 27 integration endpoints
- RESTful API design

---

## Support

- **API Issues:** [GitHub Issues](https://github.com/Krosebrook/fusion-ai/issues)
- **Questions:** [GitHub Discussions](https://github.com/Krosebrook/fusion-ai/discussions)
- **Documentation:** [Main Docs](../)

---

*API Reference Version: 1.0 (In Progress)*  
*Last Updated: 2025-12-30*
