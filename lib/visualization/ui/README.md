# UI Components

Shared UI components for all demos.

## Files

- **`CameraControlPanel.ts`** - JavaScript logic for camera controls
- **`icons.ts`** - SVG icon library (Feather Icons style)
- **`styles.css`** - Shared CSS for all UI components
- **`index.ts`** - Module exports

## Usage

### Icons

```typescript
import { icons, getIcon } from '../../../lib/visualization/ui';

// Use inline SVG
button.innerHTML = icons.info;  // Info circle
button.innerHTML = icons.close; // X icon
button.innerHTML = icons.help;  // Question mark

// Or get by name
const iconSvg = getIcon('camera');
```

Available icons: `info`, `help`, `close`, `settings`, `eye`, `eyeOff`, `play`, `pause`, `rotateCW`, `camera`

All icons use `currentColor` for stroke, making them themeable via CSS `color` property.

### Camera Controls

### In your demo's main.ts:

```typescript
// Import shared CSS (required)
import '../../../lib/visualization/ui/styles.css';

// Import camera controls
import { setupCameraControls } from '../../../lib/visualization/ui';

// Basic usage (standard buttons only)
setupCameraControls();

// With custom buttons (e.g., orbit toggle)
setupCameraControls({
    customButtons: [{
        label: 'Orbit: Off',
        onClick: () => app.toggleOrbit(),
        isToggle: true,
        toggleStates: { on: 'Orbit: On', off: 'Orbit: Off' }
    }]
});
```

### In your demo's styles.css:

**Only add demo-specific styles.** Common components are already styled.

```css
/**  * Demo-Specific Styles
 * 
 * Shared UI imported from lib/visualization/ui/styles.css
 */

/* Example: Custom control panel */
#my-custom-panel {
    position: absolute;
    top: 180px;
    left: 20px;
    /* ... standard panel styling ... */
}
```

## What's Shared

The following components are styled globally:

- **`#info-icon`** - Info button (top-right)
- **`#info-modal`** - Information overlay
- **`#info-card`** - Modal content card
- **`#camera-info-modal`** - Camera controls help modal
- **`#description-panel`** - Demo description (top-left)
- **`#controls-panel`** - Camera controls container (bottom-left)
  - Includes info button (ⓘ) in panel header with mouse/keyboard shortcuts
- **`.camera-button`** - Camera control buttons
- **`.camera-button.active`** - Active state (green)
- **`.camera-button.reset`** - Reset button (red)
- **`.panel-header`** - Panel header text
- **`.control-row`** - Control row layout
- **`kbd`** - Keyboard shortcuts

## Camera Controls Panel

The camera controls panel automatically includes:

1. **Info Icon (ⓘ)** - In panel header, shows modal with:
   - Mouse controls (left-click drag, right-click drag, scroll wheel)
   - Keyboard shortcuts (R, 1, 2, 3, 4)
2. **Reset View** - Red button, resets camera to default position
3. **Custom Buttons** - Optional custom controls (e.g., orbit toggle)
4. **View Presets** - Top, Front, Side, Iso buttons (triggered by keys 1-4)

## Color Palette

- **Background:** `#0a0a0a` (canvas), `rgba(13, 17, 30, 0.92)` (panels)
- **Primary Blue:** `#3498db`, `#5dade2`, `rgba(52, 152, 219, 0.3-0.7)`
- **Green (Active):** `#2ecc71`, `rgba(46, 204, 113, 0.25-0.5)`
- **Red (Destructive):** `#e74c3c`, `rgba(231, 76, 60, 0.2-0.6)`
- **Text:** `#e0e0e0` (primary), `#b8b8b8` (secondary), `#888` (tertiary)

## Typography

- **Font:** `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
- **Monospace:** `'Courier New', monospace` (for values, kbd)

## Benefits

✅ **DRY** - Styles defined once, used everywhere  
✅ **Consistent** - Same look and feel across all demos  
✅ **Lightweight** - No duplication, smaller bundles  
✅ **Maintainable** - Update once, affects all demos  

## Adding New Shared Components

If you create a UI component used in multiple demos:

1. Add styles to `styles.css`
2. Add logic to appropriate `.ts` file (or create new one)
3. Export from `index.ts`
4. Update this README

See [docs/UI_STANDARDS.md](../../../docs/UI_STANDARDS.md) for full design system documentation.
