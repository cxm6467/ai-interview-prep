# CSS Architecture Documentation

## Overview

The AI Interview Prep application uses a **hybrid CSS architecture** combining CSS Modules for component isolation with global styles for consistent theming. The design system follows **Atomic Design principles** and implements a **Mobile-First responsive approach**.

## Architecture Components

### 1. **CSS Modules (Component-Scoped Styles)**
- **Location**: `src/components/**/*.module.css`
- **Purpose**: Component-specific styling with automatic class name hashing
- **Benefits**: Prevents CSS conflicts, enables true component encapsulation

#### Example Structure:
```
src/components/
├── atoms/
│   ├── Button/Button.module.css
│   ├── Card/Card.module.css
│   └── Text/Text.module.css
├── molecules/
│   ├── FileUpload/FileUpload.module.css
│   └── DadJoke/DadJoke.module.css
└── organisms/
    ├── InterviewChat/InterviewChat.module.css
    └── Footer/Footer.module.css
```

### 2. **Global Styles (Application-Wide)**
- **Location**: `src/index.css`, `src/App.css`
- **Purpose**: Design system variables, base styles, utility classes
- **Scope**: Application-wide theming and foundational styles

## Design System

### Color Palette & Theming

#### CSS Custom Properties (Variables)
```css
/* Light Theme */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --accent-purple: #8b5cf6;
  --accent-blue: #3b82f6;
  --accent-green: #10b981;
  --border: #e2e8f0;
}

/* Dark Theme */
[data-theme='dark'] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
}
```

#### Color-Coded System
- **🔵 Blue**: Strengths, positive attributes, primary actions
- **🟠 Orange**: Areas for improvement, warnings
- **🟢 Green**: Success states, keyword matches, confirmations
- **🔴 Red**: Missing keywords, errors, critical alerts
- **🟣 Purple**: Interview questions, primary brand color
- **🔷 Teal**: Presentation topics, secondary features

### Typography Scale
```css
/* Responsive Typography */
--text-xs: clamp(0.75rem, 0.5vw + 0.65rem, 0.8rem);
--text-sm: clamp(0.875rem, 0.5vw + 0.75rem, 0.9rem);
--text-base: clamp(1rem, 0.5vw + 0.85rem, 1.1rem);
--text-lg: clamp(1.125rem, 1vw + 0.9rem, 1.25rem);
--text-xl: clamp(1.25rem, 1.5vw + 1rem, 1.5rem);
--text-2xl: clamp(1.5rem, 2vw + 1.2rem, 2rem);
```

### Spacing System
```css
/* Consistent Spacing Scale */
--space-xs: 0.5rem;   /* 8px */
--space-sm: 0.75rem;  /* 12px */
--space-md: 1rem;     /* 16px */
--space-lg: 1.5rem;   /* 24px */
--space-xl: 2rem;     /* 32px */
--space-2xl: 3rem;    /* 48px */
```

## Component Styling Patterns

### 1. **Atomic Components (Atoms)**

#### Button Component Pattern
```css
.button {
  /* Base styles with CSS variables */
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  min-height: 44px; /* Touch-friendly target */
}

/* Variant classes */
.primary {
  background: var(--accent-purple);
  color: white;
}

.secondary {
  background: var(--bg-tertiary);
  color: var(--accent-blue);
  border: 2px solid var(--accent-blue);
}

/* Size classes */
.small { padding: var(--space-xs) var(--space-sm); }
.medium { padding: var(--space-sm) var(--space-md); }
.large { padding: var(--space-md) var(--space-lg); }
```

### 2. **Molecule Components**

#### FileUpload Component Pattern
```css
.container {
  border: 2px dashed var(--border);
  border-radius: 12px;
  padding: var(--space-xl);
  text-align: center;
  transition: all 0.3s ease;
  background: var(--bg-secondary);
}

.container:hover {
  border-color: var(--accent-purple);
  background: var(--bg-tertiary);
}

/* State classes */
.dragActive {
  border-color: var(--accent-purple);
  background: rgba(139, 92, 246, 0.1);
}
```

### 3. **Organism Components**

#### Grid System Pattern
```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
  margin: 0 auto;
  max-width: 900px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }
}
```

## Responsive Design Strategy

### Mobile-First Approach
```css
/* Base styles (mobile) */
.component {
  font-size: var(--text-sm);
  padding: var(--space-sm);
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    font-size: var(--text-base);
    padding: var(--space-md);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    font-size: var(--text-lg);
    padding: var(--space-lg);
  }
}
```

### Breakpoint System
```css
/* Standard breakpoints */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

## Accessibility Features

### Focus Management
```css
/* Custom focus styles */
.button:focus-visible {
  outline: 2px solid var(--accent-purple);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2);
}

/* Remove default focus for mouse users */
.button:focus:not(:focus-visible) {
  outline: none;
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### High Contrast Support
```css
@media (prefers-contrast: high) {
  :root {
    --border: #000000;
    --text-secondary: var(--text-primary);
  }
}
```

## Animation & Transitions

### Consistent Timing Functions
```css
:root {
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Micro-Interactions
```css
.interactive-element {
  transition: var(--transition);
}

.interactive-element:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.interactive-element:active {
  transform: translateY(0);
}
```

## Utility Classes

### Layout Utilities
```css
.text-center { text-align: center; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.gap-sm { gap: var(--space-sm); }
.gap-md { gap: var(--space-md); }
```

### Spacing Utilities
```css
.mt-1 { margin-top: var(--space-xs); }
.mt-2 { margin-top: var(--space-sm); }
.mt-3 { margin-top: var(--space-md); }
.mb-1 { margin-bottom: var(--space-xs); }
.mb-2 { margin-bottom: var(--space-sm); }
.p-2 { padding: var(--space-sm); }
.p-3 { padding: var(--space-md); }
```

### Screen Reader Utilities
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## Performance Optimizations

### CSS Loading Strategy
1. **Critical CSS**: Inlined base styles and above-the-fold components
2. **Component CSS**: Loaded on-demand via CSS Modules
3. **Non-critical CSS**: Lazy-loaded for below-the-fold content

### Bundle Size Optimization
- **CSS Modules**: Automatic tree-shaking of unused styles
- **PostCSS**: Autoprefixer and CSS optimization
- **Purging**: Unused CSS removal in production builds

## Maintenance Guidelines

### 1. **Component Styling Rules**
- Use CSS Modules for all component-specific styles
- Follow BEM-like naming within modules: `.component`, `.component__element`, `.component--modifier`
- Keep global styles minimal and purpose-specific

### 2. **Design Token Updates**
- All color changes should update CSS custom properties in `:root`
- Typography changes should use the defined scale variables
- Spacing should always use the spacing scale variables

### 3. **Responsive Design Checklist**
- Test all components at mobile, tablet, and desktop breakpoints
- Ensure touch targets are minimum 44px on mobile
- Verify text readability across all screen sizes

### 4. **Accessibility Checklist**
- Maintain contrast ratios of at least 4.5:1 for normal text
- Ensure all interactive elements have visible focus states
- Test with screen readers and keyboard navigation
- Support reduced motion preferences

## File Organization Summary

```
src/
├── index.css              # Global variables, reset, base styles
├── App.css               # Application-wide styles, utilities
└── components/
    ├── atoms/
    │   └── */
    │       └── *.module.css  # Component-scoped styles
    ├── molecules/
    │   └── */
    │       └── *.module.css
    └── organisms/
        └── */
            └── *.module.css
```

This architecture provides scalability, maintainability, and excellent developer experience while ensuring consistent user experience across all devices and accessibility needs.