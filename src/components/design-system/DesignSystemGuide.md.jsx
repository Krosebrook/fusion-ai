# FlashFusion Design System
## Comprehensive Implementation Guide

### Quick Start

#### 1. Import Tokens in Components
```javascript
import { FLASHFUSION_TOKENS, COLORS, ANIMATIONS } from '@/components/design-system/FlashFusionTokens';
```

#### 2. Use Motion Presets
```jsx
<motion.div
  initial={ANIMATIONS.slideInUp.initial}
  animate={ANIMATIONS.slideInUp.animate}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

#### 3. Apply Neon Glow
```jsx
<div
  style={{
    boxShadow: FLASHFUSION_TOKENS.shadows.neon.purple,
    transition: FLASHFUSION_TOKENS.motion.transitions.glow,
  }}
>
  Glowing Card
</div>
```

---

## Color Application Rules

### 1. Primary Brand Use
- **Logo & Hero CTA buttons**: Purple-to-Cyan gradient
- **Focus States**: Cyan (#06B6D4)
- **Active Elements**: Purple (#8B5CF6)

### 2. Component Color Map
| Component | Color | Usage |
|-----------|-------|-------|
| Button (Primary) | Purple (#8B5CF6) | Main actions |
| Button (Secondary) | Cyan (#06B6D4) | Secondary actions |
| Button (Accent) | Orange (#FF7B00) | Highlight/Call-to-action |
| Success Badge | Emerald (#10B981) | Positive feedback |
| Warning Badge | Amber (#F59E0B) | Caution |
| Error Badge | Red (#EF4444) | Errors |

### 3. Dark Mode Implementation
- **Background**: #0F1729 (darkest)
- **Surface**: #0E152A (slightly lighter for cards)
- **Border**: #302238 (subtle purple tint)
- **Text**: rgba(255, 255, 255, 0.92) (primary), 0.60 (secondary)

---

## Motion Implementation

### Staggered Animations (List Items)
```jsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }}
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={ANIMATIONS.slideInUp}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Page Transitions
```jsx
<motion.main
  initial="exit"
  animate="enter"
  exit="exit"
  variants={{
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
  {children}
</motion.main>
```

### Hover Glow Effects
```jsx
<motion.div
  whileHover={{
    boxShadow: FLASHFUSION_TOKENS.shadows.neon.purple,
    scale: 1.05,
  }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  Hover me!
</motion.div>
```

---

## Typography Implementation

### Heading Hierarchy
```jsx
// h1 - Hero/Page Title
<h1 style={{
  fontFamily: FLASHFUSION_TOKENS.typography.fonts.heading,
  fontSize: FLASHFUSION_TOKENS.typography.sizes['5xl'], // 48px
  fontWeight: FLASHFUSION_TOKENS.typography.weights.bold,
  lineHeight: FLASHFUSION_TOKENS.typography.lineHeight.tight,
  letterSpacing: FLASHFUSION_TOKENS.typography.letterSpacing.tight,
}}>
  Main Heading
</h1>

// h2 - Section Heading
<h2 style={{
  fontSize: FLASHFUSION_TOKENS.typography.sizes['3xl'], // 30px
  fontWeight: FLASHFUSION_TOKENS.typography.weights.semibold,
}}>
  Section Heading
</h2>

// body - Content
<p style={{
  fontFamily: FLASHFUSION_TOKENS.typography.fonts.body,
  fontSize: FLASHFUSION_TOKENS.typography.sizes.base,
  lineHeight: FLASHFUSION_TOKENS.typography.lineHeight.normal,
}}>
  Body text content...
</p>
```

---

## Spacing & Layout

### 8px Grid System
```jsx
// Use token values for all spacing
const Container = styled.div`
  padding: ${FLASHFUSION_TOKENS.spacing.lg}; // 24px
  gap: ${FLASHFUSION_TOKENS.spacing.md};    // 16px
  
  @media (max-width: 768px) {
    padding: ${FLASHFUSION_TOKENS.spacing.md}; // 16px
  }
`;
```

### Responsive Design
```jsx
const ResponsiveGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${FLASHFUSION_TOKENS.spacing.lg};
  
  @media (max-width: ${FLASHFUSION_TOKENS.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${FLASHFUSION_TOKENS.spacing.md};
  }
`;
```

---

## Shadow & Depth

### Elevation Layers
```jsx
// Floating Card (lg elevation)
<div style={{ boxShadow: FLASHFUSION_TOKENS.shadows.lg }}>
  Elevated content
</div>

// Neon Brand Accent
<div style={{ 
  boxShadow: FLASHFUSION_TOKENS.shadows.neon.purple,
  backdropFilter: 'blur(10px)',
  backgroundColor: 'rgba(30, 41, 59, 0.5)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}}>
  Glassmorphic card with neon accent
</div>
```

---

## Border Radius Consistency

```jsx
const BorderRadiusMap = {
  button: FLASHFUSION_TOKENS.borders.radius.md,    // 8px
  card: FLASHFUSION_TOKENS.borders.radius.lg,      // 12px
  modal: FLASHFUSION_TOKENS.borders.radius.xl,     // 16px
  avatar: FLASHFUSION_TOKENS.borders.radius.full,  // 999px
  input: FLASHFUSION_TOKENS.borders.radius.md,     // 8px
};
```

---

## Z-Index Stack

```jsx
export const ZIndexLayers = {
  1: 'base', // z-0
  2: 'dropdown', // z-1000
  3: 'sticky', // z-1020
  4: 'fixed', // z-1030
  5: 'modalBackdrop', // z-1040
  6: 'modal', // z-1050
  7: 'popover', // z-1060
  8: 'tooltip', // z-1070
};

// Usage
<div style={{ zIndex: FLASHFUSION_TOKENS.zIndex.modal }}>
  Modal Content
</div>
```

---

## Animation Performance Tips

1. **Use transform & opacity only** for 60fps animations
2. **Avoid animating layout properties** (width, height, padding)
3. **Use GPU acceleration**: `will-change: transform`
4. **Prefer CSS animations** for infinite loops
5. **Use requestAnimationFrame** for complex sequences

---

## Accessibility Checklist

- ✅ Color contrast > 4.5:1 for text
- ✅ Focus states visible (glow effect + outline)
- ✅ Animations respect `prefers-reduced-motion`
- ✅ Interactive elements > 44px touch target
- ✅ Font sizes >= 14px for body text
- ✅ Line height >= 1.5 for readability

---

## Component Recipes

### Premium Button with Glow
```jsx
<motion.button
  whileHover={{
    boxShadow: FLASHFUSION_TOKENS.shadows.neon.purple,
    scale: 1.05,
  }}
  whileTap={{ scale: 0.95 }}
  style={{
    padding: FLASHFUSION_TOKENS.components.button.padding.base,
    background: `linear-gradient(135deg, ${COLORS.PURPLE}, ${COLORS.ORANGE})`,
    color: 'white',
    border: 'none',
    borderRadius: FLASHFUSION_TOKENS.borders.radius.md,
    fontWeight: FLASHFUSION_TOKENS.typography.weights.bold,
    cursor: 'pointer',
    transition: FLASHFUSION_TOKENS.motion.transitions.glow,
  }}
>
  Click Me
</motion.button>
```

### Glassmorphic Card
```jsx
<motion.div
  initial={ANIMATIONS.fadeIn.initial}
  animate={ANIMATIONS.fadeIn.animate}
  style={{
    padding: FLASHFUSION_TOKENS.spacing.lg,
    borderRadius: FLASHFUSION_TOKENS.borders.radius.lg,
    backgroundColor: COLORS.SURFACE_DARK,
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    backdropFilter: 'blur(10px)',
    boxShadow: FLASHFUSION_TOKENS.shadows.neon.cyan,
  }}
>
  Content
</motion.div>
```

### Staggered List
```jsx
<motion.ul
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: { staggerChildren: 0.1 },
    },
  }}
>
  {items.map((item) => (
    <motion.li
      key={item.id}
      variants={ANIMATIONS.slideInLeft}
    >
      {item.content}
    </motion.li>
  ))}
</motion.ul>
```

---

## File Organization

```
components/design-system/
├── FlashFusionTokens.js      ← Import tokens here
├── VisualAssets.md           ← This reference
└── DesignSystemGuide.md      ← Implementation guide

globals.css                    ← CSS variable overrides
tailwind.config.js            ← Tailwind extensions
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | Jan 14, 2026 | Complete design system with tokens, animations, components |
| 1.0 | Jan 1, 2026 | Initial color palette and typography |

---

**Last Updated:** January 14, 2026  
**Maintainer:** 15-Year Creative Director  
**Status:** Production Ready ✅