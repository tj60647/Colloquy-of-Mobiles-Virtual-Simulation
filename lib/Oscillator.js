// Import the DebugUtility module
import { DebugUtility } from "./DebugUtility.js";
import { MotionProfile } from "./MotionProfile.js";

/**
 * Enum-like object representing the possible motion requests for an oscillator.
 * These requests dictate how the oscillator should behave, such as stopping or releasing.
 * @enum {string}
 */
export const MotionRequest = {
  /** Request to stop the oscillator's movement and move to the reinforcement position. */
  STOP: "STOP",

  /** Request to release the oscillator, allowing it to oscillate between defined positions. */
  RELEASE: "RELEASE",
};

/**
 * Class representing an oscillator that moves between defined positions with a given motion profile.
 * The oscillator's movement is defined by parameters such as minimum and maximum positions,
 * reinforcement position, tolerance, and kinematic constraints like maximum velocity and acceleration.
 * The oscillator can execute predefined motions such as stopping at a reinforcement position or oscillating
 * between two positions, all driven by a motion profile generated based on the input parameters.
 */
export class Oscillator {
  /**
   * Create an Oscillator.
   * @param {number} minPosition - The minimum position the oscillator can reach.
   * @param {number} maxPosition - The maximum position the oscillator can reach.
   * @param {number} reinforcementPosition - The position the oscillator should move to when stopping.
   * @param {number} [tolerance=1.0] - The tolerance level to consider when checking if positions are close enough.
   * @param {number} [frameRate=60] - The frame rate at which the oscillator operates.
   * @param {number} [maxVelocity=20.0] - The maximum velocity the oscillator can achieve.
   * @param {number} [maxAcceleration=10.0] - The maximum acceleration the oscillator can achieve.
   * @param {number} [maxJerk=0.0] - The maxJerk value (rate of change of acceleration), currently not used.
   */
  constructor(
    minPosition,
    maxPosition,
    reinforcementPosition,
    tolerance = 1.0,
    frameRate = 60,
    maxVelocity = 20.0,
    maxAcceleration = 10.0,
    maxJerk = 0.0
  ) {
    DebugUtility.debugLog({
      message: "Oscillator initialized",
      minPosition,
      maxPosition,
      reinforcementPosition,
      tolerance,
      frameRate,
      maxVelocity,
      maxAcceleration,
      maxJerk,
    });

    if (minPosition >= maxPosition) {
      throw new Error(
        "Oscillator.constructor: 'minPosition' must be less than 'maxPosition'."
      );
    }
    if (
      reinforcementPosition < minPosition ||
      reinforcementPosition > maxPosition
    ) {
      throw new Error(
        "Oscillator.constructor: 'reinforcementPosition' must be within the range of 'minPosition' and 'maxPosition'."
      );
    }
    if (tolerance < 0) {
      throw new Error(
        "Oscillator.constructor: 'tolerance' must be a non-negative value."
      );
    }
    if (frameRate <= 0) {
      throw new Error(
        "Oscillator.constructor: 'frameRate' must be a positive value."
      );
    }
    if (maxVelocity <= 0) {
      throw new Error(
        "Oscillator.constructor: 'maxVelocity' must be a positive value."
      );
    }
    if (maxAcceleration <= 0) {
      throw new Error(
        "Oscillator.constructor: 'maxAcceleration' must be a positive value."
      );
    }
    if (maxJerk < 0) {
      throw new Error(
        "Oscillator.constructor: 'maxJerk' must be a non-negative value."
      );
    }

    // Assign instance variables
    this.minPosition = minPosition;
    this.maxPosition = maxPosition;
    this.reinforcementPosition = reinforcementPosition;
    this.currentPosition = minPosition; // Start at minPosition
    this.startPosition = minPosition; // Initialize startPosition to the starting position of the oscillator
    this.tolerance = tolerance;
    this.currentMotionRequest = MotionRequest.STOP; // Default motion request is to stop
    this.targetPosition = this.reinforcementPosition;
    this.motionProfile = null; // Will hold an instance of MotionProfile
    this.currentProfileIndex = 0;
    this.timeStep = 1 / frameRate; // Time step based on frame rate
    this.maxVelocity = maxVelocity;
    this.maxAcceleration = maxAcceleration;
    this.maxJerk = maxJerk;
    this.stopTargetReached = false;
  }

  /**
   * Sets the motion request for the oscillator and computes the motion profile if necessary.
   * @param {MotionRequest} motionRequest - The motion request (e.g., STOP or RELEASE).
   */
  setMotion(motionRequest) {
    DebugUtility.debugLog({
      message: "Oscillator.setMotion called",
      motionRequest,
    });

    // If the new motion request is the same as the current one, do nothing
    if (this.currentMotionRequest === motionRequest) {
      DebugUtility.debugLog({
        message: "Oscillator.setMotion: No change in motion request",
        motionRequest,
      });
      return;
    }

    // Update the current motion request and determine the target position
    this.currentMotionRequest = motionRequest;
    if (motionRequest === MotionRequest.STOP) {
      this.targetPosition = this.reinforcementPosition;
      this.startPosition = this.currentPosition; // Track the start position when motion begins
      this.computeMotionProfile();
    } else if (motionRequest === MotionRequest.RELEASE) {
      this.updateOscillationTargetPosition();
      this.startPosition = this.currentPosition; // Track the start position when oscillation begins
      this.computeMotionProfile();
    }
  }

  /**
   * Updates the target position for the oscillator during oscillation.
   * The target position is toggled between minPosition and maxPosition depending on the current position.
   */
  updateOscillationTargetPosition() {
    if (this.isCloseEnoughOrGreaterThan(this.maxPosition)) {
      this.targetPosition = this.minPosition;
    } else if (this.isCloseEnoughOrLessThan(this.minPosition)) {
      this.targetPosition = this.maxPosition;
    } else {
      this.targetPosition = this.maxPosition;
    }

    DebugUtility.debugLog({
      message: "Oscillator.updateOscillationTargetPosition",
      targetPosition: this.targetPosition,
    });
  }

  /**
   * Computes the motion profile for the oscillator based on the current and target positions.
   * The motion profile is generated to smoothly move the oscillator from its current position to the target position.
   */
  computeMotionProfile() {
    const distanceToTarget = this.calculateDistance(
      this.currentPosition,
      this.targetPosition
    );
    DebugUtility.debugLog({
      message: "Oscillator.computeMotionProfile.distanceToTarget",
      distanceToTarget,
    });

    this.motionProfile = new MotionProfile(
      distanceToTarget,
      this.maxVelocity,
      this.maxAcceleration,
      this.maxJerk,
      this.timeStep
    );

    DebugUtility.debugLog({
      message: "Oscillator.computeMotionProfile.motionProfile",
      motionProfile: this.motionProfile.toString(),
    });

    if (this.motionProfile.profile.length === 0) {
      DebugUtility.debugLog({
        message: "Motion profile is empty, check your parameters.",
      });
    }

    this.currentProfileIndex = 0;
  }

  /**
   * Calculates the distance between two positions.
   * @param {number} position1 - The first position.
   * @param {number} position2 - The second position.
   * @return {number} The absolute distance between the two positions.
   */
  calculateDistance(position1, position2) {
    return Math.abs(position2 - position1);
  }

  /**
   * Executes the motion of the oscillator based on the current motion request and profile.
   * The oscillator moves according to the generated motion profile until it reaches the target position.
   */
  act() {
    if (this.currentMotionRequest === MotionRequest.STOP) {
      if (
        !this.motionProfile ||
        this.currentProfileIndex >= this.motionProfile.profile.length
      ) {
        if (!this.stopTargetReached) {
          DebugUtility.debugLog({
            message: "Oscillator reached target position",
            targetPosition: this.targetPosition,
          });
        }
        this.stopTargetReached = true;
        return;
      }

      this.stopTargetReached = false;
      const profilePoint = this.motionProfile.profile[this.currentProfileIndex];
      this.currentPosition =
        this.startPosition +
        (this.targetPosition >= this.startPosition
          ? profilePoint.position
          : -profilePoint.position);
      this.currentProfileIndex += 1;
    } else if (this.currentMotionRequest === MotionRequest.RELEASE) {
      if (
        !this.motionProfile ||
        this.currentProfileIndex >= this.motionProfile.profile.length
      ) {
        this.updateOscillationTargetPosition();
        this.startPosition = this.currentPosition;
        this.computeMotionProfile();
      } else {
        const profilePoint =
          this.motionProfile.profile[this.currentProfileIndex];
        this.currentPosition =
          this.startPosition +
          (this.targetPosition >= this.startPosition
            ? profilePoint.position
            : -profilePoint.position);
        this.currentProfileIndex += 1;
      }
    }
  }

  /**
   * Checks if the oscillator is close enough to the target position.
   * @param {number} targetPosition - The target position to check against.
   * @return {boolean} True if the current position is within the tolerance of the target position.
   */
  isCloseEnough(targetPosition) {
    return Math.abs(this.currentPosition - targetPosition) <= this.tolerance;
  }

  /**
   * Checks if the current position is close enough to or greater than a given position.
   * @param {number} position - The position to check against.
   * @return {boolean} True if the current position is close enough to or greater than the given position.
   */
  isCloseEnoughOrGreaterThan(position) {
    return this.currentPosition >= position || this.isCloseEnough(position);
  }

  /**
   * Checks if the current position is close enough to or less than a given position.
   * @param {number} position - The position to check against.
   * @return {boolean} True if the current position is close enough to or less than the given position.
   */
  isCloseEnoughOrLessThan(position) {
    return this.currentPosition <= position || this.isCloseEnough(position);
  }

  /**
   * Senses and returns the current position of the oscillator.
   * @return {number} The current position of the oscillator.
   */
  sensePosition() {
    return this.currentPosition;
  }

  /**
   * Provides a string summary of the current state of the oscillator.
   * This summary includes details such as the current position, start position, target position,
   * current motion request, tolerance, and a brief overview of the motion profile.
   * @return {string} A summary of the oscillator's current state.
   */
  toString() {
    return `Oscillator State:
      Current Position: ${this.currentPosition}
      Start Position: ${this.startPosition}
      Target Position: ${this.targetPosition}
      Current Motion Request: ${this.currentMotionRequest}
      Tolerance: ${this.tolerance}
      Motion Profile: ${
        this.motionProfile
          ? this.motionProfile.toString()
          : "No motion profile available"
      }`;
  }

  /**
   * Converts the Oscillator instance to a JSON-friendly object.
   * This method serializes only the parameters necessary to reconstruct the oscillator using its constructor.
   * @return {Object} A JSON-friendly representation of the Oscillator.
   */
  toJSON() {
    return {
      minPosition: this.minPosition,
      maxPosition: this.maxPosition,
      reinforcementPosition: this.reinforcementPosition,
      tolerance: this.tolerance,
      frameRate: 1 / this.timeStep, // Derive frameRate from timeStep
      maxVelocity: this.maxVelocity,
      maxAcceleration: this.maxAcceleration,
      maxJerk: this.maxJerk,
    };
  }

  /**
   * Creates an Oscillator instance from a JSON object.
   * This static method allows for deserializing a JSON object back into an Oscillator instance.
   * @param {Object} json - A JSON object representing an Oscillator.
   * @return {Oscillator} A new Oscillator instance.
   */
  static fromJSON(json) {
    return new Oscillator(
      json.minPosition,
      json.maxPosition,
      json.reinforcementPosition,
      json.tolerance,
      json.frameRate,
      json.maxVelocity,
      json.maxAcceleration,
      json.maxJerk
    );
  }
}
