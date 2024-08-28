import { Sensor } from "./Sensor.js";

/**
 * SoundSensor class extends Sensor to sense sound levels.
 */
export class SoundSensor extends Sensor {
  /**
   * Creates a SoundSensor.
   * @param {Transform} parent - The parent transform.
   * @param {{x: number, y: number, z: number}} localPosition - The local position relative to the parent.
   * @param {{yaw: number, pitch: number, roll: number}} localOrientation - The local orientation relative to the parent.
   * @param {number} fieldOfView - The field of view of the sensor in degrees.
   */
  constructor(parent, localPosition, localOrientation, fieldOfView) {
    // Call the parent class constructor
    super(parent, localPosition, localOrientation, fieldOfView);
  }

  /**
   * Senses the sound level at the sensor's position.
   * @param {function} getSoundLevelCallback - Callback function to get sound level.
   * @returns {number} The sensed sound level.
   * @throws Will throw an error if the provided callback is not a function.
   */
  sense(getSoundLevelCallback) {
    // Ensure the provided callback is a function
    if (typeof getSoundLevelCallback !== "function") {
      throw new Error(
        "A valid callback function must be provided to sense sound level."
      );
    }
    // Use the callback to get the sound intensity at the sensor's position
    return getSoundLevelCallback(this);
  }
}
