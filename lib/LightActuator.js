import { Actuator } from './Actuator.js';

/**
 * LightActuator class extends Actuator to emit light.
 */
export class LightActuator extends Actuator {
  #lightIntensity;

  /**
   * Creates a LightActuator.
   * @param {Transform} parent - The parent transform.
   * @param {{x: number, y: number, z: number}} localPosition - The local position relative to the parent.
   * @param {{yaw: number, pitch: number, roll: number}} localOrientation - The local orientation relative to the parent.
   * @param {number} fieldOfView - The field of view of the actuator in degrees.
   */
  constructor(parent, localPosition, localOrientation, fieldOfView) {
    super(parent, localPosition, localOrientation, fieldOfView);
    this.#lightIntensity = 1.0; // Default light intensity (normalized)
  }

  // Getters and Setters
  get lightIntensity() {
    return this.#lightIntensity;
  }

  set lightIntensity(value) {
    if (value < 0 || value > 1) {
      throw new Error('LightActuator: lightIntensity must be between 0 and 1');
    }
    this.#lightIntensity = value;
  }

  /**
   * Emits light from the actuator.
   * @returns {number} The light intensity emitted.
   */
  emitLight() {
    return this.#lightIntensity;
  }

  /**
   * Performs actuation by emitting light.
   */
  act() {
    // Emit light within the field of influence
    // Implementation can be added here
  }

  /**
   * Converts the light actuator to a JSON object for serialization.
   * @returns {Object} The JSON representation of the light actuator.
   */
  toJSON() {
    return {
      ...super.toJSON(),
      lightIntensity: this.#lightIntensity,
    };
  }

  /**
   * Creates a LightActuator from a JSON object.
   * @param {Object} json - The JSON object.
   * @param {Transform|null} [parent=null] - The parent transform.
   * @returns {LightActuator} The created LightActuator.
   */
  static fromJSON(json, parent = null) {
    const actuator = new LightActuator(
      parent,
      json.localPosition,
      json.localOrientation,
      json.fieldOfView
    );
    actuator.lightIntensity = json.lightIntensity;
    return actuator;
  }
}
