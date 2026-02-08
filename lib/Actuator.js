import { Transform } from './Transform.js';

/**
 * Actuator class extends Transform to include actuation capabilities.
 */
export class Actuator extends Transform {
  #fieldOfView;

  /**
   * Creates an Actuator.
   * @param {Transform} parent - The parent transform.
   * @param {{x: number, y: number, z: number}} localPosition - The local position relative to the parent.
   * @param {{yaw: number, pitch: number, roll: number}} localOrientation - The local orientation relative to the parent.
   * @param {number} fieldOfView - The field of view of the actuator in degrees.
   */
  constructor(parent, localPosition, localOrientation, fieldOfView) {
    super(parent, localPosition, localOrientation);
    this.fieldOfView = fieldOfView; // Calls the setter
  }

  // Getters and Setters
  get fieldOfView() {
    return this.#fieldOfView;
  }

  set fieldOfView(value) {
    if (value <= 0 || value > 180) {
      throw new Error('Actuator: fieldOfView must be between 0 and 180 degrees');
    }
    this.#fieldOfView = value;
  }

  /**
   * Method to be implemented by subclasses to perform actuation.
   * @throws Will throw an error if not implemented.
   */
  act() {
    throw new Error('act() method should be implemented by subclasses');
  }

  /**
   * Checks if a given point is within the actuator's field of view.
   * @param {{x: number, y: number, z: number}} point - The point to check.
   * @returns {boolean} True if the point is within the field of view, false otherwise.
   */
  isInFieldOfView(point) {
    const globalPosition = this.getGlobalPosition();

    // Calculate the vector from the actuator to the point
    const vectorToPoint = {
      x: point.x - globalPosition.x,
      y: point.y - globalPosition.y,
      z: point.z - globalPosition.z,
    };

    // Calculate the squared distance to the point
    const distanceSquared =
      vectorToPoint.x * vectorToPoint.x +
      vectorToPoint.y * vectorToPoint.y +
      vectorToPoint.z * vectorToPoint.z;

    // Normalize the vector to the point
    const invDistance = 1 / sqrt(distanceSquared);
    const normalizedVectorToPoint = {
      x: vectorToPoint.x * invDistance,
      y: vectorToPoint.y * invDistance,
      z: vectorToPoint.z * invDistance,
    };

    // Get the forward vector of the actuator
    const globalForwardVector = this.getGlobalForwardVector();

    // Calculate the dot product between the forward vector and the vector to the point
    const dotProduct =
      globalForwardVector.x * normalizedVectorToPoint.x +
      globalForwardVector.y * normalizedVectorToPoint.y +
      globalForwardVector.z * normalizedVectorToPoint.z;

    // Calculate the cosine of half the field of view angle
    const cosHalfFOV = cos(radians(this.#fieldOfView / 2));

    // Check if the dot product is greater than or equal to the cosine of half the field of view angle
    return dotProduct >= cosHalfFOV;
  }

  /**
   * Converts the actuator to a JSON object for serialization.
   * @returns {Object} The JSON representation of the actuator.
   */
  toJSON() {
    return {
      ...super.toJSON(),
      fieldOfView: this.#fieldOfView,
    };
  }

  /**
   * Creates an Actuator from a JSON object.
   * @param {Object} json - The JSON object.
   * @param {Transform|null} [parent=null] - The parent transform.
   * @returns {Actuator} The created Actuator.
   */
  static fromJSON(json, parent = null) {
    return new Actuator(parent, json.localPosition, json.localOrientation, json.fieldOfView);
  }
}
