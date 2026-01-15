# FlashFusion Platform — Complete Documentation

## 🚀 Overview

**FlashFusion** is an enterprise-grade AI development platform that combines prompt engineering, agent orchestration, CI/CD automation, and visual workflow building into a unified ecosystem.

**Tech Stack:**
- **Frontend:** React 18 + Tailwind CSS + Framer Motion + shadcn/ui
- **Backend:** Deno Edge Functions + Base44 BaaS
- **Database:** PostgreSQL + Real-time subscriptions
- **AI/ML:** OpenAI, Anthropic, Vertex AI, Replicate
- **Integrations:** 27+ deep integrations (Google, GitHub, Notion, Slack, etc.)
- **State Management:** TanStack Query (React Query)
- **Routing:** React Router v6

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Architecture](#architecture)
3. [Development](#development)
4. [Deployment](#deployment)
5. [Testing](#testing)
6. [API Reference](#api-reference)
7. [Contributing](#contributing)
8. [Troubleshooting](#troubleshooting)

---

## 🏁 Getting Started

### Prerequisites
- Node.js 18+ or Deno 1.40+
- PostgreSQL 14+ (or use Base44 managed database)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/flashfusion.git
cd flashfusion

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and database URL

# Run development server
npm run dev
```

### Environment Variables

```env
# Required
BASE44_APP_ID=your_app_id
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional (for specific features)
REPLICATE_API_KEY=r8_...
VERTEX_API_KEY=...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
POSTGRES_URL=postgresql://...
```

### Quick Start

1. **Sign Up:** Navigate to `/` and click "Get Started Free"
2. **Explore Marketplace:** Browse 50+ apps at `/Marketplace`
3. **Create Your First Prompt:** Go to Prompt Studio → Editor
4. **Set Up CI/CD:** Navigate to CI/CD Automation → New Pipeline

---

## 🏗️ Architecture

### High-Level Overview

```
┌────────────────────────────────────────────────────────────┐
│                    Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Pages      │  │  Components  │  │   Hooks      │    │
│  │  /Home       │  │  /ui         │  │  useAuth     │    │
│  │  /Dashboard  │  │  /atoms      │  │  useEntity   │    │
│  │  /Marketplace│  │  /molecules  │  │  useQuery    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└───────────────────────┬────────────────────────────────────┘
                        │ Base44 SDK
┌───────────────────────▼────────────────────────────────────┐
│                Base44 Backend (BaaS)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Entities   │  │  Functions   │  │ Integrations │    │
│  │  (Database)  │  │ (Serverless) │  │ (APIs)       │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
flashfusion/
├── pages/                    # Route components (flat, no nesting)
│   ├── Home.js              # Landing page
│   ├── Dashboard.js         # User dashboard
│   ├── Marketplace.js       # App marketplace
│   ├── PromptStudio.js      # Prompt engineering
│   └── ...
├── components/              # Reusable components (can nest)
│   ├── ui/                  # shadcn/ui components
│   ├── atoms/               # Atomic components
│   ├── molecules/           # Composed components
│   ├── hooks/               # Custom React hooks
│   └── ...
├── entities/                # Database schemas (JSON)
│   ├── AppListing.json
│   ├── PromptTemplate.json
│   └── ...
├── functions/               # Backend serverless functions (Deno)
│   ├── promoteABTestWinner.js
│   ├── deployABTest.js
│   └── ...
├── agents/                  # AI agent configurations (JSON)
│   ├── Copilot.json
│   └── ...
├── Layout.js                # Global layout wrapper
└── globals.css             # Global styles
```

---

## 🛠️ Development

### Running Locally

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Production build
npm run preview      # Preview production build
```

### Code Style

We use:
- **ESLint** for linting
- **Prettier** for formatting
- **Tailwind CSS** for styling
- **TypeScript** annotations in JSDoc

### Creating New Pages

```javascript
// pages/NewPage.js
import React from "react";

export default function NewPage() {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-4xl font-bold">New Page</h1>
    </div>
  );
}
```

**CRITICAL:** Pages must be flat (no subfolders). Components can be nested.

### Creating New Entities

```json
// entities/MyEntity.json
{
  "name": "MyEntity",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Entity title"
    },
    "status": {
      "type": "string",
      "enum": ["draft", "published"],
      "default": "draft"
    }
  },
  "required": ["title"]
}
```

### Creating Backend Functions

```javascript
// functions/myFunction.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data } = await req.json();
    
    // Your logic here
    
    return Response.json({ success: true, result: data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

---

## 🚢 Deployment

### Production Deployment

FlashFusion automatically deploys via Base44 platform:

1. Push to `main` branch
2. Automatic build triggers
3. Edge deployment globally
4. Zero-downtime rollout

### Manual Deployment

```bash
# Build production bundle
npm run build

# Deploy to Base44
base44 deploy

# Check deployment status
base44 status
```

### Environment Configuration

Production environments require:
- All API keys set in Base44 dashboard → Settings → Secrets
- Database migrations applied
- CDN configured for static assets

---

## 🧪 Testing

### Running Tests

```bash
npm run test          # Run all tests
npm run test:unit     # Unit tests only
npm run test:e2e      # E2E tests only
npm run test:coverage # Generate coverage report
```

### Test Structure

```javascript
// components/ui/button.test.jsx
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText('Delete');
    expect(button).toHaveClass('bg-destructive');
  });
});
```

### Coverage Goals
- **Unit Tests:** 90%+ coverage
- **Integration Tests:** Core workflows covered
- **E2E Tests:** Critical user journeys validated

---

## 📚 API Reference

### Base44 SDK

#### Authentication
```javascript
import { base44 } from '@/api/base44Client';

// Get current user
const user = await base44.auth.me();

// Update current user
await base44.auth.updateMe({ full_name: "John Doe" });

// Logout
base44.auth.logout();

// Redirect to login
base44.auth.redirectToLogin();
```

#### Entities (Database)
```javascript
// List entities
const items = await base44.entities.AppListing.list('-created_date', 20);

// Filter entities
const active = await base44.entities.AppListing.filter(
  { status: 'active', category: 'ai_tools' },
  '-rating',
  50
);

// Create entity
const newApp = await base44.entities.AppListing.create({
  name: "My App",
  slug: "my-app",
  description: "App description",
  category: "ai_tools"
});

// Update entity
await base44.entities.AppListing.update(appId, { rating: 4.8 });

// Delete entity
await base44.entities.AppListing.delete(appId);

// Real-time subscriptions
const unsubscribe = base44.entities.AppListing.subscribe((event) => {
  console.log(`App ${event.id} was ${event.type}d`);
});
```

#### Functions
```javascript
// Invoke backend function
const result = await base44.functions.invoke('myFunction', {
  param1: "value1",
  param2: "value2"
});
```

#### Integrations
```javascript
// Call integration
const response = await base44.integrations.Core.InvokeLLM({
  prompt: "Generate product description",
  response_json_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      description: { type: "string" }
    }
  }
});
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

### Quick Contribution Flow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes following code style
4. Add tests for new functionality
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open Pull Request

### Code Review Standards
- ✅ All tests passing
- ✅ No linting errors
- ✅ Documentation updated
- ✅ Accessibility maintained (WCAG 2.2 AA)
- ✅ Performance benchmarks met

---

## 🐛 Troubleshooting

### Common Issues

**Problem:** "Unauthorized" errors when calling APIs  
**Solution:** Ensure `base44.auth.me()` is called and user is logged in

**Problem:** Entity not found  
**Solution:** Check entity name matches exactly (case-sensitive)

**Problem:** Function deployment fails  
**Solution:** Verify all imports use `npm:` or `jsr:` prefixes with versions

**Problem:** PWA not installing  
**Solution:** Must be served over HTTPS, check manifest.json and service worker

### Debug Mode

```javascript
// Enable verbose logging
localStorage.setItem('debug', 'base44:*');

// Check service worker status
navigator.serviceWorker.getRegistrations().then(console.log);

// Inspect React Query cache
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();
console.log(queryClient.getQueryCache());
```

---

## 📊 Performance

### Lighthouse Scores (Target)
- **Performance:** 95+
- **Accessibility:** 100
- **Best Practices:** 100
- **SEO:** 95+

### Optimization Techniques
- ✅ Code splitting (React.lazy)
- ✅ Image optimization (lazy loading, WebP)
- ✅ Service worker caching
- ✅ TanStack Query for request deduplication
- ✅ Memoization (React.memo, useMemo)
- ✅ Virtual scrolling for large lists

---

## 🔒 Security

### Implemented Measures
- ✅ JWT authentication with refresh tokens
- ✅ CORS configured for allowed origins
- ✅ Input sanitization on all forms
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (React escapes by default)
- ✅ HTTPS enforced in production
- ✅ Secrets managed via Base44 vault

### Best Practices
- Never expose API keys in frontend
- Validate all user inputs server-side
- Use `base44.asServiceRole` only when necessary
- Audit logs for sensitive operations

---

## 📞 Support

- **Documentation:** [docs.flashfusion.ai](https://docs.flashfusion.ai)
- **Community:** [Discord](https://discord.gg/flashfusion)
- **Email:** support@flashfusion.ai
- **GitHub Issues:** [Report bugs](https://github.com/your-org/flashfusion/issues)

---

## 📜 License

MIT License - see [LICENSE](./LICENSE) for details

---

**Version:** 2.0.0  
**Last Updated:** January 15, 2026  
**Status:** Production Ready ✅