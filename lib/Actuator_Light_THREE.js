import { Actuator_THREE } from "./Actuator_THREE.js";

export class Actuator_Light_THREE extends Actuator_THREE {
  /** @type {number} Intensity of the light actuator (lux). */
  #intensity;

  /** @type {string} Color of the light actuator (hex or CSS color string). */
  #color;

  /**
   * Creates a new LightActuator instance.
   * @param {string} [name='Unnamed Light Actuator'] - The name of the light actuator.
   * @param {number} [intensity=100] - The intensity of the light (in lux).
   * @param {string} [color='#ffffff'] - The color of the light.
   * @param {number} [range=15] - The effective range of the light actuator.
   * @param {number} [effectAngle=Math.PI / 4] - The field of effect angle for the light.
   */
  constructor(
    name = "Unnamed Light Actuator",
    intensity = 100,
    color = "#ffffff",
    range = 15,
    effectAngle = Math.PI / 4
  ) {
    super(name, range, effectAngle);
    this.#intensity = intensity;
    this.#color = color;

    // Update the field of effect helper to use the light color
    this.#updateFieldColor();
  }

  /**
   * Updates the field of effect helper's color to match the light color.
   * @private
   */
  #updateFieldColor() {
    if (this.children.length > 0) {
      const helper = this.children[0]; // The cone helper is the first child
      if (helper.material) {
        helper.material.color.set(this.#color);
      }
    }
  }

  /**
   * Getter for the intensity.
   * @returns {number} The current intensity of the light.
   */
  get intensity() {
    return this.#intensity;
  }

  /**
   * Setter for the intensity.
   * @param {number} value - The new intensity value.
   */
  set intensity(value) {
    if (typeof value !== "number" || value <= 0) {
      throw new Error("Intensity must be a positive number.");
    }
    this.#intensity = value;
  }

  /**
   * Getter for the color.
   * @returns {string} The current color of the light.
   */
  get color() {
    return this.#color;
  }

  /**
   * Setter for the color.
   * @param {string} value - The new color value.
   */
  set color(value) {
    this.#color = value;
    this.#updateFieldColor();
  }

  /**
   * Serializes the light actuator object to a JSON string.
   * @returns {string} The JSON representation of the light actuator.
   */
  toJSON() {
    const baseData = JSON.parse(super.toJSON());
    return JSON.stringify({
      ...baseData,
      intensity: this.#intensity,
      color: this.#color,
    });
  }

  /**
   * Deserializes a light actuator object from a JSON string.
   * @param {string} jsonString - The JSON string to deserialize.
   * @returns {LightActuator_THREE} The deserialized LightActuator_THREE object.
   */
  static fromJSON(jsonString) {
    const data = JSON.parse(jsonString);
    const actuator = new LightActuator_THREE(
      data.name,
      data.intensity,
      data.color,
      data.range,
      data.effectAngle
    );
    actuator.position.fromArray(data.position);
    actuator.rotation.fromArray(data.rotation);
    return actuator;
  }
}
