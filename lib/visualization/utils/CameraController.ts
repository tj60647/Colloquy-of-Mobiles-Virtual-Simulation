/**
 * CameraController.ts
 *
 * Standardized camera interface for all 3D demos.
 * Provides orbit, pan, zoom, preset views, and keyboard shortcuts.
 *
 * @see docs/CAMERA_CONTROLLER_SPEC.md
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface CameraControllerConfig {
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  domElement: HTMLElement;
  initialPosition?: THREE.Vector3;
  initialTarget?: THREE.Vector3;
  enableDamping?: boolean;
  dampingFactor?: number;
  minDistance?: number;
  maxDistance?: number;
}

export interface PresetView {
  name: string;
  position: THREE.Vector3;
  target: THREE.Vector3;
}

export class CameraController {
  private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private controls: OrbitControls;
  private domElement: HTMLElement;

  private defaultPosition: THREE.Vector3;
  private defaultTarget: THREE.Vector3;
  private isOrthographic: boolean;

  private presetViews: Map<string, PresetView>;

  constructor(config: CameraControllerConfig) {
    this.camera = config.camera;
    this.domElement = config.domElement;

    // Set up OrbitControls
    this.controls = new OrbitControls(this.camera, this.domElement);
    this.controls.enableDamping = config.enableDamping ?? true;
    this.controls.dampingFactor = config.dampingFactor ?? 0.05;
    this.controls.minDistance = config.minDistance ?? 1;
    this.controls.maxDistance = config.maxDistance ?? 1000;

    // Store defaults
    this.defaultPosition = config.initialPosition?.clone() ?? new THREE.Vector3(10, 10, 10);
    this.defaultTarget = config.initialTarget?.clone() ?? new THREE.Vector3(0, 0, 0);
    this.isOrthographic = this.camera instanceof THREE.OrthographicCamera;

    // Set initial position
    this.camera.position.copy(this.defaultPosition);
    this.controls.target.copy(this.defaultTarget);
    this.controls.update();

    // Initialize preset views
    this.presetViews = new Map();
    this.createPresetViews();

    // Set up keyboard controls
    this.setupKeyboardControls();
  }

  /**
   * Create standard preset views
   */
  private createPresetViews(): void {
    const distance = this.defaultPosition.length();

    this.presetViews.set('top', {
      name: 'Top',
      position: new THREE.Vector3(0, distance, 0),
      target: new THREE.Vector3(0, 0, 0),
    });

    this.presetViews.set('front', {
      name: 'Front',
      position: new THREE.Vector3(0, 0, distance),
      target: new THREE.Vector3(0, 0, 0),
    });

    this.presetViews.set('side', {
      name: 'Side',
      position: new THREE.Vector3(distance, 0, 0),
      target: new THREE.Vector3(0, 0, 0),
    });

    this.presetViews.set('isometric', {
      name: 'Isometric',
      position: new THREE.Vector3(distance * 0.7, distance * 0.7, distance * 0.7),
      target: new THREE.Vector3(0, 0, 0),
    });
  }

  /**
   * Set up keyboard shortcut handlers
   * Note: Help (H key) is handled by the demo's UI layer
   */
  private setupKeyboardControls(): void {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'r':
          this.reset();
          break;
        case 't':
          this.toggleProjection();
          break;
        case 'f':
          this.focusOnCenter();
          break;
        case '1':
          this.setPresetView('top');
          break;
        case '2':
          this.setPresetView('front');
          break;
        case '3':
          this.setPresetView('side');
          break;
        case '4':
          this.setPresetView('isometric');
          break;
      }
    };

    this.domElement.addEventListener('keydown', handleKeyDown);

    // Ensure canvas can receive keyboard events
    if (this.domElement instanceof HTMLCanvasElement) {
      this.domElement.tabIndex = 1;
    }
  }

  /**
   * Reset camera to default position
   */
  reset(): void {
    this.animateCameraTo(this.defaultPosition, this.defaultTarget);
  }

  /**
   * Toggle between perspective and orthographic projection
   */
  toggleProjection(): void {
    console.log('Note: Projection toggle requires camera swap - not implemented in this version');
    // Note: Switching between PerspectiveCamera and OrthographicCamera
    // requires recreating the camera object, which should be handled by the demo
  }

  /**
   * Focus camera on current target
   */
  focusOnCenter(): void {
    this.animateCameraTo(this.camera.position, this.controls.target);
  }

  /**
   * Focus camera on a specific object
   */
  focusOnObject(object: THREE.Object3D): void {
    const bbox = new THREE.Box3().setFromObject(object);
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 2;

    const direction = this.camera.position.clone().sub(this.controls.target).normalize();
    const newPosition = center.clone().add(direction.multiplyScalar(distance));

    this.animateCameraTo(newPosition, center);
  }

  /**
   * Set camera to a preset view
   */
  setPresetView(viewName: string): void {
    const preset = this.presetViews.get(viewName);
    if (preset) {
      this.animateCameraTo(preset.position, preset.target);
    }
  }

  /**
   * Smoothly animate camera to new position and target
   * Uses spherical interpolation for natural arc motion
   */
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

    // Convert positions to spherical coordinates
    const startRelative = startPosition.clone().sub(startTarget);
    const endRelative = newPosition.clone().sub(newTarget);
    
    const startSpherical = new THREE.Spherical().setFromVector3(startRelative);
    const endSpherical = new THREE.Spherical().setFromVector3(endRelative);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Ease in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Interpolate spherical coordinates
      const interpolatedSpherical = new THREE.Spherical(
        THREE.MathUtils.lerp(startSpherical.radius, endSpherical.radius, eased),
        THREE.MathUtils.lerp(startSpherical.phi, endSpherical.phi, eased),
        THREE.MathUtils.lerp(startSpherical.theta, endSpherical.theta, eased)
      );

      // Interpolate target
      const interpolatedTarget = new THREE.Vector3().lerpVectors(startTarget, newTarget, eased);

      // Convert back to Cartesian and set camera position
      const interpolatedPosition = new THREE.Vector3().setFromSpherical(interpolatedSpherical);
      this.camera.position.copy(interpolatedPosition).add(interpolatedTarget);
      this.controls.target.copy(interpolatedTarget);
      this.controls.update();

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        // Ensure final position is exact
        this.camera.position.copy(newPosition);
        this.controls.target.copy(newTarget);
        this.controls.update();
        this.controls.enabled = wasEnabled;
      }
    };

    animate();
  }

  /**
   * Get help text for camera controls
   * (Help display is handled by the demo's UI layer)
   */
  getHelpText(): string {
    return `
Camera Controls:
- Left Mouse Drag: Rotate (orbit)
- Right Mouse Drag: Pan
- Mouse Wheel: Zoom
- R: Reset to default view
- T: Toggle perspective/orthographic
- F: Focus on center
- 1: Top view
- 2: Front view
- 3: Side view
- 4: Isometric view
- H: Show this help
        `.trim();
  }

  /**
   * Update controls (call in animation loop)
   */
  update(): void {
    this.controls.update();
  }

  /**
   * Enable or disable controls
   */
  setEnabled(enabled: boolean): void {
    this.controls.enabled = enabled;
  }

  /**
   * Get the OrbitControls instance for advanced customization
   */
  getControls(): OrbitControls {
    return this.controls;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.controls.dispose();
  }
}
