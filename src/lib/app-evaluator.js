/**
 * Application Evaluator - Principal-level architecture and quality assessment
 * Grades applications against CURRENT (2024-2026) best practices
 */

/**
 * Evaluation criteria with scoring methodology
 */
export const EVALUATION_CRITERIA = {
  ARCHITECTURE: 'Architecture & Modularity',
  STATE_MANAGEMENT: 'State Management & Data Flow',
  PERFORMANCE: 'Performance (TTFB, LCP, memory, bundle size)',
  SECURITY: 'Security & Privacy',
  UX_ACCESSIBILITY: 'UX & Accessibility (WCAG 2.2)',
  OFFLINE_RESILIENCE: 'Offline / Resilience / Error Handling',
  SCALABILITY: 'Scalability & Maintainability',
  DEVELOPER_EXPERIENCE: 'Developer Experience (DX)',
  OBSERVABILITY: 'Observability & Debuggability',
  PRODUCT_CLARITY: 'Product Clarity & User Value'
};

/**
 * Grade mapping based on total score
 */
const GRADE_SCALE = {
  A: { min: 90, max: 100, label: 'Excellent - Production Grade' },
  B: { min: 80, max: 89, label: 'Good - Minor Improvements Needed' },
  C: { min: 70, max: 79, label: 'Acceptable - Significant Gaps' },
  D: { min: 60, max: 69, label: 'Poor - Major Refactoring Required' },
  F: { min: 0, max: 59, label: 'Failing - Complete Rebuild Recommended' }
};

/**
 * Calculate overall grade from scores
 */
function calculateGrade(scores) {
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const average = total / Object.keys(scores).length;
  
  for (const [grade, range] of Object.entries(GRADE_SCALE)) {
    if (average >= range.min && average <= range.max) {
      return { grade, average: average.toFixed(1), label: range.label };
    }
  }
  return { grade: 'F', average: average.toFixed(1), label: GRADE_SCALE.F.label };
}

/**
 * Convert camelCase to SCREAMING_SNAKE_CASE for EVALUATION_CRITERIA lookup
 */
function getCriteriaKey(camelCaseKey) {
  return camelCaseKey
    .replace(/([A-Z])/g, '_$1')
    .toUpperCase()
    .replace(/^_/, '');
}

/**
 * Evaluate application architecture and modularity
 */
export function evaluateArchitecture(appContext) {
  const findings = {
    score: 0,
    issues: [],
    strengths: [],
    symptoms: []
  };

  // Check for modern architecture patterns
  if (appContext.hasLayeredArchitecture) {
    findings.score += 3;
    findings.strengths.push('Clear layer separation (Client, Core, Data)');
  } else {
    findings.issues.push('No clear architectural layers - spaghetti code risk');
    findings.symptoms.push('Developers struggle to find where to add features');
  }

  // Check modularity
  if (appContext.hasModularComponents) {
    findings.score += 2;
    findings.strengths.push('Modular component organization');
  } else {
    findings.issues.push('Components tightly coupled, hard to reuse');
    findings.symptoms.push('Copy-pasting code instead of reusing');
  }

  // Check for dependency injection
  if (appContext.usesDependencyInjection) {
    findings.score += 2;
    findings.strengths.push('Dependency injection for testability');
  } else {
    findings.issues.push('Hard-coded dependencies make testing difficult');
    findings.symptoms.push('Cannot mock services in tests');
  }

  // Check for plugin architecture
  if (appContext.hasPluginArchitecture) {
    findings.score += 2;
    findings.strengths.push('Extensible plugin architecture');
  } else {
    findings.issues.push('No extensibility mechanism for third-party features');
  }

  // Check for circular dependencies
  if (appContext.hasCircularDependencies) {
    findings.score -= 1;
    findings.issues.push('Circular dependencies between modules');
    findings.symptoms.push('Build errors, unexpected initialization order');
  }

  findings.score = Math.max(0, Math.min(10, findings.score));
  return findings;
}

/**
 * Evaluate state management and data flow
 */
export function evaluateStateManagement(appContext) {
  const findings = {
    score: 0,
    issues: [],
    strengths: [],
    symptoms: []
  };

  // Check for modern state management
  if (appContext.stateManagement === 'tanstack-query' || appContext.stateManagement === 'redux-toolkit') {
    findings.score += 3;
    findings.strengths.push(`Modern state management with ${appContext.stateManagement}`);
  } else if (appContext.stateManagement === 'context-only') {
    findings.score += 1;
    findings.issues.push('Context API alone causes unnecessary re-renders');
    findings.symptoms.push('UI freezes when typing in forms');
  } else {
    findings.issues.push('No clear state management pattern');
    findings.symptoms.push('Props drilling 5+ levels deep');
  }

  // Check for server state management
  if (appContext.hasServerStateManagement) {
    findings.score += 2;
    findings.strengths.push('Separate server state management (caching, invalidation)');
  } else {
    findings.issues.push('Server data mixed with client state');
    findings.symptoms.push('Stale data after mutations, manual refetch everywhere');
  }

  // Check for optimistic updates
  if (appContext.hasOptimisticUpdates) {
    findings.score += 2;
    findings.strengths.push('Optimistic updates for better UX');
  }

  // Check for data normalization
  if (appContext.hasDataNormalization) {
    findings.score += 2;
    findings.strengths.push('Normalized data structure prevents duplication');
  } else {
    findings.issues.push('Denormalized data leads to inconsistencies');
    findings.symptoms.push('Same entity shows different values in different views');
  }

  // Check for immutability
  if (appContext.usesImmutability) {
    findings.score += 1;
    findings.strengths.push('Immutable state updates');
  } else {
    findings.issues.push('Direct state mutations cause bugs');
    findings.symptoms.push('State changes don\'t trigger re-renders');
  }

  findings.score = Math.max(0, Math.min(10, findings.score));
  return findings;
}

/**
 * Evaluate performance metrics
 */
export function evaluatePerformance(appContext) {
  const findings = {
    score: 0,
    issues: [],
    strengths: [],
    symptoms: []
  };

  // TTFB (Time to First Byte)
  if (appContext.ttfb && appContext.ttfb < 200) {
    findings.score += 2;
    findings.strengths.push(`Excellent TTFB: ${appContext.ttfb}ms`);
  } else if (appContext.ttfb && appContext.ttfb > 600) {
    findings.issues.push(`Poor TTFB: ${appContext.ttfb}ms (target: <200ms)`);
    findings.symptoms.push('Users see blank screen for seconds');
  }

  // LCP (Largest Contentful Paint)
  if (appContext.lcp && appContext.lcp < 2500) {
    findings.score += 2;
    findings.strengths.push(`Good LCP: ${appContext.lcp}ms`);
  } else if (appContext.lcp && appContext.lcp > 4000) {
    findings.issues.push(`Poor LCP: ${appContext.lcp}ms (target: <2.5s)`);
    findings.symptoms.push('Users abandon before content loads');
  }

  // Bundle size
  if (appContext.bundleSize && appContext.bundleSize < 200) {
    findings.score += 2;
    findings.strengths.push(`Optimal bundle size: ${appContext.bundleSize}KB`);
  } else if (appContext.bundleSize && appContext.bundleSize > 500) {
    findings.issues.push(`Bloated bundle: ${appContext.bundleSize}KB (target: <200KB)`);
    findings.symptoms.push('Slow initial load on mobile networks');
  }

  // Code splitting
  if (appContext.hasCodeSplitting) {
    findings.score += 2;
    findings.strengths.push('Route-based code splitting implemented');
  } else {
    findings.issues.push('No code splitting - loading entire app upfront');
    findings.symptoms.push('5+ second load time');
  }

  // Image optimization
  if (appContext.hasImageOptimization) {
    findings.score += 1;
    findings.strengths.push('Optimized images (WebP, lazy loading)');
  } else {
    findings.issues.push('Unoptimized images slow page load');
  }

  // Memoization
  if (appContext.usesMemoization) {
    findings.score += 1;
    findings.strengths.push('React.memo and useMemo used appropriately');
  } else {
    findings.issues.push('Unnecessary re-renders due to missing memoization');
  }

  findings.score = Math.max(0, Math.min(10, findings.score));
  return findings;
}

/**
 * Evaluate security and privacy
 */
export function evaluateSecurity(appContext) {
  const findings = {
    score: 0,
    issues: [],
    strengths: [],
    symptoms: []
  };

  // XSS Prevention
  if (appContext.hasXSSPrevention) {
    findings.score += 2;
    findings.strengths.push('Input sanitization prevents XSS attacks');
  } else {
    findings.score -= 2;
    findings.issues.push('NO XSS PREVENTION - Critical vulnerability');
    findings.symptoms.push('Attackers can inject malicious scripts');
  }

  // CSRF Protection
  if (appContext.hasCSRFProtection) {
    findings.score += 1;
    findings.strengths.push('CSRF tokens on state-changing operations');
  } else {
    findings.issues.push('Missing CSRF protection');
    findings.symptoms.push('Vulnerable to cross-site request forgery');
  }

  // Authentication
  if (appContext.authMethod === 'jwt' || appContext.authMethod === 'oauth2') {
    findings.score += 2;
    findings.strengths.push(`Modern authentication: ${appContext.authMethod}`);
  } else if (appContext.authMethod && appContext.authMethod.includes('sdk')) {
    findings.score += 2;
    findings.strengths.push(`SDK-based authentication: ${appContext.authMethod}`);
  } else if (appContext.authMethod === 'session') {
    findings.score += 1;
    findings.issues.push('Session-based auth limits scalability');
  } else {
    findings.issues.push('No authentication mechanism');
  }

  // Authorization (RBAC)
  if (appContext.hasRBAC) {
    findings.score += 2;
    findings.strengths.push('Role-based access control implemented');
  } else {
    findings.issues.push('No authorization - all users have same permissions');
  }

  // Secrets Management
  if (appContext.hasSecretsVault) {
    findings.score += 1;
    findings.strengths.push('Encrypted secrets vault');
  } else {
    findings.issues.push('Secrets in environment variables or code');
    findings.symptoms.push('API keys leaked in git history');
  }

  // HTTPS
  if (appContext.usesHTTPS) {
    findings.score += 1;
    findings.strengths.push('HTTPS enforced');
  } else {
    findings.issues.push('Plaintext HTTP - data interceptable');
  }

  // CORS Configuration
  if (appContext.corsConfig === 'restricted') {
    findings.score += 1;
    findings.strengths.push('CORS restricted to known domains');
  } else if (appContext.corsConfig === 'wildcard') {
    findings.issues.push('CORS allows all origins (*) - security risk');
    findings.symptoms.push('Any website can make API requests');
  }

  findings.score = Math.max(0, Math.min(10, findings.score));
  return findings;
}

/**
 * Evaluate UX and accessibility
 */
export function evaluateUXAccessibility(appContext) {
  const findings = {
    score: 0,
    issues: [],
    strengths: [],
    symptoms: []
  };

  // WCAG Compliance
  if (appContext.wcagLevel === '2.2-AAA') {
    findings.score += 3;
    findings.strengths.push('WCAG 2.2 AAA compliant');
  } else if (appContext.wcagLevel === '2.2-AA' || appContext.wcagLevel === '2.1-AA') {
    findings.score += 2;
    findings.strengths.push(`${appContext.wcagLevel} compliant`);
  } else {
    findings.issues.push('No accessibility compliance');
    findings.symptoms.push('Screen readers cannot navigate, keyboard users stuck');
  }

  // Keyboard Navigation
  if (appContext.hasKeyboardNav) {
    findings.score += 2;
    findings.strengths.push('Full keyboard navigation support');
  } else {
    findings.issues.push('Mouse-only interface excludes keyboard users');
  }

  // ARIA Labels
  if (appContext.hasARIALabels) {
    findings.score += 1;
    findings.strengths.push('Proper ARIA labels and roles');
  }

  // Color Contrast
  if (appContext.hasGoodContrast) {
    findings.score += 1;
    findings.strengths.push('Sufficient color contrast ratios');
  } else {
    findings.issues.push('Poor contrast makes text hard to read');
  }

  // Mobile Responsive
  if (appContext.isMobileResponsive) {
    findings.score += 2;
    findings.strengths.push('Mobile-responsive design');
  } else {
    findings.issues.push('Not mobile-friendly');
    findings.symptoms.push('60% of users on mobile see broken layout');
  }

  // Loading States
  if (appContext.hasLoadingStates) {
    findings.score += 1;
    findings.strengths.push('Clear loading and skeleton states');
  } else {
    findings.issues.push('No loading feedback - users think app is frozen');
  }

  findings.score = Math.max(0, Math.min(10, findings.score));
  return findings;
}

/**
 * Evaluate offline capabilities and error handling
 */
export function evaluateOfflineResilience(appContext) {
  const findings = {
    score: 0,
    issues: [],
    strengths: [],
    symptoms: []
  };

  // Service Worker
  if (appContext.hasServiceWorker) {
    findings.score += 3;
    findings.strengths.push('Service worker for offline support');
  } else {
    findings.issues.push('No offline capability - app breaks without internet');
    findings.symptoms.push('White screen when connection drops');
  }

  // Error Boundaries
  if (appContext.hasErrorBoundaries) {
    findings.score += 2;
    findings.strengths.push('React error boundaries catch crashes');
  } else {
    findings.issues.push('Uncaught errors crash entire app');
    findings.symptoms.push('Blank page after a component error');
  }

  // Retry Logic
  if (appContext.hasRetryLogic) {
    findings.score += 2;
    findings.strengths.push('Automatic retry for failed requests');
  } else {
    findings.issues.push('Network failures require manual refresh');
  }

  // Error Monitoring
  if (appContext.hasErrorMonitoring) {
    findings.score += 2;
    findings.strengths.push('Centralized error tracking (Sentry/etc)');
  } else {
    findings.issues.push('No visibility into production errors');
    findings.symptoms.push('Users report bugs you cannot reproduce');
  }

  // Graceful Degradation
  if (appContext.hasGracefulDegradation) {
    findings.score += 1;
    findings.strengths.push('Features degrade gracefully when unavailable');
  }

  findings.score = Math.max(0, Math.min(10, findings.score));
  return findings;
}

/**
 * Evaluate scalability and maintainability
 */
export function evaluateScalability(appContext) {
  const findings = {
    score: 0,
    issues: [],
    strengths: [],
    symptoms: []
  };

  // TypeScript
  if (appContext.usesTypeScript === 'full') {
    findings.score += 3;
    findings.strengths.push('Full TypeScript for type safety');
  } else if (appContext.usesTypeScript === 'partial') {
    findings.score += 1;
    findings.issues.push('Partial TypeScript - inconsistent type safety');
  } else {
    findings.issues.push('No TypeScript - refactoring is dangerous');
    findings.symptoms.push('Breaking changes discovered in production');
  }

  // Testing
  if (appContext.testCoverage >= 80) {
    findings.score += 3;
    findings.strengths.push(`Excellent test coverage: ${appContext.testCoverage}%`);
  } else if (appContext.testCoverage >= 40) {
    findings.score += 1;
    findings.issues.push(`Low test coverage: ${appContext.testCoverage}%`);
  } else {
    findings.issues.push(`Critical: only ${appContext.testCoverage}% test coverage`);
    findings.symptoms.push('Every deploy breaks something');
  }

  // Linting
  if (appContext.hasLinting) {
    findings.score += 1;
    findings.strengths.push('ESLint enforces code quality');
  }

  // Code Review Process
  if (appContext.hasCodeReview) {
    findings.score += 1;
    findings.strengths.push('Required code reviews');
  }

  // Documentation
  if (appContext.documentationQuality === 'excellent') {
    findings.score += 2;
    findings.strengths.push('Comprehensive documentation');
  } else if (appContext.documentationQuality === 'good') {
    findings.score += 1;
  } else {
    findings.issues.push('Poor documentation slows onboarding');
    findings.symptoms.push('New devs take 2+ weeks to contribute');
  }

  findings.score = Math.max(0, Math.min(10, findings.score));
  return findings;
}

/**
 * Evaluate developer experience
 */
export function evaluateDeveloperExperience(appContext) {
  const findings = {
    score: 0,
    issues: [],
    strengths: [],
    symptoms: []
  };

  // Fast Build Times
  if (appContext.buildTool === 'vite' || appContext.buildTool === 'turbopack') {
    findings.score += 2;
    findings.strengths.push(`Modern build tool: ${appContext.buildTool}`);
  } else if (appContext.buildTool === 'webpack') {
    findings.score += 1;
    findings.issues.push('Webpack slower than Vite/Turbopack');
  }

  // HMR (Hot Module Replacement)
  if (appContext.hasHMR) {
    findings.score += 2;
    findings.strengths.push('Fast HMR for instant feedback');
  } else {
    findings.issues.push('No HMR - full reload on every change');
    findings.symptoms.push('10+ second feedback loop kills productivity');
  }

  // Dev Tools
  if (appContext.hasDevTools) {
    findings.score += 2;
    findings.strengths.push('React DevTools, debugging support');
  }

  // CI/CD Pipeline
  if (appContext.hasCICD) {
    findings.score += 2;
    findings.strengths.push('Automated CI/CD pipeline');
  } else {
    findings.issues.push('Manual deployments are error-prone');
    findings.symptoms.push('Broken production deploys');
  }

  // Local Development Setup
  if (appContext.easySetup) {
    findings.score += 1;
    findings.strengths.push('Simple local setup (npm install && npm run dev)');
  } else {
    findings.issues.push('Complex setup with many manual steps');
  }

  // Environment Management
  if (appContext.hasEnvManagement) {
    findings.score += 1;
    findings.strengths.push('Clear environment configuration');
  }

  findings.score = Math.max(0, Math.min(10, findings.score));
  return findings;
}

/**
 * Evaluate observability and debuggability
 */
export function evaluateObservability(appContext) {
  const findings = {
    score: 0,
    issues: [],
    strengths: [],
    symptoms: []
  };

  // Logging
  if (appContext.loggingLevel === 'structured') {
    findings.score += 3;
    findings.strengths.push('Structured logging with context');
  } else if (appContext.loggingLevel === 'basic') {
    findings.score += 1;
    findings.issues.push('Basic console.log makes debugging hard');
  }

  // APM (Application Performance Monitoring)
  if (appContext.hasAPM) {
    findings.score += 2;
    findings.strengths.push('APM tracks performance in production');
  } else {
    findings.issues.push('No performance visibility');
    findings.symptoms.push('Cannot diagnose slow API calls');
  }

  // Error Tracking
  if (appContext.hasErrorTracking) {
    findings.score += 2;
    findings.strengths.push('Error tracking with stack traces');
  }

  // Analytics
  if (appContext.hasAnalytics) {
    findings.score += 1;
    findings.strengths.push('User analytics for product decisions');
  }

  // Feature Flags
  if (appContext.hasFeatureFlags) {
    findings.score += 2;
    findings.strengths.push('Feature flags for safe rollouts');
  } else {
    findings.issues.push('Cannot control feature rollout');
  }

  findings.score = Math.max(0, Math.min(10, findings.score));
  return findings;
}

/**
 * Evaluate product clarity and user value
 */
export function evaluateProductClarity(appContext) {
  const findings = {
    score: 0,
    issues: [],
    strengths: [],
    symptoms: []
  };

  // Clear Value Proposition
  if (appContext.hasClearValue) {
    findings.score += 3;
    findings.strengths.push('Clear value proposition');
  } else {
    findings.issues.push('Users don\'t understand what problem this solves');
    findings.symptoms.push('High bounce rate, no repeat users');
  }

  // User Onboarding
  if (appContext.hasOnboarding) {
    findings.score += 2;
    findings.strengths.push('Smooth onboarding experience');
  } else {
    findings.issues.push('No onboarding - users lost immediately');
  }

  // Feature Discovery
  if (appContext.hasFeatureDiscovery) {
    findings.score += 2;
    findings.strengths.push('Users can discover features naturally');
  }

  // Core User Journey
  if (appContext.hasClearUserJourney) {
    findings.score += 2;
    findings.strengths.push('Core user journey is smooth');
  } else {
    findings.issues.push('Users cannot complete core tasks');
    findings.symptoms.push('90% drop-off before conversion');
  }

  // Feedback Loops
  if (appContext.hasFeedbackLoops) {
    findings.score += 1;
    findings.strengths.push('User feedback mechanisms');
  }

  findings.score = Math.max(0, Math.min(10, findings.score));
  return findings;
}

/**
 * Generate modern reconstruction recommendations
 */
export function generateReconstructionPlan(scores, appContext) {
  const recommendations = {
    architecture: {
      recommended: 'React 18+ with Vite, layered architecture (UI → Services → API → Data)',
      frontend: [
        'Use React Server Components for data fetching',
        'Implement feature-based folder structure',
        'Use barrel exports for clean imports',
        'Separate business logic from UI components'
      ],
      backend: [
        'Edge functions for low latency (Vercel, Cloudflare)',
        'API Gateway with rate limiting',
        'Database connection pooling (PgBouncer)',
        'Redis for caching and sessions'
      ],
      state: [
        'TanStack Query for server state',
        'Zustand or Jotai for client state',
        'Context only for theme/auth',
        'Optimistic updates for all mutations'
      ],
      caching: [
        'HTTP caching headers',
        'Service Worker with Workbox',
        'CDN for static assets (Cloudflare)',
        'Stale-while-revalidate pattern'
      ],
      auth: [
        'NextAuth.js or Clerk for auth',
        'JWT tokens with refresh',
        'RBAC with permission middleware',
        'OAuth2 for social login'
      ],
      deployment: [
        'Vercel for frontend (auto-preview)',
        'GitHub Actions for CI/CD',
        'Automated testing on PR',
        'Staging → Production promotion'
      ]
    },
    featureLevel: {
      keep: [],
      refactor: [],
      remove: [],
      add: []
    },
    risks: [
      'Migration downtime if not planned carefully',
      'Learning curve for new patterns',
      'Breaking changes require user communication',
      'Increased infrastructure costs'
    ],
    tradeoffs: [
      'More complexity for better scalability',
      'Upfront investment for long-term maintainability',
      'May be over-engineered for small projects'
    ]
  };

  // Determine what to keep/refactor/remove based on scores
  if (scores.architecture.score >= 7) {
    recommendations.featureLevel.keep.push('Current architecture structure');
  } else {
    recommendations.featureLevel.refactor.push('Restructure to layered architecture');
  }

  if (scores.stateManagement.score < 6) {
    recommendations.featureLevel.refactor.push('Replace state management with TanStack Query + Zustand');
  }

  if (scores.performance.score < 6) {
    recommendations.featureLevel.refactor.push('Implement code splitting and lazy loading');
    recommendations.featureLevel.add.push('Bundle analyzer and performance monitoring');
  }

  if (scores.security.score < 7) {
    recommendations.featureLevel.refactor.push('Add comprehensive security measures (XSS, CSRF, CORS)');
  }

  if (scores.uxAccessibility.score < 7) {
    recommendations.featureLevel.refactor.push('Implement WCAG 2.2 AA compliance');
    recommendations.featureLevel.add.push('Keyboard navigation and screen reader support');
  }

  if (scores.offlineResilience.score < 6) {
    recommendations.featureLevel.add.push('Service Worker with offline support');
    recommendations.featureLevel.add.push('Error boundaries and retry logic');
  }

  if (scores.scalability.score < 7) {
    recommendations.featureLevel.refactor.push('Migrate to TypeScript');
    recommendations.featureLevel.add.push('Comprehensive test suite (target 80% coverage)');
  }

  if (scores.observability.score < 6) {
    recommendations.featureLevel.add.push('Error tracking (Sentry)');
    recommendations.featureLevel.add.push('Performance monitoring (Vercel Analytics)');
  }

  return recommendations;
}

/**
 * Generate reconstruction prompt for LLM
 */
export function generateReconstructionPrompt(appContext, scores, reconstruction) {
  return `# Production-Grade Application Reconstruction

## Context
You are rebuilding an existing ${appContext.appType || 'web'} application from scratch using 2024-2026 best practices.

**Original Application:**
- Type: ${appContext.appType || 'Unknown'}
- Primary Users: ${appContext.primaryUsers || 'Not specified'}
- Core Use Cases: ${appContext.coreUseCases || 'Not specified'}
- Current Tech Stack: ${appContext.techStack || 'Not specified'}
- Deployment Target: ${appContext.deploymentTarget || 'Not specified'}

**Current Weaknesses (Based on Audit):**
${Object.entries(scores)
  .filter(([_, data]) => data.score < 7)
  .map(([key, data]) => `- ${EVALUATION_CRITERIA[getCriteriaKey(key)]}: ${data.score}/10
  ${data.issues.map(issue => `  • ${issue}`).join('\n')}`)
  .join('\n')}

## Requirements

### Architecture
- Use layered architecture: UI → Services → API → Data
- Implement feature-based folder structure
- Keep components under 200 lines
- Use dependency injection for testability

### Technology Stack
- **Frontend:** React 18+ with Vite
- **State:** TanStack Query (server) + Zustand (client)
- **Styling:** Tailwind CSS with design system
- **Testing:** Vitest + React Testing Library + Playwright
- **Type Safety:** TypeScript (strict mode)
- **Backend:** Edge functions (Vercel/Cloudflare)
- **Database:** PostgreSQL with Prisma ORM
- **Caching:** Redis + CDN

### Performance Requirements
- TTFB < 200ms
- LCP < 2.5s
- Bundle size < 200KB (initial)
- 90+ Lighthouse score

### Security Requirements
- XSS prevention (DOMPurify)
- CSRF protection
- JWT authentication with refresh
- RBAC with permissions
- Restrict CORS to known origins
- Content Security Policy
- Rate limiting (5 req/60s)

### Accessibility Requirements
- WCAG 2.2 AA minimum
- Full keyboard navigation
- Screen reader support
- Proper ARIA labels
- 4.5:1 color contrast

### Observability
- Structured logging
- Error tracking (Sentry)
- Performance monitoring
- Feature flags
- User analytics

### Developer Experience
- npm install && npm run dev (simple setup)
- Hot module replacement
- Automated CI/CD with GitHub Actions
- Pre-commit hooks (lint, typecheck, test)

## Implementation Guidelines

1. **Start with Architecture**
   - Set up monorepo if needed
   - Define layer boundaries
   - Create shared types and utilities

2. **Build Core Infrastructure**
   - Auth system
   - API client with retry/cache
   - Error handling
   - Logging system

3. **Implement Features**
   - Start with core user journey
   - Add tests alongside code (TDD)
   - Document APIs and components

4. **Optimize & Polish**
   - Code splitting
   - Image optimization
   - Performance profiling
   - Accessibility audit

5. **Deploy & Monitor**
   - Set up CI/CD
   - Configure monitoring
   - Enable feature flags
   - Document runbooks

## Success Criteria
${Object.entries(EVALUATION_CRITERIA).map(([key, label]) => 
  `- ${label}: 9+/10`
).join('\n')}

## Out of Scope
${appContext.nonGoals?.map(goal => `- ${goal}`).join('\n') || '- Not specified'}

## Deliverables
1. Production-ready codebase
2. Comprehensive test suite (80%+ coverage)
3. CI/CD pipeline configuration
4. Documentation (README, API docs, architecture)
5. Deployment scripts and infrastructure-as-code

Begin by setting up the project structure and core architecture.`;
}

/**
 * Main evaluation function
 */
export function evaluateApplication(appContext) {
  // Perform all evaluations
  const scores = {
    architecture: evaluateArchitecture(appContext),
    stateManagement: evaluateStateManagement(appContext),
    performance: evaluatePerformance(appContext),
    security: evaluateSecurity(appContext),
    uxAccessibility: evaluateUXAccessibility(appContext),
    offlineResilience: evaluateOfflineResilience(appContext),
    scalability: evaluateScalability(appContext),
    developerExperience: evaluateDeveloperExperience(appContext),
    observability: evaluateObservability(appContext),
    productClarity: evaluateProductClarity(appContext)
  };

  // Calculate overall grade
  const scoreMap = Object.fromEntries(
    Object.entries(scores).map(([key, data]) => [key, data.score])
  );
  const gradeInfo = calculateGrade(scoreMap);

  // Generate reconstruction plan
  const reconstruction = generateReconstructionPlan(scores, appContext);

  // Generate reconstruction prompt
  const reconstructionPrompt = generateReconstructionPrompt(appContext, scores, reconstruction);

  // Generate executive summary
  const totalIssues = Object.values(scores).reduce((sum, s) => sum + s.issues.length, 0);
  const criticalIssues = Object.values(scores).filter(s => s.score < 5).length;
  
  const executiveSummary = `
This ${appContext.appType || 'application'} scores ${gradeInfo.average}/10 (Grade ${gradeInfo.grade}: ${gradeInfo.label}). 
${criticalIssues > 0 ? `CRITICAL: ${criticalIssues} categories failing. ` : ''}
${totalIssues} total issues identified across ${Object.keys(scores).length} categories. 
${gradeInfo.grade === 'F' || gradeInfo.grade === 'D' ? 'Complete rebuild recommended using modern stack. ' : ''}
${gradeInfo.grade === 'C' ? 'Significant refactoring required before production. ' : ''}
${gradeInfo.grade === 'B' ? 'Minor improvements needed for production-readiness. ' : ''}
${gradeInfo.grade === 'A' ? 'Production-ready with minor polish needed. ' : ''}
Primary gaps: ${Object.entries(scores)
  .filter(([_, s]) => s.score < 6)
  .map(([key]) => EVALUATION_CRITERIA[getCriteriaKey(key)])
  .slice(0, 3)
  .join(', ') || 'None major'}.
  `.trim();

  return {
    grade: gradeInfo,
    executiveSummary,
    scores,
    reconstruction,
    reconstructionPrompt
  };
}

export default evaluateApplication;
