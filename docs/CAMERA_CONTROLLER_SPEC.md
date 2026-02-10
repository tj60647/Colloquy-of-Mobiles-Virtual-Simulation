# Camera Controller Specification

**Location:** `lib/visualization/utils/CameraController.ts`  
**Phase:** Phase A (Foundation)  
**Purpose:** Standardized camera controls across all 3D demos

---

## Overview

The `CameraController` provides a consistent camera interface for all THREE.js-based demos. It wraps OrbitControls and adds standardized keybindings, preset views, and smooth transitions.

## Design Goals

1. **Consistency:** Same controls across all demos
2. **Intuitive:** Common patterns (orbit, pan, zoom)
3. **Accessible:** Keyboard and mouse support
4. **Smooth:** Animated transitions between views
5. **Flexible:** Configurable for demo-specific needs

---

## Features

### Mouse Controls
- **Left Drag:** Orbit camera around target
- **Right Drag:** Pan camera (translate)
- **Middle Drag:** Dolly (zoom alternative)
- **Scroll Wheel:** Zoom in/out
- **Double Click:** Focus on object under cursor

### Keyboard Controls
- **R:** Reset to default view
- **T:** Toggle perspective/orthographic projection
- **F:** Focus on selected object
- **1:** Top view (looking down Y-axis)
- **2:** Front view (looking along Z-axis)
- **3:** Side view (looking along X-axis)  
- **4:** Isometric view (default 45° angles)
- **H:** Show/hide help overlay

### Preset Views

Each preset smoothly animates camera to standard position:

| Key | View | Camera Position | Look At |
|-----|------|----------------|---------|
| 1 | Top | (0, 100, 0) | (0, 0, 0) |
| 2 | Front | (0, 0, 100) | (0, 0, 0) |
| 3 | Side | (100, 0, 0) | (0, 0, 0) |
| 4 | Isometric | (70, 70, 70) | (0, 0, 0) |

All positions scaled based on scene bounds.

### Projection Toggle

Switch between perspective and orthographic:
- **Perspective:** Natural 3D view with depth
- **Orthographic:** Technical view, no perspective distortion

Useful for:
- Perspective: General viewing, engaging visualization
- Orthographic: Technical analysis, precise measurements

---

## API

### Constructor

```typescript
interface CameraControllerOptions {
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  domElement: HTMLElement;
  enableDamping?: boolean; // default: true
  dampingFactor?: number; // default: 0.05
  enableZoom?: boolean; // default: true
  enablePan?: boolean; // default: true
  enableRotate?: boolean; // default: true
  minDistance?: number; // default: 10
  maxDistance?: number; // default: 1000
  autoRotate?: boolean; // default: false
  autoRotateSpeed?: number; // default: 2.0
}

class CameraController {
  constructor(options: CameraControllerOptions);
}
```

### Methods

```typescript
// Required in animation loop
update(): void;

// View presets (smooth animated transitions)
setTopView(duration?: number): Promise<void>;
setFrontView(duration?: number): Promise<void>;
setSideView(duration?: number): Promise<void>;
setIsometricView(duration?: number): Promise<void>;
resetView(duration?: number): Promise<void>;

// Custom view
setView(position: Vector3, target: Vector3, duration?: number): Promise<void>;

// Focus on object (zoom to fit bounds)
focusOnObject(object: THREE.Object3D, fitOffset?: number): Promise<void>;

// Projection
toggleProjection(): void;
setPerspective(): void;
setOrthographic(): void;

// Target
setTarget(target: Vector3): void;
getTarget(): Vector3;

// State
getState(): CameraState;
setState(state: CameraState): void;
saveState(name: string): void;
loadState(name: string): boolean;

// Enable/disable specific controls
enableControls(enable: boolean): void;
enableAutoRotate(enable: boolean): void;

// Cleanup
dispose(): void;
```

### Events

```typescript
controller.addEventListener('change', () => {
  // Camera has moved
});

controller.addEventListener('start', () => {
  // User started interacting
});

controller.addEventListener('end', () => {
  // User stopped interacting
});

controller.addEventListener('viewchange', (event) => {
  // View preset activated
  console.log(event.view); // 'top' | 'front' | 'side' | 'isometric'
});
```

---

## Usage Examples

### Basic Setup

```typescript
import * as THREE from 'three';
import { CameraController } from './lib/visualization/utils/CameraController';

// Create camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(70, 70, 70);

// Create controller
const controller = new CameraController({
  camera,
  domElement: renderer.domElement,
  enableDamping: true
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controller.update(); // Required!
  renderer.render(scene, camera);
}
```

### With Preset Views

```typescript
// Smoothly transition to top view
await controller.setTopView(1000); // 1 second animation

// Focus on a specific Mobile
const mobile = scene.getObjectByName('Mobile_1');
await controller.focusOnObject(mobile);

// Custom view
await controller.setView(
  new THREE.Vector3(50, 50, 50),
  new THREE.Vector3(10, 0, 0),
  1500 // 1.5 seconds
);
```

### Save/Restore Views

```typescript
// Save current camera position
controller.saveState('my_favorite_view');

// Later, restore it
controller.loadState('my_favorite_view');

// States stored in localStorage (persists across sessions)
```

### For Demo-Specific Customization

```typescript
// Disable pan for this demo
const controller = new CameraController({
  camera,
  domElement: renderer.domElement,
  enablePan: false
});

// Enable auto-rotate
controller.enableAutoRotate(true);

// Pause auto-rotate on user interaction
controller.addEventListener('start', () => {
  controller.enableAutoRotate(false);
});

controller.addEventListener('end', () => {
  // Resume auto-rotate after 2 seconds of inactivity
  setTimeout(() => controller.enableAutoRotate(true), 2000);
});
```

---

## Implementation Details

### Smooth Transitions

Uses TWEEN.js or custom interpolation for smooth camera movements:

```typescript
private animateCamera(
  targetPosition: Vector3,
  targetLookAt: Vector3,
  duration: number
): Promise<void> {
  return new Promise((resolve) => {
    const startPosition = this.camera.position.clone();
    const startLookAt = this.controls.target.clone();
    const startTime = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      
      // Ease-in-out interpolation
      const eased = t < 0.5
        ? 2 * t * t
        : -1 + (4 - 2 * t) * t;

      this.camera.position.lerpVectors(startPosition, targetPosition, eased);
      this.controls.target.lerpVectors(startLookAt, targetLookAt, eased);
      
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };
    
    animate();
  });
}
```

### Auto-calculated Bounds

Preset view distances adjust to scene size:

```typescript
private calculateSceneBounds(): Box3 {
  const box = new Box3();
  this.scene.traverse((object) => {
    if (object.isMesh) {
      box.expandByObject(object);
    }
  });
  return box;
}

private getPresetDistance(): number {
  const bounds = this.calculateSceneBounds();
  const size = bounds.getSize(new Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  return maxDim * 2; // 2x scene size for good framing
}
```

### Focus on Object

Automatically frames an object in view:

```typescript
focusOnObject(object: THREE.Object3D, fitOffset: number = 1.2): Promise<void> {
  const box = new Box3().setFromObject(object);
  const center = box.getCenter(new Vector3());
  const size = box.getSize(new Vector3());
  
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = this.camera.fov * (Math.PI / 180);
  const distance = maxDim / (2 * Math.tan(fov / 2)) * fitOffset;
  
  const direction = this.camera.position.clone()
    .sub(this.controls.target)
    .normalize();
  const targetPosition = center.clone().add(direction.multiplyScalar(distance));
  
  return this.animateCamera(targetPosition, center, 1000);
}
```

---

## UI Help Overlay

When user presses 'H', show help overlay:

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
