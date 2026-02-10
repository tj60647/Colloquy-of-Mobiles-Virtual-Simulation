/**
 * Oscillator.ts
 *
 * Generic component for controlling movement between min/max positions.
 * Used for horizontal rotation (pan) and potentially vertical lift.
 *
 * Supports both legacy (position argument) and new (config object) initialization.
 * Supports dependency injection for logging (Debugger).
 */

import { MotionProfile, MotionPoint } from './MotionProfile';

export const MotionRequest = {
  STOP: 'STOP',
  RELEASE: 'RELEASE',
} as const;

export type MotionRequestType = (typeof MotionRequest)[keyof typeof MotionRequest];

export interface IOscillatorLogger {
  debugLog(data: any): void;
}

export interface OscillatorConfig {
  minPosition: number;
  maxPosition: number;
  reinforcementPosition: number;
  tolerance?: number;
  frameRate?: number;
  maxVelocity?: number;
  maxAcceleration?: number;
  maxJerk?: number;
  logger?: IOscillatorLogger;
}

export class Oscillator {
  minPosition: number;
  maxPosition: number;
  reinforcementPosition: number;
  tolerance: number;
  frameRate: number;
  maxVelocity: number;
  maxAcceleration: number;
  maxJerk: number;

  currentPosition: number;
  startPosition: number;
  targetPosition: number;
  currentMotionRequest: MotionRequestType;

  motionProfile: MotionProfile | null = null;
  currentProfileIndex: number = 0;
  timeStep: number;
  stopTargetReached: boolean = false;

  private logger?: IOscillatorLogger;

  constructor(config: OscillatorConfig);
  constructor(
    minPosition: number,
    maxPosition: number,
    reinforcementPosition: number,
    tolerance?: number,
    frameRate?: number,
    maxVelocity?: number,
    maxAcceleration?: number,
    maxJerk?: number
  );
  constructor(
    arg1: number | OscillatorConfig,
    arg2?: number,
    arg3?: number,
    arg4?: number,
    arg5?: number,
    arg6?: number,
    arg7?: number,
    arg8?: number
  ) {
    let config: OscillatorConfig;

    if (typeof arg1 === 'object') {
      config = arg1;
    } else {
      // Legacy signature
      config = {
        minPosition: arg1,
        maxPosition: arg2!,
        reinforcementPosition: arg3!,
        tolerance: arg4,
        frameRate: arg5,
        maxVelocity: arg6,
        maxAcceleration: arg7,
        maxJerk: arg8,
      };
    }

    if (config.minPosition >= config.maxPosition) {
      throw new Error('Oscillator: minPosition must be less than maxPosition');
    }

    this.minPosition = config.minPosition;
    this.maxPosition = config.maxPosition;
    this.reinforcementPosition = config.reinforcementPosition;
    this.tolerance = config.tolerance ?? 1.0;
    this.frameRate = config.frameRate ?? 60;
    this.maxVelocity = config.maxVelocity ?? 20.0;
    this.maxAcceleration = config.maxAcceleration ?? 10.0;
    this.maxJerk = config.maxJerk ?? 0.0;
    this.logger = config.logger;

    this.timeStep = 1 / this.frameRate;

    // Initial State
    this.currentPosition = this.minPosition;
    this.startPosition = this.minPosition;
    this.currentMotionRequest = MotionRequest.STOP;
    this.targetPosition = this.reinforcementPosition;

    this.log({
      message: 'Oscillator initialized',
      config: this.toJSON(),
    });
  }

  setMotion(motionRequest: MotionRequestType): void {
    if (this.currentMotionRequest === motionRequest) return;

    this.log({
      message: 'Oscillator.setMotion called',
      motionRequest,
    });

    this.currentMotionRequest = motionRequest;

    if (motionRequest === MotionRequest.STOP) {
      this.targetPosition = this.reinforcementPosition;
      this.startPosition = this.currentPosition;
      this.computeMotionProfile();
    } else if (motionRequest === MotionRequest.RELEASE) {
      this.updateOscillationTargetPosition();
      this.startPosition = this.currentPosition;
      this.computeMotionProfile();
    }
  }

  private updateOscillationTargetPosition(): void {
    if (this.isCloseEnoughOrGreaterThan(this.maxPosition)) {
      this.targetPosition = this.minPosition;
    } else if (this.isCloseEnoughOrLessThan(this.minPosition)) {
      this.targetPosition = this.maxPosition;
    } else {
      this.targetPosition = this.maxPosition;
    }

    this.log({
      message: 'Oscillator.updateOscillationTargetPosition',
      targetPosition: this.targetPosition,
    });
  }

  private computeMotionProfile(): void {
    const distanceToTarget = Math.abs(this.targetPosition - this.currentPosition);

    this.log({
      message: 'Oscillator.computeMotionProfile.distanceToTarget',
      distanceToTarget,
    });

    if (distanceToTarget <= this.tolerance) {
      this.log({ message: 'Distance within tolerance, skipping profile generation' });
      // Ensure state?
      this.motionProfile = null; // Clear old profile
      return;
    }

    this.motionProfile = new MotionProfile(
      distanceToTarget,
      this.maxVelocity,
      this.maxAcceleration,
      this.maxJerk,
      this.timeStep
    );
    this.currentProfileIndex = 0;
    this.stopTargetReached = false;

    this.log({
      message: 'Oscillator.computeMotionProfile.motionProfile',
      motionProfile: this.motionProfile.toString(),
    });
  }

  act(): void {
    if (!this.motionProfile) {
      // If we have no profile (e.g. STOP request satisfied), check if we need to log
      if (this.currentMotionRequest === MotionRequest.STOP && !this.stopTargetReached) {
        if (this.isCloseEnough(this.targetPosition)) {
          this.stopTargetReached = true;
          this.currentPosition = this.targetPosition;
          this.log({
            message: 'Oscillator reached target position (Immediate)',
            targetPosition: this.targetPosition,
          });
        }
      }
      return;
    }

    // Check if profile finished
    if (this.currentProfileIndex >= this.motionProfile.profile.length) {
      this.onProfileComplete();
      return;
    }

    // Move along profile
    const point = this.motionProfile.profile[this.currentProfileIndex];
    const direction = this.targetPosition >= this.startPosition ? 1 : -1;

    this.currentPosition = this.startPosition + point.position * direction;
    this.currentProfileIndex++;
  }

  private onProfileComplete(): void {
    if (this.currentMotionRequest === MotionRequest.STOP) {
      if (!this.stopTargetReached) {
        this.currentPosition = this.targetPosition; // Snap to target
        this.stopTargetReached = true;
        this.log({
          message: 'Oscillator reached target position',
          targetPosition: this.targetPosition,
        });
        this.motionProfile = null; // Clear finished profile
      }
    } else if (this.currentMotionRequest === MotionRequest.RELEASE) {
      // Reached end of one swing, reverse!
      this.currentPosition = this.targetPosition; // Snap
      this.updateOscillationTargetPosition();
      this.startPosition = this.currentPosition;
      this.computeMotionProfile();
    }
  }

  sensePosition(): number {
    return this.currentPosition;
  }

  // Helpers
  private isCloseEnough(target: number): boolean {
    return Math.abs(this.currentPosition - target) <= this.tolerance;
  }

  private isCloseEnoughOrGreaterThan(pos: number): boolean {
    return this.currentPosition >= pos || this.isCloseEnough(pos);
  }

  private isCloseEnoughOrLessThan(pos: number): boolean {
    return this.currentPosition <= pos || this.isCloseEnough(pos);
  }

  private log(data: any): void {
    if (this.logger) {
      this.logger.debugLog(data);
    }
  }

  // Serialization
  toJSON() {
    return {
      minPosition: this.minPosition,
      maxPosition: this.maxPosition,
      reinforcementPosition: this.reinforcementPosition,
      tolerance: this.tolerance,
      frameRate: this.frameRate,
      maxVelocity: this.maxVelocity,
      maxAcceleration: this.maxAcceleration,
      maxJerk: this.maxJerk,
    };
  }

  static fromJSON(json: any): Oscillator {
    return new Oscillator({
      minPosition: json.minPosition,
      maxPosition: json.maxPosition,
      reinforcementPosition: json.reinforcementPosition,
      tolerance: json.tolerance,
      frameRate: json.frameRate,
      maxVelocity: json.maxVelocity,
      maxAcceleration: json.maxAcceleration,
      maxJerk: json.maxJerk,
    });
  }
}
