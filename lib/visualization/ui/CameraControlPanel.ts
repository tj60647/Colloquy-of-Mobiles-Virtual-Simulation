/**
 * Camera Control Panel
 *
 * Shared UI component for camera controls across all demos.
 * Creates standard camera control buttons (Reset, View Presets) and supports custom buttons.
 */

import { icons } from './icons';
import { CameraController } from '../utils/CameraController';

export interface CustomCameraButton {
  label: string;
  onClick: () => void;
  className?: string;
  isToggle?: boolean;
  toggleStates?: { on: string; off: string };
}

export interface AutoOrbitConfig {
  /** CameraController instance to control */
  cameraController: CameraController;
  /** Initial orbit speed (default: 0.005) */
  initialSpeed?: number;
  /** Minimum orbit speed (default: -0.01) */
  minSpeed?: number;
  /** Maximum orbit speed (default: 0.01) */
  maxSpeed?: number;
  /** Start with orbit enabled (default: false) */
  startEnabled?: boolean;
}

export interface CameraControlPanelOptions {
  /** DOM element ID for the controls panel container (default: 'controls-panel') */
  panelId?: string;
  /** DOM element ID for the canvas (default: 'canvas') */
  canvasId?: string;
  /** Custom buttons to add before standard view buttons */
  customButtons?: CustomCameraButton[];
  /** Configuration for auto-orbit controls (if provided, adds orbit toggle and slider) */
  autoOrbit?: AutoOrbitConfig;
}

/**
 * Set up camera control buttons in the specified panel
 *
 * Creates standardized camera controls:
 * - Info icon (shows mouse/keyboard controls)
 * - Reset View (red button)
 * - Custom buttons (if provided)
 * - Top/Front/Side/Isometric view presets
 *
 * @param options Configuration options for the panel
 * @returns Object with methods to control buttons programmatically
 */
export function setupCameraControls(options: CameraControlPanelOptions = {}): {
  updateToggleButton: (index: number, active: boolean) => void;
  setOrbitEnabled: (enabled: boolean) => void;
  setOrbitSpeed: (speed: number) => void;
} {
  const { panelId = 'controls-panel', canvasId = 'canvas', customButtons = [], autoOrbit } = options;

  const controlsPanel = document.getElementById(panelId);
  const canvas = document.getElementById(canvasId);

  if (!controlsPanel) {
    console.warn(`Camera controls panel '${panelId}' not found`);
    return { updateToggleButton: () => {}, setOrbitEnabled: () => {}, setOrbitSpeed: () => {} };
  }

  if (!canvas) {
    console.warn(`Canvas element '${canvasId}' not found`);
    return { updateToggleButton: () => {}, setOrbitEnabled: () => {}, setOrbitSpeed: () => {} };
  }

  // Track toggle buttons for programmatic control
  const toggleButtons: HTMLButtonElement[] = [];

  // Create info modal for camera controls
  createCameraInfoModal(controlsPanel);

  // Reset View button (always first)
  const resetButton = document.createElement('button');
  resetButton.className = 'camera-button reset';
  resetButton.textContent = 'Reset View';
  resetButton.addEventListener('click', () => {
    const event = new KeyboardEvent('keydown', { key: 'r' });
    canvas.dispatchEvent(event);
  });
  controlsPanel.appendChild(resetButton);

  // Add custom buttons
  customButtons.forEach((btn) => {
    const button = document.createElement('button');
    button.className = btn.className || 'camera-button';
    button.textContent = btn.label;

    if (btn.isToggle && btn.toggleStates) {
      // Toggle button behavior
      button.addEventListener('click', () => {
        const isActive = button.classList.toggle('active');
        button.textContent = isActive ? btn.toggleStates!.on : btn.toggleStates!.off;
        btn.onClick();
      });
      toggleButtons.push(button);
    } else {
      // Regular button behavior
      button.addEventListener('click', btn.onClick);
    }

    controlsPanel.appendChild(button);
  });

  // Standard view preset buttons - Row 3: Top, Front, Side, Iso
  const viewsRow = document.createElement('div');
  viewsRow.className = 'camera-view-row';
  
  const views = [
    { label: 'Top', key: '1' },
    { label: 'Front', key: '2' },
    { label: 'Side', key: '3' },
    { label: 'Iso', key: '4' },
  ];

  views.forEach((view) => {
    const button = document.createElement('button');
    button.className = 'camera-button camera-view-button';
    button.textContent = view.label;
    button.addEventListener('click', () => {
      const event = new KeyboardEvent('keydown', { key: view.key });
      canvas.dispatchEvent(event);
    });
    viewsRow.appendChild(button);
  });
  
  controlsPanel.appendChild(viewsRow);

  // Orbit controls - Row 4 (if configured)
  let orbitToggleButton: HTMLButtonElement | null = null;
  let orbitSlider: HTMLInputElement | null = null;
  
  if (autoOrbit) {
    const { cameraController, initialSpeed = 0.005, minSpeed = -0.01, maxSpeed = 0.01, startEnabled = false } = autoOrbit;
    
    // Set initial state
    if (startEnabled) {
      cameraController.enableAutoOrbit(initialSpeed);
    }
    
    // Orbit toggle button
    orbitToggleButton = document.createElement('button');
    orbitToggleButton.className = 'camera-button';
    orbitToggleButton.textContent = startEnabled ? 'Orbit: On' : 'Orbit: Off';
    if (startEnabled) {
      orbitToggleButton.classList.add('active');
    }
    
    orbitToggleButton.addEventListener('click', () => {
      const isActive = orbitToggleButton!.classList.toggle('active');
      orbitToggleButton!.textContent = isActive ? 'Orbit: On' : 'Orbit: Off';
      
      // Enable/disable slider based on orbit state
      if (orbitSlider) {
        orbitSlider.disabled = !isActive;
      }
      
      // Control CameraController directly
      if (isActive) {
        cameraController.enableAutoOrbit();
      } else {
        cameraController.disableAutoOrbit();
      }
    });
    controlsPanel.appendChild(orbitToggleButton);

    // Orbit speed slider container
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'camera-slider-container';

    orbitSlider = document.createElement('input');
    orbitSlider.type = 'range';
    orbitSlider.className = 'camera-slider';
    orbitSlider.min = String(minSpeed);
    orbitSlider.max = String(maxSpeed);
    orbitSlider.step = '0.0005';
    orbitSlider.value = String(initialSpeed);
    orbitSlider.disabled = !startEnabled; // Start disabled unless orbit is enabled

    const sliderValue = document.createElement('div');
    sliderValue.className = 'camera-slider-value';
    sliderValue.textContent = parseFloat(orbitSlider.value).toFixed(4);

    orbitSlider.addEventListener('input', () => {
      const speed = parseFloat(orbitSlider!.value);
      sliderValue.textContent = speed.toFixed(4);
      cameraController.setAutoOrbitSpeed(speed);
    });

    sliderContainer.appendChild(orbitSlider);
    sliderContainer.appendChild(sliderValue);
    controlsPanel.appendChild(sliderContainer);
  }

  // Return API for programmatic control
  return {
    /**
     * Update a toggle button's state programmatically
     * @param index Index of the toggle button (0-based, in order of customButtons)
     * @param active Whether the button should be active
     */
    updateToggleButton: (index: number, active: boolean) => {
      const button = toggleButtons[index];
      if (button && customButtons[index]?.isToggle) {
        const states = customButtons[index].toggleStates!;
        if (active) {
          button.classList.add('active');
          button.textContent = states.on;
        } else {
          button.classList.remove('active');
          button.textContent = states.off;
        }
      }
    },
    /**
     * Set orbit enabled state programmatically
     */
    setOrbitEnabled: (enabled: boolean) => {
      if (orbitToggleButton) {
        if (enabled) {
          orbitToggleButton.classList.add('active');
          orbitToggleButton.textContent = 'Orbit: On';
        } else {
          orbitToggleButton.classList.remove('active');
          orbitToggleButton.textContent = 'Orbit: Off';
        }
      }
      // Enable/disable slider based on orbit state
      if (orbitSlider) {
        orbitSlider.disabled = !enabled;
      }
    },
    /**
     * Set orbit speed programmatically
     */
    setOrbitSpeed: (speed: number) => {
      if (orbitSlider) {
        orbitSlider.value = String(speed);
        const valueDisplay = orbitSlider.parentElement?.querySelector('.camera-slider-value');
        if (valueDisplay) {
          valueDisplay.textContent = speed.toFixed(4);
        }
      }
    },
  };
}

/**
 * Create info modal with camera controls help
 */
function createCameraInfoModal(controlsPanel: HTMLElement): void {
  // Create info button in panel header
  const header = controlsPanel.querySelector('.panel-header');
  if (header) {
    const infoButton = document.createElement('button');
    infoButton.className = 'camera-info-button';
    infoButton.innerHTML = icons.info;
    infoButton.title = 'Camera Controls Help';
    infoButton.style.cssText = `
      float: right;
      background: transparent;
      border: 1px solid rgba(52, 152, 219, 0.4);
      color: #5dade2;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      cursor: pointer;
      padding: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    `;

    infoButton.addEventListener('mouseenter', () => {
      infoButton.style.borderColor = 'rgba(52, 152, 219, 0.7)';
      infoButton.style.transform = 'scale(1.1)';
    });

    infoButton.addEventListener('mouseleave', () => {
      infoButton.style.borderColor = 'rgba(52, 152, 219, 0.4)';
      infoButton.style.transform = 'scale(1)';
    });

    header.appendChild(infoButton);

    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'camera-info-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(5px);
      z-index: 1000;
      display: none;
      align-items: center;
      justify-content: center;
    `;

    // Create info card
    const card = document.createElement('div');
    card.style.cssText = `
      position: relative;
      background: rgba(13, 17, 30, 0.95);
      border: 2px solid rgba(52, 152, 219, 0.5);
      border-radius: 12px;
      padding: 32px 40px;
      max-width: 500px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
      color: #e0e0e0;
    `;

    card.innerHTML = `
      <button id="camera-info-close" style="position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; background: transparent; border: none; color: #888; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: color 0.2s;">${icons.close}</button>
      <h2 style="color: #3498db; font-size: 1.6em; margin-bottom: 12px; font-weight: 600;">Camera Controls</h2>
      <div style="font-size: 0.95em; line-height: 1.6; color: #b8b8b8; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid rgba(52, 152, 219, 0.2);">
        Navigate the 3D scene with mouse and keyboard controls
      </div>
      
      <div style="margin-bottom: 24px;">
        <h3 style="color: #5dade2; font-size: 1.1em; margin-bottom: 12px; font-weight: 500;">Mouse Controls</h3>
        <div style="display: flex; align-items: center; margin-bottom: 10px; color: #b8b8b8; font-size: 0.95em;">
          <span style="min-width: 140px; color: #e0e0e0; font-weight: 500;">Left Click + Drag</span>
          <span>Rotate camera</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 10px; color: #b8b8b8; font-size: 0.95em;">
          <span style="min-width: 140px; color: #e0e0e0; font-weight: 500;">Right Click + Drag</span>
          <span>Pan camera</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 10px; color: #b8b8b8; font-size: 0.95em;">
          <span style="min-width: 140px; color: #e0e0e0; font-weight: 500;">Scroll Wheel</span>
          <span>Zoom in/out</span>
        </div>
      </div>
      
      <div>
        <h3 style="color: #5dade2; font-size: 1.1em; margin-bottom: 12px; font-weight: 500;">Keyboard Shortcuts</h3>
        <div style="display: flex; align-items: center; margin-bottom: 10px; color: #b8b8b8; font-size: 0.95em;">
          <span style="min-width: 140px; color: #e0e0e0; font-weight: 500;">R</span>
          <span>Reset camera view</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 10px; color: #b8b8b8; font-size: 0.95em;">
          <span style="min-width: 140px; color: #e0e0e0; font-weight: 500;">1</span>
          <span>Top view</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 10px; color: #b8b8b8; font-size: 0.95em;">
          <span style="min-width: 140px; color: #e0e0e0; font-weight: 500;">2</span>
          <span>Front view</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 10px; color: #b8b8b8; font-size: 0.95em;">
          <span style="min-width: 140px; color: #e0e0e0; font-weight: 500;">3</span>
          <span>Side view</span>
        </div>
        <div style="display: flex; align-items: center; color: #b8b8b8; font-size: 0.95em;">
          <span style="min-width: 140px; color: #e0e0e0; font-weight: 500;">4</span>
          <span>Isometric view</span>
        </div>
      </div>
    `;

    modal.appendChild(card);
    document.body.appendChild(modal);

    // Event handlers
    const showModal = () => {
      modal.style.display = 'flex';
    };

    const hideModal = () => {
      modal.style.display = 'none';
    };

    infoButton.addEventListener('click', showModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideModal();
    });

    const closeButton = card.querySelector('#camera-info-close');
    if (closeButton) {
      closeButton.addEventListener('click', hideModal);
      closeButton.addEventListener('mouseenter', () => {
        (closeButton as HTMLElement).style.color = '#e0e0e0';
      });
      closeButton.addEventListener('mouseleave', () => {
        (closeButton as HTMLElement).style.color = '#888';
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        hideModal();
      }
    });
  }
}
