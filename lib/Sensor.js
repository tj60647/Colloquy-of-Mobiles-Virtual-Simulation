/**
 * Sensor class extends Transform to include sensing capabilities.
 */
class Sensor extends Transform {
  /**
   * Creates a Sensor.
   * @param {Transform} parent - The parent transform.
   * @param {{x: number, y: number, z: number}} localPosition - The local position relative to the parent.
   * @param {{yaw: number, pitch: number, roll: number}} localOrientation - The local orientation relative to the parent.
   * @param {number} fieldOfView - The field of view of the sensor in degrees.
   */
  constructor(parent, localPosition, localOrientation, fieldOfView) {
    super(parent, localPosition, localOrientation);
    this.fieldOfView = fieldOfView;
  }

  /**
   * Method to be implemented by subclasses to perform sensing.
   * @throws Will throw an error if not implemented.
   */
  sense() {
    throw new Error("sense() method should be implemented by subclasses");
  }

  /**
   * Checks if a given point is within the sensor's field of view.
   * @param {{x: number, y: number, z: number}} point - The point to check.
   * @returns {boolean} True if the point is within the field of view, false otherwise.
   */
  isInFieldOfView(point) {
    let globalPosition = this.getGlobalPosition();

    // Calculate the vector from the sensor to the point
    let vectorToPoint = {
      x: point.x - globalPosition.x,
      y: point.y - globalPosition.y,
      z: point.z - globalPosition.z,
    };

    // Calculate the squared distance to the point
    let distanceSquared =
      vectorToPoint.x * vectorToPoint.x +
      vectorToPoint.y * vectorToPoint.y +
      vectorToPoint.z * vectorToPoint.z;

    // Normalize the vector to the point (we use the squared distance here)
    let invDistance = 1 / sqrt(distanceSquared);
    let normalizedVectorToPoint = {
      x: vectorToPoint.x * invDistance,
      y: vectorToPoint.y * invDistance,
      z: vectorToPoint.z * invDistance,
    };

    // Get the forward vector of the sensor
    let globalForwardVector = this.getGlobalForwardVector();

    // Calculate the dot product between the forward vector and the vector to the point
    let dotProduct =
      globalForwardVector.x * normalizedVectorToPoint.x +
      globalForwardVector.y * normalizedVectorToPoint.y +
      globalForwardVector.z * normalizedVectorToPoint.z;

    // Calculate the cosine of half the field of view angle
    let cosHalfFOV = cos(radians(this.fieldOfView / 2));

    // Check if the dot product is greater than or equal to the cosine of half the field of view angle
    return dotProduct >= cosHalfFOV;
  }

  /**
   * Converts the sensor to a JSON object for serialization.
   * @returns {Object} The JSON representation of the sensor.
   */
  toJSON() {
    return {
      ...super.toJSON(),
      fieldOfView: this.fieldOfView,
    };
  }

  /**
   * Creates a Sensor from a JSON object.
   * @param {Object} json - The JSON object.
   * @param {Transform|null} [parent=null] - The parent transform.
   * @returns {Sensor} The created Sensor.
   */
  static fromJSON(json, parent = null) {
    return new Sensor(
      parent,
      json.localPosition,
      json.localOrientation,
      json.fieldOfView
    );
  }
}
