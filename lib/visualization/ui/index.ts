/**
 * UI Components
 *
 * Shared UI components for demos.
 *
 * Usage:
 * - Import CSS: import '../../../lib/visualization/ui/styles.css'
 * - Import JS: import { setupCameraControls } from '../../../lib/visualization/ui'
 */

export { setupCameraControls } from './CameraControlPanel';
export type { CustomCameraButton, CameraControlPanelOptions } from './CameraControlPanel';
export { setupMotionProfilePanel } from './MotionProfilesPanel';
export type { MotionProfilePanelOptions, MotionProfilePanelApi, MotionProfilePanelState } from './MotionProfilesPanel';
export { icons, getIcon } from './icons';

// Note: CSS must be imported separately in your demo's main.ts:
// import '../../../lib/visualization/ui/styles.css';
