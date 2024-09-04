/**
 * Transform class represents a position and orientation in 3D space.
 * It supports hierarchical transformations with caching to optimize performance.
 * This class is designed to be used in a p5.js environment.
 */
export class Transform {
  // Private fields for local position
  #x;
  #y;
  #z;

  // Private fields for local orientation
  #yaw;
  #pitch;
  #roll;

  // Other private fields for caching and state tracking
  #cachedGlobalPosition = null;
  #cachedGlobalOrientation = null;
  #cachedGlobalForwardVector = null;
  #needsPositionUpdate = true;
  #needsOrientationUpdate = true;
  #lastParentGlobalPosition = null;
  #lastParentGlobalOrientation = null;

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
      throw new Error(
        "Transform: Parent must be an instance of Transform or null."
      );
    }

    this.parent = parent instanceof Transform ? parent : null;

    // Initialize private fields for local position
    this.#x = localPosition.x;
    this.#y = localPosition.y;
    this.#z = localPosition.z;

    // Initialize private fields for local orientation
    this.#yaw = localOrientation.yaw;
    this.#pitch = localOrientation.pitch;
    this.#roll = localOrientation.roll;

    this.name = name;
    this.id = id;

    // Track parent's last known transformation for caching
    this.#lastParentGlobalPosition = this.parent
      ? this.parent.getGlobalPosition()
      : null;
    this.#lastParentGlobalOrientation = this.parent
      ? this.parent.getGlobalOrientation()
      : null;

    // Initialize children array to manage hierarchical relationships
    this.children = [];
    if (this.parent) {
      this.parent.addChild(this);
    }
  }

  // Getters and Setters for Position

  /**
   * Gets the local X position.
   * @returns {number} The local X position.
   */
  get x() {
    return this.#x;
  }

  /**
   * Sets the local X position and marks children for update.
   * @param {number} value - The new X position.
   */
  set x(value) {
    this.#x = value;
    this.#needsPositionUpdate = true;
    this.markChildrenForUpdate(); // Mark children for update
  }

  /**
   * Gets the local Y position.
   * @returns {number} The local Y position.
   */
  get y() {
    return this.#y;
  }

  /**
   * Sets the local Y position and marks children for update.
   * @param {number} value - The new Y position.
   */
  set y(value) {
    this.#y = value;
    this.#needsPositionUpdate = true;
    this.markChildrenForUpdate(); // Mark children for update
  }

  /**
   * Gets the local Z position.
   * @returns {number} The local Z position.
   */
  get z() {
    return this.#z;
  }

  /**
   * Sets the local Z position and marks children for update.
   * @param {number} value - The new Z position.
   */
  set z(value) {
    this.#z = value;
    this.#needsPositionUpdate = true;
    this.markChildrenForUpdate(); // Mark children for update
  }

  // Getters and Setters for Orientation

  /**
   * Gets the local yaw (rotation around Y-axis).
   * @returns {number} The local yaw in degrees.
   */
  get yaw() {
    return this.#yaw;
  }

  /**
   * Sets the local yaw and marks children for update.
   * @param {number} value - The new yaw in degrees.
   */
  set yaw(value) {
    this.#yaw = value;
    this.#needsOrientationUpdate = true;
    this.markChildrenForUpdate(); // Mark children for update
  }

  /**
   * Gets the local pitch (rotation around X-axis).
   * @returns {number} The local pitch in degrees.
   */
  get pitch() {
    return this.#pitch;
  }

  /**
   * Sets the local pitch and marks children for update.
   * @param {number} value - The new pitch in degrees.
   */
  set pitch(value) {
    this.#pitch = value;
    this.#needsOrientationUpdate = true;
    this.markChildrenForUpdate(); // Mark children for update
  }

  /**
   * Gets the local roll (rotation around Z-axis).
   * @returns {number} The local roll in degrees.
   */
  get roll() {
    return this.#roll;
  }

  /**
   * Sets the local roll and marks children for update.
   * @param {number} value - The new roll in degrees.
   */
  set roll(value) {
    this.#roll = value;
    this.#needsOrientationUpdate = true;
    this.markChildrenForUpdate(); // Mark children for update
  }

  /**
   * Adds a child transform to this transform.
   * @param {Transform} child - The child transform to add.
   */
  addChild(child) {
    if (child instanceof Transform && !this.children.includes(child)) {
      this.children.push(child);
    }
  }

  /**
   * Marks all children for an update.
   * This method is called whenever the parent transform changes,
   * so all children are aware they need to recalculate their global state.
   */
  markChildrenForUpdate() {
    this.children.forEach((child) => {
      child.#needsPositionUpdate = true;
      child.#needsOrientationUpdate = true;
      child.markChildrenForUpdate(); // Recursively mark all descendants
    });
  }

  /**
   * Gets the root transform of this hierarchy.
   * @returns {Transform} The root transform.
   */
  getRoot() {
    let current = this;
    while (current.parent !== null) {
      current = current.parent;
    }
    return current;
  }

  /**
   * Updates all transforms in the hierarchy starting from the root.
   */
  updateAllTransforms() {
    const root = this.getRoot();
    root.updateTransformRecursively();
  }

  /**
   * Recursively updates this transform and its children.
   */
  updateTransformRecursively() {
    this.getGlobalPosition(); // Recalculate global position if needed
    this.getGlobalOrientation(); // Recalculate global orientation if needed

    // Recursively update children
    this.children.forEach((child) => child.updateTransformRecursively());
  }

  /**
   * Applies a function to each transform in the hierarchy starting from the root.
   * @param {Function} callback - The function to apply to each transform.
   */
  applyToAllTransforms(callback) {
    const root = this.getRoot();
    root.applyRecursively(callback);
  }

  /**
   * Recursively applies a function to this transform and its children.
   * @param {Function} callback - The function to apply.
   */
  applyRecursively(callback) {
    callback(this);
    this.children.forEach((child) => child.applyRecursively(callback));
  }

  /**
   * Serializes the entire transform hierarchy to a JSON object.
   * @returns {Object} The serialized JSON object.
   */
  serializeHierarchy() {
    const root = this.getRoot();
    return root.serializeRecursively();
  }

  /**
   * Recursively serializes this transform and its children.
   * @returns {Object} The serialized JSON object.
   */
  serializeRecursively() {
    const data = this.toJSON();
    data.children = this.children.map((child) => child.serializeRecursively());
    return data;
  }

  /**
   * Gets the global position, recalculating if necessary.
   * @returns {{x: number, y: number, z: number}} The global position.
   */
  getGlobalPosition() {
    if (this.parentHasChanged()) {
      this.#needsPositionUpdate = true;
    }

    if (!this.#needsPositionUpdate && this.#cachedGlobalPosition) {
      return this.#cachedGlobalPosition;
    }

    const { x, y, z } = this.calculatePosition();
    this.#cachedGlobalPosition = { x, y, z };
    this.#needsPositionUpdate = false;
    this.updateLastParentTransform();
    return this.#cachedGlobalPosition;
  }

  /**
   * Gets the global orientation, recalculating if necessary.
   * @returns {{yaw: number, pitch: number, roll: number}} The global orientation.
   */
  getGlobalOrientation() {
    if (this.parentHasChanged()) {
      this.#needsOrientationUpdate = true;
    }

    if (!this.#needsOrientationUpdate && this.#cachedGlobalOrientation) {
      return this.#cachedGlobalOrientation;
    }

    const { yaw, pitch, roll } = this.calculateOrientation();
    this.#cachedGlobalOrientation = { yaw, pitch, roll };
    this.#needsOrientationUpdate = false;
    this.updateLastParentTransform();
    return this.#cachedGlobalOrientation;
  }

  /**
   * Gets the local forward vector.
   * @returns {p5.Vector} The local forward vector.
   */
  getLocalForwardVector() {
    return createVector(0, 1, 0);
  }

  /**
   * Gets the global forward vector based on the global orientation.
   * @returns {p5.Vector} The global forward vector.
   */
  getGlobalForwardVector() {
    if (this.parentHasChanged()) {
      this.#needsOrientationUpdate = true;
    }

    if (!this.#needsOrientationUpdate && this.#cachedGlobalForwardVector) {
      return this.#cachedGlobalForwardVector;
    }

    const { yaw, pitch, roll } = this.getGlobalOrientation();

    let forwardVector = createVector(0, 1, 0);

    forwardVector = this.applyRotation(forwardVector, yaw, pitch, roll);

    this.#cachedGlobalForwardVector = forwardVector;
    this.#needsOrientationUpdate = false;
    this.updateLastParentTransform();
    return this.#cachedGlobalForwardVector;
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
   * Applies the parent's rotation to the local position and then translates
   * to the parent's global position.
   * @returns {{x: number, y: number, z: number}} Calculated global position.
   */
  calculatePosition() {
    let x = this.#x;
    let y = this.#y;
    let z = this.#z;

    if (this.parent) {
      // Get parent's global position and orientation
      const parentPos = this.parent.getGlobalPosition();
      const parentOri = this.parent.getGlobalOrientation();

      // Apply parent's rotation to the local position
      const localPos = createVector(x, y, z);
      const rotatedPos = this.applyRotation(
        localPos,
        parentOri.yaw,
        parentOri.pitch,
        parentOri.roll
      );

      // Calculate global position by adding rotated local position to parent's global position
      x = rotatedPos.x + parentPos.x;
      y = rotatedPos.y + parentPos.y;
      z = rotatedPos.z + parentPos.z;
    }

    return { x, y, z };
  }

  /**
   * Calculates the global orientation based on local and parent's orientations.
   * @returns {{yaw: number, pitch: number, roll: number}} Calculated global orientation.
   */
  calculateOrientation() {
    let yaw = this.#yaw;
    let pitch = this.#pitch;
    let roll = this.#roll;

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
      JSON.stringify(this.#lastParentGlobalPosition) !==
        JSON.stringify(currentParentPosition) ||
      JSON.stringify(this.#lastParentGlobalOrientation) !==
        JSON.stringify(currentParentOrientation)
    );
  }

  /**
   * Updates the last known transformation state of the parent.
   */
  updateLastParentTransform() {
    this.#lastParentGlobalPosition = this.parent
      ? this.parent.getGlobalPosition()
      : null;
    this.#lastParentGlobalOrientation = this.parent
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
      localPosition: { x: this.#x, y: this.#y, z: this.#z },
      localOrientation: {
        yaw: this.#yaw,
        pitch: this.#pitch,
        roll: this.#roll,
      },
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
