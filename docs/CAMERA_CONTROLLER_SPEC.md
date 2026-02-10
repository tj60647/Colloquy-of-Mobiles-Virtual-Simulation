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

Help modal shows camera controls (triggered by info button):

```html
<div id="camera-help" class="help-overlay" style="display: none;">
  <h3>Camera Controls</h3>
  
  <section>
    <h4>Mouse</h4>
    <ul>
      <li><strong>Left Drag:</strong> Rotate view</li>
      <li><strong>Right Drag:</strong> Pan view</li>
      <li><strong>Scroll:</strong> Zoom in/out</li>
      <li><strong>Double Click:</strong> Focus on object</li>
    </ul>
  </section>
  
  <section>
    <h4>Keyboard</h4>
    <ul>
      <li><strong>R:</strong> Reset view</li>
      <li><strong>T:</strong> Toggle projection</li>
      <li><strong>F:</strong> Focus on selection</li>
      <li><strong>1-4:</strong> Preset views</li>
      <li><strong>H:</strong> Toggle this help</li>
    </ul>
  </section>
  
  <button onclick="this.parentElement.style.display='none'">Close</button>
</div>
```

Auto-styled in `demo-template/public/styles.css`

---

## Testing

### Test Cases

1. **Mouse Controls:**
   - Orbit works in all directions
   - Pan doesn't affect rotation center
   - Zoom respects min/max distance

2. **Keyboard Shortcuts:**
   - All keys trigger correct actions
   - No conflicts with browser shortcuts
   - Help overlay shows/hides

3. **Preset Views:**
   - Smooth animation to each preset
   - Correct camera orientation
   - Scales properly for different scene sizes

4. **Projection Toggle:**
   - Maintains view direction when switching
   - Orthographic camera has correct frustum
   - Zoom works in both modes

5. **Focus:**
   - Frames object correctly
   - Works with different object sizes
   - Maintains up vector

6. **State Persistence:**
   - Save/load preserves position and target
   - localStorage works across sessions
   - Handle missing states gracefully

### Demo Test App

Create `apps/demo-TS-00-camera-test/` to validate CameraController:
- Scene with various objects (cubes, spheres, complex meshes)
- UI to test all features
- Visual feedback for each action
- Performance monitoring

---

## Browser Compatibility

- **Modern Browsers:** Chrome, Firefox, Safari, Edge (last 2 versions)
- **WebGL:** Required (fail gracefully if not available)
- **Pointer Events:** Use for better touch support
- **LocalStorage:** Optional (state persistence degrades gracefully)

---

## Accessibility Considerations

- Keyboard navigation for all camera functions
- Visual indicators for active camera mode
- Clear instructions in help overlay
- Configurable sensitivity for users with motor impairments
- Reduced motion option (instant view changes instead of animated)

---

## Related Files

- **Implementation:** `lib/visualization/utils/CameraController.ts`
- **Tests:** `lib/visualization/utils/__tests__/CameraController.test.ts`
- **Test Demo:** `apps/demo-TS-00-camera-test/`
- **CSS Styles:** `apps/demo-TS-template/public/styles.css` (help overlay)
- **Documentation:** This file

---

## Dependencies

- THREE.js (OrbitControls)
- (Optional) TWEEN.js for advanced easing

---

## Future Enhancements

- [ ] Touch gestures (pinch to zoom, two-finger pan)
- [ ] Gamepad support
- [ ] VR camera rig (for WebXR demos)
- [ ] Camera path animation (for recordings)
- [ ] Multiple camera bookmarks
- [ ] Collision detection (prevent camera going through objects)
- [ ] Follow mode (camera follows moving object)
