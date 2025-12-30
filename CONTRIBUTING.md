# Contributing to FlashFusion

Thank you for your interest in contributing to FlashFusion! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Community](#community)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** 18+ and npm 9+
- **Git** for version control
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A GitHub account
- Basic knowledge of React, TypeScript/JavaScript, and Tailwind CSS

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/fusion-ai.git
   cd fusion-ai
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Krosebrook/fusion-ai.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Verify the setup** by opening http://localhost:5173 in your browser

### Project Structure

```
fusion-ai/
├── src/
│   ├── pages/              # Page components (59 pages)
│   ├── components/         # Reusable components (47 directories)
│   ├── api/               # API client code
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── lib/               # Core libraries
│   └── docs/              # Additional documentation
├── functions/             # Backend functions (Deno)
├── public/                # Static assets
├── .github/               # GitHub configuration
└── Configuration files
```

## Development Workflow

### Branching Strategy

We use a feature branch workflow:

1. **main** - Production-ready code
2. **develop** - Integration branch for features (if exists)
3. **feature/** - Feature branches (e.g., `feature/add-new-integration`)
4. **bugfix/** - Bug fix branches (e.g., `bugfix/fix-login-issue`)
5. **hotfix/** - Urgent production fixes

### Creating a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create and checkout a new feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to your fork
git push origin feature/your-feature-name
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no logic change)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Build process or auxiliary tool changes
- `ci` - CI/CD changes

**Examples:**
```bash
feat(ai-studio): add code generation for Python
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
refactor(api): improve error handling in API client
test(pipeline): add unit tests for pipeline generator
```

## Coding Standards

### JavaScript/JSX Style Guide

- Use **ES6+** features
- Use **functional components** with hooks
- Follow existing code formatting (ESLint rules)
- Use **meaningful variable names**
- Keep functions **small and focused**
- Add **JSDoc comments** for complex functions

### TypeScript Style Guide

- Use **strict mode** when migrating to TypeScript
- Define **interfaces** for complex objects
- Use **type inference** where possible
- Avoid `any` type

### Component Guidelines

1. **Component Structure:**
   ```jsx
   // Imports
   import React from 'react';
   import { useHook } from '../hooks/useHook';
   
   // Component
   export default function ComponentName({ prop1, prop2 }) {
     // Hooks
     const [state, setState] = React.useState(null);
     
     // Effects
     React.useEffect(() => {
       // effect logic
     }, []);
     
     // Handlers
     const handleClick = () => {
       // handler logic
     };
     
     // Render
     return (
       <div>
         {/* JSX */}
       </div>
     );
   }
   ```

2. **Props:**
   - Destructure props in function parameters
   - Add PropTypes or TypeScript types
   - Provide default values for optional props

3. **State Management:**
   - Use local state for component-specific data
   - Use TanStack Query for server state
   - Keep state as close to where it's used as possible

4. **Styling:**
   - Use Tailwind CSS utility classes
   - Follow the cinema-grade design system
   - Use existing component libraries (Radix UI)
   - Maintain responsive design (mobile-first)

### Backend Function Guidelines

1. **Function Structure:**
   ```typescript
   import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
   
   Deno.serve(async (req) => {
     try {
       // Authentication
       const base44 = createClientFromRequest(req);
       const user = await base44.auth.me();
       
       if (!user) {
         return Response.json({ error: 'Unauthorized' }, { status: 401 });
       }
       
       // Input validation
       const data = await req.json();
       // ... validate data
       
       // Business logic
       // ... process request
       
       // Response
       return Response.json({ success: true, data });
     } catch (error) {
       console.error('Function error:', error);
       return Response.json({ error: error.message }, { status: 500 });
     }
   });
   ```

2. **Error Handling:**
   - Always use try-catch blocks
   - Return appropriate HTTP status codes
   - Log errors with context
   - Return user-friendly error messages

3. **Security:**
   - Always validate user authentication
   - Sanitize all inputs
   - Use parameterized queries
   - Never expose sensitive data in responses

### File Naming Conventions

- **Components:** PascalCase (e.g., `UserProfile.jsx`)
- **Utilities:** camelCase (e.g., `formatDate.js`)
- **Hooks:** camelCase with `use` prefix (e.g., `useAuth.js`)
- **Pages:** PascalCase (e.g., `Dashboard.jsx`)
- **Functions:** camelCase (e.g., `generatePipeline.ts`)

## Testing Guidelines

### Running Tests

```bash
# Run all tests (when testing infrastructure is added)
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Run E2E tests
npm test:e2e
```

### Writing Tests

1. **Unit Tests:**
   - Test individual functions and components
   - Mock external dependencies
   - Aim for >70% code coverage

2. **Integration Tests:**
   - Test component interactions
   - Test API integrations
   - Test user flows

3. **E2E Tests:**
   - Test critical user journeys
   - Test across different browsers
   - Test responsive behavior

### Test File Location

- Place test files next to the code they test
- Use `.test.jsx` or `.test.ts` extension
- Example: `Button.jsx` → `Button.test.jsx`

## Pull Request Process

### Before Submitting

1. **Update your branch** with the latest main:
   ```bash
   git checkout main
   git pull upstream main
   git checkout feature/your-feature
   git rebase main
   ```

2. **Run quality checks**:
   ```bash
   npm run lint        # Check for linting errors
   npm run lint:fix    # Auto-fix linting issues
   npm run typecheck   # Check TypeScript types
   npm run build       # Ensure build succeeds
   ```

3. **Test your changes**:
   - Manually test all affected features
   - Run automated tests (when available)
   - Test in different browsers
   - Test responsive behavior

### Submitting a Pull Request

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - **Clear title** following conventional commits format
   - **Description** of what changes were made and why
   - **Screenshots** or videos for UI changes
   - **Testing steps** for reviewers
   - **Related issue** links (e.g., "Closes #123")

3. **PR Template:**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Related Issues
   Closes #123
   
   ## Screenshots (if applicable)
   
   ## Testing Steps
   1. Step one
   2. Step two
   
   ## Checklist
   - [ ] Code follows project style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings generated
   - [ ] Tests added/updated
   - [ ] All tests pass
   - [ ] Build succeeds
   ```

### Review Process

1. **Automated Checks:**
   - Linting and formatting
   - Build verification
   - Test suite (when available)
   - Security scanning

2. **Code Review:**
   - At least one maintainer review required
   - Address all feedback
   - Request re-review after changes

3. **Merging:**
   - Squash and merge (preferred)
   - Keep commit history clean
   - Delete branch after merge

## Issue Guidelines

### Reporting Bugs

Use the bug report template and include:

- **Description:** Clear description of the bug
- **Steps to reproduce:** Detailed steps
- **Expected behavior:** What should happen
- **Actual behavior:** What actually happens
- **Environment:** Browser, OS, Node version
- **Screenshots:** If applicable
- **Logs:** Any relevant error messages

### Requesting Features

Use the feature request template and include:

- **Description:** Clear description of the feature
- **Use case:** Why this feature is needed
- **Proposed solution:** How it could work
- **Alternatives:** Other approaches considered
- **Additional context:** Any other relevant info

### Issue Labels

- `bug` - Something isn't working
- `feature` - New feature request
- `documentation` - Documentation improvements
- `enhancement` - Improvement to existing feature
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - High priority issue
- `security` - Security-related issue

## Community

### Getting Help

- **GitHub Discussions:** Ask questions and share ideas
- **GitHub Issues:** Report bugs and request features
- **Documentation:** Check existing docs first

### Recognition

Contributors are recognized in:
- GitHub contributors list
- Release notes
- Project documentation

Thank you for contributing to FlashFusion! 🚀

---

*Last Updated: 2025-12-30*
