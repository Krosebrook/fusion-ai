# FlashFusion API & Architecture Documentation

## 📚 Table of Contents

1. [API Documentation](#api-documentation)
2. [Architecture Overview](#architecture-overview)
3. [Edge Cases & Error Handling](#edge-cases--error-handling)
4. [Documentation Roadmap](#documentation-roadmap)

---

# API Documentation

## Base44 SDK Integration

### Authentication API

#### `base44.auth.me()`
**Returns:** `Promise<User | null>`
```javascript
const user = await base44.auth.me();
```

#### `base44.auth.isAuthenticated()`
**Returns:** `Promise<boolean>`

#### `base44.auth.logout(redirectUrl?: string)`

#### `base44.auth.redirectToLogin(nextUrl?: string)`

---

### Entities API

#### CRUD Operations
```javascript
// List all
await base44.entities.Task.list('-created_date', 50);

// Filter
await base44.entities.Task.filter({ status: 'active' }, '-updated_date', 20);

// Create
await base44.entities.Task.create({ title: "New task", status: "todo" });

// Update
await base44.entities.Task.update(id, { status: "completed" });

// Delete
await base44.entities.Task.delete(id);

// Real-time subscription
const unsubscribe = base44.entities.Task.subscribe((event) => {
  console.log(`${event.type}:`, event.data);
});
```

---

### Agents API

```javascript
// Create conversation
const conv = await base44.agents.createConversation({
  agent_name: 'UserJourneyMapper',
  metadata: { role: 'user', flow: 'onboarding' }
});

// Add message
await base44.agents.addMessage(conv, {
  role: 'user',
  content: 'Analyze this flow...'
});

// Subscribe to updates
const unsub = base44.agents.subscribeToConversation(convId, (data) => {
  setMessages(data.messages);
});
```

---

### Integrations API

```javascript
// LLM
await base44.integrations.Core.InvokeLLM({
  prompt: "...",
  response_json_schema: { type: "object", properties: {...} },
  add_context_from_internet: true
});

// File upload
const { file_url } = await base44.integrations.Core.UploadFile({ file });

// Image generation
const { url } = await base44.integrations.Core.GenerateImage({
  prompt: "Futuristic UI design"
});

// Email
await base44.integrations.Core.SendEmail({
  to: "user@example.com",
  subject: "...",
  body: "..."
});
```

---

### Analytics API

```javascript
base44.analytics.track({
  eventName: "feature_used",
  properties: { feature: "ab_test", success: true }
});
```

---

## Backend Functions

### Structure
```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Business logic
  const result = await base44.entities.Task.list();
  
  return Response.json({ success: true, data: result });
});
```

---

### Key Functions

#### `generateABTestScenarios`
**Input:** `{ analysisContent, role, flow }`  
**Output:** `{ scenarios: [...] }`

#### `deployABTest`
**Input:** `{ scenario, config }`  
**Output:** `{ success, testId, deployment: {...} }`

---

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Not authenticated |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid input |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

---

# Architecture Overview

## System Layers

```
┌─────────────────────────────────────────┐
│     Presentation (React + Tailwind)     │
├─────────────────────────────────────────┤
│   Business Logic (Hooks + Services)     │
├─────────────────────────────────────────┤
│       API Layer (Base44 SDK)            │
├─────────────────────────────────────────┤
│   Backend (Deno Functions + Agents)     │
├─────────────────────────────────────────┤
│     Data Layer (Base44 Database)        │
└─────────────────────────────────────────┘
```

---

## Component Architecture

### Atomic Design
```
atoms/          # CinematicCard, CinematicButton
molecules/      # ContentCard, FormField
organisms/      # user-journey/, prompt-studio/
pages/          # UserJourneyAnalyzer, Dashboard
layout/         # Layout.js (sticky nav + aurora)
```

---

## Data Flow Patterns

### User Journey Analysis
```
Preset → Config → Agent Conversation → Real-time Stream → A/B Tests → Deploy
```

### Real-time Sync
```javascript
useEffect(() => {
  const unsub = base44.entities.Task.subscribe((event) => {
    if (event.type === 'create') setTasks(prev => [...prev, event.data]);
  });
  return unsub;
}, []);
```

---

## State Management

### React Query
```javascript
useQuery({
  queryKey: ['tasks'],
  queryFn: fetchTasks,
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: true
});
```

---

## Security

### Auth Flow
```
Landing → Check Auth → Login → OAuth → JWT → Silent Refresh
```

### Permissions
- `owner` → Full access
- `admin` → Manage users
- `user` → Own data only

---

## Performance

### Code Splitting
```javascript
const Page = lazy(() => import('./pages/Page'));
```

### Optimization
- Bundle size: <500KB initial
- React Query caching
- Image lazy loading
- Virtual scrolling

---

# Edge Cases & Error Handling

## Authentication

### Token Expiration
**Handling:** Automatic silent refresh at 80% token lifetime

### Concurrent Tab Logout
**Handling:** Storage event listener syncs logout across tabs

### OAuth Failure
**Handling:** User-friendly error + retry button

---

## Data Sync

### WebSocket Disconnect
**Handling:** Exponential backoff reconnection (max 3 attempts)

### Stale Data
**Handling:** `refetchOnReconnect` + `refetchOnWindowFocus`

### Conflicting Updates
**Handling:** Last write wins + optimistic UI with rollback

---

## AI Agents

### Response Timeout (>60s)
**Handling:** Promise.race with timeout + background completion

### Malformed Output
**Handling:** JSON validation + error logging + user notification

### Tool Failure
**Handling:** Agent receives error message + can retry

---

## Forms

### Empty Submission
**Handling:** Client-side validation + disabled button

### XSS Injection
**Handling:** React auto-escape + ReactMarkdown safe mode

### Large Input (>10,000 chars)
**Handling:** maxLength + slice + warning toast

---

## File Upload

### Unsupported Type
**Handling:** MIME type validation + error message

### Upload Interruption
**Handling:** AbortController cleanup on unmount

---

## A/B Testing

### Insufficient Sample
**Handling:** Calculate required size + progress indicator + warnings

### Performance Degradation
**Handling:** Daily monitoring + email alerts + emergency stop

### Traffic Allocation Bug
**Handling:** Deterministic bucketing + drift detection

---

## Mobile

### Touch Conflicts
**Handling:** Delta comparison (horizontal vs vertical movement)

### Safari Viewport
**Handling:** Dynamic `--vh` CSS variable

---

## Performance

### Memory Leaks
**Handling:** Always unsubscribe in cleanup

### Infinite Render
**Handling:** useMemo for stable references

---

# Documentation Roadmap

## Top 10 Priorities

### 1. **Component Library Storybook** 🎨
- Interactive playground
- Props documentation
- Usage examples
- Visual regression tests
- **Est:** 2-3 days

### 2. **User Guide / Tutorials** 📖
- Getting started
- Step-by-step workflows
- Video walkthroughs
- FAQs
- **Est:** 3-4 days

### 3. **Testing Strategy** 🧪
- Unit testing guidelines
- E2E with Playwright
- Visual regression
- Mocking strategies
- **Est:** 2 days

### 4. **Security & Compliance** 🔒
- Auth best practices
- GDPR checklist
- SOC2 requirements
- Incident response
- **Est:** 2 days

### 5. **Design System** 🎨
- Visual language
- Color palette
- Typography scale
- Motion principles
- **Est:** 3 days

### 6. **CI/CD Pipeline** 🚀
- Architecture overview
- Deployment strategies
- Quality gates
- Monitoring
- **Est:** 2 days

### 7. **AI Agent Development** 🤖
- Custom agent creation
- Prompt engineering
- Multi-agent patterns
- Performance optimization
- **Est:** 2-3 days

### 8. **Performance Optimization** ⚡
- Bundle analysis
- Code splitting
- Web Vitals
- Caching strategies
- **Est:** 2 days

### 9. **Database Schema** 💾
- ERD diagrams
- Migration strategies
- Query optimization
- Audit trails
- **Est:** 1-2 days

### 10. **Internationalization** 🌍
- i18n architecture
- Translation workflow
- RTL support
- Localization
- **Est:** 1-2 days

---

## Documentation Standards

✅ **Requirements:**
- Table of contents (>3 pages)
- Runnable code examples
- Screenshots/diagrams
- Last updated date
- Related links

✅ **Quality:**
- 90% coverage
- <2% broken links
- 4.5+ star rating
- Peer reviewed

---

## Contact & Contributions

For questions or contributions:
1. Check existing docs
2. Search GitHub issues
3. Submit PR with improvements
4. Join community Slack

**Maintained by:** FlashFusion Team  
**Last Updated:** 2026-01-14