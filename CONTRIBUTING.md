# Contributing to FlashFusion Platform

Thank you for your interest in contributing to FlashFusion! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We pledge to:

- Be respectful and inclusive in all interactions
- Welcome diverse perspectives and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Expected Behavior

- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Other conduct that could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 18+ installed
- npm 9+ installed
- Git installed
- A modern code editor (VS Code recommended)
- Basic knowledge of React, TypeScript, and Vite

### Finding Issues to Work On

1. Check the [Issues](https://github.com/Krosebrook/fusion-ai/issues) page
2. Look for issues labeled:
   - `good first issue` - Great for new contributors
   - `help wanted` - Community help needed
   - `bug` - Bug fixes needed
   - `enhancement` - New features or improvements
3. Comment on the issue to express interest before starting work
4. Wait for maintainer confirmation to avoid duplicate efforts

---

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/fusion-ai.git
cd fusion-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Lint code
npm run lint:fix   # Auto-fix lint issues
npm run typecheck  # Type checking (when TS migration complete)
```

---

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

1. **Bug Reports** - Report bugs via GitHub Issues
2. **Feature Requests** - Suggest new features via GitHub Issues
3. **Code Contributions** - Submit pull requests
4. **Documentation** - Improve docs, add examples
5. **Code Reviews** - Review other contributors' pull requests
6. **Testing** - Write tests, improve test coverage
7. **Design** - UI/UX improvements, design assets

### Reporting Bugs

When reporting bugs, please include:

1. **Clear Title** - Descriptive summary of the issue
2. **Description** - Detailed explanation of the problem
3. **Steps to Reproduce**
   - Step-by-step instructions
   - Expected behavior
   - Actual behavior
4. **Environment**
   - OS and version
   - Browser and version
   - Node.js version
   - npm version
5. **Screenshots/Logs** - If applicable
6. **Possible Solution** - If you have ideas

### Suggesting Features

When suggesting features, include:

1. **Problem Statement** - What problem does this solve?
2. **Proposed Solution** - How should it work?
3. **Alternatives** - Other solutions considered
4. **Use Cases** - Real-world scenarios
5. **Additional Context** - Mockups, examples, references

---

## Coding Standards

### JavaScript/JSX Style

We follow modern JavaScript best practices:

```javascript
// ✅ Good - Use const/let, arrow functions
const handleSubmit = async (data) => {
  const result = await processData(data);
  return result;
};

// ❌ Avoid - var, function keyword for simple functions
var handleSubmit = function(data) {
  // ...
};
```

### React Component Patterns

```jsx
// ✅ Good - Functional component with clear structure
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function MyComponent({ title, onAction }) {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Effect logic
  }, []);
  
  return (
    <div className="container">
      <h2>{title}</h2>
      <Button onClick={onAction}>Action</Button>
    </div>
  );
}

// ❌ Avoid - Class components (unless necessary)
class MyComponent extends React.Component {
  // ...
}
```

### File Organization

```
src/
├── pages/           # Page components (one per route)
├── components/      # Reusable components
│   ├── ui/          # UI primitives (buttons, inputs)
│   ├── atoms/       # Atomic design - smallest components
│   ├── molecules/   # Atomic design - combined atoms
│   └── feature/     # Feature-specific components
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── api/             # API client code
└── lib/             # Core libraries and helpers
```

### Naming Conventions

- **Components:** PascalCase - `MyComponent.jsx`
- **Utilities:** camelCase - `formatDate.js`
- **Hooks:** camelCase with 'use' prefix - `useAuth.js`
- **Constants:** UPPER_SNAKE_CASE - `API_BASE_URL`
- **CSS Classes:** kebab-case - `my-component-class`

### Code Quality

1. **No Console Logs** - Remove console.log in production code
2. **Handle Errors** - Always handle errors gracefully
3. **Avoid Magic Numbers** - Use named constants
4. **DRY Principle** - Don't Repeat Yourself
5. **Small Functions** - Keep functions focused and small (<50 lines)
6. **Comments** - Add comments for complex logic only

### Security Best Practices

```javascript
// ✅ Good - Sanitize user input
import { sanitizeInput } from '@/lib/security';

const handleInput = (userInput) => {
  const clean = sanitizeInput(userInput);
  // Use clean input
};

// ✅ Good - Validate data
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(0)
});

// ❌ Avoid - Direct use of user input in HTML
const unsafeHTML = `<div>${userInput}</div>`; // XSS risk!
```

---

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, no logic change)
- **refactor:** Code refactoring (no feature change or bug fix)
- **perf:** Performance improvements
- **test:** Adding or updating tests
- **chore:** Maintenance tasks, dependency updates
- **ci:** CI/CD changes
- **build:** Build system changes

### Examples

```bash
# Feature
feat(ai-studio): add support for Claude AI model

# Bug fix
fix(auth): resolve token expiration issue

# Documentation
docs(readme): update installation instructions

# Refactoring
refactor(api-client): simplify error handling logic

# Multiple paragraphs
feat(pipeline): add visual pipeline builder

Implements drag-and-drop interface for creating CI/CD pipelines.
Includes:
- Node library with 20+ pre-built actions
- Visual connection system
- YAML export functionality

Closes #123
```

### Commit Best Practices

1. **Atomic Commits** - One logical change per commit
2. **Clear Messages** - Explain what and why, not how
3. **Present Tense** - "add feature" not "added feature"
4. **Imperative Mood** - "fix bug" not "fixes bug"
5. **Reference Issues** - Use "Closes #123" or "Fixes #456"

---

## Pull Request Process

### Before Submitting

1. ✅ Code follows style guidelines
2. ✅ Self-review completed
3. ✅ Comments added for complex logic
4. ✅ Documentation updated (if needed)
5. ✅ No console.log or debug code
6. ✅ Tested locally
7. ✅ Lint passes (`npm run lint`)
8. ✅ Build succeeds (`npm run build`)

### PR Title Format

Follow the same format as commit messages:

```
feat(component): add new feature
fix(bug): resolve issue with XYZ
docs: update contributing guide
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests (when available)
- [ ] All tests pass

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated documentation
- [ ] My changes generate no new warnings
- [ ] I have checked for accessibility issues

## Related Issues
Closes #(issue number)
```

### Review Process

1. **Automated Checks** - Wait for CI/CD (when implemented)
2. **Code Review** - At least one maintainer approval required
3. **Changes Requested** - Address feedback promptly
4. **Approval** - Maintainer will merge when ready
5. **Celebration** - Your contribution is live! 🎉

### After Merge

- Your contribution will be included in the next release
- You'll be added to the contributors list
- Thank you for making FlashFusion better!

---

## Testing Guidelines

### Current State

⚠️ **Note:** Testing infrastructure is currently being implemented. Once complete, all contributions should include tests.

### Future Testing Requirements

When testing is available:

1. **Unit Tests** - Test individual functions and components
2. **Integration Tests** - Test feature workflows
3. **E2E Tests** - Test critical user paths
4. **Coverage Target** - Aim for >70% code coverage

### Writing Tests (Future)

```javascript
// Example unit test
import { describe, it, expect } from 'vitest';
import { formatDate } from '@/utils/date';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2025-01-15');
    expect(formatDate(date)).toBe('January 15, 2025');
  });
});

// Example component test
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

---

## Documentation

### Types of Documentation

1. **Code Comments** - For complex logic
2. **README** - Project overview and setup
3. **API Documentation** - Function/component APIs
4. **Tutorials** - How-to guides
5. **Architecture Docs** - System design

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Keep docs up-to-date with code changes
- Follow the Diátaxis framework when possible

### Updating Documentation

When your PR changes behavior:

1. Update relevant markdown files
2. Update inline code comments
3. Add examples if helpful
4. Update API documentation

---

## Community

### Getting Help

- **GitHub Discussions** - Ask questions, share ideas
- **GitHub Issues** - Report bugs, request features
- **Pull Requests** - Submit code, review others' work

### Recognition

Contributors will be recognized:

- In the project README
- In release notes
- In the contributors page (coming soon)

### Maintainers

Current maintainers:
- [@Krosebrook](https://github.com/Krosebrook)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Questions?

If you have questions not covered here:

1. Check existing [GitHub Issues](https://github.com/Krosebrook/fusion-ai/issues)
2. Create a new issue with the `question` label
3. Reach out to maintainers

---

## Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Base44 SDK Documentation](https://base44.com)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

**Thank you for contributing to FlashFusion! 🚀**

Together, we're building the future of AI-powered development.
