// File: Transducer_THREE.js
// Define the Transducer_THREE class that extends THREE.Object3D and provides common functionality for visualizing direction, local axes, and field of effect.
// The class also includes a custom unique identifier, type, and flags to control the visibility of helpers.
// The class includes methods to create the visual helpers for direction, axes, and field of effect, and to update the direction helper's orientation.
// The class also includes getters and
// setters for the transducer type, custom ID, field of effect angle, field of effect helper range, and visibility of the helpers.
// The class includes methods to serialize and deserialize the transducer object to and from a JSON string.
// The class is exported for use in other modules.
// The class is used in the Actuator_THREE and Sensor_THREE classes to inherit common behaviors.

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js";

/**
 * Base class representing a transducer (sensor or actuator).
 * Provides common functionality for visualizing direction, local axes, and field of effect.
 * Extends THREE.Object3D to leverage the Three.js object hierarchy and transformations.
 */
export class Transducer_THREE extends THREE.Object3D {
  // Enum for the type of transducer

  /**
   * @typedef {'sensor' | 'actuator' | 'unknown'} TRANSDUCER_TYPE
   */
  static TRANSDUCER_TYPE = Object.freeze({
    SENSOR: "sensor",
    ACTUATOR: "actuator",
    UNKNOWN: "unknown",
  });

  /** @constant {number} 4 * Math.PI */
  static FOUR_PI = 4 * Math.PI;

  /** @type {string} Custom unique identifier for the transducer. */
  #customId;

  /** @type {THREE.ArrowHelper} Visual helper to show the transducer's direction. */
  #directionHelper;

  /** @type {THREE.AxesHelper} Visual helper to show the transducer's local axes. */
  #axesHelper;

  /** @type {number} Length of the axes helper. */
  #axesLength; // Length of the axes helper

  /** @type {THREE.Group} Visual helper to show the field of effect. */
  #fieldOfEffect_HelperGroup;

  /** @type {number} Range displayed by helper */
  #fieldOfEffect_HelperRange;

  // add field of effect color
  /** @type {number} Color of the field of effect helper. */
  #fieldOfEffect_HelperColor;

  /** @type {TRANSDUCER_TYPE} Type of the transducer (sensor or actuator). */
  #transducerType; // Type of the transducer (sensor or actuator)

  /** @type {number} Field of effect angle in radians. */
  #fieldOfEffect_AngleFull; // Full field of effect angle in radians

  /** Flags to control visibility of helpers */
  showDirectionHelper; // Flag to control the visibility of the direction helper
  showAxesHelper; // Flag to control the visibility of the axes helper
  showFoEHelper; // Flag to control the visibility of the field of effect helper

  /**
   * Creates a new Transducer instance.
   * @param {string} [name='Unnamed Transducer'] - The name of the transducer.
   * @param {TRANSDUCER_TYPE} [type=TRANSDUCER_TYPE.UNKNOWN] - The type of the transducer.
   * @param {number} [fieldOfEffectAngleFull=Math.PI / 4] - The field of effect angle in radians.
   * @param {boolean} [showDirectionHelper=true] - Flag to control the visibility of the direction helper.
   * @param {boolean} [showAxesHelper=true] - Flag to control the visibility of the axes helper.
   * @param {boolean} [showFoEHelper=true] - Flag to control the visibility of the field of effect helper.
   */
  constructor(
    name = "Unnamed Transducer",
    transducerType = Transducer_THREE.TRANSDUCER_TYPE.UNKNOWN,
    fieldOfEffect_AngleFull = Math.PI / 4,
    showDirectionHelper = true,
    showAxesHelper = true,
    showFoEHelper = true
  ) {
    super();

    // Initialize properties
    this.name = name;
    // Validate the transducer type
    if (
      !Object.values(Transducer_THREE.TRANSDUCER_TYPE).includes(transducerType)
    ) {
      throw new Error(
        `Invalid transducer type: ${transducerType}. Must be 'sensor', 'actuator', or 'unknown'.`
      );
    } else {
      this.#transducerType = transducerType;
    }

    this.#fieldOfEffect_HelperColor = 0xd9c900;
    this.#fieldOfEffect_HelperRange = 100;
    this.#fieldOfEffect_AngleFull = fieldOfEffect_AngleFull;
    this.showDirectionHelper = showDirectionHelper;
    this.showAxesHelper = showAxesHelper;
    this.showFoEHelper = showFoEHelper;

    this.#customId = THREE.MathUtils.generateUUID(); // Generate a custom unique ID

    this.#axesLength = 12; // Length of the axes helper

    // Create the visual helpers
    this.#createFieldHelper();
    this.#createDirectionHelper();
    this.#createAxesHelper();
  }

  /**
   * Creates the Field of Effect (FoE) helper, which visualizes the range and effect angle.
   * Updates geometry based on intensity and field of effect angle.
   * @private
   */
  #createFieldHelper() {
    const range = this.#fieldOfEffect_HelperRange;
    const angle = this.#fieldOfEffect_AngleFull / 2;

    // Remove the existing field helper group if it exists
    if (this.#fieldOfEffect_HelperGroup) {
      this.remove(this.#fieldOfEffect_HelperGroup);
    }

    // Create a new group to hold the field of effect helper
    this.#fieldOfEffect_HelperGroup = new THREE.Group();

    const color = this.#fieldOfEffect_HelperColor;

    // Create helper lines for the XZ and YZ planes
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
      const material = new THREE.LineBasicMaterial({ color });
      const line = new THREE.Line(geometry, material);
      this.#fieldOfEffect_HelperGroup.add(line);
    }

    // Create lines for the YZ plane
    for (let i = 1; i < pointsYZ.length; i++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        pointsYZ[0],
        pointsYZ[i],
      ]);
      const material = new THREE.LineBasicMaterial({ color });
      const line = new THREE.Line(geometry, material);
      this.#fieldOfEffect_HelperGroup.add(line);
    }

    // Create an ellipse to represent the field of effect boundary
    const ellipseCurve = new THREE.EllipseCurve(
      0,
      0, // Center
      range * Math.sin(angle),
      range * Math.sin(angle), // Radii
      0,
      2 * Math.PI, // Full circle
      false,
      0
    );

    const ellipsePoints = ellipseCurve.getPoints(50);
    const ellipseGeometry = new THREE.BufferGeometry().setFromPoints(
      ellipsePoints
    );
    const ellipseMaterial = new THREE.LineBasicMaterial({ color });
    const ellipse = new THREE.Line(ellipseGeometry, ellipseMaterial);
    ellipse.position.set(0, 0, range * Math.cos(angle)); // Position in front of the transducer
    this.#fieldOfEffect_HelperGroup.add(ellipse);

    // Create two arcs to connect the endpoints in the XZ and YZ planes
    const arcXZ = new THREE.ArcCurve(0, 0, range, -angle, angle, false);
    const arcYZ = new THREE.ArcCurve(0, 0, range, -angle, angle, false);

    const arcGeometryXZ = new THREE.BufferGeometry().setFromPoints(
      arcXZ.getPoints(50)
    );
    const arcMaterialXZ = new THREE.LineBasicMaterial({ color });
    const arcLineXZ = new THREE.Line(arcGeometryXZ, arcMaterialXZ);
    // Align the arc to be in the YZ plane
    arcLineXZ.rotation.z = Math.PI / 2;
    arcLineXZ.rotation.x = Math.PI / 2;
    arcLineXZ.position.set(0, 0, 0);
    this.#fieldOfEffect_HelperGroup.add(arcLineXZ);

    const arcGeometryYZ = new THREE.BufferGeometry().setFromPoints(
      arcYZ.getPoints(50)
    );
    const arcMaterialYZ = new THREE.LineBasicMaterial({ color });
    const arcLineYZ = new THREE.Line(arcGeometryYZ, arcMaterialYZ);
    arcLineYZ.rotation.y = -Math.PI / 2; // Align the arc to be in the YZ plane
    arcLineYZ.position.set(0, 0, 0);
    this.#fieldOfEffect_HelperGroup.add(arcLineYZ);

    // Set the visibility based on the flag
    this.#fieldOfEffect_HelperGroup.visible = this.showFoEHelper;
    this.add(this.#fieldOfEffect_HelperGroup);
  }

  /**
   * Creates the direction helper using an ArrowHelper.
   * @private
   */
  #createDirectionHelper() {
    // Remove the existing direction helper if it exists
    if (this.#directionHelper) {
      this.remove(this.#directionHelper);
    }

    this.#directionHelper = new THREE.ArrowHelper(
      this.getWorldDirection(new THREE.Vector3()),
      new THREE.Vector3(0, 0, 0),
      this.#axesLength, // Length of the arrow
      0xff0000 // Red color for the direction arrow
    );
    this.#directionHelper.visible = this.showDirectionHelper;
    this.add(this.#directionHelper);
  }

  /**
   * Creates the axes helper.
   * @private
   */
  #createAxesHelper() {
    // Remove the existing axes helper if it exists
    if (this.#axesHelper) {
      this.remove(this.#axesHelper);
    }

    this.#axesHelper = new THREE.AxesHelper(this.#axesLength); // Size of the axes
    this.#axesHelper.visible = this.showAxesHelper;
    this.add(this.#axesHelper);
  }

  /**
   * Updates the direction helper's orientation based on the current direction.
   */
  updateDirectionHelper() {
    if (this.#directionHelper) {
      this.#directionHelper.setDirection(
        this.getWorldDirection(new THREE.Vector3())
      );
    }
  }

  //getter and setters
  /**
   * Public getter for the transducer type property.
   * @returns {TransducerType} The type of the transducer.
   */
  get transducerType() {
    return this.#transducerType;
  }

  /**
   * Public getter for the custom ID property.
   * @returns {string} The custom unique ID of the transducer.
   */
  get customId() {
    return this.#customId;
  }

  /**
   * Getter for the field of effect angle.
   * @returns {number} The current field of effect angle in radians.
   */
  get fieldOfEffect_AngleFull() {
    return this.#fieldOfEffect_AngleFull;
  }

  /**
   * Setter for the field of effect angle, updating the visualization.
   * @param {number} value - The new field of effect angle in radians.
   * @throws {Error} If the angle is not a valid number.
   */
  set fieldOfEffect_AngleFull(value) {
    if (typeof value !== "number" || value <= 0 || value > Math.PI) {
      throw new Error(
        "Field of effect angle must be a positive number and less than or equal to π."
      );
    }
    this.#fieldOfEffect_AngleFull = value;
    this.#createFieldHelper(); // Update the field helper with the new effect angle
  }

  /**
   * Getter for the field of effect helper range.
   */
  get fieldOfEffect_HelperRange() {
    return this.#fieldOfEffect_HelperRange;
  }

  /**
   * Setter for the field of effect helper range.
   * @param {number} value - The new range for the field of effect helper.
   * @throws {Error} If the range is not a valid number.
   * @returns {void}
   */
  set fieldOfEffect_HelperRange(value) {
    if (typeof value !== "number" || value <= 0) {
      throw new Error(
        "Field of effect helper range must be a positive number."
      );
    }
    this.#fieldOfEffect_HelperRange = value;
    this.#createFieldHelper(); // Update the field helper with the new range
  }

  /**
   * Getter for the field of effect helper color.
   * @returns {number} The color of the field of effect helper.
   */
  get fieldOfEffect_HelperColor() {
    return this.#fieldOfEffect_HelperColor;
  }

  /**
   * Setter for the field of effect helper color.
   * @param {number} value - The new color for the field of effect helper.
   * @throws {Error} If the color is not a valid number.
   * @returns {void}
   * */
  set fieldOfEffect_HelperColor(value) {
    if (typeof value !== "number") {
      throw new Error("Field of effect helper color must be a number.");
    }
    this.#fieldOfEffect_HelperColor = value;
    this.#createFieldHelper(); // Update the field helper with the new color
  }

  /**
   * Getter and setter for the visibility of the direction helper.
   */
  get directionHelperVisible() {
    return this.#directionHelper.visible;
  }

  set directionHelperVisible(visible) {
    this.#directionHelper.visible = visible;
  }

  /**
   * Getter and setter for the visibility of the axes helper.
   */
  get axesHelperVisible() {
    return this.#axesHelper.visible;
  }

  set axesHelperVisible(visible) {
    this.#axesHelper.visible = visible;
  }

  /**
   * Serializes the transducer object to a JSON string.
   * @returns {string} The JSON representation of the transducer.
   */
  toJSON() {
    return JSON.stringify({
      name: this.name,
      transducerType: this.#transducerType,
      position: this.position.toArray(),
      rotation: this.rotation.toArray(),
      fieldOfEffect_AngleFull: this.#fieldOfEffect_AngleFull,
      showDirectionHelper: this.showDirectionHelper,
      showAxesHelper: this.showAxesHelper,
      showFoEHelper: this.showFoEHelper,
    });
  }

  /**
   * Deserializes a transducer object from a JSON string.
   * @param {string} jsonString - The JSON string to deserialize.
   * @returns {Transducer_THREE} The deserialized Transducer_THREE object.
   */
  static fromJSON(jsonString) {
    const data = JSON.parse(jsonString);
    const transducer = new Transducer_THREE(
      data.name,
      data.transducerType,
      data.fieldOfEffect_AngleFull,
      data.showDirectionHelper,
      data.showAxesHelper,
      data.showFoEHelper
    );
    transducer.position.fromArray(data.position);
    transducer.rotation.fromArray(data.rotation);
    return transducer;
  }
}
