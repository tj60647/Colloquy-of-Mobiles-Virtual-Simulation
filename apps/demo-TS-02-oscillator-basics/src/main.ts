/**
 * Demo 2: Oscillator Basics
 *
 * Demonstrates oscillator-driven transform animation with motion profiles.
 * Shows how Mobiles achieve controlled, repeating motion patterns.
 */

import '../../../lib/visualization/ui/styles.css';
import * as THREE from 'three';
import { Environment } from '../../../lib/Environment';
import { SceneGraphLoader } from '../../../lib/SceneGraphLoader';
import { ThreeJSRenderer } from '../../../lib/visualization/renderers/ThreeJSRenderer';
import { setupCameraControls } from '../../../lib/visualization/ui';
import { Mobile } from '../../../lib/Mobile';
import { MotionRequest } from '../../../lib/subsystems/HorizontalControlSubsystem';
import type { SimulationState } from '../../../lib/types';

/**
 * Extended renderer for oscillator visualization
 */
class OscillatorRenderer extends ThreeJSRenderer {
  private mobileObjects: Map<number, THREE.Group> = new Map();

  /**
   * Create visual representation for a Mobile
   */
  protected override createMobileObject(mobileState: any): THREE.Object3D {
    const group = new THREE.Group();
    group.name = mobileState.name || `Mobile ${mobileState.id}`;

    // Create a cylinder to represent the mobile body (vertical post)
    const bodyGeometry = new THREE.CylinderGeometry(3, 3, 40, 16);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: this.getMobileColor(mobileState.id),
      emissive: this.getMobileColor(mobileState.id),
      emissiveIntensity: 0.2,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Add a horizontal arm extending from the body
    const armGeometry = new THREE.BoxGeometry(60, 4, 4);
    const armMaterial = new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      metalness: 0.5,
      roughness: 0.5,
    });
    const arm = new THREE.Mesh(armGeometry, armMaterial);
    arm.position.set(30, 0, 0);
    arm.castShadow = true;
    arm.receiveShadow = true;
    group.add(arm);

    // Add sphere at end of arm to show motion clearly
    const tipGeometry = new THREE.SphereGeometry(6, 16, 16);
    const tipMaterial = new THREE.MeshPhongMaterial({
      color: this.getMobileColor(mobileState.id),
      emissive: this.getMobileColor(mobileState.id),
      emissiveIntensity: 0.3,
    });
    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
    tip.position.set(60, 0, 0);
    tip.castShadow = true;
    tip.receiveShadow = true;
    group.add(tip);

    // Add axes helper
    const axes = new THREE.AxesHelper(20);
    group.add(axes);

    this.mobileObjects.set(mobileState.id, group);
    return group;
  }

  /**
   * Get a distinct color for each mobile
   */
  private getMobileColor(id: number): number {
    const colors = [
      0x3498db, // Blue
      0xe74c3c, // Red
      0x2ecc71, // Green
      0xf39c12, // Orange
    ];
    return colors[id % colors.length];
  }

  /**
   * Clean up
   */
  override dispose(): void {
    this.mobileObjects.clear();
    super.dispose();
  }
}

/**
 * Main application class
 */
class Demo2App {
  private environment: Environment;
  private renderer: OscillatorRenderer;
  private animationId: number | null = null;
  private isPaused: boolean = false;
  private mobiles: Mobile[] = [];

  constructor() {
    // Get canvas element
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    // Create renderer
    this.renderer = new OscillatorRenderer({
      canvas,
      backgroundColor: 0x1a1a2e,
      enableShadows: true,
    });

    // Add grid for reference
    this.renderer.addGrid();

    // Initialize environment (will be set by loadConfig)
    this.environment = new Environment();
  }

  /**
   * Load configuration and create scene
   */
  async loadConfig(configPath: string): Promise<void> {
    try {
      this.environment = await SceneGraphLoader.loadFromFile(configPath);
      
      // Get all mobiles from environment
      this.mobiles = this.environment.mobiles;
      
      console.log(`Loaded ${this.mobiles.length} mobiles`);

      // Initialize all oscillators to RELEASED state (start oscillating)
      for (const mobile of this.mobiles) {
        mobile.horizontalControlSubsystem.setMotion(MotionRequest.RELEASE);
      }

      console.log('Configuration loaded successfully');
    } catch (error) {
      console.error('Failed to load configuration:', error);
      throw error;
    }
  }

  /**
   * Start the animation loop
   */
  start(): void {
    const animate = () => {
      if (!this.isPaused) {
        // Update simulation
        this.environment.update();

        // Get simulation state
        const state: SimulationState = this.environment.toJSON();

        // Render visualization
        this.renderer.render(state);
      }

      // Continue loop
      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Toggle pause/resume
   */
  togglePause(): void {
    this.isPaused = !this.isPaused;
    this.updatePauseButton();
  }

  /**
   * Update pause button text
   */
  private updatePauseButton(): void {
    const button = document.getElementById('pause-button');
    if (button) {
      button.textContent = this.isPaused ? 'Resume' : 'Pause';
    }
  }

  /**
   * Toggle oscillator state between RELEASED and STOPPED
   */
  toggleOscillatorState(): void {
    for (const mobile of this.mobiles) {
      const currentState = mobile.horizontalControlSubsystem.currentMotionRequest;
      if (currentState === MotionRequest.RELEASE) {
        mobile.horizontalControlSubsystem.setMotion(MotionRequest.STOP);
      } else {
        mobile.horizontalControlSubsystem.setMotion(MotionRequest.RELEASE);
      }
    }
    this.updateStateButton();
  }

  /**
   * Update state button text
   */
  private updateStateButton(): void {
    const button = document.getElementById('state-button');
    if (button && this.mobiles.length > 0) {
      const state = this.mobiles[0].horizontalControlSubsystem.currentMotionRequest;
      button.textContent = state === MotionRequest.RELEASE ? 'Stop All' : 'Release All';
    }
  }

  /**
   * Stop the animation loop
   */
  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
    this.renderer.dispose();
  }
}

/**
 * Setup simulation controls
 */
function setupSimulationControls(app: Demo2App): void {
  // Pause button
  const pauseButton = document.getElementById('pause-button');
  if (pauseButton) {
    pauseButton.addEventListener('click', () => {
      app.togglePause();
    });
  }

  // State button
  const stateButton = document.getElementById('state-button');
  if (stateButton) {
    stateButton.addEventListener('click', () => {
      app.toggleOscillatorState();
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      event.preventDefault();
      app.togglePause();
    } else if (event.code === 'KeyS') {
      event.preventDefault();
      app.toggleOscillatorState();
    }
  });
}

/**
 * Initialize and run the demo
 */
async function init() {
  try {
    // Create app
    const app = new Demo2App();

    // Setup UI
    setupInfoModal();
    setupCameraControls();
    setupSimulationControls(app);

    // Load configuration (relative path for Vite dev server)
    await app.loadConfig('config.json');

    // Start simulation
    app.start();

    // Handle window resize
    window.addEventListener('resize', () => {
      // Renderer handles its own resize
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      app.dispose();
    });

  } catch (error) {
    console.error('Failed to initialize demo:', error);
    alert('Failed to load demo. Check console for details.');
  }
}

/**
 * Set up info modal interactions
 */
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

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
