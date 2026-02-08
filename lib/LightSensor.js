import { Sensor } from './Sensor.js';

/**
 * LightSensor class extends Sensor to sense light intensity.
 */
export class LightSensor extends Sensor {
  /**
   * Creates a LightSensor.
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
   * Senses the light intensity at the sensor's position.
   * @param {function} getLightIntensityCallback - Callback function to get light intensity.
   * @returns {number} The sensed light intensity.
   * @throws Will throw an error if the provided callback is not a function.
   */
  sense(getLightIntensityCallback) {
    // Ensure the provided callback is a function
    if (typeof getLightIntensityCallback !== 'function') {
      throw new Error('A valid callback function must be provided to sense light intensity.');
    }
    // Use the callback to get the light intensity at the sensor's position
    return getLightIntensityCallback(this);
  }
}
