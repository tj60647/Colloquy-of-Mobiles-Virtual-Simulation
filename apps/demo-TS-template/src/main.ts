/**
 * main.ts - Demo Template Entry Point
 *
 * This template demonstrates the standard pattern for all demos:
 * 1. Load simulation configuration
 * 2. Create Environment and Mobiles
 * 3. Set up renderer
 * 4. Run animation loop (simulation + visualization)
 */

import '../../../lib/visualization/ui/styles.css';
import { Environment } from '../../../lib/Environment';
import { SceneGraphLoader } from '../../../lib/SceneGraphLoader';
import { ThreeJSRenderer } from '../../../lib/visualization/renderers/ThreeJSRenderer';
import { setupCameraControls } from '../../../lib/visualization/ui';
import type { SimulationState } from '../../../lib/types';

/**
 * Main application class
 */
class DemoApp {
  private environment: Environment;
  private renderer: ThreeJSRenderer;
  private animationId: number | null = null;

  constructor() {
    // Get canvas element
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    // Create renderer
    this.renderer = new ThreeJSRenderer({
      canvas,
      backgroundColor: 0x1a1a1a,
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
      // Update simulation
      this.environment.update();

      // Get simulation state
      const state: SimulationState = this.environment.toJSON();

      // Render visualization
      this.renderer.render(state);

      // Continue loop
      this.animationId = requestAnimationFrame(animate);
    };

    animate();
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
 * Initialize and start the demo
 */
async function init() {
  const app = new DemoApp();

  // Set up UI controls
  setupInfoModal();
  setupCameraControls(); // Standard camera controls (no custom buttons)

  try {
    // Load config (use relative path for deployment compatibility)
    await app.loadConfig('config.json');
    app.start();
    console.log('Demo started');
  } catch (error) {
    console.error('Failed to initialize demo:', error);
  }

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    app.dispose();
  });
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
