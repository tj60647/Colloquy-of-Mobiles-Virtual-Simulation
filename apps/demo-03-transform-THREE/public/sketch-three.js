// Import the Three.js library and OrbitControls from a CDN
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js";

// Import Text from Troika Text library loaded via CDN
import { Text } from "https://unpkg.com/troika-three-text?module";

import { createCameraControl } from "../../../lib/cameraUtilities.js";

let scene, renderer, cameraControl;
let worldTransform,
  rootTransform,
  childTransform,
  grandChildTransform,
  greatGrandChildTransform;
const rotationSpeed = 0.5; // Speed of rotation in degrees per frame
const axisLength = 20;

// Pre-create geometries and materials for the axes
let xAxisGeometry, yAxisGeometry, zAxisGeometry;
let xAxisMaterial, yAxisMaterial, zAxisMaterial;

let lightSource;

/**
 * Initializes the Three.js scene, camera, renderer, and controls.
 * Creates a hierarchy of objects representing the transforms.
 */
function init() {
  // Create the scene
  scene = new THREE.Scene();

  // Set up the renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Create a container for the camera control
  cameraControl = createCameraControl(renderer);

  lightSource = new THREE.DirectionalLight(0xffffff, 1);
  lightSource.position.set(10, 10, 10);
  scene.add(lightSource);

  // Create transforms with hierarchical relationships
  worldTransform = new THREE.Group();
  scene.add(worldTransform); // Add root to the scene

  rootTransform = new THREE.Group();
  scene.add(rootTransform); // Add root to the scene

  childTransform = new THREE.Group();
  rootTransform.add(childTransform); // Child is added to root
  childTransform.position.set(0, 50, 0); // Position child relative to root
  childTransform.rotation.z = Math.PI / 2; // Rotate child around its Y-axis

  grandChildTransform = new THREE.Group();
  childTransform.add(grandChildTransform); // Grandchild is added to child
  grandChildTransform.position.set(0, 50, 0); // Position grandchild relative to child
  grandChildTransform.rotation.z = Math.PI / 2; // Rotate grandchild around its Y-axis

  greatGrandChildTransform = new THREE.Group();
  grandChildTransform.add(greatGrandChildTransform); // Great-grandchild is added to grandchild
  greatGrandChildTransform.position.set(0, 50, 0); // Position great-grandchild relative to grandchild
  greatGrandChildTransform.rotation.z = Math.PI / 2; // Rotate great-grandchild around its Y-axis

  // Add a grid to the scene for reference
  const gridHelper = new THREE.GridHelper(200, 10);
  worldTransform.add(gridHelper);

  // Create geometries to visualize the transforms as cubes
  const cubeGeometry = new THREE.BoxGeometry(4, 4, 4); // Use cubes instead of spheres
  const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });

  // Create and add meshes to visualize each transform
  const rootMesh = new THREE.Mesh(cubeGeometry, material);
  rootTransform.add(rootMesh); // Visualize root

  const childMesh = new THREE.Mesh(cubeGeometry, material);
  childTransform.add(childMesh); // Visualize child

  const grandChildMesh = new THREE.Mesh(cubeGeometry, material);
  grandChildTransform.add(grandChildMesh); // Visualize grandchild

  const greatGrandChildMesh = new THREE.Mesh(cubeGeometry, material);
  greatGrandChildTransform.add(greatGrandChildMesh); // Visualize great-grandchild

  // Pre-create axis geometries and materials
  createAxisGeometriesAndMaterials();

  // Draw axes for each transform
  drawAxes(rootTransform);
  drawAxes(childTransform);
  drawAxes(grandChildTransform);
  drawAxes(greatGrandChildTransform);

  animate();
}

/**
 * Creates geometries and materials for the axes once.
 */
function createAxisGeometriesAndMaterials() {
  // X-axis: Red
  const xAxisPoints = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(axisLength, 0, 0),
  ];
  xAxisGeometry = new THREE.BufferGeometry().setFromPoints(xAxisPoints);
  xAxisMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

  // Y-axis: Green
  const yAxisPoints = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, axisLength, 0),
  ];
  yAxisGeometry = new THREE.BufferGeometry().setFromPoints(yAxisPoints);
  yAxisMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });

  // Z-axis: Blue
  const zAxisPoints = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, axisLength),
  ];
  zAxisGeometry = new THREE.BufferGeometry().setFromPoints(zAxisPoints);
  zAxisMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
}

/**
 * Draws the local coordinate axes (X, Y, Z) for a given transform.
 * @param {THREE.Object3D} transform - The transform object for which the axes are drawn.
 */
function drawAxes(transform) {
  // Reuse pre-created geometries and materials for axes
  const xAxisLine = new THREE.Line(xAxisGeometry, xAxisMaterial);
  transform.add(xAxisLine);
  createTextLabel("X", axisLength / 2, 0, 0, transform); // Position label at midpoint of X-axis

  const yAxisLine = new THREE.Line(yAxisGeometry, yAxisMaterial);
  transform.add(yAxisLine);
  createTextLabel("Y", 0, axisLength / 2, 0, transform); // Position label at midpoint of Y-axis

  const zAxisLine = new THREE.Line(zAxisGeometry, zAxisMaterial);
  transform.add(zAxisLine);
  createTextLabel("Z", 0, 0, axisLength / 2, transform); // Position label at midpoint of Z-axis
}

/**
 * Draws a line between two transforms, accounting for their world positions and orientations.
 * @param {THREE.Object3D} parent - The parent transform.
 * @param {THREE.Object3D} child - The child transform.
 */
function drawLineBetweenTransforms(parent, child) {
  const parentPosition = new THREE.Vector3();
  parent.getWorldPosition(parentPosition); // Get parent's world position

  const childPosition = new THREE.Vector3();
  child.getWorldPosition(childPosition); // Get child's world position

  const linePoints = [parentPosition, childPosition];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff }); // White color for the line
  const line = new THREE.Line(lineGeometry, lineMaterial);

  scene.add(line); // Add the line to the scene
}

/**
 * Creates a text label using Troika's Text class at the specified position.
 * @param {string} text - The text content of the label.
 * @param {number} x - The x-coordinate for the label.
 * @param {number} y - The y-coordinate for the label.
 * @param {number} z - The z-coordinate for the label.
 * @param {THREE.Object3D} parent - The parent object to which the label is added.
 */
function createTextLabel(text, x, y, z, parent) {
  const textMesh = new Text();
  textMesh.text = text;
  textMesh.fontSize = 5;
  textMesh.position.set(x, y, z);
  textMesh.color = 0xffffff; // Set text color
  textMesh.anchorX = "center"; // Anchor the text at the center horizontally
  textMesh.anchorY = "middle"; // Anchor the text at the center vertically
  textMesh.sync(); // Sync the text

  parent.add(textMesh);
}

/**
 * Animates the scene, applying rotation to the transforms and rendering.
 */
function animate() {
  requestAnimationFrame(animate);

  // Clear lines before drawing new ones
  clearLines();

  // Draw lines between parent and child objects
  drawLineBetweenTransforms(rootTransform, childTransform);
  drawLineBetweenTransforms(childTransform, grandChildTransform);
  drawLineBetweenTransforms(grandChildTransform, greatGrandChildTransform);

  // Rotate the transforms around their local Z-axis
  rootTransform.rotation.y += THREE.MathUtils.degToRad(rotationSpeed);
  childTransform.rotation.y += THREE.MathUtils.degToRad(rotationSpeed);
  grandChildTransform.rotation.y += THREE.MathUtils.degToRad(rotationSpeed);
  greatGrandChildTransform.rotation.y +=
    THREE.MathUtils.degToRad(rotationSpeed);

  // Render the scene from the perspective of the camera
  renderer.render(scene, cameraControl.camera);
}

/**
 * Clears all lines between transforms from the scene.
 */
function clearLines() {
  for (let i = scene.children.length - 1; i >= 0; i--) {
    const obj = scene.children[i];
    if (obj.type === "Line") {
      scene.remove(obj);
    }
  }
}

// Initialize the scene
init();
