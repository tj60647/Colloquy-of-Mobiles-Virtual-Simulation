/**
 * Transform class represents a position and orientation in 3D space.
 * It supports hierarchical transformations with caching to optimize performance.
 * This class is designed to be used in a p5.js environment.
 */
export class Transform {
  /**
   * Creates a Transform instance.
   * @param {Transform|null} parent - The parent transform. If null, this transform is a root transform.
   * @param {{x: number, y: number, z: number}} localPosition - The local position relative to the parent.
   * @param {{yaw: number, pitch: number, roll: number}} localOrientation - The local orientation relative to the parent.
   * @param {string} [name="Unnamed Transform"] - The name of the transform.
   * @param {number} [id=Date.now()] - The unique identifier for the transform.
   */
  constructor(
    parent,
    localPosition,
    localOrientation,
    name = "Unnamed Transform",
    id = Date.now()
  ) {
    if (parent && !(parent instanceof Transform)) {
      // Parent must be an instance of Transform or null
      throw new Error(
        "Transform: Parent must be an instance of Transform or null."
      );
    }
    this.parent = parent instanceof Transform ? parent : null;
    this.localPosition = localPosition;
    this.localOrientation = localOrientation;
    this.name = name;
    this.id = id;

    // Caching properties
    this.cachedGlobalPosition = null;
    this.cachedGlobalOrientation = null;
    this.cachedGlobalForwardVector = null;
    this.needsPositionUpdate = true;
    this.needsOrientationUpdate = true;

    // Track parent's last known transformation for caching
    this.lastParentGlobalPosition = this.parent
      ? this.parent.getGlobalPosition()
      : null;
    this.lastParentGlobalOrientation = this.parent
      ? this.parent.getGlobalOrientation()
      : null;
  }

  /**
   * Gets the global position, recalculating if necessary.
   * @returns {{x: number, y: number, z: number}} The global position.
   */
  getGlobalPosition() {
    if (this.parentHasChanged()) {
      this.needsPositionUpdate = true;
    }

    if (!this.needsPositionUpdate && this.cachedGlobalPosition) {
      return this.cachedGlobalPosition;
    }

    const { x, y, z } = this.calculatePosition();
    this.cachedGlobalPosition = { x, y, z };
    this.needsPositionUpdate = false;
    this.updateLastParentTransform();
    return this.cachedGlobalPosition;
  }

  /**
   * Gets the global orientation, recalculating if necessary.
   * @returns {{yaw: number, pitch: number, roll: number}} The global orientation.
   */
  getGlobalOrientation() {
    if (this.parentHasChanged()) {
      this.needsOrientationUpdate = true;
    }

    if (!this.needsOrientationUpdate && this.cachedGlobalOrientation) {
      return this.cachedGlobalOrientation;
    }

    const { yaw, pitch, roll } = this.calculateOrientation();
    this.cachedGlobalOrientation = { yaw, pitch, roll };
    this.needsOrientationUpdate = false;
    this.updateLastParentTransform();
    return this.cachedGlobalOrientation;
  }

  /**
   * Gets the local forward vector.
   * @returns {p5.Vector} The local forward vector.
   */
  getLocalForwardVector() {
    // Forward vector aligned with the Y-axis in the local coordinate system
    return createVector(0, 1, 0);
  }

  /**
   * Gets the global forward vector based on the global orientation.
   * @returns {p5.Vector} The global forward vector.
   */
  getGlobalForwardVector() {
    if (this.parentHasChanged()) {
      this.needsOrientationUpdate = true;
    }

    if (!this.needsOrientationUpdate && this.cachedGlobalForwardVector) {
      return this.cachedGlobalForwardVector;
    }

    const { yaw, pitch, roll } = this.getGlobalOrientation();

    // Forward vector aligned with the Y-axis in the local coordinate system
    let forwardVector = createVector(0, 1, 0);

    // Apply global orientation to the forward vector
    forwardVector = this.applyRotation(forwardVector, yaw, pitch, roll);

    this.cachedGlobalForwardVector = forwardVector;
    this.needsOrientationUpdate = false;
    this.updateLastParentTransform();
    return this.cachedGlobalForwardVector;
  }

  /**
   * Applies rotation to a vector based on yaw, pitch, and roll angles.
   * @param {p5.Vector} vector - The vector to rotate.
   * @param {number} yaw - The yaw angle in degrees.
   * @param {number} pitch - The pitch angle in degrees.
   * @param {number} roll - The roll angle in degrees.
   * @returns {p5.Vector} The rotated vector.
   */
  applyRotation(vector, yaw, pitch, roll) {
    let rotatedVector = vector.copy();

    // Apply roll (around Z-axis)
    rotatedVector = createVector(
      rotatedVector.x * cos(radians(roll)) -
        rotatedVector.y * sin(radians(roll)),
      rotatedVector.x * sin(radians(roll)) +
        rotatedVector.y * cos(radians(roll)),
      rotatedVector.z
    );

    // Apply pitch (around X-axis)
    rotatedVector = createVector(
      rotatedVector.x,
      rotatedVector.y * cos(radians(pitch)) -
        rotatedVector.z * sin(radians(pitch)),
      rotatedVector.y * sin(radians(pitch)) +
        rotatedVector.z * cos(radians(pitch))
    );

    // Apply yaw (around Y-axis)
    rotatedVector = createVector(
      rotatedVector.x * cos(radians(yaw)) + rotatedVector.z * sin(radians(yaw)),
      rotatedVector.y,
      -rotatedVector.x * sin(radians(yaw)) + rotatedVector.z * cos(radians(yaw))
    );

    return rotatedVector;
  }

  /**
   * Calculates the global position based on local and parent's transformations.
   * @returns {{x: number, y: number, z: number}} Calculated global position.
   */
  calculatePosition() {
    let { x, y, z } = this.localPosition;
    if (this.parent) {
      const parentPos = this.parent.getGlobalPosition();
      const parentOri = this.parent.getGlobalOrientation();

      // Convert parent orientation to radians using p5.js radians() function
      const yaw = radians(parentOri.yaw);
      const pitch = radians(parentOri.pitch);
      const roll = radians(parentOri.roll);

      // Apply rotations in the correct order: roll, pitch, yaw
      let tx, ty, tz;

      // Apply roll (around Z-axis)
      tx = x * Math.cos(roll) - y * Math.sin(roll);
      ty = x * Math.sin(roll) + y * Math.cos(roll);
      x = tx;
      y = ty;

      // Apply pitch (around X-axis)
      ty = y * Math.cos(pitch) - z * Math.sin(pitch);
      tz = y * Math.sin(pitch) + z * Math.cos(pitch);
      y = ty;
      z = tz;

      // Apply yaw (around Y-axis)
      tx = x * Math.cos(yaw) - z * Math.sin(yaw);
      tz = x * Math.sin(yaw) + z * Math.cos(yaw);
      x = tx;
      z = tz;

      // Translate based on parent's global position
      x += parentPos.x;
      y += parentPos.y;
      z += parentPos.z;
    }
    return { x, y, z };
  }

  /**
   * Calculates the global orientation based on local and parent's orientations.
   * @returns {{yaw: number, pitch: number, roll: number}} Calculated global orientation.
   */
  calculateOrientation() {
    let { yaw, pitch, roll } = this.localOrientation;
    if (this.parent) {
      const parentOri = this.parent.getGlobalOrientation();
      yaw += parentOri.yaw;
      pitch += parentOri.pitch;
      roll += parentOri.roll;
    }
    return { yaw, pitch, roll };
  }

  /**
   * Checks if the parent's transformation has changed since the last update.
   * @returns {boolean} True if the parent has changed, false otherwise.
   */
  parentHasChanged() {
    const currentParentPosition = this.parent
      ? this.parent.getGlobalPosition()
      : null;
    const currentParentOrientation = this.parent
      ? this.parent.getGlobalOrientation()
      : null;

    return (
      JSON.stringify(this.lastParentGlobalPosition) !==
        JSON.stringify(currentParentPosition) ||
      JSON.stringify(this.lastParentGlobalOrientation) !==
        JSON.stringify(currentParentOrientation)
    );
  }

  /**
   * Updates the last known transformation state of the parent.
   */
  updateLastParentTransform() {
    this.lastParentGlobalPosition = this.parent
      ? this.parent.getGlobalPosition()
      : null;
    this.lastParentGlobalOrientation = this.parent
      ? this.parent.getGlobalOrientation()
      : null;
  }

  /**
   * Converts the transform to a JSON object for serialization.
   * @returns {Object} The JSON representation of the transform.
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      localPosition: this.localPosition,
      localOrientation: this.localOrientation,
      parentId: this.parent ? this.parent.id : null,
    };
  }

  /**
   * Creates a Transform from a JSON object.
   * @param {Object} json - The JSON object.
   * @param {Transform|null} [parent=null] - The parent transform.
   * @returns {Transform} The created Transform.
   */
  static fromJSON(json, parent = null) {
    return new Transform(
      parent,
      json.localPosition,
      json.localOrientation,
      json.name,
      json.id
    );
  }
}
