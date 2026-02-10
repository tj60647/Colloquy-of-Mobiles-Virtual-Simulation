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

**Why?** Demos prioritize 3D simulation over UI. Simple controls (~50 lines) don't need framework overhead. See [docs/UI_STANDARDS.md](../../docs/UI_STANDARDS.md) for full rationale.

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

## Adding Custom Camera Buttons

The camera controls panel can include custom buttons (like Demo 1's Orbit toggle). Use the shared `setupCameraControls()` function:

### Example: Toggle Button (like Orbit Mode)
```typescript
import { setupCameraControls } from '../../../lib/visualization/ui';

setupCameraControls({
    customButtons: [
        {
            label: 'Orbit: Off',
            onClick: () => app.toggleOrbit(),
            className: 'camera-button',
            isToggle: true,
            toggleStates: { on: 'Orbit: On', off: 'Orbit: Off' }
        }
    ]
});
```

### Example: Regular Action Button
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
<!-- CustomControl Panel -->
<div id="custom-panel" class="panel">
    <div class="panel-header">Your Control Title</div>
    <div class="control-row">
        <span class="control-label">Control Name</span>
    </div>
    <input type="range" id="your-slider" min="0" max="1" step="0.01" value="0.5">
    <div class="slider-value" id="your-value">0.5</div>
</div>
```

**Note:** Always add `class="panel"` to get shared glassmorphism styling.

### 2. Add CSS to public/styles.css (if needed)

**Only add positioning.** The `.panel` class provides all styling (glassmorphism, colors, borders, etc.).

```css
/* Demo-specific panel positioning only */
#custom-panel {
    position: absolute;
    top: 180px;  /* Below description panel */
    left: 20px;
}
```

**That's it!** No need for background, padding, border-radius, etc. - the `.panel` class handles all that.
    background: rgba(13, 17, 30, 0.92);
    color: #e0e0e0;
    padding: 16px 20px;
    border-radius: 8px;
    border: 1px solid rgba(52, 152, 219, 0.3);
    z-index: 100;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    min-width: 220px;
}

#your-slider {
    width: 100%;
    margin: 8px 0;
    accent-color: #3498db;
}

.slider-value {
    text-align: center;
    font-size: 0.9em;
    color: #5dade2;
    font-weight: 600;
    font-family: 'Courier New', monospace;
}
```

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

**Shared UI components** are styled in `lib/visualization/ui/styles.css`:
- `.panel` - Base panel styling (glassmorphism, borders, colors, etc.)
- `.panel.large` - Larger padding for description/title panels
- `.panel-header`, `.control-row`, `.control-label` - Panel content styles
- `.camera-button`, `kbd`, `input[type="range"]` - Interactive elements
- All info icon, modal, and standard components

**Demo-specific CSS** in `public/styles.css` only needs:
- Positioning (`top`, `left`, `right`, `bottom` for your panel IDs)
- That's it!

### Adding Custom Panels

**1. HTML** - Add `class="panel"` to your div:
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
✅ Dark glassmorphism background  
✅ Blue border and shadows  
✅ Proper padding and border-radius  
✅ Backdrop blur effect  
✅ Consistent z-index  

### Shared Classes Available

- **`.panel`** - Standard panel (220px min-width)
- **`.panel.large`** - Larger panel with more padding (420px max-width)
- **`.panel-header`** - Uppercase blue header text
- **`.control-row`** - Flexbox row for label + value
- **`.control-label`** / **`.control-hint`** - Text styling
- **`.slider-value`** - Monospace value display
- **`.camera-button`** - Camera control buttons
- **`input[type="range"]`** - Styled sliders

### Standard Panel Style

**Don't redefine these** - just use the `.panel` class:
```css
.your-panel {
    position: absolute;
    background: rgba(13, 17, 30, 0.92);
    color: #e0e0e0;
    padding: 16px 20px;
    border-radius: 8px;
    border: 1px solid rgba(52, 152, 219, 0.3);
    z-index: 100;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

### Color Palette
- **Background:** `#0a0a0a` (canvas), `rgba(13, 17, 30, 0.92)` (panels)
- **Primary Blue:** `#3498db`, `#5dade2`, `rgba(52, 152, 219, 0.3-0.7)`
- **Text:** `#e0e0e0` (primary), `#b8b8b8` (secondary), `#888` (tertiary)

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
- [UI Standards](../../docs/UI_STANDARDS.md) - Detailed UI component specs
- [Camera Controller Spec](../../docs/CAMERA_CONTROLLER_SPEC.md) - Camera behavior

## Examples

- **Demo 1:** Transform hierarchy with rotation speed control

