/**
 * ThreeJSRenderer.ts
 *
 * Pure adapter for rendering simulation state with THREE.js.
 * NEVER modifies simulation state - read-only visualization.
 *
 * @see docs/DEMO_REFACTORING_PLAN.md
 */

import * as THREE from 'three';
import { CameraController } from '../utils/CameraController';
import type { SimulationState, MobileState, TransformState } from '../../types';

export interface RendererConfig {
  canvas: HTMLCanvasElement;
  width?: number;
  height?: number;
  backgroundColor?: number;
  enableShadows?: boolean;
}

/**
 * Base ThreeJS renderer for simulation visualization.
 * Demos can extend this to add custom visualization logic.
 */
export class ThreeJSRenderer {
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected renderer: THREE.WebGLRenderer;
  protected cameraController: CameraController;

  // Object caching for performance
  protected objectCache: Map<number, THREE.Object3D>;

  constructor(config: RendererConfig) {
    const width = config.width ?? window.innerWidth;
    const height = config.height ?? window.innerHeight;

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(config.backgroundColor ?? 0x1a1a1a);

    // Create camera
    // Use PerspectiveCamera for 3D visualization. Parameters: fov, aspect, near, far
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: config.canvas,
      antialias: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    if (config.enableShadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // Create camera controller
    this.cameraController = new CameraController({
      camera: this.camera,
      domElement: config.canvas,
      initialPosition: new THREE.Vector3(180, 120, 180),
      initialTarget: new THREE.Vector3(0, 0, 0),
    });

    // Initialize object cache
    this.objectCache = new Map();

    // Set up default lighting
    this.setupDefaultLighting();

    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
  }

  /**
   * Set up default scene lighting
   */
  protected setupDefaultLighting(): void {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    // Directional light for shadows and definition
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Hemisphere light for softer ambient
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x545454, 0.3);
    this.scene.add(hemisphereLight);
  }

  /**
   * Render a single frame from simulation state
   * This is the main entry point - reads state, updates scene, renders
   */
  render(state: SimulationState): void {
    // Update scene objects from state
    this.updateScene(state);

    // Update camera controller
    this.cameraController.update();

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Render directly without updating from state
   * Useful for demos that manage their own scene objects
   * @param updateControls Whether to update camera controls (default: true)
   */
  renderDirect(updateControls: boolean = true): void {
    // Update camera controller
    if (updateControls) {
      this.cameraController.update();
    }

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Update THREE.js scene from simulation state
   */
  protected updateScene(state: SimulationState): void {
    const currentIds = new Set<number>();

    // Update or create objects for each mobile
    if (state.mobiles) {
      for (const mobileState of state.mobiles) {
        currentIds.add(mobileState.id);
        this.updateMobile(mobileState);
      }
    }

    // Remove objects that no longer exist in simulation
    for (const [id, object] of this.objectCache.entries()) {
      if (!currentIds.has(id)) {
        this.scene.remove(object);
        this.objectCache.delete(id);
        this.disposeObject(object);
      }
    }
  }

  /**
   * Update or create a Mobile visualization
   */
  protected updateMobile(state: MobileState): void {
    let object = this.objectCache.get(state.id);

    if (!object) {
      object = this.createMobileObject(state);
      this.objectCache.set(state.id, object);
      this.scene.add(object);
    }

    // Update transform (position, rotation)
    this.updateTransform(object, state.transform);

    // Update visual properties (override in subclass for custom behavior)
    this.updateMobileVisuals(object, state);
  }

  /**
   * Create THREE.js object for a Mobile
   * Override in subclass for custom visualization
   */
  protected createMobileObject(state: MobileState): THREE.Object3D {
    const group = new THREE.Group();
    group.name = state.name;

    // Create simple body geometry (box for now)
    const bodyGeometry = new THREE.BoxGeometry(1, 2, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3498db });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Add coordinate axes helper
    const axesHelper = new THREE.AxesHelper(2);
    group.add(axesHelper);

    return group;
  }

  /**
   * Update Mobile visual properties (colors, states, etc.)
   * Override in subclass for custom behavior
   */
  protected updateMobileVisuals(object: THREE.Object3D, state: MobileState): void {
    // Base implementation does nothing
    // Subclasses can override to visualize drive states, etc.
  }

  /**
   * Update object transform from state
   */
  protected updateTransform(object: THREE.Object3D, transform: TransformState): void {
    object.position.set(transform.position.x, transform.position.y, transform.position.z);

    object.rotation.set(transform.rotation.pitch, transform.rotation.yaw, transform.rotation.roll);

    if (transform.scale) {
      object.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
    }
  }

  /**
   * Handle window resize
   */
  protected handleResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  /**
   * Add a polar grid helper to the scene (circular/radial grid)
   */
  addGrid(): void {
    // Use PolarGridHelper for circular visualization
    // Parameters: radius, sectors, rings, divisions, color1, color2
    const grid = new THREE.PolarGridHelper(120, 8, 10, 128, 0xcccccc, 0xdddddd);
    this.scene.add(grid);
  }

  /**
   * Add an object to the scene (for external objects like coordinateSystems)
   */
  addToScene(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  /**
   * Get the scene (for advanced customization)
   */
  getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Get the camera (for advanced customization)
   */
  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  /**
   * Get the camera controller
   */
  getCameraController(): CameraController {
    return this.cameraController;
  }

  /**
   * Dispose of THREE.js object and its resources
   */
  protected disposeObject(object: THREE.Object3D): void {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => mat.dispose());
        } else {
          child.material?.dispose();
        }
      }
    });
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    // Dispose all cached objects
    for (const object of this.objectCache.values()) {
      this.disposeObject(object);
    }
    this.objectCache.clear();

    // Dispose renderer
    this.renderer.dispose();

    // Dispose camera controller
    this.cameraController.dispose();
  }
}
