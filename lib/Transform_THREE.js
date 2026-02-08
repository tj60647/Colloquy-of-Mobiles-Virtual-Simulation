import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';

// Import Troika Text library
// https://github.com/protectwise/troika/tree/main/packages/troika-three-text

// Import Text from Troika Text library loaded via CDN
// import { Text } from "https://unpkg.com/troika-three-text?module";

/**
 * Transform class represents a position and orientation in 3D space.
 * It supports hierarchical transformations with caching to optimize performance.
 * This class is designed to be used in a p5.js environment.
 */
export class Transform_THREE extends THREE.Object3D {
  /** @type {boolean} Flag to control rendering of the axes helper. */
  #showAxesHelper;

  /** @type {THREE.AxesHelper} Visual helper to show the sensor's local axes. */
  #axesHelper;

  /** @type {number} Length of the axes helper. */
  #axesLength; // Length of the axes helper

  /** @type {THREE.Text} Text geometry for the axes labels. */
  #axesLabels;

  /** @type {boolean} Flag to control rendering of the axes labels. */
  #showAxesLabels;

  /** @type {boolean} Flag to control rendering of the origin helper. */
  #showOriginHelper;

  /** @type {THREE.BoxGeometry} Flag to control rendering of the origin helper. */
  #originHelper;

  /** @type {string} The unique identifier for the transform. */
  #transform_id;

  /**
   * Creates a new Transform instance with the specified position and orientation.
   * @param {string} name - The name of the transform.
   * @param {string} id - The unique identifier for the transform.
   * @param {boolean} showAxesHelper - Flag to control rendering of the axes helper.
   * @param {boolean} showOriginHelper - Flag to control rendering of the origin helper.
   */
  constructor(name = 'Unnamed Transform', id = null, showAxesHelper = true) {
    super();
    // Generate a unique identifier if none is provided
    if (id === null) {
      id = THREE.MathUtils.generateUUID();
    }

    this.#transform_id = id; //add a unique identifier to the transform, seperate from the object3D id.
    this.name = name; //name is a property of Object3D
    this.#showAxesHelper = showAxesHelper;
    this.#axesLength = 12; // Length of the axes helper
    this.#axesHelper = new THREE.AxesHelper(this.#axesLength); //the default size for the axesHelper
    this.#axesHelper.visible = this.#showAxesHelper;
    this.add(this.#axesHelper);
    this.#showOriginHelper = true;

    // Create the origin helper
    this.#createOriginHelper();
  }
  //getters
  get transform_id() {
    return this.#transform_id;
  }

  get showAxesHelper() {
    return this.#showAxesHelper;
  }

  get showOriginHelper() {
    return this.#showOriginHelper;
  }

  //setters
  set showAxesHelper(value) {
    this.#showAxesHelper = value;
    this.#axesHelper.visible = this.#showAxesHelper;
  }

  set showOriginHelper(value) {
    this.#showOriginHelper = value;
    this.#originHelper.visible = this.#showOriginHelper;
  }

  originHelperMaterial(value) {
    //verify that the value is a material
    if (!(value instanceof THREE.Material)) {
      console.error('The origin helper material must be an instance of THREE.Material');
      return;
    }
    this.#originHelper.material = value;
  }

  /**
   * Creates geometry for the origin helper
   * @private
   */
  #createOriginHelper() {
    // Create the origin helper
    const box = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const object = new THREE.Mesh(box, material);
    this.#originHelper = object;
    this.#originHelper.visible = this.#showOriginHelper;
    this.add(this.#originHelper);
  }

  /**
   * Creates a text label using Troika's Text class at the specified position.
   * @param {string} text - The text content of the label.
   * @param {number} x - The x-coordinate for the label.
   * @param {number} y - The y-coordinate for the label.
   * @param {number} z - The z-coordinate for the label.
   * @param {THREE.Object3D} parent - The parent object to which the label is added.
   */
  createTextLabel(text, x, y, z, parent) {
    // const textMesh = new Text();
    // textMesh.text = text;
    // textMesh.fontSize = 5;
    // textMesh.position.set(x, y, z);
    // textMesh.color = 0xffffff; // Set text color
    // textMesh.anchorX = "center"; // Anchor the text at the center horizontally
    // textMesh.anchorY = "middle"; // Anchor the text at the center vertically
    // textMesh.sync(); // Sync the text
    // parent.add(textMesh);
  }
}
