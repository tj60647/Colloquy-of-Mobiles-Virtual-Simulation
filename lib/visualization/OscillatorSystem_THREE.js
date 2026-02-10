import { MotionProfile } from './MotionProfile.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';

/**
 * Class representing an oscillator that moves between defined positions with a given motion profile.
 * The oscillator's movement is defined by parameters such as minimum and maximum positions,
 * reinforcement position, tolerance, and kinematic constraints like maximum velocity and acceleration.
 * The oscillator can execute predefined motions such as stopping at a reinforcement position or oscillating
 * between two positions, all driven by a motion profile generated based on the input parameters.
 */
export class OscillatorSystem_THREE extends THREE.Object3D {
  /**
   * Enum-like object representing the possible motion requests for an oscillator.
   * These requests dictate how the oscillator should behave, such as stopping or releasing.
   * @enum {string}
   */
  static MOTION_REQUEST = Object.freeze({
    /** Request to stop the oscillator's movement and move to the reinforcement position. */
    STOP: 'STOP',

    /** Request to release the oscillator, allowing it to oscillate between defined positions. */
    RELEASE: 'RELEASE',

    /** Unknown or undefined motion request. */
    UNKNOWN: 'UNKNOWN',
  });

  /** @type {number} The oscillator's minimum position in radians. */
  #minPosition;

  /** @type {number} The oscillator's maximum position in radians. */
  #maxPosition;

  /** @type {number} The position the oscillator should move to when stopping, in radians. */
  #reinforcementPosition;

  /** @type {number} The tolerance level to consider when checking if positions are close enough, in radians. */
  #tolerance;

  /** @type {number} The maximum velocity the oscillator can achieve, in radians per second. */
  #maxVelocity;

  /** @type {number} The maximum acceleration the oscillator can achieve, in radians per second squared. */
  #maxAcceleration;

  /** @type {number} The max jerk value (rate of change of acceleration), currently not used. In radians per second cubed. */
  #maxJerk;

  /** @type {number} The current position of the oscillator in radians. */
  #currentPosition;

  /** @type {number} The starting position of the oscillator in radians. */
  #startPosition;

  /** @type {Oscillator_THREE.MOTION_REQUEST} The current motion request for the oscillator. */
  #currentMotionRequest;

  /** @type {number} The target position the oscillator should move towards. */
  #targetPosition;

  /** @type {MotionProfile} The motion profile generated for the oscillator's movement. */
  #motionProfile;

  /** @type {number} The current index of the point within the motion profile being executed. */
  #currentProfileIndex;

  /** @type {number} The time step used to calculate the motion profile based on the frame rate. */
  #timeStep;

  /** @type {boolean} A flag indicating whether the oscillator has reached its stop target position. */
  #stopTargetReached;

  ///////////////////////////////////////////////////////////////////////////
  // Visualizing the Oscillator_THREE
  ///////////////////////////////////////////////////////////////////////////

  /** @type {THREE.ArrowHelper} Visual helper to show the oscillator's base direction. */
  #SystemDirectionHelper;

  /** @type {THREE.Group} The moving portion of the oscillator system. */
  #oscillator;

  /** @type {THREE.AxesHelper} Visual helper to show the oscillator system's local axes. */
  #systemAxesHelper;

  /** @type {number} Length of the axes helper. */
  #axesLength;

  /** @type {THREE.Group} Visual helper to show the range of motion. */
  #rangeOfMotion_HelperGroup;

  /** @type {number} Size of the range of motion helper. */
  #rangeOfMotion_HelperSize;

  /** @type {number} Color of the range of motion helper. */
  #rangeOfMotion_HelperColor;

  /** Flags to control visibility of helpers */
  showSystemDirectionHelper; // Flag to control the visibility of the base direction helper
  showOscillator; // Flag to control the visibility of the current direction helper
  showSystemAxesHelper; // Flag to control the visibility of the axes helper
  showRangeOfMotionHelper; // Flag to control the visibility of the range of motion helper

  /**
   * Creates an OscillatorSystem_THREE instance.
   * @param {string} [name='Unnamed Oscillator'] - The name of the oscillator.
   * @param {number} minPosition - The minimum position the oscillator can reach, in radians.
   * @param {number} maxPosition - The maximum position the oscillator can reach, in radians.
   * @param {number} reinforcementPosition - The position the oscillator should move to when stopping, in radians.
   * @param {number} [tolerance=1.0] - The tolerance level to consider when checking if positions are close enough, in radians.
   * @param {number} [frameRate=60] - The frame rate at which the oscillator operates.
   * @param {number} [maxVelocity=20.0] - The maximum velocity the oscillator can achieve, in radians per second.
   * @param {number} [maxAcceleration=10.0] - The maximum acceleration the oscillator can achieve, in radians per second squared.
   * @param {number} [maxJerk=0.0] - The max jerk value (rate of change of acceleration), currently not used. In radians per second cubed.
   * @param {boolean} [showSystemDirectionHelper=true] - Initial visibility of the base direction helper.
   * @param {boolean} [showOscillator=true] - Initial visibility of the current direction helper.
   * @param {boolean} [showSystemAxesHelper=true] - Initial visibility of the axes helper.
   * @param {boolean} [showRangeOfMotionHelper=true] - Initial visibility of the range of motion helper.
   */
  constructor(
    name = 'Unnamed Oscillator',
    minPosition = -Math.PI / 4,
    maxPosition = Math.PI / 4,
    reinforcementPosition = 0,
    tolerance = 0.25 * (Math.PI / 180), // Convert to radians
    frameRate = 60,
    maxVelocity = 20.0 * (Math.PI / 180), // Convert to radians per second
    maxAcceleration = 10.0 * (Math.PI / 180), // Convert to radians per second squared
    maxJerk = 0.0 * (Math.PI / 180), // Convert to radians per second cubed
    showSystemDirectionHelper = true,
    showOscillator = true,
    showSystemAxesHelper = true,
    showRangeOfMotionHelper = true
  ) {
    super(); // Call the parent constructor

    //the oscillator is 2 nested Object3D instances
    //"this" is the base Object3D instance, it does not move
    // a child represents the oscillation, it moves
    // the child is added to the base
    // the child's position is set to the parent position
    // the child's rotation is set to the current direction

    // Parameter validation
    if (minPosition >= maxPosition) {
      throw new Error(
        "OscillatorSystem_THREE.constructor: 'minPosition' must be less than 'maxPosition'."
      );
    }
    if (reinforcementPosition < minPosition || reinforcementPosition > maxPosition) {
      throw new Error(
        "OscillatorSystem_THREE.constructor: 'reinforcementPosition' must be within the range of 'minPosition' and 'maxPosition'."
      );
    }
    if (tolerance < 0) {
      throw new Error(
        "OscillatorSystem_THREE.constructor: 'tolerance' must be a non-negative value."
      );
    }
    if (frameRate <= 0) {
      throw new Error("OscillatorSystem_THREE.constructor: 'frameRate' must be a positive value.");
    }
    if (maxVelocity <= 0) {
      throw new Error(
        "OscillatorSystem_THREE.constructor: 'maxVelocity' must be a positive value."
      );
    }
    if (maxAcceleration <= 0) {
      throw new Error(
        "OscillatorSystem_THREE.constructor: 'maxAcceleration' must be a positive value."
      );
    }
    if (maxJerk < 0) {
      throw new Error(
        "OscillatorSystem_THREE.constructor: 'maxJerk' must be a non-negative value."
      );
    }

    // Initialize properties
    this.name = name;
    this.#minPosition = minPosition;
    this.#maxPosition = maxPosition;
    this.#reinforcementPosition = reinforcementPosition;
    this.#currentPosition = minPosition; // Start at minPosition
    this.#startPosition = minPosition; // Initialize startPosition to the starting position
    this.#tolerance = tolerance;
    this.#currentMotionRequest = OscillatorSystem_THREE.MOTION_REQUEST.STOP; // Default motion request is to stop
    this.#targetPosition = this.reinforcementPosition;
    this.#motionProfile = null; // Will hold an instance of MotionProfile
    this.#currentProfileIndex = 0;
    this.#timeStep = 1 / frameRate; // Time step based on frame rate
    this.#maxVelocity = maxVelocity;
    this.#maxAcceleration = maxAcceleration;
    this.#maxJerk = maxJerk;
    this.#stopTargetReached = false;

    // Initialize visual helper properties
    this.#rangeOfMotion_HelperColor = 0x00ff00; // Green color for the range of motion helper
    this.showSystemDirectionHelper = showSystemDirectionHelper;
    this.showOscillator = showOscillator;
    this.showSystemAxesHelper = showSystemAxesHelper;
    this.showRangeOfMotionHelper = showRangeOfMotionHelper;
    this.#rangeOfMotion_HelperSize = 10; // Default size

    // Create the visual helpers
    this.#createRangeOfMotionHelper();
    this.#createSystemDirectionHelper();
    this.#createOscillator();
    this.#createSystemAxesHelper();
  }

  // Getters and Setters

  get anchor() {
    return this; // im not sure this makes sense
  }

  /**
   * Returns the group that is the oscillator.
   * @return {THREE.Group} The group that represents the oscillator.
   */
  get oscillator() {
    return this.#oscillator;
  }

  get minPosition() {
    return this.#minPosition;
  }

  get maxPosition() {
    return this.#maxPosition;
  }

  get reinforcementPosition() {
    return this.#reinforcementPosition;
  }

  get tolerance() {
    return this.#tolerance;
  }

  get maxVelocity() {
    return this.#maxVelocity;
  }

  get maxAcceleration() {
    return this.#maxAcceleration;
  }

  get maxJerk() {
    return this.#maxJerk;
  }

  get currentPosition() {
    return this.#currentPosition;
  }

  get startPosition() {
    return this.#startPosition;
  }

  get currentMotionRequest() {
    return this.#currentMotionRequest;
  }

  get targetPosition() {
    return this.#targetPosition;
  }

  get motionProfile() {
    return this.#motionProfile;
  }

  get currentProfileIndex() {
    return this.#currentProfileIndex;
  }

  get timeStep() {
    return this.#timeStep;
  }

  get stopTargetReached() {
    return this.#stopTargetReached;
  }

  set minPosition(value) {
    if (value >= this.maxPosition) {
      throw new Error('Oscillator_THREE: minPosition must be less than maxPosition.');
    }
    this.#minPosition = value;
  }

  set maxPosition(value) {
    if (value <= this.minPosition) {
      throw new Error('Oscillator_THREE: maxPosition must be greater than minPosition.');
    }
    this.#maxPosition = value;
  }

  set reinforcementPosition(value) {
    if (value < this.minPosition || value > this.maxPosition) {
      throw new Error(
        'Oscillator_THREE: reinforcementPosition must be within the range of minPosition and maxPosition.'
      );
    }
    this.#reinforcementPosition = value;
  }

  set tolerance(value) {
    if (value < 0) {
      throw new Error('Oscillator_THREE: tolerance must be a non-negative value.');
    }
    this.#tolerance = value;
  }

  set maxVelocity(value) {
    if (value <= 0) {
      throw new Error('Oscillator_THREE: maxVelocity must be a positive value.');
    }
    this.#maxVelocity = value;
  }

  set maxAcceleration(value) {
    if (value <= 0) {
      throw new Error('Oscillator_THREE: maxAcceleration must be a positive value.');
    }
    this.#maxAcceleration = value;
  }

  set maxJerk(value) {
    if (value < 0) {
      throw new Error('Oscillator_THREE: maxJerk must be a non-negative value.');
    }
    this.#maxJerk = value;
  }

  set currentPosition(value) {
    this.#currentPosition = value;
  }

  set startPosition(value) {
    this.#startPosition = value;
  }

  setMotionRequest(motionRequest) {
    // Validate motion request
    if (!Object.values(OscillatorSystem_THREE.MOTION_REQUEST).includes(motionRequest)) {
      console.warn(
        `Oscillator_THREE: Received invalid motion request '${motionRequest}'. Defaulting to UNKNOWN.`
      );
      this.#currentMotionRequest = OscillatorSystem_THREE.MOTION_REQUEST.UNKNOWN;
      return;
    }

    // If the new motion request is the same as the current one, do nothing
    if (this.#currentMotionRequest === motionRequest) {
      return;
    }

    // Update the current motion request and determine the target position
    this.#currentMotionRequest = motionRequest;
    if (motionRequest === OscillatorSystem_THREE.MOTION_REQUEST.STOP) {
      this.targetPosition = this.reinforcementPosition;
      this.startPosition = this.currentPosition; // Track the start position when motion begins
      this.computeMotionProfile();
    } else if (motionRequest === OscillatorSystem_THREE.MOTION_REQUEST.RELEASE) {
      this.updateOscillationTargetPosition();
      this.startPosition = this.currentPosition; // Track the start position when oscillation begins
      this.computeMotionProfile();
    }
  }

  // Motion Control Methods

  /**
   * Updates the target position for the oscillator during oscillation.
   * The target position is toggled between minPosition and maxPosition depending on the current position.
   */
  updateOscillationTargetPosition() {
    if (this.isCloseEnoughOrGreaterThan(this.maxPosition)) {
      this.#targetPosition = this.minPosition;
    } else if (this.isCloseEnoughOrLessThan(this.minPosition)) {
      this.#targetPosition = this.maxPosition;
    } else {
      this.#targetPosition = this.maxPosition;
    }
  }

  /**
   * Computes the motion profile for the oscillator based on the current and target positions.
   * The motion profile is generated to smoothly move the oscillator from its current position to the target position.
   */
  computeMotionProfile() {
    const distanceToTarget = this.calculateDistance(this.currentPosition, this.targetPosition);

    this.#motionProfile = new MotionProfile(
      distanceToTarget,
      this.maxVelocity,
      this.maxAcceleration,
      this.maxJerk,
      this.timeStep
    );

    if (!this.#motionProfile.profile.length) {
      console.log(`Oscillator_THREE.computeMotionProfile: No motion profile generated.`);
    }

    this.#currentProfileIndex = 0;
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
    switch (this.currentMotionRequest) {
      case OscillatorSystem_THREE.MOTION_REQUEST.STOP:
        this.handleStopRequest();
        break;
      case OscillatorSystem_THREE.MOTION_REQUEST.RELEASE:
        this.handleReleaseRequest();
        break;
      default:
        console.warn(
          `OscillatorSystem_THREE.act: Unknown motion request '${this.currentMotionRequest}'.`
        );
    }
    // Update the oscillator
    this.#updateoscillator();
  }

  /**
   * Handles the STOP motion request.
   */
  handleStopRequest() {
    if (!this.#motionProfile || this.#currentProfileIndex >= this.#motionProfile.profile.length) {
      if (!this.#stopTargetReached) {
        // Oscillator has reached its target position
        // Implement any necessary actions upon reaching the stop target
        console.log(`OscillatorSystem_THREE.handleStopRequest: Reached reinforcement position.`);
      }
      this.#stopTargetReached = true;
      return;
    }

    this.#stopTargetReached = false;
    const profilePoint = this.#motionProfile.profile[this.#currentProfileIndex];
    this.currentPosition =
      this.startPosition +
      (this.targetPosition >= this.startPosition ? profilePoint.position : -profilePoint.position);
    this.#currentProfileIndex += 1;
  }

  /**
   * Handles the RELEASE motion request.
   */
  handleReleaseRequest() {
    if (!this.#motionProfile || this.#currentProfileIndex >= this.#motionProfile.profile.length) {
      this.updateOscillationTargetPosition();
      this.startPosition = this.currentPosition;
      this.computeMotionProfile();
    } else {
      const profilePoint = this.#motionProfile.profile[this.#currentProfileIndex];
      this.currentPosition =
        this.startPosition +
        (this.targetPosition >= this.startPosition
          ? profilePoint.position
          : -profilePoint.position);
      this.#currentProfileIndex += 1;
    }
  }

  // Helper Methods

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
    return `Oscillator_THREE State:
      Current Position: ${this.currentPosition}
      Start Position: ${this.startPosition}
      Target Position: ${this.targetPosition}
      Current Motion Request: ${this.currentMotionRequest}
      Tolerance: ${this.tolerance}
      Motion Profile: ${
        this.motionProfile ? this.motionProfile.toString() : 'No motion profile available'
      }`;
  }

  /**
   * Converts the Oscillator_THREE instance to a JSON-friendly object.
   * This method serializes both constructor parameters and dynamic states.
   * @return {Object} A JSON-friendly representation of the Oscillator_THREE.
   */
  toJSON() {
    return {
      name: this.name,
      minPosition: this.minPosition,
      maxPosition: this.maxPosition,
      reinforcementPosition: this.reinforcementPosition,
      tolerance: this.tolerance,
      frameRate: 1 / this.timeStep, // Derive frameRate from timeStep
      maxVelocity: this.maxVelocity,
      maxAcceleration: this.maxAcceleration,
      maxJerk: this.maxJerk,
      currentPosition: this.currentPosition,
      currentMotionRequest: this.currentMotionRequest,
      targetPosition: this.targetPosition,
      currentProfileIndex: this.currentProfileIndex,
      stopTargetReached: this.stopTargetReached,
      // Include visual helper visibility flags
      showSystemDirectionHelper: this.showSystemDirectionHelper,
      showOscillator: this.showOscillator,
      showSystemAxesHelper: this.showSystemAxesHelper,
      showRangeOfMotionHelper: this.showRangeOfMotionHelper,
      rangeOfMotion_HelperSize: this.#rangeOfMotion_HelperSize,
      rangeOfMotion_HelperColor: this.#rangeOfMotion_HelperColor,
    };
  }

  /**
   * Creates an Oscillator_THREE instance from a JSON object.
   * This static method allows for deserializing a JSON object back into an Oscillator_THREE instance.
   * @param {Object} json - A JSON object representing an Oscillator_THREE.
   * @return {Oscillator_THREE} A new Oscillator_THREE instance.
   */
  static fromJSON(json) {
    const oscillator = new OscillatorSystem_THREE(
      json.name,
      json.minPosition,
      json.maxPosition,
      json.reinforcementPosition,
      json.tolerance,
      json.frameRate,
      json.maxVelocity,
      json.maxAcceleration,
      json.maxJerk,
      json.showSystemDirectionHelper,
      json.showOscillator,
      json.showSystemAxesHelper,
      json.showRangeOfMotionHelper
    );
    oscillator.currentPosition = json.currentPosition;
    oscillator.startPosition = json.startPosition;
    oscillator.currentMotionRequest = json.currentMotionRequest;
    oscillator.targetPosition = json.targetPosition;
    oscillator.currentProfileIndex = json.currentProfileIndex;
    oscillator.stopTargetReached = json.stopTargetReached;
    oscillator.#rangeOfMotion_HelperSize = json.rangeOfMotion_HelperSize;
    oscillator.#rangeOfMotion_HelperColor = json.rangeOfMotion_HelperColor;
    // Reconstruct motionProfile if necessary
    if (json.motionProfile) {
      oscillator.#motionProfile = MotionProfile.fromJSON(json.motionProfile);
    }
    return oscillator;
  }

  ///////////////////////////////////////////////////////////////////////////
  // Visual Helper Methods
  ///////////////////////////////////////////////////////////////////////////

  /**
   * Creates the Range of Motion (RoM) helper, which visualizes the range angle.
   * @private
   */
  #createRangeOfMotionHelper() {
    const size = this.#rangeOfMotion_HelperSize;
    const color = this.#rangeOfMotion_HelperColor;

    // Remove the existing range helper group if it exists
    if (this.#rangeOfMotion_HelperGroup) {
      this.remove(this.#rangeOfMotion_HelperGroup);
    }

    // Create a new group to hold the range of motion helper
    this.#rangeOfMotion_HelperGroup = new THREE.Group();
    const material = new THREE.LineBasicMaterial({ color });

    // Draw lines from origin to min and max positions
    const pointsOriginToMin = [
      new THREE.Vector3(0, 0, 0), // Origin
      new THREE.Vector3(size * Math.sin(this.#minPosition), 0, size * Math.cos(this.#minPosition)), // Min position in XZ plane
    ];
    const geometryXZ_min = new THREE.BufferGeometry().setFromPoints(pointsOriginToMin);
    const lineXZ_min = new THREE.Line(geometryXZ_min, material);
    this.#rangeOfMotion_HelperGroup.add(lineXZ_min);

    const pointsOriginToMax = [
      new THREE.Vector3(0, 0, 0), // Origin
      new THREE.Vector3(size * Math.sin(this.#maxPosition), 0, size * Math.cos(this.#maxPosition)), // Max position in XZ plane
    ];
    const geometryXZ_max = new THREE.BufferGeometry().setFromPoints(pointsOriginToMax);
    const lineXZ_max = new THREE.Line(geometryXZ_max, material);
    this.#rangeOfMotion_HelperGroup.add(lineXZ_max);

    // Draw an arc in the XZ plane from the min to the max position using EllipseCurve
    const arcCurve = new THREE.EllipseCurve(
      0,
      0, // Center of the arc
      size,
      size, // X and Z radius (same for a circular arc)
      this.#minPosition, // Starting angle (min position in radians)
      this.#maxPosition, // Ending angle (max position in radians)
      false, // Always go counter-clockwise (set to false for clockwise)
      0
    );

    const range = Math.abs(this.#maxPosition - this.#minPosition);
    const pointCount = Math.floor((range * 180) / Math.PI);
    const arcPoints = arcCurve.getPoints(pointCount);

    const arcGeometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const arc = new THREE.Line(arcGeometry, material);

    // Align the arc to be in the YZ plane
    arc.rotation.z = Math.PI / 2;
    arc.rotation.x = Math.PI / 2;
    arc.position.set(0, 0, 0);
    this.#rangeOfMotion_HelperGroup.add(arc);

    // Set the visibility based on the flag
    this.#rangeOfMotion_HelperGroup.visible = this.showRangeOfMotionHelper;
    this.add(this.#rangeOfMotion_HelperGroup);
  }

  /**
   * Creates the base direction helper using an ArrowHelper.
   * @private
   */
  #createSystemDirectionHelper() {
    // Remove the existing direction helper if it exists
    if (this.#SystemDirectionHelper) {
      this.remove(this.#SystemDirectionHelper);
    }

    this.#SystemDirectionHelper = new THREE.ArrowHelper(
      this.getWorldDirection(new THREE.Vector3()),
      new THREE.Vector3(0, 0, 0),
      this.#axesLength || 10, // Default length if not set
      0xff0000 // Red color for the direction arrow
    );
    this.#SystemDirectionHelper.visible = this.showSystemDirectionHelper;
    this.add(this.#SystemDirectionHelper);
  }

  /**
   * Creates the current direction helper using an ArrowHelper.
   * @private
   */
  #createOscillator() {
    // Remove the existing direction helper if it exists
    if (this.#oscillator) {
      //check if the oscillator has children
      if (this.#oscillator.children.length > 0) {
        //throw an error if the oscillator has children
        throw new Error('OscillatorSystem_THREE.#createOscillator: Oscillator has children.');
      } else {
        //remove the oscillator if it has no children
        this.remove(this.#oscillator);
      }
    }

    // add a group to hold the oscillator
    this.#oscillator = new THREE.Group();
    this.#oscillator.rotation.y = this.currentPosition;

    // add an axis helper to the group
    const axis = new THREE.AxesHelper(this.#axesLength || 10); // Default size if not set
    this.#oscillator.add(axis);

    // add an arrow to the group
    // it point in the direction of the z-axis
    const oscillatorDirection = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, 0),
      this.#axesLength || 10, // Default length if not set
      0x0088ff // Blue color for the direction arrow
    );
    this.#oscillator.add(oscillatorDirection);

    this.#oscillator.visible = this.showOscillator;
    this.add(this.#oscillator);
  }

  /**
   * Updates the current direction helper's orientation based on the current position.
   * @private
   */
  #updateoscillator() {
    if (this.#oscillator) {
      //set the orientation direction of the group to the current position
      //assume the rotation is in the y-axis
      this.#oscillator.rotation.y = this.currentPosition;
      // this.#oscillator.setDirection(
      //   new THREE.Vector3(
      //     Math.sin(this.currentPosition),
      //     0,
      //     Math.cos(this.currentPosition)
      //   )
      // );
    }
  }

  /**
   * Creates the axes helper.
   * @private
   */
  #createSystemAxesHelper() {
    // Remove the existing axes helper if it exists
    if (this.#systemAxesHelper) {
      this.remove(this.#systemAxesHelper);
    }

    this.#systemAxesHelper = new THREE.AxesHelper(this.#axesLength || 10); // Default size if not set
    this.#systemAxesHelper.visible = this.showSystemAxesHelper;
    this.add(this.#systemAxesHelper);
  }
}
