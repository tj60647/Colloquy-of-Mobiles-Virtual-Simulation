import { Actuator_THREE } from "./Actuator_THREE.js";

export class Actuator_Sound_THREE extends Actuator_THREE {
  /** @type {number} Volume of the sound actuator (in decibels). */
  #volume;

  /** @type {number} Frequency of the sound actuator (in Hertz). */
  #frequency;

  /**
   * Creates a new SoundActuator instance.
   * @param {string} [name='Unnamed Sound Actuator'] - The name of the sound actuator.
   * @param {number} [volume=70] - The volume of the sound (in dB).
   * @param {number} [frequency=440] - The frequency of the sound (in Hz).
   * @param {number} [range=10] - The effective range of the sound actuator.
   * @param {number} [effectAngle=Math.PI / 4] - The field of effect angle for directional sound.
   */
  constructor(
    name = "Unnamed Sound Actuator",
    volume = 70,
    frequency = 440,
    range = 10,
    effectAngle = Math.PI / 4
  ) {
    super(name, range, effectAngle);
    this.#volume = volume;
    this.#frequency = frequency;
  }

  /**
   * Getter for the volume.
   * @returns {number} The current volume in decibels.
   */
  get volume() {
    return this.#volume;
  }

  /**
   * Setter for the volume.
   * @param {number} value - The new volume value.
   */
  set volume(value) {
    if (typeof value !== "number" || value <= 0) {
      throw new Error("Volume must be a positive number.");
    }
    this.#volume = value;
  }

  /**
   * Getter for the frequency.
   * @returns {number} The current frequency in Hertz.
   */
  get frequency() {
    return this.#frequency;
  }

  /**
   * Setter for the frequency.
   * @param {number} value - The new frequency value.
   */
  set frequency(value) {
    if (typeof value !== "number" || value <= 0) {
      throw new Error("Frequency must be a positive number.");
    }
    this.#frequency = value;
  }

  /**
   * Serializes the sound actuator object to a JSON string.
   * @returns {string} The JSON representation of the sound actuator.
   */
  toJSON() {
    const baseData = JSON.parse(super.toJSON());
    return JSON.stringify({
      ...baseData,
      volume: this.#volume,
      frequency: this.#frequency,
    });
  }

  /**
   * Deserializes a sound actuator object from a JSON string.
   * @param {string} jsonString - The JSON string to deserialize.
   * @returns {SoundActuator_THREE} The deserialized SoundActuator_THREE object.
   */
  static fromJSON(jsonString) {
    const data = JSON.parse(jsonString);
    const actuator = new SoundActuator_THREE(
      data.name,
      data.volume,
      data.frequency,
      data.range,
      data.effectAngle
    );
    actuator.position.fromArray(data.position);
    actuator.rotation.fromArray(data.rotation);
    return actuator;
  }
}
