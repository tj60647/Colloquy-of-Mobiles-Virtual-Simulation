// filename: sketch.js
// location: apps/demo-01-actuator-THREE/public/sketch.js

// demonstration of the Actuator_THREE class
// that can emit energy within its field of effect
// the UI allows for controlling the actuator's properties
// and displays the detection status of targets

// Import the Three.js library and OrbitControls from a CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';
import { createCameraControl } from '../../../lib/cameraUtilities.js';

// Import the custom Actuator_THREE class
import { Actuator_THREE } from '../../lib/Actuator_THREE.js';

// Create the main scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

// Set up the WebGL renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a container for the camera control
const cameraControl = createCameraControl(renderer);
console.log('cameraControl.isPerspective:' + cameraControl.isPerspective);

// Add a directional light to the scene
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(70, 200, 100).normalize();
scene.add(light);

// Add a grid helper to the scene
const gridHelper = new THREE.PolarGridHelper(42, 8, 16, 128, 0xcccccc, 0xdddddd);
scene.add(gridHelper);

// Add an array of targets to the scene inside a 100 unit circle
const targetCount = 100;
const targets = [];
for (let i = 0; i < targetCount; i++) {
  // Assign a random minimum sensitivity level to the target, mapped between 0.001 and 1
  const minIntensitySensitivity = Math.random() * (1 - 0.001) + 0.001;

  // Calculate the dimension using logarithmic scaling to make the size changes more visually intuitive
  const scaledSensitivity = Math.log10(1 / minIntensitySensitivity + 1);
  const dimension = scaledSensitivity; // Scaling factor for better visibility

  const target = new THREE.Mesh(
    new THREE.BoxGeometry(dimension, dimension, dimension), // input: width, height, depth
    new THREE.MeshLambertMaterial({ color: 0xff0000 })
  );

  const distance = Math.random() * 38 + 4;
  const angle = Math.random() * Math.PI * 2;
  const deltaY = Math.random() * 10 - 5;
  target.position.set(distance * Math.cos(angle), deltaY, distance * Math.sin(angle));

  target.minIntensitySensitivity = minIntensitySensitivity;
  scene.add(target);
  targets.push(target);
}

// Create an actuator instance
const actuator = new Actuator_THREE(
  'Central Actuator',
  Math.PI / 2, // Field of effect angle in radians
  1000, // Power of the actuator
  true, // Show direction helper
  true, // Show axes helper
  true // Show field of effect helper
);
actuator.position.set(0, 0, 0); // Position the actuator at the origin
actuator.rotation.set(0, Math.PI / 4, 0); // Rotate the actuator 45 degrees around the Y-axis
scene.add(actuator); // Add the actuator to the scene

// Create a secondary camera for the actuator's view
const actuatorCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); // Aspect ratio set to 1 for a square view
actuatorCamera.fov = actuator.fieldOfEffect_AngleFull * (180 / Math.PI); // Update actuator camera FOV
actuatorCamera.updateProjectionMatrix();

// Variable for rotation rate
let rotationRate = 0.003; // Default rotation rate

//********************************************************************************
// UI Creation and Interaction

/**
 * Creates the UI for controlling the actuator's properties.
 * @returns {{statusDisplay: HTMLElement}} - Returns an object containing a reference to the status display element.
 */
function createUI() {
  //set the document body to not scroll
  document.body.style.overflow = 'hidden';

  // Create a UI container
  const uiContainer = document.createElement('div');
  uiContainer.style.position = 'absolute';
  uiContainer.style.top = '10px';
  uiContainer.style.left = '10px';
  uiContainer.style.color = 'white';
  uiContainer.style.fontFamily = 'Arial, sans-serif';
  uiContainer.style.zIndex = '100';
  uiContainer.style.backgroundColor = 'rgba(128, 128, 128, 0.5)';
  uiContainer.style.padding = '10px';
  uiContainer.style.borderRadius = '5px';
  uiContainer.style.display = 'flex';
  uiContainer.style.flexDirection = 'column';
  uiContainer.style.gap = '10px';
  uiContainer.style.width = '200px'; // Adjusted width for more space
  document.body.appendChild(uiContainer);

  // Create a title label
  const titleLabel = document.createElement('div');
  titleLabel.textContent = 'Actuator Controls';
  titleLabel.style.fontWeight = 'bold';
  titleLabel.style.textAlign = 'center';
  uiContainer.appendChild(titleLabel);

  // Create a button to toggle the actuator visibility
  const toggleButton = document.createElement('button');
  toggleButton.textContent = actuator.visible ? 'Hide Actuator' : 'Show Actuator';
  toggleButton.style.width = '100%'; // Fixed width for the button
  toggleButton.onclick = () => {
    actuator.visible = !actuator.visible;
    toggleButton.textContent = actuator.visible ? 'Hide Actuator' : 'Show Actuator';
  };
  uiContainer.appendChild(toggleButton);

  // Create a label and slider for the actuator's field of view
  const fovLabel = document.createElement('label');
  fovLabel.textContent = 'Field of View:';
  uiContainer.appendChild(fovLabel);

  const fovSliderContainer = document.createElement('div');
  fovSliderContainer.style.display = 'flex';
  fovSliderContainer.style.alignItems = 'center';
  const fovSlider = document.createElement('input');
  fovSlider.type = 'range';
  fovSlider.min = '1';
  fovSlider.max = '180';
  fovSlider.value = (actuator.fieldOfEffect_AngleFull * (180 / Math.PI)).toString();
  const fovValueDisplay = document.createElement('span');
  fovValueDisplay.style.marginLeft = '10px';
  fovValueDisplay.textContent = `${fovSlider.value}°`;

  fovSlider.oninput = (event) => {
    actuator.fieldOfEffect_AngleFull = (parseInt(event.target.value) * Math.PI) / 180;
    actuatorCamera.fov = actuator.fieldOfEffect_AngleFull * (180 / Math.PI); // Update actuator camera FOV
    actuatorCamera.updateProjectionMatrix();
    fovValueDisplay.textContent = `${event.target.value}°`;
  };

  fovSliderContainer.appendChild(fovSlider);
  fovSliderContainer.appendChild(fovValueDisplay);
  uiContainer.appendChild(fovSliderContainer);

  // Create a label and slider for the actuator's power
  const powerLabel = document.createElement('label');
  powerLabel.textContent = 'Actuator Power:';
  uiContainer.appendChild(powerLabel);

  const powerSliderContainer = document.createElement('div');
  powerSliderContainer.style.display = 'flex';
  powerSliderContainer.style.alignItems = 'center';
  const powerSlider = document.createElement('input');
  powerSlider.type = 'range';
  powerSlider.min = '0';
  powerSlider.max = '1000';
  powerSlider.step = '10'; // Adding step for better precision
  powerSlider.value = actuator.power.toString();

  const powerValueDisplay = document.createElement('span');
  powerValueDisplay.style.marginLeft = '10px';
  powerValueDisplay.textContent = `${powerSlider.value}`;

  powerSlider.oninput = (event) => {
    actuator.power = parseInt(event.target.value);
    powerValueDisplay.textContent = `${event.target.value}`;
  };

  powerSliderContainer.appendChild(powerSlider);
  powerSliderContainer.appendChild(powerValueDisplay);
  uiContainer.appendChild(powerSliderContainer);

  // Create a label and slider for the actuator's rotation rate
  const rotationRateLabel = document.createElement('label');
  rotationRateLabel.textContent = 'Rotation Rate:';
  uiContainer.appendChild(rotationRateLabel);

  const rotationRateSliderContainer = document.createElement('div');
  rotationRateSliderContainer.style.display = 'flex';
  rotationRateSliderContainer.style.alignItems = 'center';
  const rotationRateSlider = document.createElement('input');
  rotationRateSlider.type = 'range';
  rotationRateSlider.min = '-0.01';
  rotationRateSlider.max = '0.01';
  rotationRateSlider.step = '0.001';
  rotationRateSlider.value = rotationRate.toString(); // Default rotation rate
  const rotationRateValueDisplay = document.createElement('span');
  rotationRateValueDisplay.style.marginLeft = '10px';
  rotationRateValueDisplay.textContent = `${rotationRateSlider.value}`;

  rotationRateSlider.oninput = (event) => {
    rotationRate = parseFloat(event.target.value);
    rotationRateValueDisplay.textContent = `${event.target.value}`;
  };

  rotationRateSliderContainer.appendChild(rotationRateSlider);
  rotationRateSliderContainer.appendChild(rotationRateValueDisplay);
  uiContainer.appendChild(rotationRateSliderContainer);

  // Create a label for status display
  const statusDisplayLabel = document.createElement('label');
  statusDisplayLabel.textContent = 'Actuator Status:';
  uiContainer.appendChild(statusDisplayLabel);

  // Create a status display at the bottom for actuator data
  const statusDisplay = document.createElement('div');
  statusDisplay.textContent = 'Actuator Status: Initializing...';
  statusDisplay.style.fontSize = '12px';
  statusDisplay.style.fontWeight = 'lighter';
  statusDisplay.style.marginTop = '5px'; // Add some spacing above the status
  uiContainer.appendChild(statusDisplay);

  return { statusDisplay };
}

//********************************************************************************

// Initialize UI and get references to dynamically updated elements
const { statusDisplay } = createUI();

//********************************************************************************

/**
 * Function to update the scene on each animation frame.
 */
function animate() {
  requestAnimationFrame(animate);

  // Rotate the actuator around the Y-axis based on the rotation rate
  actuator.rotation.y += rotationRate;
  // Reset actuator rotation if it exceeds 2*PI
  if (actuator.rotation.y > Math.PI * 2) {
    actuator.rotation.y = 0;
  }

  // Update the actuator camera to match the actuator's position and orientation
  actuatorCamera.position.copy(actuator.position);

  // Compute the direction the actuator is facing
  const actuatorDirection = new THREE.Vector3();
  actuator.getWorldDirection(actuatorDirection);

  // Point the camera in the same direction as the actuator
  actuatorCamera.lookAt(actuator.position.clone().add(actuatorDirection));

  // Check if any targets are within the actuator's field of effect and update UI
  updateTargetDetectionStatus();

  // Render the main scene from the main camera's perspective
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);

  renderMainCamera();

  // Render the actuator's view in a square window in the top-right corner
  const insetSize = Math.min(window.innerWidth, window.innerHeight) / 4; // Make the viewport a square
  renderer.setScissorTest(true); // Enable scissor test to limit rendering to the viewport
  renderer.setScissor(
    window.innerWidth - insetSize - 10,
    window.innerHeight - insetSize - 10,
    insetSize,
    insetSize
  );
  renderer.setViewport(
    window.innerWidth - insetSize - 10,
    window.innerHeight - insetSize - 10,
    insetSize,
    insetSize
  );
  renderer.render(scene, actuatorCamera);
  renderer.setScissorTest(false); // Disable scissor test after rendering
}

function renderMainCamera() {
  // Render the main scene from the main camera's perspective
  //renderer.setViewport(0, 0, window.innerWidth, window.innerHeight); --- is this optional?
  renderer.clear(); // Clear the previous frame

  // Update orbit mode if active

  cameraControl.updateOrbit();

  // Update the controls and render the scene
  if (!cameraControl.isOrbiting) {
    cameraControl.currentOrbitControl.update(); // Only update controls if not in orbit mode
  }

  renderer.render(scene, cameraControl.camera);
}

/**
 * Function to update the detection status of targets and update the UI.
 * This function checks if targets are in range and updates the UI accordingly.
 */
function updateTargetDetectionStatus() {
  // Variable to track if any target is detectable
  let targetIsDetectable = false;

  // Clear previous summary in the status display
  statusDisplay.innerHTML = ''; // Clear existing content

  // Create a status message header
  let statusHeader = document.createElement('div');
  statusHeader.textContent = 'Target Detection Summary:';
  statusHeader.style.fontWeight = 'bold';
  statusDisplay.appendChild(statusHeader);

  // Iterate over each target and check if it is within the actuator's field of effect
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const result = actuator.isTargetInFieldOfEffect(target);

    if (result.inFieldOfEffect && result.transmittedIntensity >= target.minIntensitySensitivity) {
      targetIsDetectable = true;

      // Create a new row for each detectable target
      let targetRow = document.createElement('div');
      targetRow.style.marginTop = '5px'; // Add some spacing between rows

      // Add information about the target
      targetRow.innerHTML = `
        <strong>Target ${i + 1}:</strong> <br>
        Distance: ${result.distance.toFixed(2)} <br>
        Target Sensitivity: ${target.minIntensitySensitivity.toFixed(3)} <br>
        Transmitted Intensity: ${result.transmittedIntensity.toFixed(3)}
      `;

      // Append the target row to the status display
      statusDisplay.appendChild(targetRow);

      // Adjust the color of the target based on the transmitted intensity
      // the transmitted intensity is always greater than the target's minIntensitySensitivity
      // so we subtract the minIntensitySensitivity to get a value between 0 and 1
      let intensityFactor =
        (result.transmittedIntensity - target.minIntensitySensitivity) /
        (1 - target.minIntensitySensitivity);

      // Clamp intensityFactor between 0 and 1
      intensityFactor = Math.max(0, Math.min(intensityFactor, 1));

      // Use the intensityFactor to calculate the color:
      const redValue = Math.floor((1 - intensityFactor) * 255);
      const greenValue = Math.floor(intensityFactor * 255);

      // Set the target color (from red to green)
      target.material.color.setRGB(redValue / 255, greenValue / 255, 0);
      target.material.emissive.setRGB(0, greenValue / 255, 0);
    } else {
      // Set the target's color to red if not in range
      target.material.color.set(0xff0000);
      target.material.emissive.set(0x000000);
    }
  }

  // If no targets are detectable, display a corresponding message
  if (!targetIsDetectable) {
    let noTargetMessage = document.createElement('div');
    noTargetMessage.textContent = 'No targets are in the field of effect.';
    statusDisplay.appendChild(noTargetMessage);
  }
}

// Start the animation loop
animate();

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
