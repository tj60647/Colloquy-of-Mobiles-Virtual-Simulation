# Camera Controller Specification

**Location:** `lib/visualization/utils/CameraController.ts`  
**UI Component:** `lib/visualization/ui/CameraControlPanel.ts`  
**Phase:** Phase A (Foundation) - **IMPLEMENTED**  
**Purpose:** Standardized camera controls across all 3D demos

---

## Overview

The camera control system provides consistent camera interaction across all THREE.js-based demos. It consists of two main components:

1. **CameraController** - Core camera logic wrapping THREE.js OrbitControls
2. **CameraControlPanel** - Shared UI component for camera buttons and controls

## Design Goals

1. **Consistency:** Same controls across all demos ✅
2. **Intuitive:** Common patterns (orbit, pan, zoom) ✅
3. **Accessible:** Keyboard and mouse support ✅
4. **Smooth:** Animated transitions between views ✅
5. **Flexible:** Configurable for demo-specific needs ✅

---

## Features

### Mouse Controls (OrbitControls)
- **Left Drag:** Orbit camera around target
- **Right Drag:** Pan camera (translate)
- **Scroll Wheel:** Zoom in/out
- **Damping:** Smooth camera motion with configurable inertia

### Keyboard Shortcuts
- **R:** Reset to default view
- **F:** Focus on center point
- **1:** Top view (looking down Y-axis)
- **2:** Front view (looking along Z-axis)
- **3:** Side view (looking along X-axis)  
- **4:** Isometric view (45° angles)

### UI Controls
- **Reset View Button:** Red button to reset camera (triggers 'R' key)
- **View Preset Buttons:** Top/Front/Side/Iso buttons (triggers '1/2/3/4' keys)
- **Custom Buttons:** Demos can add custom buttons (e.g., Orbit toggle)
- **Info Modal:** Displays camera controls help (triggered by info icon)

### Preset Views

Each preset smoothly animates camera to standard position using spherical interpolation:

| Key | View | Position Formula | Look At |
|-----|------|------------------|---------|
| 1 | Top | (0, distance, 0) | (0, 0, 0) |
| 2 | Front | (0, 0, distance) | (0, 0, 0) |
| 3 | Side | (distance, 0, 0) | (0, 0, 0) |
| 4 | Isometric | (0.7d, 0.7d, 0.7d) | (0, 0, 0) |

Distance = length of initial camera position (e.g., 216 units for [180, 120, 180]).

### Animation System

Camera transitions use:
- **Spherical Interpolation:** Natural arc motion between positions
- **Ease-in-out Cubic:** Smooth acceleration/deceleration
- **Duration:** 500ms default (configurable)
- **Control Disable:** OrbitControls disabled during animation

---

## API Reference

### CameraController Class

**File:** `lib/visualization/utils/CameraController.ts`

#### Constructor

```typescript
interface CameraControllerConfig {
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  domElement: HTMLElement;
  initialPosition?: THREE.Vector3;
  initialTarget?: THREE.Vector3;
  enableDamping?: boolean; // default: true
  dampingFactor?: number; // default: 0.05
  minDistance?: number; // default: 1
  maxDistance?: number; // default: 1000
}

const controller = new CameraController(config);
```

#### Methods

```typescript
// Required in animation loop
update(): void;

// View presets (smooth animated transitions, 500ms duration)
reset(): void;
setPresetView(viewName: 'top' | 'front' | 'side' | 'isometric'): void;

// Camera control
focusOnCenter(): void;
focusOnObject(object: THREE.Object3D): void; // Frames object in view

// Projection toggle (not fully implemented - requires camera swap)
toggleProjection(): void;

// Control state
setEnabled(enabled: boolean): void;
getControls(): OrbitControls; // Access underlying OrbitControls

// Help text
getHelpText(): string; // Returns formatted help text

// Cleanup
dispose(): void;
```

### CameraControlPanel Component

**File:** `lib/visualization/ui/CameraControlPanel.ts`

#### Setup Function

```typescript
interface CameraControlPanelOptions {
  panelId?: string; // default: 'controls-panel'
  canvasId?: string; // default: 'canvas'
  customButtons?: CustomCameraButton[];
  orbitControls?: OrbitControlsConfig;
}

interface CustomCameraButton {
  label: string;
  onClick: () => void;
  className?: string;
  isToggle?: boolean;
  toggleStates?: { on: string; off: string };
}

interface OrbitControlsConfig {
  onToggle: (enabled: boolean) => void;
  onSpeedChange: (speed: number) => void;
  initialSpeed?: number; // default: 0.002
  minSpeed?: number; // default: -0.01
  maxSpeed?: number; // default: 0.01
}

const panel = setupCameraControls(options);
// Returns: { updateToggleButton, setOrbitEnabled, setOrbitSpeed }
```

---

## Usage Examples

### Basic Setup

```typescript
import * as THREE from 'three';
import { ThreeJSRenderer } from '../../../lib/visualization/renderers/ThreeJSRenderer';

// ThreeJSRenderer creates CameraController automatically
const renderer = new ThreeJSRenderer({
  canvas: document.getElementById('canvas') as HTMLCanvasElement,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0xffffff,
});

// Access controller
const controller = renderer.getCameraController();

// Animation loop  
function animate() {
  requestAnimationFrame(animate);
  renderer.render(simulationState);
}
```

### Adding UI Controls

```typescript
import { setupCameraControls } from '../../../lib/visualization/ui';

setupCameraControls({
  panelId: 'controls-panel',
  canvasId: 'canvas',
});
```

HTML structure:
HTML structure:

```html
<div id="controls-panel" class="panel">
  <div class="panel-header">Camera Controls</div>
  <!-- Buttons added dynamically -->
</div>
```

### Custom Orbit Controls

```typescript
import { setupCameraControls } from '../../../lib/visualization/ui';

const cameraPanel = setupCameraControls({
  orbitControls: {
    onToggle: (enabled: boolean) => {
      app.isOrbiting = enabled;
      if (enabled) {
        app.startOrbit();
      } else {
        app.stopOrbit();
      }
    },
    onSpeedChange: (speed: number) => {
      app.orbitSpeed = speed;
    },
    initialSpeed: 0.005,
    minSpeed: -0.005,
    maxSpeed: 0.005,
  },
});
```

### Custom Buttons

```typescript
setupCameraControls({
  customButtons: [
    {
      label: 'Focus',
      onClick: () => {
        controller.focusOnObject(selectedObject);
      },
    },
    {
      label: 'Auto-Rotate',
      isToggle: true,
      toggleStates: { on: 'Auto: On', off: 'Auto: Off' },
      onClick: () => {
        // Toggle auto-rotate logic
      },
    },
  ],
});
```

---

## Implementation Details

### Smooth Camera Transitions

Uses spherical interpolation for natural arc motion:

```typescript
private animateCameraTo(
  newPosition: THREE.Vector3,
  newTarget: THREE.Vector3,
  duration: number = 500
): void {
  const startPosition = this.camera.position.clone();
  const startTarget = this.controls.target.clone();
  const startTime = Date.now();

  // Disable controls during animation
  const wasEnabled = this.controls.enabled;
  this.controls.enabled = false;

  // Convert to spherical coordinates for smooth arc interpolation
  const startRelative = startPosition.clone().sub(startTarget);
  const endRelative = newPosition.clone().sub(newTarget);
  
  const startSpherical = new THREE.Spherical().setFromVector3(startRelative);
  const endSpherical = new THREE.Spherical().setFromVector3(endRelative);

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const t = Math.min(elapsed / duration, 1);

    // Ease in-out cubic: slower at start/end, faster in middle
    const eased = t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Interpolate spherical coordinates (radius, phi, theta)
    const interpolatedSpherical = new THREE.Spherical(
      THREE.MathUtils.lerp(startSpherical.radius, endSpherical.radius, eased),
      THREE.MathUtils.lerp(startSpherical.phi, endSpherical.phi, eased),
      THREE.MathUtils.lerp(startSpherical.theta, endSpherical.theta, eased)
    );

    // Interpolate target position
    const interpolatedTarget = new THREE.Vector3()
      .lerpVectors(startTarget, newTarget, eased);

    // Convert back to Cartesian and apply
    const interpolatedPosition = new THREE.Vector3()
      .setFromSpherical(interpolatedSpherical)
      .add(interpolatedTarget);
      
    this.camera.position.copy(interpolatedPosition);
    this.controls.target.copy(interpolatedTarget);
    this.controls.update();

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      // Ensure exact final position
      this.camera.position.copy(newPosition);
      this.controls.target.copy(newTarget);
      this.controls.update();
      this.controls.enabled = wasEnabled;
    }
  };

  animate();
}
```

**Why spherical interpolation?**
- Linear interpolation moves in straight line (unnatural)
- Spherical creates smooth arc around target point
- Consistent speed throughout (via ease-in-out function)

### Focus on Object Algorithm

Automatically calculates camera distance to frame objects:

```typescript
focusOnObject(object: THREE.Object3D): void {
  // Calculate bounding box
  const bbox = new THREE.Box3().setFromObject(object);
  const center = bbox.getCenter(new THREE.Vector3());
  const size = bbox.getSize(new THREE.Vector3());

  // Use largest dimension
  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = maxDim * 2; // 2x for proper framing

  // Keep current view direction
  const direction = this.camera.position.clone()
    .sub(this.controls.target)
    .normalize();
    
  // Calculate new position along same direction
  const newPosition = center.clone()
    .add(direction.multiplyScalar(distance));

  this.animateCameraTo(newPosition, center);
}
```

### Keyboard Event Handling

Events attached to canvas element to avoid browser conflicts:

```typescript
private setupKeyboardControls(): void {
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case 'r': this.reset(); break;
      case 't': this.toggleProjection(); break;
      case 'f': this.focusOnCenter(); break;
      case '1': this.setPresetView('top'); break;
      case '2': this.setPresetView('front'); break;
      case '3': this.setPresetView('side'); break;
      case '4': this.setPresetView('isometric'); break;
    }
  };

  this.domElement.addEventListener('keydown', handleKeyDown);
  
  // Ensure canvas can receive keyboard events
  if (this.domElement instanceof HTMLCanvasElement) {
    this.domElement.tabIndex = 1;
  }
}
```

### UI Button Creation

CameraControlPanel dynamically creates buttons:

```typescript
// Info button with help modal
const infoButton = document.createElement('button');
infoButton.className = 'camera-info-button';
infoButton.innerHTML = icons.info; // SVG icon
infoButton.addEventListener('click', () => modal.style.display = 'flex');

// Reset button
const resetButton = document.createElement('button');
resetButton.className = 'camera-button reset';
resetButton.textContent = 'Reset View';
resetButton.addEventListener('click', () => {
  // Dispatch 'r' key event to canvas
  canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }));
});

// View preset buttons (Top, Front, Side, Iso)
views.forEach((view) => {
  const button = document.createElement('button');
  button.className = 'camera-button camera-view-button';
  button.textContent = view.label;
  button.addEventListener('click', () => {
    canvas.dispatchEvent(new KeyboardEvent('keydown', { key: view.key }));
  });
  viewsRow.appendChild(button);
});
```

**Design Pattern:** UI buttons dispatch keyboard events to canvas, triggering CameraController's keyboard handlers. This maintains separation between UI and camera logic.

---

## UI Info Modal

Info modal dynamically created with camera controls help:

**Generated HTML Structure:**
```html
<div id="camera-info-modal" style="display: none;">
  <div class="info-card">
    <button class="close-button">×</button>
    <h2>Camera Controls</h2>
    
    <div class="controls-grid">
      <!-- Mouse Controls Section -->
      <div>
        <h3>🖱️ Mouse Controls</h3>
        <ul>
          <li><strong>Left Drag:</strong> Orbit around scene</li>
          <li><strong>Right Drag:</strong> Pan camera</li>
          <li><strong>Scroll Wheel:</strong> Zoom in/out</li>
        </ul>
      </div>
      
      <!-- Keyboard Shortcuts Section -->
      <div>
        <h3>⌨️ Keyboard Shortcuts</h3>
        <ul>
          <li><kbd>R</kbd> Reset to default view</li>
          <li><kbd>F</kbd> Focus on center</li>
          <li><kbd>1</kbd> Top view</li>
          <li><kbd>2</kbd> Front view</li>
          <li><kbd>3</kbd> Side view</li>
          <li><kbd>4</kbd> Isometric view</li>
        </ul>
      </div>
    </div>
  </div>
</div>
```

**Styling:** Modal has dark overlay with backdrop blur. Card uses light mode theme (rgba(255,255,255,0.95)) with blue accent border. Styled in [lib/visualization/ui/styles.css](../lib/visualization/ui/styles.css).

---

## CSS Styling

All camera UI styling defined in `lib/visualization/ui/styles.css`:

```css
/* Camera control buttons */
.camera-button {
    background: rgba(255, 255, 255, 0.9);
    color: #2c3e50;
    border: 1px solid rgba(52, 152, 219, 0.3);
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.camera-button:hover {
    background: rgba(52, 152, 219, 0.2);
    border-color: #3498db;
}

.camera-button.reset {
    background: rgba(231, 76, 60, 0.1);
    border-color: rgba(231, 76, 60, 0.4);
    color: #c0392b;
}

.camera-button.active {
    background: rgba(46, 204, 113, 0.2);
    border-color: #27ae60;
    color: #229954;
}

/* Orbit speed slider */
.camera-slider-container {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
}

.camera-slider {
    flex: 1;
    height: 4px;
    background: rgba(52, 152, 219, 0.2);
    border-radius: 2px;
}

.camera-slider::-webkit-slider-thumb {
    width: 16px;
    height: 16px;
    background: #2980b9;
    border: 2px solid #ffffff;
    border-radius: 50%;
    cursor: pointer;
}

.camera-slider-value {
    font-family: monospace;
    font-size: 12px;
    color: #666666;
    min-width: 60px;
    text-align: right;
}
```

---

## Testing

### Manual Test Cases

**Mouse Controls:**
- ✅ Left drag orbits smoothly in all directions
- ✅ Right drag pans without changing orbit center
- ✅ Scroll zoom respects min/max distance (1-1000 units)
- ✅ Damping provides smooth deceleration

**Keyboard Shortcuts:**
- ✅ R: Resets to initial position (180, 120, 180)
- ✅ F: Centers on origin (0, 0, 0)
- ✅ 1-4: Smooth animated transitions to presets
- ✅ No conflicts with browser shortcuts

**UI Buttons:**
- ✅ Reset button triggers reset animation
- ✅ View preset buttons (Top/Front/Side/Iso) work correctly
- ✅ Info button shows/hides modal
- ✅ Orbit toggle enables/disables slider
- ✅ Slider updates orbit speed in real-time

**Animations:**
- ✅ Smooth 500ms transitions with ease-in-out
- ✅ Natural arc motion via spherical interpolation
- ✅ Controls disabled during animation
- ✅ Exact final positioning (no drift)

### Integration Tests

**With ThreeJSRenderer:**
```typescript
const renderer = new ThreeJSRenderer({ canvas, ... });
const controller = renderer.getCameraController();

// Test camera update in animation loop
function animate() {
  renderer.render(state); // Calls controller.update() internally
}

// Test preset views
controller.setPresetView('top');
// Verify camera position after 500ms
```

**With CameraControlPanel:**
```typescript
const panel = setupCameraControls({
  orbitControls: { onToggle, onSpeedChange, ... },
  customButtons: [{ label: 'Test', onClick: testFn }],
});

// Test programmatic control
panel.setOrbitEnabled(true);
panel.setOrbitSpeed(0.01);
panel.updateToggleButton(0, true);
```

### Test Demo

**Location:** `apps/demo-TS-01-transform-hierarchy/` (serves as camera test)

**Features tested:**
- All keyboard shortcuts (R, F, 1-4)
- All UI buttons (Reset, presets, orbit toggle)
- Custom orbit controls (toggle + slider)
- Focus on object (coordinator system nodes)
- Camera info modal
- Window resize handling

---

## Browser Compatibility

**Supported Browsers:**
- ✅ Chrome 120+ (tested)
- ✅ Firefox 120+ (tested)
- ✅ Edge 120+ (Chromium-based)
- ✅ Safari 17+ (WebKit)

**Requirements:**
- WebGL 1.0 (for THREE.js rendering)
- ES6 modules (native or bundled via Vite)
- CSS3 (backdrop-filter for glass effects)
- Pointer Events API (for mouse/touch input)

**Graceful Degradation:**
- No WebGL: Error message shown
- No keyboard: UI buttons still functional
- Reduced motion preference: Instant view changes (no animation)

---

## Related Files

**Core Implementation:**
- `lib/visualization/utils/CameraController.ts` - Camera logic
- `lib/visualization/ui/CameraControlPanel.ts` - UI component
- `lib/visualization/ui/index.ts` - Exports
- `lib/visualization/ui/icons.ts` - SVG icons
- `lib/visualization/ui/styles.css` - Shared styles

**Renderer Integration:**
- `lib/visualization/renderers/ThreeJSRenderer.ts` - Creates controller, provides `getCameraController()`

**Documentation:**
- `docs/CAMERA_CONTROLLER_SPEC.md` - This file
- `lib/visualization/ui/README.md` - UI components guide

**Examples:**
- `apps/demo-TS-01-transform-hierarchy/` - Full implementation example
- `apps/demo-TS-template/` - Template for new demos

---

## Dependencies

**Runtime:**
- THREE.js v0.168.0+ (OrbitControls from `three/examples/jsm/controls/OrbitControls.js`)

**Development:**
- TypeScript 5+ (for type checking)
- Vite 5+ (for bundling demos)

**No Additional Libraries:** No TWEEN.js - custom animation via requestAnimationFrame

---

## Future Enhancements

**Planned (Priority Order):**
- [ ] **Touch gestures** - Pinch to zoom, two-finger pan/rotate
- [ ] **Projection toggle** - Proper perspective↔orthographic switching (requires camera recreation)
- [ ] **State persistence** - Save/load camera bookmarks to localStorage
- [ ] **Advanced focus** - Multi-object framing, collision avoidance
- [ ] **Camera paths** - Record/playback camera animations for demos
- [ ] **Gamepad support** - Console-style camera control
- [ ] **Accessibility** - Screen reader descriptions, reduced motion mode

**Not Planned:**
- VR camera rig (separate XR controller needed)
- Cinematic camera (different animation system)
- First-person controller (demos are observer-based)

---

## Contribution Guidelines

When modifying camera system:

## Contribution Guidelines

When modifying camera system:

1. **Test in all demos** - Ensure changes work across existing demos
2. **Maintain smooth animations** - Keep 500ms duration, ease-in-out cubic
3. **Preserve keyboard shortcuts** - Don't change R/F/1-4 bindings
4. **Update styles centrally** - Modify `lib/visualization/ui/styles.css`, not individual demos
5. **Document UI changes** - Update help modal if adding controls
6. **Check browser compat** - Test in Chrome, Firefox, Safari
7. **Follow existing patterns** - UI buttons dispatch keyboard events to canvas

### Code Style

```typescript
// ✅ Good: Clear method names, typed parameters
focusOnObject(object: THREE.Object3D): void {
  const bbox = new THREE.Box3().setFromObject(object);
  // ...
}

// ❌ Bad: Generic names, missing types
doFocus(obj) {
  // ...
}
```

### Adding New Preset Views

```typescript
// In CameraController.ts createPresetViews():
this.presetViews.set('custom', {
  name: 'Custom View',
  position: new THREE.Vector3(x, y, z),
  target: new THREE.Vector3(0, 0, 0),
});

// In CameraControlPanel.ts views array:
const views = [
  { label: 'Top', key: '1' },
  { label: 'Front', key: '2' },
  { label: 'Side', key: '3' },
  { label: 'Iso', key: '4' },
  { label: 'Custom', key: '5' }, // Add new preset
];
```

---

## Version History

- **v1.0** (Current) - Initial implementation with OrbitControls, keyboard shortcuts, UI panel
- **v0.5** - Prototype with basic OrbitControls wrapper
- **v0.1** - Spec document created

---

## Summary

The camera controller system provides consistent, intuitive camera controls across all demos through:

- **CameraController.ts** - Core camera logic with smooth animated transitions
- **CameraControlPanel.ts** - Reusable UI component with buttons and info modal  
- **styles.css** - Centralized styling for light mode theme
- **Keyboard shortcuts** - R/F/1-4 for common operations
- **OrbitControls integration** - Familiar mouse interactions

**Key Design Decision:** UI buttons dispatch keyboard events rather than calling controller methods directly. This maintains separation of concerns and ensures keyboard and UI work identically.

**Current Status:** ✅ Fully implemented and deployed in demo-TS-01-transform-hierarchy

**Next Steps:** Touch gesture support, projection toggle completion, state persistence

