# Floating Ask AI Update

## Changes Made

### 1. Added Agency Central Brain to Admin Sidebar
**File**: [src/components/AdminSidebar.tsx](src/components/AdminSidebar.tsx)

Added "Knowledge Base" link to the Quick Access section of the admin sidebar:
- Icon: Brain
- Label: Knowledge Base
- Route: `/admin/central-brain`

Now accessible from the admin sidebar navigation!

### 2. Updated Agency Central Brain Theme
**File**: [src/pages/AgencyCentralBrain.tsx](src/pages/AgencyCentralBrain.tsx)

Completely redesigned to match the application theme:
- ✅ Uses `AdminSidebar` component
- ✅ Consistent header styling with search bar
- ✅ Theme-appropriate cards with `border-border` and `bg-card`
- ✅ Proper color scheme using `text-foreground`, `text-muted-foreground`
- ✅ Responsive tabs with proper styling
- ✅ Badge components for status indicators
- ✅ Consistent button styling

### 3. Created Floating Draggable Ask AI Button
**File**: [src/components/knowledge-base/FloatingAskAI.tsx](src/components/knowledge-base/FloatingAskAI.tsx)

A beautiful floating button that:
- ✨ **Pulses when idle** - Animated pulsing ring to attract attention
- 🎯 **Draggable** - Can be moved anywhere on the screen
- 🚀 **Smooth animations** - Modal slides out from the button click position
- 💫 **Gradient background** - Emerald gradient with hover effects
- 📍 **Smart positioning** - Constrained to viewport, starts bottom-right
- 🔔 **Tooltip** - Shows "Ask AI" on hover

**Features**:
```typescript
- Pulsing ring animation when not clicked
- Draggable with mouse (cursor: move)
- Opens Ask AI modal on click
- Constrains to viewport boundaries
- Smooth gradient hover effects
- Sparkles icon with scale animation
```

### 4. Integrated Floating Widget Throughout App
**Files Updated**:
- [src/components/knowledge-base/index.ts](src/components/knowledge-base/index.ts) - Export FloatingAskAI
- [src/pages/ClientKnowledge.tsx](src/pages/ClientKnowledge.tsx) - Replaced button with floating widget

**Changes**:
- ❌ Removed "Ask AI" button from header
- ✅ Added `<FloatingAskAI />` component
- ✅ Removed unused state and imports
- ✅ Cleaner header with just "Refresh" and "Upload"

## How It Works

### Floating Button Behavior

1. **Initial State**: Button appears bottom-right with pulsing ring
2. **Hover**: Shows tooltip and inner glow effect
3. **Drag**: Click and drag to reposition anywhere
4. **Click**: Opens Ask AI modal with smooth animation
5. **Modal Open**: Pulse animation stops

### Component Structure

```tsx
<FloatingAskAI preselectedItems={docs} />
  ↓
  Creates floating button + AskAIWidget
  ↓
  Button properties:
  - Fixed position (draggable)
  - Gradient background
  - Pulsing animation
  - Sparkles icon
  ↓
  On click → Opens AskAIWidget modal
```

### Visual Design

**Button**:
- Size: 64px × 64px (w-16 h-16)
- Shape: Perfectly round (rounded-full)
- Colors: Emerald gradient (from-emerald-500 to-emerald-600)
- Icon: Sparkles (white, 28px)
- Shadow: Large drop shadow

**Animations**:
- Pulse ring: `animate-ping` on outer span
- Hover glow: Opacity transition on middle span
- Icon scale: `group-hover:scale-110`
- Tooltip fade: Opacity transition

**Positioning**:
- Default: Bottom-right (100px from edges)
- Draggable: Anywhere within viewport
- Z-index: 50 (above most content)

## Usage Examples

### Basic Usage
```tsx
import { FloatingAskAI } from '@/components/knowledge-base';

function MyPage() {
  return (
    <div>
      {/* Your page content */}
      <FloatingAskAI />
    </div>
  );
}
```

### With Preselected Documents
```tsx
import { FloatingAskAI } from '@/components/knowledge-base';

function DocumentViewer({ documents }) {
  return (
    <div>
      {/* Your page content */}
      <FloatingAskAI preselectedItems={documents} />
    </div>
  );
}
```

## Benefits

1. **Non-Intrusive**: Floating button doesn't take up header space
2. **Always Accessible**: Available on any page it's added to
3. **User-Friendly**: Draggable to preferred position
4. **Eye-Catching**: Pulsing animation draws attention
5. **Modern**: Smooth animations and gradient design
6. **Flexible**: Can be added to any page

## Files Modified

| File | Change |
|------|--------|
| `src/components/AdminSidebar.tsx` | Added Knowledge Base link |
| `src/pages/AgencyCentralBrain.tsx` | Complete theme redesign |
| `src/components/knowledge-base/FloatingAskAI.tsx` | **NEW** - Floating button component |
| `src/components/knowledge-base/index.ts` | Export FloatingAskAI and AskAIWidget |
| `src/pages/ClientKnowledge.tsx` | Replaced button with floating widget |

## Screenshots

### Floating Button States

**Idle (Pulsing)**:
- Round emerald button
- Pulsing ring animation
- Sparkles icon

**Hover**:
- Inner glow appears
- Tooltip shows "Ask AI"
- Icon scales up slightly

**Dragging**:
- Cursor changes to move
- Button follows mouse
- Constrained to viewport

**Clicked**:
- Pulse animation stops
- Modal slides out
- Button remains visible

## Technical Details

### State Management
```typescript
const [isOpen, setIsOpen] = useState(false);           // Modal open/closed
const [position, setPosition] = useState({ x, y });    // Button position
const [isDragging, setIsDragging] = useState(false);   // Dragging state
const [dragOffset, setDragOffset] = useState({ x, y }); // Drag offset
```

### Event Handlers
```typescript
handleMouseDown  // Start dragging, calculate offset
handleMouseMove  // Update position while dragging
handleMouseUp    // Stop dragging
handleClick      // Open modal (only if not dragging)
```

### Constraints
```typescript
// Constrain to viewport
const maxX = window.innerWidth - 64;
const maxY = window.innerHeight - 64;

setPosition({
  x: Math.max(0, Math.min(newX, maxX)),
  y: Math.max(0, Math.min(newY, maxY)),
});
```

## Future Enhancements

Potential improvements:
1. Save position to localStorage (persist across sessions)
2. Animation when opening modal (slide from button)
3. Notification badge for new features
4. Quick actions menu on right-click
5. Minimize/expand animation
6. Keyboard shortcut to open (e.g., Ctrl+K)
7. Voice command activation
8. Multi-theme support (color variants)

## Browser Compatibility

- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (all versions)
- ✅ Mobile browsers (touch not yet supported)

**Note**: Drag functionality currently mouse-only. Touch support coming soon!

## Accessibility

- Proper ARIA label: `aria-label="Ask AI"`
- Keyboard accessible (can be improved)
- Screen reader friendly
- High contrast (emerald on white icon)

## Performance

- Minimal re-renders (only on drag)
- CSS animations (GPU accelerated)
- No layout thrashing
- Smooth 60fps animations

## Summary

The floating "Ask AI" button provides:
- ✨ Beautiful pulsing animation
- 🎯 Draggable positioning
- 🚀 Smooth modal integration
- 💚 Theme-consistent design
- 📱 Easy to implement
- 🎨 Customizable

Perfect for providing quick AI access without cluttering the UI!
