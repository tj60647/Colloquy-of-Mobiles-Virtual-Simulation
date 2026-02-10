/**
 * Demo 1: Transform Hierarchy
 *
 * Demonstrates parent-child transform relationships in the scene graph.
 * Shows how child transforms inherit parent transformations.
 */

import '../../../lib/visualization/ui/styles.css';
import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { Environment } from '../../../lib/Environment';
import { SceneGraphLoader } from '../../../lib/SceneGraphLoader';
import { ThreeJSRenderer } from '../../../lib/visualization/renderers/ThreeJSRenderer';
import { setupCameraControls } from '../../../lib/visualization/ui';
import type { SimulationState } from '../../../lib/types';

// Global rotation speed control
let rotationSpeed = 0.0025;

// Transform offset constant for child positioning
const TRANSFORM_OFFSET = 96;

// Material definitions
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0,
  roughness: 0,
  transmission: 1,
  opacity: 0.5,
  transparent: true,
  reflectivity: 0.9,
  ior: 1.5,
  clearcoat: 1,
  clearcoatRoughness: 0.5,
});

const chromeMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 1,
  roughness: 0,
  transmission: 0,
  opacity: 1,
  transparent: false,
  reflectivity: 0.9,
  ior: 1,
  clearcoat: 1,
  clearcoatRoughness: 1,
});

interface CoordinateSystem {
  id: string;
  name: string;
  parent: string | null;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

interface DemoConfig {
  version: string;
  name: string;
  description: string;
  coordinateSystems: CoordinateSystem[];
  mobiles: any[];
}

/**
 * Main application class
 */
class Demo1App {
  private environment: Environment;
  private renderer: ThreeJSRenderer;
  private labelRenderer: CSS2DRenderer;
  private animationId: number | null = null;
  private transformObjects: Map<string, THREE.Object3D> = new Map();
  public isOrbiting: boolean = false;
  private cameraRig: THREE.Group | null = null;
  public orbitSpeed: number = 0.005;
  private config: DemoConfig | null = null;
  private jsonLiveMode: boolean = false;

  constructor() {
    // Get canvas element
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    // Create renderer
    this.renderer = new ThreeJSRenderer({
      canvas,
      backgroundColor: 0xffffff,
      enableShadows: true,
    });

    // Create CSS2D renderer for labels
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0';
    this.labelRenderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild(this.labelRenderer.domElement);

    // Add grid for reference
    // Use darker grid for white background
    const grid = new THREE.PolarGridHelper(120, 8, 10, 128, 0x888888, 0xcccccc);
    this.renderer.addToScene(grid);

    // Initialize environment
    this.environment = new Environment();
  }

  /**
   * Load configuration and create scene
   */
  async loadConfig(configPath: string): Promise<void> {
    try {
      // Fetch and parse config
      const response = await fetch(configPath);
      const config: DemoConfig = await response.json();
      
      // Store config for JSON display
      this.config = config;

      // Load environment (even though it's empty for this demo)
      this.environment = await SceneGraphLoader.loadFromFile(configPath);

      // Create THREE.js visualizations for coordinate systems
      this.createTransformVisualizations(config.coordinateSystems);
      
      // Setup JSON display
      this.setupJsonDisplay();

      console.log('Configuration loaded successfully');
      console.log(
        'Transform hierarchy created with',
        config.coordinateSystems.length,
        'transforms'
      );
    } catch (error) {
      console.error('Failed to load configuration:', error);
      throw error;
    }
  }

  /**
   * Setup JSON display toggle
   */
  private setupJsonDisplay(): void {
    const toggleButton = document.getElementById('json-toggle');
    const jsonPanel = document.getElementById('json-panel');
    const closeButton = document.getElementById('json-close');
    const jsonContent = document.getElementById('json-content');
    const liveCheckbox = document.getElementById('json-live-checkbox') as HTMLInputElement;
    const liveToggle = document.getElementById('json-live-toggle');
    
    if (!toggleButton || !jsonPanel || !closeButton || !jsonContent || !liveCheckbox || !liveToggle) return;
    
    // Display formatted JSON with colored rotation values
    if (this.config) {
      jsonContent.innerHTML = this.formatJsonWithColors(this.config);
    }
    
    // Toggle panel visibility
    toggleButton.addEventListener('click', () => {
      const isVisible = jsonPanel.classList.toggle('visible');
      toggleButton.textContent = isVisible ? 'Hide JSON' : 'Show JSON';
      if (isVisible) {
        toggleButton.style.display = 'none';
      }
    });
    
    // Close button
    closeButton.addEventListener('click', () => {
      jsonPanel.classList.remove('visible');
      toggleButton.textContent = 'Show JSON';
      toggleButton.style.display = 'block';
    });
    
    // Live mode toggle
    liveCheckbox.addEventListener('change', () => {
      this.jsonLiveMode = liveCheckbox.checked;
      if (liveCheckbox.checked) {
        liveToggle.classList.add('active');
      } else {
        liveToggle.classList.remove('active');
        // Reset to static config
        if (this.config) {
          jsonContent.innerHTML = this.formatJsonWithColors(this.config);
        }
      }
    });
  }

  /**
   * Format JSON with colored rotation values
   */
  private formatJsonWithColors(config: DemoConfig): string {
    let json = JSON.stringify(config, null, 2);
    
    // Color rotation values: x=red, y=green, z=blue (matching axis helper)
    json = json.replace(/"x":\s*(-?\d+\.?\d*)/g, (match, value) => {
      if (match.includes('"x"')) {
        // Check if this is in a rotation context by looking ahead in the string
        return `"x": <span style="color: #ff8080">${value}</span>`;
      }
      return match;
    });
    
    json = json.replace(/"y":\s*(-?\d+\.?\d*)/g, (match, value) => {
      return `"y": <span style="color: #80ff80">${value}</span>`;
    });
    
    json = json.replace(/"z":\s*(-?\d+\.?\d*)/g, (match, value) => {
      return `"z": <span style="color: #8080ff">${value}</span>`;
    });
    
    return json;
  }

  /**
   * Create THREE.js objects for each coordinate system
   */
  private createTransformVisualizations(systems: CoordinateSystem[]): void {
    const jointRadius = 6; // diameter 12
    const linkRadius = 6; // diameter 12 - same as sphere
    
    // Build the hierarchy
    for (const cs of systems) {
      const group = new THREE.Group();
      group.name = cs.name;

      // Add sphere at joint using glass material
      const sphereGeometry = new THREE.SphereGeometry(jointRadius, 32, 32);
      const sphere = new THREE.Mesh(sphereGeometry, glassMaterial);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      group.add(sphere);

      // Add axes helper with chrome material
      const axesSize = jointRadius * 1.5;
      const axes = new THREE.AxesHelper(axesSize);
      group.add(axes);

      // Add axis labels
      this.createAxisLabel(group, 'X', new THREE.Vector3(axesSize + 2, 0, 0), '#ff4444');
      this.createAxisLabel(group, 'Y', new THREE.Vector3(0, axesSize + 2, 0), '#44ff44');
      this.createAxisLabel(group, 'Z', new THREE.Vector3(0, 0, axesSize + 2), '#4444ff');

      // Add text label
      const labelDiv = document.createElement('div');
      // Add card styling
      labelDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
      labelDiv.style.color = '#000000';
      labelDiv.style.padding = '4px 8px';
      labelDiv.style.borderRadius = '4px';
      labelDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      labelDiv.style.fontFamily = 'monospace';
      labelDiv.style.fontWeight = 'bold';
      labelDiv.style.border = '1px solid #ccc';
      
      labelDiv.className = 'transform-label';
      labelDiv.textContent = cs.name;
      const label = new CSS2DObject(labelDiv);
      label.visible = false;
      label.position.set(0, jointRadius + 8, 0);
      group.add(label);

      // Set initial position and rotation
      group.position.set(cs.position.x, cs.position.y, cs.position.z);
      group.rotation.set(cs.rotation.x, cs.rotation.y, cs.rotation.z);

      // Store in map
      this.transformObjects.set(cs.id, group);

      // Add to scene (parent will be set in next loop)
      if (!cs.parent) {
        this.renderer.addToScene(group);
      }
    }

    // Set up parent-child relationships and add connecting links
    for (const cs of systems) {
      if (cs.parent) {
        const parent = this.transformObjects.get(cs.parent);
        const child = this.transformObjects.get(cs.id);
        if (parent && child) {
          // Add cylinder link between parent and child
          const linkLength = Math.sqrt(
            cs.position.x ** 2 + cs.position.y ** 2 + cs.position.z ** 2
          );
          
          if (linkLength > 0) {
            const cylinderGeometry = new THREE.CylinderGeometry(
              linkRadius,
              linkRadius,
              linkLength,
              16,
              1,
              true // open ended
            );
            const cylinder = new THREE.Mesh(cylinderGeometry, glassMaterial);
            cylinder.castShadow = true;
            cylinder.receiveShadow = true;
            
            // Position cylinder halfway between origin and child position
            cylinder.position.set(
              cs.position.x / 2,
              cs.position.y / 2,
              cs.position.z / 2
            );
            
            // Orient cylinder toward child position
            const direction = new THREE.Vector3(cs.position.x, cs.position.y, cs.position.z).normalize();
            const axis = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
            const angle = Math.acos(new THREE.Vector3(0, 1, 0).dot(direction));
            if (axis.length() > 0) {
              cylinder.quaternion.setFromAxisAngle(axis, angle);
            }
            
            parent.add(cylinder);
          }
          
          parent.add(child);
        }
      }
    }
  }

  /**
   * Helper to create colored axis labels
   */
  private createAxisLabel(parent: THREE.Group, text: string, position: THREE.Vector3, color: string): void {
    const div = document.createElement('div');
    div.className = 'axis-label';
    div.textContent = text;
    div.style.color = color;
    div.style.fontFamily = 'monospace';
    div.style.fontSize = '12px';
    div.style.fontWeight = 'bold';
    
    const label = new CSS2DObject(div);
    label.position.copy(position);
    parent.add(label);
  }

  /**
   * Toggle visibility of node labels
   */
  setNodeLabelsVisible(visible: boolean): void {
    this.transformObjects.forEach((group) => {
      group.traverse((child) => {
        if (child instanceof CSS2DObject && child.element.classList.contains('transform-label')) {
          child.visible = visible;
        }
      });
    });
  }

  /**
   * Start the animation loop
   */
  start(): void {
    const animate = () => {
      // Update orbit if active
      if (this.isOrbiting) {
        this.updateOrbit();
      }

      // Animate the hierarchy
      this.animateTransforms();

      // Render visualization directly (bypass state-based rendering)
      // Disable camera controller updates when mutually exclusive orbit mode is active
      this.renderer.renderDirect(!this.isOrbiting);

      // Render labels
      this.labelRenderer.render(this.renderer.getScene(), this.renderer.getCamera());
      
      // Update JSON if live mode is enabled
      if (this.jsonLiveMode) {
        this.updateLiveJson();
      }

      // Continue loop
      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Update JSON display with live transform data
   */
  private updateLiveJson(): void {
    const jsonContent = document.getElementById('json-content');
    if (!jsonContent || !this.config) return;
    
    // Create live config with current transform states
    const liveConfig = {
      ...this.config,
      coordinateSystems: this.config.coordinateSystems.map(cs => {
        const obj = this.transformObjects.get(cs.id);
        if (!obj) return cs;
        
        return {
          ...cs,
          position: {
            x: parseFloat(obj.position.x.toFixed(4)),
            y: parseFloat(obj.position.y.toFixed(4)),
            z: parseFloat(obj.position.z.toFixed(4))
          },
          rotation: {
            x: parseFloat(obj.rotation.x.toFixed(4)),
            y: parseFloat(obj.rotation.y.toFixed(4)),
            z: parseFloat(obj.rotation.z.toFixed(4))
          }
        };
      })
    };
    
    jsonContent.innerHTML = this.formatJsonWithColors(liveConfig);
  }

  /**
   * Update camera orbit animation
   */
  private updateOrbit(): void {
    if (this.cameraRig) {
      this.cameraRig.rotation.y += this.orbitSpeed;
    }
  }

  /**
   * Start orbit mode
   */
  startOrbit(): void {
    const camera = this.renderer.getCamera();

    if (!this.cameraRig) {
      // Create camera rig
      this.cameraRig = new THREE.Group();
      this.cameraRig.name = 'cameraRig';

      // Calculate rig rotation from current camera position
      const currentAngle = Math.atan2(camera.position.z, camera.position.x);
      this.cameraRig.rotation.y = currentAngle;

      // Get camera's world position before reparenting
      const worldPosition = new THREE.Vector3();
      camera.getWorldPosition(worldPosition);

      // Add rig to scene
      this.renderer.addToScene(this.cameraRig);

      // Attach camera to rig
      this.cameraRig.attach(camera);

      console.log('Orbit mode enabled - camera attached to rig');
    }
  }

  /**
   * Stop orbit mode
   */
  stopOrbit(): void {
    const camera = this.renderer.getCamera();

    if (this.cameraRig) {
      // Get camera's world position/rotation before reparenting
      const worldPosition = new THREE.Vector3();
      const worldQuaternion = new THREE.Quaternion();
      camera.getWorldPosition(worldPosition);
      camera.getWorldQuaternion(worldQuaternion);

      // Remove camera from rig (returns to previous parent)
      this.cameraRig.remove(camera);

      // Add camera back to scene with preserved world transform
      this.renderer.addToScene(camera);
      camera.position.copy(worldPosition);
      camera.quaternion.copy(worldQuaternion);

      // Remove rig from scene
      this.renderer.getScene().remove(this.cameraRig);
      this.cameraRig = null;

      console.log('Orbit mode disabled - camera restored to scene');
    }
  }

  /**
   * Animate transforms to show hierarchy
   */
  private animateTransforms(): void {
    // Rotate root (children inherit this)
    const root = this.transformObjects.get('root');
    if (root) {
      root.rotation.y += rotationSpeed;
    }

    // Add local rotation to child
    const child = this.transformObjects.get('child');
    if (child) {
      child.rotation.y += rotationSpeed;
    }

    // Add local rotation to grandchild
    const grandchild = this.transformObjects.get('grandchild');
    if (grandchild) {
      grandchild.rotation.y += rotationSpeed;
    }

    // Add local rotation to great-grandchild
    const greatGrandchild = this.transformObjects.get('great-grandchild');
    if (greatGrandchild) {
      greatGrandchild.rotation.y += rotationSpeed;
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
    if (this.labelRenderer.domElement.parentNode) {
      this.labelRenderer.domElement.parentNode.removeChild(this.labelRenderer.domElement);
    }
  }
}

/**
 * Initialize and start the demo
 */
async function init() {
  const app = new Demo1App();

  // Set up UI controls
  setupTransformControls();
  setupLabelControl(app);

  // Set up camera controls with orbit controls
  setupCameraControls({
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

  try {
    // Load relative to the current path (essential for subdirectory deployment)
    await app.loadConfig('config.json');
    app.start();
    console.log('Demo 1: Transform Hierarchy started');
    console.log('Watch the hierarchy rotate - children inherit parent transformations!');
  } catch (error) {
    console.error('Failed to initialize demo:', error);
  }

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    app.dispose();
  });
}

/**label toggle control
 */
function setupLabelControl(app: Demo1App) {
  const toggle = document.getElementById('labels-toggle') as HTMLInputElement;
  if (!toggle) return;

  toggle.addEventListener('change', (event) => {
    app.setNodeLabelsVisible((event.target as HTMLInputElement).checked);
  });
}

/**
 * Set up 
 * Set up rotation speed control UI
 */
function setupTransformControls() {
  const slider = document.getElementById('rotation-slider') as HTMLInputElement;
  const valueDisplay = document.getElementById('rotation-value');

  if (!slider || !valueDisplay) return;

  // Update rotation speed and display when slider changes
  slider.addEventListener('input', (event) => {
    rotationSpeed = parseFloat((event.target as HTMLInputElement).value);
    valueDisplay.textContent = rotationSpeed.toFixed(4);
  });
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
