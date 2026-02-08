// Import the Three.js library and OrbitControls from a CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.168.0/examples/jsm/loaders/GLTFLoader.js';
import { Text } from 'https://unpkg.com/troika-three-text?module';

let scene, camera, renderer, controls;
let loadedModel;

/**
 * Initializes the Three.js scene, camera, renderer, and controls.
 * Loads the GLB model and adds it to the scene.
 */
function init() {
  // Set up the scene
  scene = new THREE.Scene();

  // Set up the camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 200, 0);

  // Set up the renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Set up OrbitControls to allow camera orbiting around the origin
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  // Add a grid helper to the scene
  const gridHelper = new THREE.GridHelper(200, 50);
  scene.add(gridHelper);

  // Load the GLB model
  const loader = new GLTFLoader();
  loader.load(
    'fem_body_shell.glb',
    function (gltf) {
      loadedModel = gltf.scene;
      scene.add(loadedModel);
    },
    undefined,
    function (error) {
      console.error('An error occurred while loading the GLB file:', error);
    }
  );

  // Example: Add a Troika Text label
  createTextLabel('Hello, Troika!', 0, 20, 0, scene);

  animate();
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
  textMesh.anchorX = 'center'; // Anchor the text at the center horizontally
  textMesh.anchorY = 'middle'; // Anchor the text at the center vertically
  textMesh.sync(); // Sync the text for rendering

  parent.add(textMesh);
}

/**
 * Animation loop.
 */
function animate() {
  requestAnimationFrame(animate);

  // Update controls
  controls.update();

  // Render the scene
  renderer.render(scene, camera);
}

// Initialize the scene
init();
