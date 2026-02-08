import { Actuator } from './Actuator.js';

/**
 * SoundActuator class extends Actuator to emit sound.
 */
export class SoundActuator extends Actuator {
  #soundIntensity;

  /**
   * Creates a SoundActuator.
   * @param {Transform} parent - The parent transform.
   * @param {{x: number, y: number, z: number}} localPosition - The local position relative to the parent.
   * @param {{yaw: number, pitch: number, roll: number}} localOrientation - The local orientation relative to the parent.
   * @param {number} fieldOfView - The field of view of the actuator in degrees.
   */
  constructor(parent, localPosition, localOrientation, fieldOfView) {
    super(parent, localPosition, localOrientation, fieldOfView);
    this.#soundIntensity = 1.0; // Default sound intensity (normalized)
  }

  // Getters and Setters
  get soundIntensity() {
    return this.#soundIntensity;
  }

  set soundIntensity(value) {
    if (value < 0 || value > 1) {
      throw new Error('SoundActuator: soundIntensity must be between 0 and 1');
    }
    this.#soundIntensity = value;
  }

  /**
   * Emits sound from the actuator.
   * @returns {number} The sound intensity emitted.
   */
  emitSound() {
    return this.#soundIntensity;
  }

  /**
   * Performs actuation by emitting sound.
   */
  act() {
    // Emit sound within the field of influence
    // Implementation can be added here
  }

  /**
   * Converts the sound actuator to a JSON object for serialization.
   * @returns {Object} The JSON representation of the sound actuator.
   */
  toJSON() {
    return {
      ...super.toJSON(),
      soundIntensity: this.#soundIntensity,
    };
  }

  /**
   * Creates a SoundActuator from a JSON object.
   * @param {Object} json - The JSON object.
   * @param {Transform|null} [parent=null] - The parent transform.
   * @returns {SoundActuator} The created SoundActuator.
   */
  static fromJSON(json, parent = null) {
    const actuator = new SoundActuator(
      parent,
      json.localPosition,
      json.localOrientation,
      json.fieldOfView
    );
    actuator.soundIntensity = json.soundIntensity;
    return actuator;
  }
}
