import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js";

/**
 * Represents a sensor object that can detect other objects within its field of view.
 * Extends THREE.Object3D to make use of Three.js's object hierarchy and transformations.
 */
export class Sensor_THREE extends THREE.Object3D {
  /** @type {string} Unique identifier for the sensor. */
  #id;

  /** @type {THREE.ArrowHelper} Visual helper to show the sensor's direction. */
  #viewDirectionHelper;

  /** @type {THREE.AxesHelper} Visual helper to show the sensor's local axes. */
  #axesHelper;

  /** @type {THREE.Group} Group to hold the field of view helper geometry. */
  #fovHelperGroup;

  /** @type {boolean} Flag to control rendering of the view direction helper. */
  #showViewDirectionHelper;

  /** @type {boolean} Flag to control rendering of the axes helper. */
  #showAxesHelper;

  /** @type {boolean} Flag to control rendering of the field of view helper. */
  #showFovHelper;

  /** @type {number} Field of view angle in radians. */
  #fov;

  /** @type {number} Sensitivity of the sensor. */
  #sensitivity;

  /** @type {number} Minimum intensity threshold. */
  #minIntensity;

  /**
   * Creates a new Sensor instance.
   * @param {string} [name='Unnamed Sensor'] - The name of the sensor.
   * @param {number} [fov=Math.PI / 4] - The field of view of the sensor in radians.
   * @param {boolean} [showViewDirectionHelper=true] - Flag to render the view direction helper.
   * @param {boolean} [showAxesHelper=true] - Flag to render the axes helper.
   * @param {boolean} [showFovHelper=true] - Flag to render the field of view helper.
   */
  constructor(
    name = "Unnamed Sensor",
    fov = Math.PI / 4,
    sensitivity = 1000, // Sensitivity of the sensor
    minIntensity = 0.1, // Minimum intensity threshold
    showViewDirectionHelper = true,
    showAxesHelper = true,
    showFovHelper = true
  ) {
    super();

    // Initialize private fields
    this.#id = THREE.MathUtils.generateUUID(); // Generate a unique ID for the sensor
    this.name = name; // Public name of the sensor
    this.#fov = fov; // Field of view in radians
    this.#sensitivity = sensitivity; // Initialize sensor sensitivity
    this.#minIntensity = minIntensity; // Initialize minimum intensity for detection

    // Initialize flags for rendering helpers
    this.#showViewDirectionHelper = showViewDirectionHelper;
    this.#showAxesHelper = showAxesHelper;
    this.#showFovHelper = showFovHelper;

    // Private helper to visualize the sensor's view direction (negative Z-axis by default)
    this.#viewDirectionHelper = new THREE.ArrowHelper(
      this.getWorldDirection(new THREE.Vector3()),
      new THREE.Vector3(0, 0, 0), // Arrow starts at the sensor's local origin
      12,
      0xff0000 // Red color for the direction arrow
    );

    // Add the view direction helper based on the flag
    if (this.#showViewDirectionHelper) {
      this.add(this.#viewDirectionHelper);
    }

    // Private axes helper to visualize the sensor's local coordinate system
    this.#axesHelper = new THREE.AxesHelper(12); // Size of 12 unit

    // Add the axes helper based on the flag
    if (this.#showAxesHelper) {
      this.add(this.#axesHelper);
    }

    // Create the initial FOV helper group
    this.#createFovHelper();
    if (this.#showFovHelper) {
      this.add(this.#fovHelperGroup);
    }
  }

  /**
   * Getter for the maximum range based on the sensor's sensitivity and minimum intensity threshold.
   * @returns {number} The maximum detection range of the sensor.
   */
  get range() {
    return Math.sqrt(this.#sensitivity / this.#minIntensity);
  }

  /**
   * Checks if a target object is within the effective range of the sensor based on the inverse square law.
   * @param {THREE.Object3D} targetObject - The target object to check.
   * @returns {{inRange: boolean, distance: number}} An object containing whether the target is within range and the distance to the target.
   */
  isInRange(targetObject) {
    // Calculate the distance from the sensor to the target
    const distance = this.position.distanceTo(targetObject.position);

    // Calculate the intensity using the inverse square law
    const intensity = this.#sensitivity / (distance * distance);

    // Determine if the target is within range
    const inRange = intensity >= this.#minIntensity;

    // Return both the boolean and the distance
    return { inRange, distance, intensity, range: this.range };
  }

  /**
   * Checks if a target object is within the sensor's field of view.
   * @param {THREE.Object3D} targetObject - The target object to check.
   * @returns {boolean} True if the target is within the field of view, false otherwise.
   */
  isInFieldOfView(targetObject) {
    // The negative Z-axis is considered the forward/view direction
    const sensorDirection = this.getWorldDirection(new THREE.Vector3());

    // Vector from the sensor's position to the target's position
    const toTarget = new THREE.Vector3()
      .subVectors(targetObject.position, this.position)
      .normalize();

    // Calculate the angle between the sensor's direction and the target vector
    const angle = sensorDirection.angleTo(toTarget);

    // Check if the angle is within the field of view
    return angle <= this.fov / 2;
  }

  /**
   * Serializes the sensor object to a JSON string.
   * @returns {string} The JSON representation of the sensor.
   */
  toJSON() {
    return JSON.stringify({
      id: this.#id, // Include the private id in the serialized output
      name: this.name,
      position: this.position.toArray(),
      rotation: this.rotation.toArray(),
      fov: this.fov,
      showViewDirectionHelper: this.#showViewDirectionHelper,
      showAxesHelper: this.#showAxesHelper,
      showFovHelper: this.#showFovHelper,
    });
  }

  /**
   * Deserializes a sensor object from a JSON string.
   * @param {string} jsonString - The JSON string to deserialize.
   * @returns {Sensor} The deserialized Sensor object.
   */
  static fromJSON(jsonString) {
    const data = JSON.parse(jsonString);

    const sensor = new Sensor_THREE(
      data.name,
      data.fov,
      data.showViewDirectionHelper,
      data.showAxesHelper,
      data.showFovHelper
    );

    // Restore the id, position, and rotation from the JSON data
    sensor.#setId(data.id); // Use a private method to set the private id
    sensor.position.fromArray(data.position);
    sensor.rotation.fromArray(data.rotation);

    return sensor;
  }

  /**
   * Private method to set the private id field.
   * @param {string} id - The ID to set.
   * @private
   */
  #setId(id) {
    this.#id = id;
  }

  /**
   * Public getter for the private id property.
   * @returns {string} The unique ID of the sensor.
   */
  getId() {
    return this.#id;
  }

  /**
   * Toggles the rendering of the view direction helper.
   * @param {boolean} show - Whether to show the view direction helper.
   */
  toggleViewDirectionHelper(show) {
    this.#showViewDirectionHelper = show;
    if (show) {
      this.add(this.#viewDirectionHelper);
    } else {
      this.remove(this.#viewDirectionHelper);
    }
  }

  /**
   * Toggles the rendering of the axes helper.
   * @param {boolean} show - Whether to show the axes helper.
   */
  toggleAxesHelper(show) {
    this.#showAxesHelper = show;
    if (show) {
      this.add(this.#axesHelper);
    } else {
      this.remove(this.#axesHelper);
    }
  }

  /**
   * Toggles the rendering of the field of view helper.
   * @param {boolean} show - Whether to show the FOV helper.
   */
  toggleFovHelper(show) {
    this.#showFovHelper = show;
    if (show) {
      this.#updateFovHelper(); // Ensure the FOV helper is updated when shown
    } else {
      this.remove(this.#fovHelperGroup);
    }
  }

  /**
   * Getter for the field of view (FOV) property.
   * @returns {number} The current field of view in radians.
   */
  get fov() {
    return this.#fov;
  }

  /**
   * Setter for the field of view (FOV) property.
   * Updates the FOV and refreshes the helper visualization.
   * @param {number} value - The new field of view in radians.
   * @throws {Error} If the FOV value is not a number.
   * @throws {Error} If the FOV value is not finite.
   * @throws {Error} If the FOV value is NaN.
   * @throws {Error} If the FOV value is less than or equal to zero.
   */
  set fov(value) {
    if (typeof value !== "number") {
      throw new Error("Field of view must be a number.");
    }
    if (!isFinite(value)) {
      throw new Error("Field of view must be a finite number.");
    }
    if (isNaN(value)) {
      throw new Error("Field of view must not be NaN.");
    }
    if (value <= 0) {
      throw new Error("Field of view must be greater than zero.");
    }

    this.#fov = value;
    this.#updateFovHelper(); // Update the FOV helper to match the new FOV
  }

  /**
   * Getter for the sensitivity property.
   * @returns {number} The sensitivity of the sensor.
   */
  get sensitivity() {
    return this.#sensitivity;
  }

  /**
   * Setter for the sensitivity property.
   * @param {number} value - The new sensitivity value.
   * @throws {Error} If the sensitivity value is less than or equal to zero.
   * @throws {Error} If the sensitivity value is not a number.
   * @throws {Error} If the sensitivity value is not finite.
   * @throws {Error} If the sensitivity value is NaN.
   */
  set sensitivity(value) {
    if (typeof value !== "number") {
      throw new Error("Sensitivity must be a number.");
    }
    if (!isFinite(value)) {
      throw new Error("Sensitivity must be a finite number.");
    }
    if (isNaN(value)) {
      throw new Error("Sensitivity must not be NaN.");
    }
    if (value <= 0) {
      throw new Error("Sensitivity must be greater than zero.");
    }
    this.#sensitivity = value;
    this.#updateFovHelper(); // Update the FOV helper to match the new sensitivity
  }

  /**
   * Updates the FOV helper's geometry to match the current field of view.
   * @private
   */
  #updateFovHelper() {
    this.#createFovHelper(); // Recreate the geometry with the updated FOV
    if (this.#showFovHelper) {
      this.add(this.#fovHelperGroup); // Add the updated FOV helper group back to the scene
    }
  }

  /**
   * Creates the FOV helper as a conical section of a sphere.
   * @private
   */
  #createFovHelper() {
    //determine the range based on distance to minIntensity
    const range = this.range;

    const angle = this.#fov / 2; // Half of the FOV angle

    // Remove the existing FOV helper group if it exists
    if (this.#fovHelperGroup) {
      this.remove(this.#fovHelperGroup);
    }

    this.#fovHelperGroup = new THREE.Group();

    // Calculate the endpoints for the lines in the XZ and YZ planes
    const pointsXZ = [
      new THREE.Vector3(0, 0, 0), // Origin
      new THREE.Vector3(range * Math.sin(angle), 0, range * Math.cos(angle)), // Right in XZ plane
      new THREE.Vector3(-range * Math.sin(angle), 0, range * Math.cos(angle)), // Left in XZ plane
    ];

    const pointsYZ = [
      new THREE.Vector3(0, 0, 0), // Origin
      new THREE.Vector3(0, range * Math.sin(angle), range * Math.cos(angle)), // Top in YZ plane
      new THREE.Vector3(0, -range * Math.sin(angle), range * Math.cos(angle)), // Bottom in YZ plane
    ];

    // Create lines for the XZ plane
    for (let i = 1; i < pointsXZ.length; i++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        pointsXZ[0],
        pointsXZ[i],
      ]);
      const material = new THREE.LineBasicMaterial({ color: 0xd9c900 }); //#d9c900
      const line = new THREE.Line(geometry, material);
      this.#fovHelperGroup.add(line);
    }

    // Create lines for the YZ plane
    for (let i = 1; i < pointsYZ.length; i++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        pointsYZ[0],
        pointsYZ[i],
      ]);
      const material = new THREE.LineBasicMaterial({ color: 0xd9c900 });
      const line = new THREE.Line(geometry, material);
      this.#fovHelperGroup.add(line);
    }

    // Create an ellipse for the intersection of the field of view with the spherical surface
    const ellipseCurve = new THREE.EllipseCurve(
      0,
      0, // Center of the ellipse
      range * Math.sin(angle),
      range * Math.sin(angle), // X and Y radii (equal for a circle)
      0,
      2 * Math.PI, // Start and end angles (full circle)
      false, // No clockwise direction
      0 // No rotation
    );

    const ellipsePoints = ellipseCurve.getPoints(50);
    const ellipseGeometry = new THREE.BufferGeometry().setFromPoints(
      ellipsePoints
    );
    const ellipseMaterial = new THREE.LineBasicMaterial({ color: 0xd9c900 });
    const ellipse = new THREE.Line(ellipseGeometry, ellipseMaterial);

    ellipse.position.set(0, 0, range * Math.cos(angle)); // Position the ellipse in the XY plane
    this.#fovHelperGroup.add(ellipse);

    // Create two arcs to connect the endpoints in the XZ and YZ planes
    const arcXZ = new THREE.ArcCurve(0, 0, range, -angle, angle, false);
    const arcYZ = new THREE.ArcCurve(0, 0, range, -angle, angle, false);

    const arcGeometryXZ = new THREE.BufferGeometry().setFromPoints(
      arcXZ.getPoints(50)
    );
    const arcMaterialXZ = new THREE.LineBasicMaterial({ color: 0xd9c900 });
    const arcLineXZ = new THREE.Line(arcGeometryXZ, arcMaterialXZ);
    // Align the arc to be in the YZ plane
    arcLineXZ.rotation.z = Math.PI / 2;
    arcLineXZ.rotation.x = Math.PI / 2;
    arcLineXZ.position.set(0, 0, 0);
    this.#fovHelperGroup.add(arcLineXZ);

    const arcGeometryYZ = new THREE.BufferGeometry().setFromPoints(
      arcYZ.getPoints(50)
    );
    const arcMaterialYZ = new THREE.LineBasicMaterial({ color: 0xd9c900 });
    const arcLineYZ = new THREE.Line(arcGeometryYZ, arcMaterialYZ);
    arcLineYZ.rotation.y = -Math.PI / 2; // Align the arc to be in the YZ plane
    arcLineYZ.position.set(0, 0, 0);
    this.#fovHelperGroup.add(arcLineYZ);
  }
}
