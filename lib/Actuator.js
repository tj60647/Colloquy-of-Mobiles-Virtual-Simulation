/**
 * Actuator class extends Transform to include actuation capabilities.
 */
class Actuator extends Transform {
  /**
   * Creates an Actuator.
   * @param {Transform} parent - The parent transform.
   * @param {{x: number, y: number, z: number}} localPosition - The local position relative to the parent.
   * @param {{yaw: number, pitch: number, roll: number}} localOrientation - The local orientation relative to the parent.
   * @param {number} fieldOfView - The field of view of the actuator in degrees.
   */
  constructor(parent, localPosition, localOrientation, fieldOfView) {
    super(parent, localPosition, localOrientation);
    this.fieldOfView = fieldOfView;
  }

  /**
   * Method to be implemented by subclasses to perform actuation.
   * @throws Will throw an error if not implemented.
   */
  act() {
    throw new Error("act() method should be implemented by subclasses");
  }

  /**
   * Checks if a given point is within the actuator's field of view.
   * @param {{x: number, y: number, z: number}} point - The point to check.
   * @returns {boolean} True if the point is within the field of view, false otherwise.
   */
  isInFieldOfView(point) {
    let globalPosition = this.getGlobalPosition();

    // Calculate the vector from the actuator to the point
    let vectorToPoint = {
      x: point.x - globalPosition.x,
      y: point.y - globalPosition.y,
      z: point.z - globalPosition.z
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
      z: vectorToPoint.z * invDistance
    };

    // Get the forward vector of the actuator
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
   * Converts the actuator to a JSON object for serialization.
   * @returns {Object} The JSON representation of the actuator.
   */
  toJSON() {
    return {
      ...super.toJSON(),
      fieldOfView: this.fieldOfView
    };
  }

  /**
   * Creates an Actuator from a JSON object.
   * @param {Object} json - The JSON object.
   * @param {Transform|null} [parent=null] - The parent transform.
   * @returns {Actuator} The created Actuator.
   */
  static fromJSON(json, parent = null) {
    return new Actuator(
      parent,
      json.localPosition,
      json.localOrientation,
      json.fieldOfView
    );
  }
}

/**
 * LightActuator class extends Actuator to emit light.
 */
class LightActuator extends Actuator {
  /**
   * Creates a LightActuator.
   * @param {Transform} parent - The parent transform.
   * @param {{x: number, y: number, z: number}} localPosition - The local position relative to the parent.
   * @param {{yaw: number, pitch: number, roll: number}} localOrientation - The local orientation relative to the parent.
   * @param {number} fieldOfView - The field of view of the actuator in degrees.
   */
  constructor(parent, localPosition, localOrientation, fieldOfView) {
    super(parent, localPosition, localOrientation, fieldOfView);
    this.lightIntensity = 1.0; // Default light intensity (normalized)
  }

  /**
   * Emits light from the actuator.
   * @returns {number} The light intensity emitted.
   */
  emitLight() {
    return this.lightIntensity;
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
      lightIntensity: this.lightIntensity
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

/**
 * SoundActuator class extends Actuator to emit sound.
 */
class SoundActuator extends Actuator {
  /**
   * Creates a SoundActuator.
   * @param {Transform} parent - The parent transform.
   * @param {{x: number, y: number, z: number}} localPosition - The local position relative to the parent.
   * @param {{yaw: number, pitch: number, roll: number}} localOrientation - The local orientation relative to the parent.
   * @param {number} fieldOfView - The field of view of the actuator in degrees.
   */
  constructor(parent, localPosition, localOrientation, fieldOfView) {
    super(parent, localPosition, localOrientation, fieldOfView);
    this.soundIntensity = 1.0; // Default sound intensity (normalized)
  }

  /**
   * Emits sound from the actuator.
   * @returns {number} The sound intensity emitted.
   */
  emitSound() {
    return this.soundIntensity;
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
      soundIntensity: this.soundIntensity
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
