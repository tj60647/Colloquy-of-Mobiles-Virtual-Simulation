# UI Components

Shared UI components for all demos.

## Files

- **`CameraControlPanel.ts`** - JavaScript logic for camera controls
- **`MotionProfilesPanel.ts`** - Reusable motion profile controls + collapsible section behavior
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

### Motion Profile Panel

Use the shared motion profile panel wiring with a reusable HTML layout.

#### In your demo HTML:

```html
<div class="motion-profile-panel panel">
    <div id="profile-panel" class="motion-profile-controls motion-profile-section">
        <button id="motion-controls-toggle" class="motion-profile-section-toggle" aria-expanded="true" aria-controls="motion-controls-content" type="button">
            <span>Motion Profile Controls</span>
            <span class="motion-profile-section-caret">▾</span>
        </button>
        <div id="motion-controls-content" class="motion-profile-section-content">
            <!-- distance, velocity, acceleration, yoyo, play/pause, reset controls -->
        </div>
    </div>

    <div id="motion-viz-section" class="motion-profile-graphs motion-profile-section">
        <button id="motion-viz-toggle" class="motion-profile-section-toggle" aria-expanded="true" aria-controls="motion-viz-content" type="button">
            <span>Motion Profile Visualization</span>
            <span class="motion-profile-section-caret">▾</span>
        </button>
        <div id="motion-viz-content" class="motion-profile-section-content">
            <canvas id="canvas"></canvas>
        </div>
    </div>
</div>
```

#### In your demo `main.ts`:

```typescript
import '../../../lib/visualization/ui/styles.css';
import { setupMotionProfilePanel } from '../../../lib/visualization/ui';

const motionPanel = setupMotionProfilePanel({
    initialState: {
        totalDistance: 120,
        maxVelocity: 15,
        maxAcceleration: 15,
        yoyoMode: true,
        isPaused: false,
    },
    onDistanceChange: (value) => {
        // update model + regenerate profile
    },
    onVelocityChange: (value) => {
        // update model + regenerate profile
    },
    onAccelerationChange: (value) => {
        // update model + regenerate profile
    },
    onYoyoModeChange: (enabled) => {
        // update mode + reset/regenerate
    },
    onPlayPause: () => {
        // toggle playback
    },
    onReset: () => {
        // reset playback state
    },
    onSectionCollapseChange: (section) => {
        if (section === 'visualization') {
            // resize canvas after collapse/expand
        }
    },
});

motionPanel.setCollapsed('controls', false);
motionPanel.setCollapsed('visualization', false);
```

`setupMotionProfilePanel` handles:
- Slider/checkbox/button event binding
- Value label synchronization
- Play/pause button label updates via `setPaused(...)`
- Collapsible controls + visualization sections via `setCollapsed(...)`

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

See [docs/UI_ARCHITECTURE.md](../../../docs/UI_ARCHITECTURE.md) for canonical architecture guidance and [docs/UI_STANDARDS.md](../../../docs/UI_STANDARDS.md) for visual standards.
