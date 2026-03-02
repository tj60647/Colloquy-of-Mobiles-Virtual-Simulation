# Demo Template

This is the standard template for all Colloquy of Mobiles demos.

## File Structure

```
demo-TS-##-name/
├── index.html          (at root, not in public/)
├── src/
│   └── main.ts         (demo logic)
├── public/
│   ├── styles.css      (demo styling)
│   └── config.json     (simulation config)
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Technology

**Demos use vanilla TypeScript with custom CSS - NO frameworks.**

- ❌ **No React, Vue, Angular** - Current UI needs don't justify framework complexity
- ❌ **No Tailwind, Bootstrap** - Custom CSS ensures consistent styling
- ✅ **Vanilla TypeScript** - Direct DOM manipulation, lightweight bundles
- ✅ **Shared modules** - Reusable components like `CameraControlPanel.ts`

**Why?** Demos prioritize 3D simulation over UI. See [UI Architecture](../../docs/UI_ARCHITECTURE.md) for canonical architecture/rationale and [UI Standards](../../docs/UI_STANDARDS.md) for visual conventions.

## Creating a New Demo

1. **Copy this template folder:**
   ```bash
   cp -r apps/demo-TS-template apps/demo-TS-##-your-demo-name
   cd apps/demo-TS-##-your-demo-name
   ```

2. **Update package.json:**
   - Change `name` to `demo-ts-##-your-demo-name`
   - Update `description`

3. **Update index.html:**
   - Replace `##` with demo number
   - Replace `[Name]` with demo title
   - Replace `[Brief description...]` with actual description
   - Add any demo-specific UI panels (see Demo 1 for example)

4. **Update src/main.ts:**
   - Customize the demo logic
   - Keep the standard init pattern with `setupInfoModal()`

5. **Update public/config.json:**
   - Define your simulation configuration

6. **Install dependencies:**
   ```bash
   npm install
   ```

7. **Test locally:**
   ```bash
   npm run dev
   ```

## Standard UI Components

All demos include these standard components by default:

### 1. Info Icon (ⓘ)
- **Location:** Top-right corner
- **Purpose:** Opens modal with demo description and help
- **No changes needed** - works out of the box

### 2. Info Modal
- **Purpose:** Full demo description, mouse controls, keyboard shortcuts
- **Customization:** Update title and description in index.html

### 3. Camera Controls Panel
- **Location:** Bottom-left corner
- **Purpose:** Standard camera controls (Reset, View Presets)
- **Module:** `lib/visualization/ui/CameraControlPanel.ts` (shared)
- **Basic usage:** `setupCameraControls()` - no changes needed
- **Custom buttons:** See "Adding Custom Camera Buttons" below

**IMPORTANT:** The HTML for camera controls should be an empty panel:
```html
<!-- Camera Controls Panel -->
<div id="controls-panel" class="panel">
    <div class="panel-header">Camera Controls</div>
    <!-- Buttons will be added dynamically -->
</div>
```
❌ **DO NOT** add manual button HTML - `setupCameraControls()` creates them dynamically!

## Adding Custom Camera Controls

The camera controls panel includes standard buttons (Reset, View presets). You can add:

### 1. Auto-Orbit Controls
For demos with animated motion, enable automatic camera orbit:

```typescript
import { setupCameraControls } from '../../../lib/visualization/ui';

// In your demo class, make renderer public:
class YourDemoApp {
  public renderer: YourRendererClass; // Must be public for setupCameraControls
  // ...
}

// In init() function:
const app = new YourDemoApp();

setupCameraControls({
  autoOrbit: {
    cameraController: app.renderer.getCameraController(),
    initialSpeed: 0.005,     // Default rotation speed
    minSpeed: -0.01,         // Minimum (reverse rotation)
    maxSpeed: 0.01,          // Maximum (fast rotation)
    startEnabled: false,     // Whether orbit starts immediately
  }
});
```

This adds:
- **Orbit toggle** button (Enable/Disable)
- **Speed slider** to control rotation speed

The CameraController handles all orbit logic automatically - no callbacks needed!

### 2. Custom Action Buttons
Add custom buttons for demo-specific actions:

```typescript
setupCameraControls({
  customButtons: [
    {
      label: 'Take Screenshot',
      onClick: () => captureScreenshot(),
      className: 'camera-button'
    }
  ]
});
```

Custom buttons appear **between** the Reset button and View Preset buttons.

## Adding Demo-Specific Controls

If your demo needs custom controls (like Demo 1's rotation slider), follow this pattern:

### 1. Add HTML to index.html
```html
<!-- Custom Control Panel -->
<div id="custom-panel" class="panel">
    <div class="panel-header">Your Control Title</div>
    <div class="control-row">
        <span class="control-label">Control Name</span>
        <span class="control-hint">Value</span>
    </div>
    <input type="range" id="your-slider" min="0" max="1" step="0.01" value="0.5">
    <div class="slider-value" id="your-value">0.5</div>
</div>
```

**Note:** Always add `class="panel"` to get shared glassmorphism styling.

### 2. Add CSS to public/styles.css

**IMPORTANT: Only add positioning and demo-specific layout.** The `.panel` class provides all styling (glassmorphism, colors, borders, etc.).

```css
/* Demo-specific panel positioning only */
#custom-panel {
    position: absolute;
    top: 180px;  /* Below description panel */
    left: 20px;
}
```

**That's it!** The shared `lib/visualization/ui/styles.css` already provides:
- `.panel` styling (background, border, padding, glassmorphism)
- `.control-row`, `.control-label`, `.control-hint` styling
- `input[type="range"]` and `.slider-value` styling
- All info modal, camera button, and standard component styles

### 3. Wire up in src/main.ts
```typescript
function setupCustomControls() {
    const slider = document.getElementById('your-slider') as HTMLInputElement;
    const valueDisplay = document.getElementById('your-value');
    
    if (!slider || !valueDisplay) return;
    
    slider.addEventListener('input', (event) => {
        const value = parseFloat((event.target as HTMLInputElement).value);
        valueDisplay.textContent = value.toFixed(2);
        // Update your demo state here
    });
}

// Call in init()
async function init() {
    // ...
    setupInfoModal();
    setupCustomControls(); // Add this
    // ...
}
```

## Styling Guidelines

**Shared CSS imported automatically - only add demo-specific positioning.**

### How It Works

1. **Shared UI styles** are in `lib/visualization/ui/styles.css`:
   - Imported automatically: `import '../../../lib/visualization/ui/styles.css';` in main.ts
   - Provides: `.panel`, `.panel-header`, `.control-row`, camera buttons, info modal, sliders, etc.
   - **DO NOT duplicate these styles in your demo!**

2. **Demo-specific styles** go in `public/styles.css`:
   - **ONLY positioning**: `top`, `left`, `right`, `bottom` for panel placement
   - **Demo-specific layout**: Custom grid/flex arrangements for your unique controls
   - **DO NOT redefine** `.panel`, `.control-row`, or other shared classes

### Example - Demo 1 Transform Hierarchy

```css
/**
 * Demo 1: Transform Hierarchy - Demo-Specific Styles
 * 
 * Shared UI styles imported from lib/visualization/ui/styles.css
 * This file only contains demo-specific positioning and layout.
 */

/* Transform Control Panel - Positioning Only */
#transform-panel {
    position: absolute;
    top: 180px;  /* Below description panel */
    left: 20px;
}

**1. HTML** - Add `class="panel"` to your div:
```html
<div id="my-panel" class="panel">
    <div class="panel-header">My Controls</div>
    <!-- content -->
</div>
```

### Standard Panel Usage

**1. HTML** - Add `class="panel"`:
```html
<div id="my-panel" class="panel">
    <div class="panel-header">My Controls</div>
    <!-- content -->
</div>
```

**2. CSS** - Only position it:
```css
#my-panel {
    position: absolute;
    top: 180px;
    left: 20px;
}
```

The `.panel` class automatically provides:
✅ Glassmorphism background (light theme with transparency)
✅ Subtle border and shadows  
✅ Proper padding and border-radius  
✅ Backdrop blur effect  
✅ Consistent z-index  

### Shared Classes Available

Use these classes from `lib/visualization/ui/styles.css` - **DO NOT redefine them:**

- **`.panel`** - Standard panel (220px min-width, light glassmorphism)
- **`.panel.large`** - Larger panel with more padding (420px max-width)
- **`.panel-header`** - Uppercase blue header text
- **`.control-row`** - Flexbox row for label + value
- **`.control-label`** / **`.control-hint`** - Text styling
- **`.slider-value`** - Monospace value display
- **`.camera-button`** - Camera control buttons
- **`input[type="range"]`** - Styled sliders
- **`#info-icon`** - Info icon button (top-right)
- **`#info-modal`** - Info modal backdrop and card
- **`.help-section`**, **`.help-item`**, **`.help-key`** - Modal content styling

### Color Palette (Light Theme)

From `lib/visualization/ui/styles.css`:
- **Panel BG:** `rgba(255, 255, 255, 0.5)` with `backdrop-filter: blur(8px)`
- **Text:** `#2c3e50` (primary), `#5a6c7d` (secondary), `#666` (labels)
- **Primary Blue:** `#2980b9`, `#3498db` (borders, highlights, interactive elements)
- **Hover:** `rgba(52, 152, 219, 0.2)` backgrounds
- **Success Green:** `#27ae60` (active states)
- **Warning Red:** `#c0392b` (reset buttons)

### Typography
- **Font:** `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
- **Monospace:** `'Courier New', monospace` (for values, kbd)

## Panel Positioning

Standard positions to avoid overlap:
- **Top-right:** Info icon (ⓘ)
- **Top-left:** Demo-specific controls (if needed)
- **Bottom-left:** Camera controls (standard)
- **Bottom-right:** Available for demo-specific controls

## Config File Format

Use Config V2 format:
```json
{
  "version": "2.0",
  "name": "Demo Name",
  "description": "Demo description",
  "coordinateSystems": [
    {
      "id": "root",
      "name": "Root",
      "parent": null,
      "position": { "x": 0, "y": 0, "z": 0 },
      "rotation": { "x": 0, "y": 0, "z": 0 }
    }
  ],
  "mobiles": []
}
```

## Build Configuration

The template includes:
- **Vite config:** Pre-configured with Three.js deduplication
- **TypeScript config:** Extends root tsconfig
- **Package.json:** Three.js ^0.168.0 to match root dependency

**Do not modify these unless necessary.**

## Testing

Before submitting your demo:

1. ✅ Runs locally with `npm run dev`
2. ✅ Builds successfully with `npm run build`
3. ✅ All UI components visible and styled consistently
4. ✅ Info modal has accurate description
5. ✅ No console errors
6. ✅ Camera controls work (R, 1-4, F keys)
7. ✅ Responsive to window resize

## Documentation

See:
- [UI Architecture](../../docs/UI_ARCHITECTURE.md) - Canonical UI architecture and migration strategy
- [UI Standards](../../docs/UI_STANDARDS.md) - Detailed UI component specs
- [Camera Controller Spec](../../docs/CAMERA_CONTROLLER_SPEC.md) - Camera behavior

## Examples

- **Demo 1:** Transform hierarchy with rotation speed control

