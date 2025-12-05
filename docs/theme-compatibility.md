# Theme Compatibility Guidelines

## Overview

Agentics Hub uses a dynamic theming system that allows agency-wide and per-client theme customization. To ensure all UI components work correctly with this system, developers **MUST** follow these guidelines.

## The Rule

> **THEME COMPATIBILITY RULE**
> All UI components MUST use CSS custom properties (`var(--*)`) for colors, backgrounds, borders, and shadows to ensure theme compatibility. Hardcoded color values will break theming!

## Why This Matters

The theme builder allows:
- **Agency admins** to set default themes for all clients
- **Theme templates** to be created and assigned to clients
- **Per-client customization** of colors, backgrounds, cards, sidebars, etc.
- **Real-time updates** - changes apply immediately without page reload

Hardcoded color values bypass this system and create visual inconsistencies.

## CSS Custom Properties Reference

### Base Colors (HSL Format)
```css
--background          /* Page/app background */
--foreground          /* Primary text color */
--primary             /* Brand accent color */
--secondary           /* Secondary accent */
--accent              /* Alternative accent */
--muted               /* Muted background */
--muted-foreground    /* Muted text */
--card                /* Card background */
--card-foreground     /* Card text */
--popover             /* Dropdown/popover background */
--popover-foreground  /* Dropdown text */
--border              /* Border color */
--input               /* Input field background */
--ring                /* Focus ring color */
--destructive         /* Error/destructive actions */
```

### Theme Builder Properties (Direct Values)
These are dynamically updated by the theme builder:

```css
/* Page Background */
--page-bg             /* Can be color or gradient */

/* Card Styling */
--card-bg             /* Card background (color/gradient) */
--card-border         /* Card border with opacity */
--card-border-width   /* Border thickness */
--card-shadow         /* Box shadow */

/* Button Styling */
--button-bg           /* Button background */
--button-hover        /* Hover state */
--button-active       /* Active/pressed state */
--button-text         /* Button text color */

/* Sidebar Styling */
--sidebar-bg          /* Sidebar background */
--sidebar-text        /* Sidebar text */
--sidebar-active-bg   /* Active item background */
--sidebar-active-text /* Active item text */
--sidebar-hover-bg    /* Hover state */

/* Tab Bar */
--tab-bar-bg          /* Tab bar background */
--tab-active-bg       /* Active tab background */
--tab-active-text     /* Active tab text */
--tab-active-border   /* Active tab border */
--tab-inactive-text   /* Inactive tab text */
--tab-hover-bg        /* Tab hover state */

/* Glass Effects */
--glass-blur          /* Blur amount for glass effect */
--glass-bg-opacity    /* Glass background opacity */
--glass-tint          /* Glass tint color */

/* Status Colors */
--status-success      /* Success state */
--status-warning      /* Warning state */
--status-error        /* Error state */
--status-info         /* Info state */

/* Dividers */
--divider-color       /* Divider/separator color */
--divider-width       /* Divider thickness */
--divider-style       /* solid/dashed/dotted */
```

## Examples

### ✅ CORRECT - Using CSS Variables

```tsx
// Using Tailwind with CSS variables
<div className="bg-background text-foreground border-border" />

// Using inline styles with CSS variables
<div style={{ 
  background: 'var(--card-bg)',
  border: 'var(--card-border-width) solid var(--card-border)',
  boxShadow: 'var(--card-shadow)'
}} />

// Using HSL variables in Tailwind
<button className="bg-primary text-primary-foreground hover:bg-primary/90" />
```

### ❌ INCORRECT - Hardcoded Colors

```tsx
// DON'T hardcode hex colors
<div className="bg-[#1a1a1a]" />
<div style={{ backgroundColor: '#134736' }} />

// DON'T use Tailwind arbitrary colors
<button className="bg-[#0a0e1a] text-white" />

// DON'T mix hardcoded with variables
<div className="bg-card" style={{ borderColor: '#333' }} />
```

## Component Guidelines

### Cards
```tsx
<Card 
  style={{
    background: 'var(--card-bg)',
    border: 'var(--card-border-width) solid var(--card-border)',
    boxShadow: 'var(--card-shadow)',
  }}
>
  {/* content */}
</Card>
```

### Buttons (Primary)
```tsx
<Button 
  style={{
    background: 'var(--button-bg)',
    color: 'var(--button-text)',
  }}
>
  Click Me
</Button>
```

### Dividers/Separators
```tsx
<hr 
  style={{
    borderTop: 'var(--divider-width) var(--divider-style) var(--divider-color)',
  }}
/>
```

### Glass Effect Components
```tsx
<div
  style={{
    background: 'var(--glass-tint)',
    backdropFilter: 'blur(var(--glass-blur))',
  }}
/>
```

## Theme Hierarchy

The theme system follows this cascade:

1. **Agency Default** - Base theme for all clients (set by agency admins)
2. **Theme Template** - Reusable theme presets that can be assigned to clients
3. **Client Custom** - Per-client customization (if allowed)

When a client user logs in, they see their assigned theme automatically.

## Database Tables

The theme system uses these tables:

- `agency_theme_settings` - Single row for agency-wide defaults
- `theme_templates` - Library of reusable theme presets
- `client_theme_settings` - Per-client theme configuration
- `custom_theme_presets` - User-saved custom presets

## Access Control

- **Agency Admins**: Can edit all theme settings, create templates, lock client themes
- **Client Owners/Admins**: Can customize their client theme (if not locked)
- **Client Users**: View-only, see their assigned theme

## Testing Your Components

1. Navigate to `/settings/themes` (requires authentication)
2. Switch between light/dark modes
3. Change colors in different sections
4. Verify your component updates in real-time
5. Test with different presets

## Migration Guide

If you have existing components with hardcoded colors:

1. Identify all hardcoded color values
2. Map them to the closest CSS variable
3. Replace hardcoded values with `var(--variable-name)`
4. Test with both light and dark themes
5. Test with custom color configurations

## Questions?

If you're unsure which variable to use for a specific use case, check the existing components in:
- `src/components/settings/` - Theme builder components
- `src/index.css` - CSS variable definitions
- `src/contexts/ThemeContext.tsx` - Theme context and defaults



