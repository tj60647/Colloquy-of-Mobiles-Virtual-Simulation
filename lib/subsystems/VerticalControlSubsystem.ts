/**
 * VerticalControlSubsystem.ts
 * 
 * Specialized Oscillator for Vertical Control (Reflector Roll).
 * Used exclusively by Female mobiles for vertical mirror adjustment.
 * Extends the generic Oscillator component.
 */

import { Oscillator, OscillatorConfig, IOscillatorLogger, MotionRequest, MotionRequestType } from './Oscillator';

export { OscillatorConfig, IOscillatorLogger, MotionRequest, MotionRequestType };

export class VerticalControlSubsystem extends Oscillator {
    // Inherit constructor overloads from Oscillator
    // This subsystem drives the 'roll' rotation instead of 'yaw'
}
