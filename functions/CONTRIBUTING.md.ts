# Contributing to FlashFusion

Thank you for your interest in contributing to FlashFusion! This document provides guidelines and best practices for contributing to the project.

---

## 🎯 Code of Conduct

Be respectful, inclusive, and constructive. We're building world-class software together.

---

## 🚀 Getting Started

### 1. Fork & Clone
```bash
git clone https://github.com/your-username/flashfusion.git
cd flashfusion
npm install
```

### 2. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes
Follow our coding standards (see below)

### 4. Test Your Changes
```bash
npm run test
npm run lint
```

### 5. Commit with Conventional Commits
```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in component"
git commit -m "docs: update README"
```

### 6. Push & Create PR
```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub.

---

## 📝 Coding Standards

### JavaScript/React Style

**Use modern ES2023+ features:**
```javascript
// ✅ Good
const items = await base44.entities.Task.list();
const filtered = items.filter(item => item.status === 'active');

// ❌ Avoid
var items = await base44.entities.Task.list();
var filtered = items.filter(function(item) { return item.status === 'active'; });
```

**Prefer functional components with hooks:**
```javascript
// ✅ Good
export default function MyComponent() {
  const [state, setState] = useState(null);
  return <div>{state}</div>;
}

// ❌ Avoid class components
class MyComponent extends React.Component { ... }
```

**Use destructuring:**
```javascript
// ✅ Good
const { user, loading, error } = useAuth();

// ❌ Avoid
const user = useAuth().user;
const loading = useAuth().loading;
```

### Component Organization

**File structure for components:**
```javascript
import React from "react";
import { Button } from "@/components/ui/button";

export default function MyComponent({ title, onAction }) {
  const [state, setState] = React.useState(null);

  const handleClick = () => {
    // Logic here
    onAction?.(state);
  };

  return (
    <div className="p-4">
      <h2>{title}</h2>
      <Button onClick={handleClick}>Action</Button>
    </div>
  );
}
```

**Props validation (JSDoc):**
```javascript
/**
 * MyComponent displays a card with action button
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {Function} props.onAction - Callback when action clicked
 */
export default function MyComponent({ title, onAction }) { ... }
```

### Styling Guidelines

**Use Tailwind utility classes:**
```javascript
// ✅ Good
<div className="flex items-center gap-4 p-6 bg-slate-800 rounded-lg">

// ❌ Avoid inline styles unless dynamic
<div style={{ display: 'flex', padding: '24px' }}>
```

**Responsive design (mobile-first):**
```javascript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

**Use design tokens:**
```javascript
import { FLASHFUSION_TOKENS, COLORS } from '@/components/design-system/FlashFusionTokens';

<div style={{ 
  padding: FLASHFUSION_TOKENS.spacing.lg,
  background: COLORS.PRIMARY_GRADIENT 
}}>
```

---

## 🧪 Testing Requirements

### All contributions must include tests

**Unit tests for components:**
```javascript
// components/ui/button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Integration tests for workflows:**
```javascript
describe('App Marketplace', () => {
  it('filters apps by category', async () => {
    render(<Marketplace />);
    
    await waitFor(() => screen.getByText('AI Tools'));
    fireEvent.click(screen.getByText('AI Tools'));
    
    const apps = screen.getAllByRole('link');
    expect(apps.length).toBeGreaterThan(0);
  });
});
```

### Coverage Requirements
- **Minimum:** 80% statement coverage
- **Target:** 90%+ for new features
- **Critical paths:** 100% coverage (auth, payments, etc.)

---

## 🎨 Design Standards

### Cinematic Quality Checklist
- ✅ Use FLASHFUSION_TOKENS for all spacing, colors, typography
- ✅ Implement smooth animations (300-500ms duration)
- ✅ Add micro-interactions (hover states, loading spinners)
- ✅ Ensure WCAG 2.2 AA accessibility (color contrast, keyboard nav)
- ✅ Mobile-responsive (test on iPhone SE, iPad, Desktop)
- ✅ Dark mode optimized (our primary theme)

### Motion Guidelines
- **Use Framer Motion** for complex animations
- **Stagger children** for list animations (0.05-0.1s delay)
- **Ease-out** for entrances, **ease-in** for exits
- **Respect prefers-reduced-motion** for accessibility

```javascript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
>
  Content
</motion.div>
```

---

## 📋 Pull Request Checklist

Before submitting, ensure:

- [ ] Code follows style guide
- [ ] All tests pass (`npm run test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Documentation updated (if applicable)
- [ ] Screenshots/videos added (for UI changes)
- [ ] Accessibility tested (keyboard navigation, screen reader)
- [ ] Mobile responsive (tested on small screens)
- [ ] Performance impact assessed (Lighthouse score)
- [ ] No console errors in browser
- [ ] Commit messages follow conventional commits

---

## 🔍 Code Review Process

### Timeline
- **First review:** Within 2 business days
- **Follow-up:** Within 1 business day
- **Merge:** Once approved by 2+ maintainers

### Review Criteria
1. **Functionality:** Does it work as intended?
2. **Code Quality:** Clean, maintainable, well-documented?
3. **Testing:** Adequate test coverage?
4. **Design:** Matches FlashFusion aesthetic?
5. **Performance:** No regressions?
6. **Security:** No vulnerabilities introduced?

---

## 🎓 Learning Resources

### Recommended Reading
- [React Best Practices](https://react.dev/learn)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Guide](https://www.framer.com/motion/)
- [Base44 Platform Docs](https://docs.base44.com)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)

### Internal Docs
- [Design System](../components/design-system/DesignSystemGuide.md)
- [A/B Testing Guide](./AB_TESTING_DOCUMENTATION.md)
- [Backend Functions](./ARCHITECTURE.md)

---

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Description:**
Clear description of the bug

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Screenshots:**
If applicable

**Environment:**
- Browser: Chrome 120
- OS: macOS 14
- Version: 2.0.0
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
**Problem:**
What problem does this solve?

**Proposed Solution:**
How should it work?

**Alternatives Considered:**
Other approaches you've thought about

**Additional Context:**
Mockups, examples, references
```

---

## 🏆 Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Monthly contributor spotlight

Top contributors may receive:
- Early access to features
- Swag & merch
- LinkedIn recommendations

---

## 📧 Questions?

- **Discord:** [#contributors channel](https://discord.gg/flashfusion)
- **Email:** dev@flashfusion.ai
- **Office Hours:** Thursdays 2-3pm PT

---

Thank you for making FlashFusion better! 🎉