// filename: Actuator_THREE.js
// Extends Transducer_THREE to represent an actuator object.
// Represents an actuator that can emit energy, such as light or sound, within its field of effect.

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js";
import { Transducer_THREE } from "./Transducer_THREE.js"; // Import the base Transducer class

/**
 * Represents an actuator object that can emit energy, such as light or sound, within its field of effect.
 * Extends Transducer_THREE to inherit common behaviors such as helpers and field of effect visualization.
 */
export class Actuator_THREE extends Transducer_THREE {
  /** @type {number} Power the actuator can emit. */
  #power;

  // Default color for the actuator field of effect
  #fieldOfEffect_HelperColor_default = 0xa3ef59;

  /** @type {number} For drawing the field of effect we need a proxy for the minimum intensity sensitivity. */
  #proxyMinIntensitySensitivity = 0.05;
  /**
   * Creates a new Actuator instance.
   * @param {string} [name='Unnamed Actuator'] - The name of the actuator.
   * @param {number} [fieldOfEffect_AngleFull=Math.PI / 4] - The field of effect angle of the actuator in radians.
   * @param {number} [power=100] - Power the actuator can emit.
   * @param {boolean} [showDirectionHelper=true] - Initial visibility of the direction helper.
   * @param {boolean} [showAxesHelper=true] - Initial visibility of the axes helper.
   * @param {boolean} [showFoEHelper=true] - Initial visibility of the field of effect helper.
   */
  constructor(
    name = "Unnamed Actuator",
    fieldOfEffect_AngleFull = Math.PI / 4,
    power = 100,
    showDirectionHelper = true,
    showAxesHelper = true,
    showFoEHelper = true
  ) {
    // Call the parent class constructor (Transducer_THREE) with the given parameters
    super(
      name,
      Transducer_THREE.TRANSDUCER_TYPE.ACTUATOR,
      fieldOfEffect_AngleFull,
      showDirectionHelper,
      showAxesHelper,
      showFoEHelper
    );

    // Set the default color for the field of effect helper
    this.fieldOfEffect_HelperColor = this.#fieldOfEffect_HelperColor_default;

    // Initialize actuator-specific fields
    this.power = power; // Use the setter to validate and set power
  }

  /**
   * Getter for the power the actuator can emit.
   * @returns {number} The power of the actuator.
   */
  get power() {
    return this.#power;
  }

  /**
   * Setter for the power the actuator can emit.
   * @param {number} value - The new power value.
   * @throws {Error} If the power value is invalid.
   */
  set power(value) {
    if (
      typeof value !== "number" ||
      value <= 0 ||
      !isFinite(value) ||
      isNaN(value)
    ) {
      throw new Error("Power must be a positive number and finite.");
    }
    this.#power = value;

    this.fieldOfEffect_HelperRange = this.calculateEffectiveRange(
      this.#proxyMinIntensitySensitivity
    );
  }

  /**
   * Method to calculate the effective range of the actuator based on a minimum intensity sensitivity. Used to draw the field of effect.
   * @param {number} minIntensitySensitivity - The minimum intensity sensitivity required for detection.
   * @returns {number} The effective range of the actuator.
   * @throws {Error} If the minimum intensity sensitivity is invalid.
   */
  calculateEffectiveRange(minIntensitySensitivity) {
    if (minIntensitySensitivity <= 0) {
      throw new Error(
        "Minimum intensity sensitivity must be greater than zero."
      );
    }
    return Math.sqrt(
      this.#power / (minIntensitySensitivity * Transducer_THREE.FOUR_PI)
    );
  }

  /**
   * Checks is a target object is withini the actuator's field of effect.
   * @param {THREE.Object3D} targetObject
   * @returns {{inFieldOfEffect: boolean, distance: number, transmittedIntesity: number}} An object indicating if the target is within the field of effect and the distance to the target.
   */
  isTargetInFieldOfEffect(targetObject) {
    // Check if the target object is a valid instance of THREE.Object3D
    if (!(targetObject instanceof THREE.Object3D)) {
      throw new Error("Target object must be an instance of THREE.Object3D.");
    }
    // Check if the target object has a valid minIntensitySensitivity property
    if (
      typeof targetObject.minIntensitySensitivity !== "number" ||
      targetObject.minIntensitySensitivity <= 0
    ) {
      throw new Error(
        "Target object must have a positive minIntensitySensitivity property."
      );
    }

    // check if the target is within the field of effect
    const actuatorDirection = this.getWorldDirection(new THREE.Vector3());
    const toTarget = new THREE.Vector3()
      .subVectors(targetObject.position, this.position)
      .normalize();
    const angle = actuatorDirection.angleTo(toTarget);

    // Check if the target is within the field of effect
    if (angle > this.fieldOfEffect_AngleFull / 2) {
      return {
        power: this.power,
        inFieldOfEffect: false,
        distance: null,
        transmittedIntensity: null,
      };
    } else {
      // Calculate the distance and transmitted intensity
      const distance = this.position.distanceTo(targetObject.position);
      const transmittedIntensity = this.calculateTransmittedIntensity(distance);
      return {
        power: this.power,
        inFieldOfEffect: true,
        distance,
        transmittedIntensity,
      };
    }
  }

  /**
   * Calculates the intensity of the actuator's power at a given distance.
   * @param {number} distance - The distance from the actuator.
   * @returns {number} The intensity of the actuator's power at the given distance.
   * @throws {Error} If the distance is invalid.
   */
  calculateTransmittedIntensity(distance) {
    if (distance <= 0) {
      throw new Error("Distance must be greater than zero.");
    }
    return this.power / (distance * distance * Transducer_THREE.FOUR_PI);
  }

  /**
   * Serializes the actuator object to a JSON string.
   * @returns {string} The JSON representation of the actuator.
   */
  toJSON() {
    const baseData = JSON.parse(super.toJSON());
    return JSON.stringify({
      ...baseData,
      power: this.#power,
    });
  }

  /**
   * Deserializes an actuator object from a JSON string.
   * @param {string} jsonString - The JSON string to deserialize.
   * @returns {Actuator_THREE} The deserialized Actuator_THREE object.
   */
  static fromJSON(jsonString) {
    const data = JSON.parse(jsonString);
    const actuator = new Actuator_THREE(
      data.name,
      data.fieldOfEffect_AngleFull,
      data.power,
      data.showDirectionHelper,
      data.showAxesHelper,
      data.showFoEHelper
    );
    actuator.position.fromArray(data.position);
    actuator.rotation.fromArray(data.rotation);
    return actuator;
  }
}
