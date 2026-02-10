/**
 * HorizontalControlSubsystem.ts
 *
 * Specialized Oscillator for Horizontal Control (Rotation).
 * Extending the generic Oscillator component.
 */

import { Oscillator } from './Oscillator';
import type { OscillatorConfig, IOscillatorLogger, MotionRequestType } from './Oscillator';
import { MotionRequest } from './Oscillator';

// Re-export types used by consumers
export type { OscillatorConfig, IOscillatorLogger, MotionRequestType };
export { MotionRequest };

export class HorizontalControlSubsystem extends Oscillator {
  // Inherit constructor overloads from Oscillator
}
