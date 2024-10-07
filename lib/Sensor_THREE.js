// filename: Sensor_THREE.js
// Extends Transducer_THREE to inherit common behaviors such as helpers and intensity.
// Represents a sensor object that can detect other objects within its field of view.

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js";
import { hexToRgba } from "./UI_Utilities.js";
import { Transducer_THREE } from "./Transducer_THREE.js"; // Import the new Transducer class

/**
 * Represents a sensor object that can detect other objects within its field of view.
 * Extends Transducer_THREE to inherit common behaviors such as helpers and intensity.
 */
export class Sensor_THREE extends Transducer_THREE {
  /** @type {number} Minimum intensity threshold for detection. */
  #minIntensitySensitivity;

  // Default color for the actuator field of effect
  #fieldOfEffect_HelperColor_default = 0xabe1fb;

  /** @type {number} Cached value for 4 * Math.PI * minIntensitySensitivity */
  #cachedSensitivityDenominator;

  /** @type {number} For drawing the field of effect we need a proxy for the source power level. */
  #proxyPower = 1000;

  /**
   * Creates a new Sensor instance.
   * @param {string} [name='Unnamed Sensor'] - The name of the sensor.
   * @param {number} [fieldOfEffect_AngleFull=Math.PI / 4] - The field of effect angle of the sensor in radians.
   * @param {number} [minIntensitySensitivity=0.05] - Sensitivity of the sensor.
   * @param {boolean} [showDirectionHelper=true] - Initial visibility of the direction helper.
   * @param {boolean} [showAxesHelper=true] - Initial visibility of the axes helper.
   * @param {boolean} [showFoEHelper=true] - Initial visibility of the field of effect helper.
   */
  constructor(
    name = "Unnamed Sensor",
    fieldOfEffect_AngleFull = Math.PI / 4,
    minIntensitySensitivity = 0.05, // Sensitivity of the sensor
    showDirectionHelper = true,
    showAxesHelper = true,
    showFoEHelper = true
  ) {
    // Call the parent class constructor (Transducer_THREE) with the given parameters
    super(
      name,
      Transducer_THREE.TRANSDUCER_TYPE.SENSOR,
      fieldOfEffect_AngleFull,
      showDirectionHelper,
      showAxesHelper,
      showFoEHelper
    );

    // Set the default color for the field of effect helper
    this.fieldOfEffect_HelperColor = this.#fieldOfEffect_HelperColor_default;

    // Initialize sensor-specific fields
    this.minIntensitySensitivity = minIntensitySensitivity; // use the setter to update the cached value
  }

  /**
   * Method to calculate the received intensity at a given distance using the inverse-square law.
   * @param {number} power - The power of the source.
   * @param {number} distance - The distance from the source.
   * @returns {number} The received intensity.
   */
  calculateReceivedIntensity(powerAtSource, distance) {
    if (distance <= 0) {
      throw new Error("Distance must be greater than zero.");
    }
    return powerAtSource / (Sensor_THREE.FOUR_PI * distance * distance);
  }

  // Method to calculate detection range based on provided source power
  calculateDetectionRange(powerAtSource) {
    if (powerAtSource <= 0) {
      throw new Error("Power source must be greater than zero.");
    }
    return Math.sqrt(powerAtSource / this.#cachedSensitivityDenominator);
  }

  // Getter for minimum intensity
  get minIntensitySensitivity() {
    return this.#minIntensitySensitivity;
  }

  // Setter for minimum intensity
  set minIntensitySensitivity(value) {
    if (
      typeof value !== "number" ||
      value <= 0 ||
      !isFinite(value) ||
      isNaN(value)
    ) {
      throw new Error(
        "minIntensitySensitivity must be a positive number and finite."
      );
    }
    this.#minIntensitySensitivity = value;
    this.#cachedSensitivityDenominator =
      Sensor_THREE.FOUR_PI * this.#minIntensitySensitivity;

    //update the effective range helper
    this.fieldOfEffect_HelperRange = this.calculateDetectionRange(
      this.proxyPower
    );
  }

  /**
   * Getter for the baseline intensity of the sensor.
   * @returns {number} The baseline intensity of the sensor.
   */
  get proxyPower() {
    return this.#proxyPower;
  }

  /**
   * Setter for the baseline intensity of the sensor.
   * @param {number} value - The new baseline intensity value.
   * @throws {Error} If the baseline intensity value is invalid.
   */
  set proxyPower(value) {
    if (
      typeof value !== "number" ||
      value <= 0 ||
      !isFinite(value) ||
      isNaN(value)
    ) {
      throw new Error("proxyPower must be a positive number and finite.");
    }
    this.#proxyPower = value;

    //update the effective range helper
    this.fieldOfEffect_HelperRange = this.calculateDetectionRange(
      this.proxyPower
    );
  }

  /**
   * Checks if a target object is within both the sensor's field of view and range.
   * Combines both `isInRange` and `isInFieldOfView` for better efficiency.
   * @param {THREE.Object3D} targetObject - The target object to check. Must have a power property.
   * @returns {{inRange: boolean, inFieldOfView: boolean, distance: number, receivedIntensity: number}} An object indicating if the target is within range, its distance, if it's in the field of view, and the calculated received power.
   */
  isTargetDetectable(targetObject) {
    // 1. Ensure the target object has a positive power property
    if (typeof targetObject.power !== "number" || targetObject.power <= 0) {
      // Throw an error if the target object does not have a valid power property
      // include the target object's type in the error message
      throw new Error(
        "Target object must have a positive power property. " +
          typeof targetObject
      );
    }

    // 2. Check if the target is within the field of view (fast check)
    const sensorDirection = this.getWorldDirection(new THREE.Vector3());
    const toTarget = new THREE.Vector3()
      .subVectors(targetObject.position, this.position)
      .normalize();
    const angle = sensorDirection.angleTo(toTarget);

    if (angle > this.fieldOfEffect_AngleFull / 2) {
      // If the target is outside the field of view, return early
      return {
        inFieldOfView: false,
        inRange: false,
        distance: null,
        sourcePower: targetObject.power,
        receivedIntensity: null,
      };
    } else {
      // 3. Calculate the distance from the sensor to the target (intermediate cost)
      const distance = this.position.distanceTo(targetObject.position);

      // 4. Calculate the intensity received by the sensor (highest cost)
      const receivedIntensity = this.calculateReceivedIntensity(
        targetObject.power,
        distance
      );

      // 5. Check if the received intensity is above the sensor's sensitivity threshold
      const inRange = receivedIntensity >= this.#minIntensitySensitivity;

      // Return the combined result with all relevant information
      return {
        inFieldOfView: true,
        inRange,
        distance,
        sourcePower: targetObject.power,
        receivedIntensity,
      };
    }
  }

  /**
   * Serializes the sensor object to a JSON string.
   * @returns {string} The JSON representation of the sensor.
   */
  toJSON() {
    const baseData = JSON.parse(super.toJSON());
    return JSON.stringify({
      ...baseData,
      minIntensitySensitivity: this.#minIntensitySensitivity,
      proxyPower: this.#proxyPower,
    });
  }

  /**
   * Deserializes a sensor object from a JSON string.
   * @param {string} jsonString - The JSON string to deserialize.
   * @returns {Sensor_THREE} The deserialized Sensor_THREE object.
   */
  static fromJSON(jsonString) {
    const data = JSON.parse(jsonString);
    const sensor = new Sensor_THREE(
      data.name,
      data.fieldOfEffect_AngleFull,
      data.minIntensitySensitivity,
      data.showDirectionHelper,
      data.showAxesHelper,
      data.showFoEHelper
    );
    sensor.position.fromArray(data.position);
    sensor.rotation.fromArray(data.rotation);
    sensor.#proxyPower = data.proxyPower; // Restore proxyPower from JSON
    return sensor;
  }
}
