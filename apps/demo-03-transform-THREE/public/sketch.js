// Import the Three.js library and OrbitControls from a CDN
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js";
import { createCameraControl } from "../../../lib/cameraUtilities.js";

// Import the custom Sensor_THREE class
import { Transform_THREE } from "../../lib/Transform_THREE.js";

let scene, cameraControl, renderer;
let worldTransform,
  rootTransform,
  childTransform,
  grandChildTransform,
  greatGrandChildTransform;
let rotationSpeed = 0.001; // Speed of rotation in radians per frame
let lightSource;

let cylindarDiameter = 3;
let sphereDiameter = 3;

let fogNear = 50;
let fogFar = 250;

let transformOffset = 12;

// Create a glass-like material
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, // White or light color for glass
  metalness: 0, // Glass is not metallic, range 0 to 1
  roughness: 0, // Smooth surface
  transmission: 1, // Full transmission for clear glass, range 0 to 1
  opacity: 0.5, // Slight opacity to enhance the glass effect
  transparent: true, // Enable transparency
  reflectivity: 0.9, // High reflectivity for glass
  ior: 1.5, // Index of refraction, typical value for glass
  clearcoat: 1, // Extra glossiness for reflective surfaces, range 0 to 1
  clearcoatRoughness: 0.5, // No roughness for a smooth, glass-like surface, range 0 to 1
});

// Create a chrome-like material
const chromeMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, // White or light color for glass
  metalness: 1, // Glass is not metallic, range 0 to 1
  roughness: 0, // Smooth surface
  transmission: 0, // Full transmission for clear glass, range 0 to 1
  opacity: 1, // Slight opacity to enhance the glass effect
  transparent: false, // Enable transparency
  reflectivity: 0.9, // High reflectivity for glass
  ior: 1, // Index of refraction, typical value for glass
  clearcoat: 1, // Extra glossiness for reflective surfaces, range 0 to 1
  clearcoatRoughness: 1, // No roughness for a smooth, glass-like surface, range 0 to 1
});

/**
 * Initializes the Three.js scene, camera, renderer, and controls.
 * Creates a hierarchy of objects representing the transforms.
 */
function init() {
  // Create the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color("white"); // Set the scene background color
  scene.fog = new THREE.Fog(0xffffff, fogNear, fogFar); // Initial fog settings
  scene.ambientLight = new THREE.AmbientLight(0xffffff, 0.05);

  // Set up the WebGL renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // set the renderer to use antialiasing
  renderer.antialias = true;

  document.body.appendChild(renderer.domElement);

  cameraControl = createCameraControl(renderer);

  // Set up a directional light source
  lightSource = new THREE.DirectionalLight(0xffffff, 1);
  lightSource.position.set(10, 10, 10);
  scene.add(lightSource);

  // Create transforms with hierarchical relationships
  worldTransform = new Transform_THREE("World", "worldID");
  scene.add(worldTransform); // Add root to the scene

  rootTransform = new Transform_THREE("Root", "rootID");
  rootTransform.originHelperMaterial(chromeMaterial);
  drawLineBetweenTransforms(rootTransform, childTransform);
  addSphereAtTransform(rootTransform);
  scene.add(rootTransform); // Add root to the scene

  childTransform = new Transform_THREE("Child", "childID");
  drawLineBetweenTransforms(rootTransform, childTransform);
  addSphereAtTransform(childTransform);
  childTransform.originHelperMaterial(chromeMaterial);
  rootTransform.add(childTransform); // Child is added to root
  childTransform.position.set(0, transformOffset, 0); // Position child relative to root
  childTransform.rotation.z = Math.PI / 2; // Rotate child around its Y-axis

  grandChildTransform = new Transform_THREE("Grandchild", "grandchildID");
  drawLineBetweenTransforms(childTransform, grandChildTransform);
  addSphereAtTransform(grandChildTransform);
  grandChildTransform.originHelperMaterial(chromeMaterial);
  childTransform.add(grandChildTransform); // Grandchild is added to child
  grandChildTransform.position.set(0, transformOffset, 0); // Position grandchild relative to child
  grandChildTransform.rotation.z = Math.PI / 2; // Rotate grandchild around its Y-axis

  greatGrandChildTransform = new Transform_THREE(
    "Great-grandchild",
    "greatGrandchildID"
  );
  drawLineBetweenTransforms(grandChildTransform, greatGrandChildTransform);
  addSphereAtTransform(greatGrandChildTransform);
  greatGrandChildTransform.originHelperMaterial(chromeMaterial);
  grandChildTransform.add(greatGrandChildTransform); // Great-grandchild is added to grandchild
  greatGrandChildTransform.position.set(0, transformOffset, 0); // Position great-grandchild relative to grandchild
  greatGrandChildTransform.rotation.z = Math.PI / 2; // Rotate great-grandchild around its Y-axis

  // Add a grid to the scene for reference
  // Add a grid helper to the scene
  const gridHelper = new THREE.PolarGridHelper(
    42,
    8,
    16,
    128,
    0xcccccc,
    0xdddddd
  );
  worldTransform.add(gridHelper);

  // Initialize UI and get references to dynamically updated elements
  createUI();

  animate();
}

//draw a sphere and a cylindar between two transforms
//assume that the geometry will be added ot the parent transform
//and the sphere will be at the parent's position
//and the cylindar will be between the two transforms

function drawLineBetweenTransforms(parent, child) {
  // Create a cylindar between the two transforms
  const cylindarGeometry = new THREE.CylinderGeometry(
    cylindarDiameter / 2,
    cylindarDiameter / 2,
    transformOffset,
    32
  ); // parameters: radiusTop, radiusBottom, height, radialSegments

  //no caps on the cylindar
  cylindarGeometry.openEnded = true;

  const cylindarMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
  const cylindar = new THREE.Mesh(cylindarGeometry, glassMaterial);
  cylindar.position.set(0, transformOffset / 2, 0); // Position the cylindar halfway between the two transforms
  parent.add(cylindar);
}

function addSphereAtTransform(parent) {
  // Create a sphere at the parent's position
  const sphereGeometry = new THREE.SphereGeometry(sphereDiameter / 2, 32, 32); // parameters: radius, widthSegments, heightSegments
  const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
  const sphere = new THREE.Mesh(sphereGeometry, glassMaterial);
  parent.add(sphere);
}

/**
 * Animates the scene, applying rotation to the transforms and rendering.
 */
function animate() {
  requestAnimationFrame(animate);

  // Rotate the transforms around their local Y-axis
  rootTransform.rotation.y += rotationSpeed;
  childTransform.rotation.y += rotationSpeed;
  grandChildTransform.rotation.y += rotationSpeed;
  greatGrandChildTransform.rotation.y += rotationSpeed;

  // Render the scene from the perspective of the camera
  renderMainCamera();
}

// Function to create and set up the UI
function createUI() {
  //set the document body to not scroll
  document.body.style.overflow = "hidden";

  // Create a UI container
  const uiContainer = document.createElement("div");
  uiContainer.style.position = "absolute";
  uiContainer.style.top = "10px";
  uiContainer.style.left = "10px";
  uiContainer.style.color = "white";
  uiContainer.style.fontFamily = "Arial, sans-serif";
  uiContainer.style.zIndex = "100";
  uiContainer.style.backgroundColor = "rgba(128, 128, 128, 0.5)";
  uiContainer.style.padding = "10px";
  uiContainer.style.borderRadius = "5px";
  uiContainer.style.display = "flex";
  uiContainer.style.flexDirection = "column";
  uiContainer.style.gap = "10px";
  uiContainer.style.width = "200px"; // Increased width to accommodate value display
  document.body.appendChild(uiContainer);

  // Create a title label
  const titleLabel = document.createElement("div");
  titleLabel.textContent = "Transform Controls";
  titleLabel.style.fontWeight = "bold";
  titleLabel.style.textAlign = "center";
  uiContainer.appendChild(titleLabel);

  // Create a label and slider for the sensor's rotation rate
  const rotationRateLabel = document.createElement("label");
  rotationRateLabel.textContent = "Rotation Rate:";
  uiContainer.appendChild(rotationRateLabel);

  const rotationRateSlider = document.createElement("input");
  rotationRateSlider.type = "range";
  rotationRateSlider.min = "-0.01";
  rotationRateSlider.max = "0.01";
  rotationRateSlider.step = "0.001";
  rotationRateSlider.value = rotationSpeed.toString(); // Default rotation rate
  rotationRateSlider.oninput = (event) => {
    rotationSpeed = parseFloat(event.target.value);
    rotationRateValue.textContent = rotationSpeed.toFixed(3); // Update the displayed value
  };
  uiContainer.appendChild(rotationRateSlider);

  const rotationRateValue = document.createElement("span");
  rotationRateValue.textContent = rotationSpeed.toFixed(3); // Initial value display
  uiContainer.appendChild(rotationRateValue);
}

// Initialize the scene
init();

// Handle window resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function renderMainCamera() {
  renderer.clear(); // Clear the previous frame

  // Update orbit mode if active

  cameraControl.updateOrbit();

  // Update the controls and render the scene
  if (!cameraControl.isOrbiting) {
    cameraControl.currentOrbitControl.update(); // Only update controls if not in orbit mode
  }

  renderer.render(scene, cameraControl.camera);
}
