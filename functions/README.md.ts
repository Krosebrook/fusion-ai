# FlashFusion CI/CD API Functions

## 🔐 Authentication

All API endpoints require authentication via API key in the request header:

```
X-API-Key: ffai_your_api_key_here
```

### API Key Format
- Prefix: `ffai_`
- Hash: SHA-256
- Permissions: `trigger_pipeline`, `read_runs`, `read_config`, `webhook`

---

## 📡 API Endpoints

### 1. Trigger Pipeline Run
**Endpoint:** `POST /api/trigger-pipeline`

**Purpose:** Initiate a new pipeline execution

**Required Permission:** `trigger_pipeline`

**Request Body:**
```json
{
  "pipeline_id": "string",
  "branch": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "run_id": "string",
  "status": "running",
  "workflow_id": "string"
}
```

**Example:**
```bash
curl -X POST https://api.flashfusion.app/api/trigger-pipeline \
  -H "X-API-Key: ffai_..." \
  -H "Content-Type: application/json" \
  -d '{"pipeline_id": "abc123"}'
```

---

### 2. Get Pipeline Status
**Endpoint:** `GET /api/get-status?run_id=...`

**Purpose:** Check the status of a specific pipeline run

**Required Permission:** `read_runs`

**Query Parameters:**
- `run_id`: Pipeline run identifier

**Response:**
```json
{
  "success": true,
  "run": {
    "id": "string",
    "status": "success|failed|running",
    "duration_seconds": 120,
    "steps": [...],
    "deployment_url": "https://..."
  }
}
```

---

### 3. Get Pipeline Configuration
**Endpoint:** `GET /api/get-config?pipeline_id=...`

**Purpose:** Retrieve detailed pipeline configuration

**Required Permission:** `read_config`

**Query Parameters:**
- `pipeline_id`: Pipeline identifier

**Response:**
```json
{
  "success": true,
  "config": {
    "id": "string",
    "name": "string",
    "provider": "github|gitlab",
    "project_type": "react|nextjs|...",
    "repository_name": "owner/repo",
    "branch": "main",
    "triggers": {...},
    "build_command": "npm run build",
    "quality_gates": {...}
  }
}
```

---

### 4. Create API Key
**Endpoint:** `POST /functions/createAPIKey`

**Purpose:** Generate a new API key with specified permissions

**Authentication:** User session (not API key)

**Request Body:**
```json
{
  "name": "Production Deploy Key",
  "permissions": ["trigger_pipeline", "read_runs"],
  "pipeline_ids": ["id1", "id2"],
  "expires_in_days": 90
}
```

**Response:**
```json
{
  "success": true,
  "id": "key_id",
  "name": "Production Deploy Key",
  "plaintext_key": "ffai_...",
  "key_preview": "...abc123"
}
```

**⚠️ Important:** Save the `plaintext_key` immediately - it's only shown once!

---

## 🪝 Webhooks

### Send Webhook Notification
**Endpoint:** `POST /functions/sendWebhook`

**Purpose:** Trigger webhook notifications for pipeline events

**Request Body:**
```json
{
  "event_type": "run.completed|run.failed|run.started",
  "pipeline_id": "string",
  "payload": {
    "run_id": "string",
    "status": "success",
    "duration": "2m 30s"
  }
}
```

### Webhook Event Types
- `run.started` - Pipeline execution begins
- `run.completed` - Pipeline succeeds
- `run.failed` - Pipeline fails
- `optimization.available` - AI suggests optimization
- `deployment.success` - Deployment completes

### Webhook Payload Structure
```json
{
  "event": "run.completed",
  "timestamp": "2025-11-21T10:30:00Z",
  "pipeline_id": "abc123",
  "data": {
    "run_id": "run_456",
    "status": "success",
    "duration": "2m 30s"
  }
}
```

### Webhook Signature Verification

All webhooks include HMAC-SHA256 signature for security:

**Headers:**
```
X-FlashFusion-Signature: <hmac_hex>
X-FlashFusion-Event: run.completed
```

**Node.js Verification:**
```javascript
const crypto = require('crypto');

function verifyWebhook(req, secret) {
  const signature = req.headers['x-flashfusion-signature'];
  const payload = JSON.stringify(req.body);
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}
```

**Python Verification:**
```python
import hmac
import hashlib
import json

def verify_webhook(request, secret):
    signature = request.headers.get('X-FlashFusion-Signature')
    payload = json.dumps(request.json)
    
    expected_signature = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return signature == expected_signature
```

---

## 🔍 Error Handling

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (missing parameters)
- `401` - Unauthorized (invalid/missing API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (pipeline/run doesn't exist)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": "Invalid API key format",
  "message": "API keys must start with ffai_"
}
```

---

## 🛡️ Security Best Practices

1. **Store API Keys Securely**
   - Use environment variables
   - Never commit to version control
   - Rotate regularly (90 days recommended)

2. **Least Privilege Principle**
   - Grant minimum required permissions
   - Scope keys to specific pipelines when possible

3. **Monitor Usage**
   - Track `usage_count` and `last_used`
   - Alert on suspicious patterns
   - Disable unused keys

4. **Webhook Security**
   - Always verify HMAC signatures
   - Use HTTPS endpoints only
   - Implement rate limiting

---

## 📊 Rate Limits

- **API Calls:** 1000 requests/hour per API key
- **Webhooks:** 100 events/minute per endpoint

Exceeding limits returns `429 Too Many Requests`

---

## 🚀 Quick Start

1. **Generate API Key**
   ```bash
   # In FlashFusion dashboard: API → Create API Key
   ```

2. **Trigger Pipeline**
   ```bash
   curl -X POST https://api.flashfusion.app/api/trigger-pipeline \
     -H "X-API-Key: ffai_your_key" \
     -d '{"pipeline_id": "your_pipeline_id"}'
   ```

3. **Check Status**
   ```bash
   curl https://api.flashfusion.app/api/get-status?run_id=run_123 \
     -H "X-API-Key: ffai_your_key"
   ```

4. **Setup Webhook**
   ```bash
   # In dashboard: API → Webhooks → Create
   # Configure: URL, events, secret
   ```

---

## 📝 Support

For issues or questions:
- Documentation: https://docs.flashfusion.app
- Support: support@flashfusion.app
- Status: https://status.flashfusion.app