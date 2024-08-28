// Import the DebugUtility module
import { DebugUtility } from "./DebugUtility.js";

/**
 * Class representing a detailed motion profile for an object.
 * The motion profile is generated based on input parameters and consists of
 * three distinct phases: acceleration, cruising, and deceleration.
 * The profile accounts for key kinematic variables such as distance, velocity,
 * and acceleration over time, allowing for precise motion planning and analysis.
 */
export class MotionProfile {
  /**
   * Create a MotionProfile.
   * @param {number} totalDistance - The total distance the object needs to travel.
   * @param {number} maxVelocity - The maximum velocity the object can achieve.
   * @param {number} maxAcceleration - The maximum acceleration the object can achieve.
   * @param {number} [maxJerk=0.0] - The maxJerk value (rate of change of acceleration), currently not used.
   * @param {number} [timestep=0.1] - The time step used for calculations.
   * @param {number} [initialVelocity=0.0] - The initial velocity of the object.
   * @throws {Error} If any input parameters are invalid.
   */
  constructor(
    totalDistance,
    maxVelocity,
    maxAcceleration,
    maxJerk = 0.0,
    timestep = 0.1,
    initialVelocity = 0.0
  ) {
    if (totalDistance <= 0) {
      throw new Error("totalDistance must be a positive number.");
    }
    if (maxVelocity <= 0) {
      throw new Error("maxVelocity must be a positive number.");
    }
    if (maxAcceleration <= 0) {
      throw new Error("maxAcceleration must be a positive number.");
    }
    if (timestep <= 0) {
      throw new Error("timestep must be a positive number.");
    }
    if (initialVelocity < 0) {
      throw new Error("initialVelocity cannot be negative.");
    }

    DebugUtility.debugLog({
      message: `MotionProfile initialized`,
      totalDistance,
      maxVelocity,
      maxAcceleration,
      maxJerk,
      timestep,
      initialVelocity,
    });

    // Assign values to instance variables
    this.totalDistance = totalDistance;
    this.maxVelocity = maxVelocity;
    this.maxAcceleration = maxAcceleration;
    this.maxJerk = maxJerk; // Placeholder for future use, currently not utilized
    this.timestep = timestep;
    this.initialVelocity = initialVelocity; // Initial velocity of the object
    this.profile = []; // Array to hold the generated motion profile

    // Initialize variables to track min/max values of the motion profile
    this._profile_minPosition = Infinity;
    this._profile_maxPosition = -Infinity;
    this._profile_minVelocity = Infinity;
    this._profile_maxVelocity = -Infinity;
    this._profile_minAcceleration = Infinity;
    this._profile_maxAcceleration = -Infinity;

    try {
      // Generate the motion profile based on the input parameters
      this.generateMotionProfile();
    } catch (error) {
      DebugUtility.debugLog({
        message: `Error during motion profile generation`,
        error: error.message,
      });
      throw error; // Re-throw the error after logging it
    }
  }

  /**
   * Generate the motion profile consisting of acceleration, cruising, and deceleration phases.
   * This method populates the `profile` array with data points representing the object's motion.
   * @throws {Error} If any errors occur during the generation of the motion profile.
   */
  generateMotionProfile() {
    let currentPosition = 0;
    let currentVelocity = this.initialVelocity;

    // Calculate the time and distance required to reach maxVelocity from the initial velocity
    let accelerationTime =
      (this.maxVelocity - this.initialVelocity) / this.maxAcceleration;
    let accelerationDistance =
      this.initialVelocity * accelerationTime +
      0.5 * this.maxAcceleration * Math.pow(accelerationTime, 2);

    if (isNaN(accelerationTime) || isNaN(accelerationDistance)) {
      throw new Error(
        "Failed to calculate acceleration time or distance. Check input values."
      );
    }

    // Adjust maxVelocity if the acceleration distance exceeds half the total distance
    if (accelerationDistance > this.totalDistance / 2) {
      this.maxVelocity = Math.sqrt(
        this.initialVelocity * this.initialVelocity +
          (2 * this.maxAcceleration * this.totalDistance) / 2
      );
      DebugUtility.debugLog({
        message: `Adjusted maxVelocity due to short distance`,
        newMaxVelocity: this.maxVelocity.toFixed(5),
      });

      // Recalculate acceleration time and distance with the new maxVelocity
      accelerationTime =
        (this.maxVelocity - this.initialVelocity) / this.maxAcceleration;
      accelerationDistance =
        this.initialVelocity * accelerationTime +
        0.5 * this.maxAcceleration * Math.pow(accelerationTime, 2);

      if (isNaN(accelerationTime) || isNaN(accelerationDistance)) {
        throw new Error(
          "Failed to calculate adjusted acceleration time or distance. Check input values."
        );
      }

      DebugUtility.debugLog({
        message: `Adjusted accelerationDistance`,
        newAccelerationDistance: accelerationDistance.toFixed(5),
      });
    }

    const decelerationDistance = accelerationDistance;
    const cruisingDistance =
      this.totalDistance - accelerationDistance - decelerationDistance;
    const cruisingTime = cruisingDistance / this.maxVelocity;

    if (cruisingDistance < 0) {
      throw new Error(
        "Invalid cruising distance calculated. Check input values."
      );
    }

    // Acceleration phase
    for (let t = 0; t <= accelerationTime; t += this.timestep) {
      const currentAcceleration = this.maxAcceleration;
      currentVelocity += currentAcceleration * this.timestep;
      currentPosition += currentVelocity * this.timestep;

      if (isNaN(currentPosition) || isNaN(currentVelocity)) {
        throw new Error(
          "Failed to calculate position or velocity during acceleration phase."
        );
      }

      this.updateMinMax(currentPosition, currentVelocity, currentAcceleration);

      this.profile.push({
        position: currentPosition,
        velocity: currentVelocity,
        acceleration: currentAcceleration,
        jerk: this.maxJerk, // Placeholder, currently constant
      });
    }

    DebugUtility.debugLog({
      message: `End of Acceleration Phase`,
      distanceTraveled: currentPosition.toFixed(2),
    });

    // Cruising phase
    for (let t = 0; t <= cruisingTime; t += this.timestep) {
      currentPosition += this.maxVelocity * this.timestep;

      if (isNaN(currentPosition)) {
        throw new Error("Failed to calculate position during cruising phase.");
      }

      this.updateMinMax(currentPosition, this.maxVelocity, 0);

      this.profile.push({
        position: currentPosition,
        velocity: this.maxVelocity,
        acceleration: 0, // No acceleration in constant velocity phase
        jerk: 0, // No jerk in constant velocity phase
      });
    }

    DebugUtility.debugLog({
      message: `End of Cruising Phase`,
      distanceTraveled: currentPosition.toFixed(2),
    });

    // Deceleration phase
    for (let t = 0; t <= accelerationTime; t += this.timestep) {
      const currentAcceleration = -this.maxAcceleration;
      currentVelocity += currentAcceleration * this.timestep;
      currentPosition += currentVelocity * this.timestep;

      if (isNaN(currentPosition) || isNaN(currentVelocity)) {
        throw new Error(
          "Failed to calculate position or velocity during deceleration phase."
        );
      }

      this.updateMinMax(currentPosition, currentVelocity, currentAcceleration);

      this.profile.push({
        position: currentPosition,
        velocity: currentVelocity,
        acceleration: currentAcceleration,
        jerk: -this.maxJerk, // Placeholder, currently constant
      });
    }

    DebugUtility.debugLog({
      message: `End of Deceleration Phase`,
      distanceTraveled: currentPosition.toFixed(2),
    });
  }

  /**
   * Update the minimum and maximum values for position, velocity, and acceleration.
   * This method is used internally during profile generation to track the extremes of the motion.
   * @param {number} position - The current position of the object.
   * @param {number} velocity - The current velocity of the object.
   * @param {number} acceleration - The current acceleration of the object.
   */
  updateMinMax(position, velocity, acceleration) {
    this._profile_minPosition = Math.min(this._profile_minPosition, position);
    this._profile_maxPosition = Math.max(this._profile_maxPosition, position);

    this._profile_minVelocity = Math.min(this._profile_minVelocity, velocity);
    this._profile_maxVelocity = Math.max(this._profile_maxVelocity, velocity);

    this._profile_minAcceleration = Math.min(
      this._profile_minAcceleration,
      acceleration
    );
    this._profile_maxAcceleration = Math.max(
      this._profile_maxAcceleration,
      acceleration
    );
  }

  /**
   * Get the minimum position in the profile.
   * @return {number} The minimum position.
   */
  get profile_minPosition() {
    return this._profile_minPosition;
  }

  /**
   * Get the maximum position in the profile.
   * @return {number} The maximum position.
   */
  get profile_maxPosition() {
    return this._profile_maxPosition;
  }

  /**
   * Get the minimum velocity in the profile.
   * @return {number} The minimum velocity.
   */
  get profile_minVelocity() {
    return this._profile_minVelocity;
  }

  /**
   * Get the maximum velocity in the profile.
   * @return {number} The maximum velocity.
   */
  get profile_maxVelocity() {
    return this._profile_maxVelocity;
  }

  /**
   * Get the minimum acceleration in the profile.
   * @return {number} The minimum acceleration.
   */
  get profile_minAcceleration() {
    return this._profile_minAcceleration;
  }

  /**
   * Get the maximum acceleration in the profile.
   * @return {number} The maximum acceleration.
   */
  get profile_maxAcceleration() {
    return this._profile_maxAcceleration;
  }

  /**
   * Get the duration of the motion profile.
   * This method calculates the total duration by multiplying the number of time steps by the time step size.
   * @return {number} The total duration of the motion profile.
   */
  get profile_duration() {
    return this.profile.length * this.timestep;
  }

  /**
   * Get a string summary of the motion profile.
   * This summary includes key statistics such as the number of points,
   * duration, and minimum/maximum values for position, velocity, and acceleration.
   * @return {string} A summary of the motion profile.
   */
  toString() {
    return `Motion Profile Summary:
      MP Total Points: ${this.profile.length}
      MP Time Step: ${this.timestep}
      MP Duration: ${this.profile_duration.toFixed(2)} seconds
      MP Position: min=${this.profile_minPosition.toFixed(
        2
      )}, max=${this.profile_maxPosition.toFixed(2)}
      MP Velocity: min=${this.profile_minVelocity.toFixed(
        2
      )}, max=${this.profile_maxVelocity.toFixed(2)}
      MP Acceleration: min=${this._profile_minAcceleration.toFixed(
        2
      )}, max=${this._profile_maxAcceleration.toFixed(2)}
      MP Jerk: min=${(-this.maxJerk).toFixed(2)}, max=${this.maxJerk.toFixed(
      2
    )} (Placeholder)`;
  }

  /**
   * Converts the MotionProfile instance to a JSON-friendly object.
   * This method serializes only the parameters that were provided to the constructor,
   * allowing for easy reconstruction of the object.
   * @return {Object} A JSON-friendly representation of the MotionProfile.
   */
  toJSON() {
    return {
      totalDistance: this.totalDistance,
      maxVelocity: this.maxVelocity,
      maxAcceleration: this.maxAcceleration,
      maxJerk: this.maxJerk,
      timestep: this.timestep,
      initialVelocity: this.initialVelocity,
    };
  }

  /**
   * Creates a MotionProfile instance from a JSON object.
   * This static method allows for deserializing a JSON object back into a MotionProfile instance.
   * @param {Object} json - A JSON object representing a MotionProfile.
   * @return {MotionProfile} A new MotionProfile instance.
   */
  static fromJSON(json) {
    return new MotionProfile(
      json.totalDistance,
      json.maxVelocity,
      json.maxAcceleration,
      json.maxJerk,
      json.timestep,
      json.initialVelocity
    );
  }
}
