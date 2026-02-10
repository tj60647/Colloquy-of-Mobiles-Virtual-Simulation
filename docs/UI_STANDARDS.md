# Demo UI Standards

This document defines the standard UI pattern for all demos in the Colloquy of Mobiles system.

## Overview

All demos use a consistent, minimal UI with:
- **Info Icon** (top right) - Opens detailed information modal
- **Camera Controls Panel** (bottom left) - Always-visible quick reference
- **Info Modal** (overlay) - Full demo description and help text

## Layout

```
┌─────────────────────────────────────────────┐
│                                      [i]    │  Info Icon
│                                             │
│              CANVAS AREA                    │
│                                             │
│                                             │
│  ┌───────────────────┐                     │
│  │ Camera Controls   │                     │  Controls Panel
│  │ Orbit: Left Drag  │                     │
│  └───────────────────┘                     │
└─────────────────────────────────────────────┘
```

## Components

### 1. Info Icon (`#info-icon`)

**Location:** Top right corner (20px from edges)  
**Purpose:** Toggle information modal  
**Style:**
- Circular button (48x48px)
- Blue "i" icon in circle
- Translucent dark background with backdrop blur
- Hover: slight scale + glow effect

**HTML:**
```html
<button id="info-icon" aria-label="Show information">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
</button>
```

### 2. Camera Controls Panel (`#controls-panel`)

**Location:** Bottom left corner (20px from edges)  
**Purpose:** Always-visible quick reference for camera controls  
**Style:**
- Translucent dark card with backdrop blur
- Blue border and accents
- Compact list format (220px min width)

**Content:**
- Orbit: Left Drag
- Pan: Right Drag
- Zoom: Scroll
- Reset: R
- Views: 1 2 3 4

**HTML:**
```html
<div id="controls-panel">
    <div class="panel-header">Camera Controls</div>
    <div class="control-row">
        <span class="control-label">Orbit</span>
        <span class="control-hint">Left Drag</span>
    </div>
    <!-- More control rows... -->
</div>
```

### 3. Info Modal (`#info-modal`)

**Location:** Full-screen overlay (centered)  
**Purpose:** Detailed demo description, instructions, full help  
**Style:**
- Dark backdrop with blur
- Centered card (max 600px wide)
- Scrollable content
- Close button (X) in top right
- Smooth fade-in animation

**Content Structure:**
1. **Title:** Demo name
2. **Description:** What the demo demonstrates
3. **Mouse Controls:** Orbit, Pan, Zoom
4. **Keyboard Shortcuts:** R, 1-4, F, etc.

**Interactions:**
- Open: Click info icon
- Close: Click X, click backdrop, or press ESC

**HTML:**
```html
<div id="info-modal">
    <div id="info-card">
        <button id="info-close" aria-label="Close">&times;</button>
        <h2>Demo Title</h2>
        <p class="description">...</p>
        <div class="help-section">
            <h3>Mouse Controls</h3>
            <!-- help items -->
        </div>
        <div class="help-section">
            <h3>Keyboard Shortcuts</h3>
            <!-- help items -->
        </div>
    </div>
</div>
```

## Color Palette

**Background:**
- Canvas: `#0a0a0a` (very dark)
- Panels: `rgba(13, 17, 30, 0.92)` (translucent navy)

**Borders/Accents:**
- Primary: `rgba(52, 152, 219, 0.3)` - `rgba(52, 152, 219, 0.7)` (blue)
- Text headings: `#3498db`, `#5dade2` (blue shades)

**Text:**
- Primary: `#e0e0e0` (light gray)
- Secondary: `#b8b8b8` (medium gray)
- Tertiary: `#888` (dark gray)

**Interactive:**
- Kbd tags: `rgba(52, 152, 219, 0.2)` background, `#5dade2` text

## Typography

**Font Stack:** `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`  
**Monospace:** `'Courier New', monospace` (for kbd tags)

**Sizes:**
- Panel header: 0.85em, uppercase, letter-spacing: 0.5px
- Panel content: 0.9em
- Modal title: 1.6em
- Modal headings: 1.1em
- Modal body: 0.95em

## Interaction Patterns

### Info Modal Toggle

**JavaScript:**
```javascript
function setupInfoModal() {
    const infoIcon = document.getElementById('info-icon');
    const infoModal = document.getElementById('info-modal');
    const infoClose = document.getElementById('info-close');
    
    if (!infoIcon || !infoModal || !infoClose) return;
    
    // Open modal on icon click
    infoIcon.addEventListener('click', () => {
        infoModal.classList.add('visible');
    });
    
    // Close modal on close button click
    infoClose.addEventListener('click', () => {
        infoModal.classList.remove('visible');
    });
    
    // Close modal on backdrop click
    infoModal.addEventListener('click', (e) => {
        if (e.target === infoModal) {
            infoModal.classList.remove('visible');
        }
    });
    
    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && infoModal.classList.contains('visible')) {
            infoModal.classList.remove('visible');
        }
    });
}
```

## Accessibility

- All interactive elements use semantic HTML (`<button>`, not `<div>`)
- `aria-label` attributes on icon buttons
- Keyboard navigation supported (ESC to close)
- High contrast text (WCAG AA compliant)
- Focus states on interactive elements

## Technology Philosophy

**IMPORTANT:** Demos use **vanilla TypeScript** with **custom CSS only**

### No UI Frameworks
- ❌ **No React, Vue, Angular, etc.** - Overkill for simple demo UIs
- ❌ **No CSS frameworks** (Tailwind, Bootstrap, etc.) - Must use custom CSS

### Why Vanilla TypeScript?
- **Lightweight** - No framework overhead (~45KB+ for React alone)
- **Performance** - Direct DOM manipulation is faster for 60fps animations
- **Simplicity** - Current UI complexity doesn't justify framework complexity
- **Control** - Full control over styling and behavior
- **Minimal dependencies** - Aligns with project philosophy

### When Might We Reconsider?
React/frameworks would be worth considering if demos require:
- Complex data visualization dashboards
- Multi-step forms or wizards
- Real-time data tables
- Advanced state management across many components

Current UI needs (~50 lines of code per demo) don't warrant this complexity.

### Shared UI Components
While we avoid frameworks, we do share common logic:
- **JavaScript:** `lib/visualization/ui/CameraControlPanel.ts` - Reusable camera controls
- **CSS:** `lib/visualization/ui/styles.css` - All common component styles
- **Import:** `import '../../../lib/visualization/ui/styles.css'` in main.ts

**What's shared:**
- All standard UI components (info icon, modal, panels, buttons, kbd styling)
- Color palette, typography, glassmorphism effects
- Consistent visual language

**What's demo-specific:**
- Custom control panels unique to each demo (e.g., rotation slider in Demo 1)
- Demo-specific layout adjustments

This ensures:
- Consistent visual language across all demos
- Lightweight bundle size (no duplication)
- Full control over styling
- DRY code without framework overhead

## Template Files

Reference implementation in:
- `apps/demo-TS-template/public/index.html`
- `apps/demo-TS-template/public/styles.css`
- `apps/demo-TS-template/src/main.ts`

When creating a new demo, copy these files and customize:
- Demo title and number
- Description text in info modal
- Any demo-specific UI elements (if needed)

## Responsive Behavior

Currently optimized for desktop displays. Mobile optimization is deferred to Phase 11.

Key considerations for future mobile support:
- Touch gesture equivalents for mouse controls
- Collapsible/minimized controls panel on small screens
- Simplified info modal layout
