// filename: sketch.js
// file location: apps/demo-08-sensor-THREE/public/sketch.js
// this demo illustrates the use of the Sensor_THREE class
// to detect targets within its field of view
// and visualize the detection status in a Three.js scene.
// The sensor is represented by a cone-shaped field of effect
// that can detect targets within its range based on their intensity.
// The targets are represented by cubes with varying power levels.
// the UI allows for adjusting the sensor's field of view and sensitivity.

// Import the Three.js library and OrbitControls from a CDN
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js";
import { createCameraControl } from "../../../lib/cameraUtilities.js";

// Import the custom Sensor_THREE class
import { Sensor_THREE } from "../../lib/Sensor_THREE.js";
import { Transducer_THREE } from "../../lib/Transducer_THREE.js";
import { formatValue } from "../../lib/UI_Utilities.js";

// Create the main scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

// Set up the WebGL renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a container for the camera control
const cameraControl = createCameraControl(renderer);

// Add a directional light to the scene
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(70, 200, 100).normalize();
scene.add(light);

// Add a grid helper to the scene
//const gridHelper = new THREE.GridHelper(84, 84, 0xcccccc, 0xdddddd);

const gridHelper = new THREE.PolarGridHelper(
  42,
  8,
  16,
  128,
  0xcccccc,
  0xdddddd
);
scene.add(gridHelper);

//PolarGridHelper

// Add an array of targets to the scene inside a 100 unit circle
const targetCount = 100;

const targets = [];
for (let i = 0; i < targetCount; i++) {
  const power = 1 + Math.floor(Math.random() * 100) * 20; // Assign a random power level to the target
  const dimension = power / 1000; // Scale the dimension based on the power level
  const target = new THREE.Mesh(
    new THREE.BoxGeometry(dimension, dimension, dimension), // input: width, height, depth
    new THREE.MeshLambertMaterial({ color: 0xff0000 })
  );

  const distance = Math.random() * 38 + 4;
  const angle = Math.random() * Math.PI * 2;
  const deltaY = Math.random() * 10 - 5;
  target.position.set(
    distance * Math.cos(angle),
    deltaY,
    distance * Math.sin(angle)
  );
  target.power = power;
  scene.add(target);
  targets.push(target);
}

// Create a sensor instance
const sensor = new Sensor_THREE(
  "Front Sensor",
  Math.PI / 2, // FOV in radians
  0.05, // Minimum intensity sensitivity
  true, // Show direction helper
  true, // Show axes helper
  true // Show field of effect helper
);
sensor.position.set(0, 0, 0); // Position the sensor at the origin
sensor.rotation.set(0, Math.PI / 4, 0); // Rotate the sensor 45 degrees around the Y-axis
scene.add(sensor); // Add the sensor to the scene

// Create a secondary camera for the sensor's view
const sensorCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); // Aspect ratio set to 1 for a square view
sensorCamera.fov = sensor.fieldOfEffect_AngleFull * (180 / Math.PI); // Update sensor camera FOV
sensorCamera.updateProjectionMatrix();

// Variable for rotation rate
let rotationRate = 0.003; // Default rotation rate

//********************************************************************************
// UI Creation and Interaction

// Function to create and set up the UI
function createControls(transducer) {
  const isSensor =
    transducer.transducerType === Transducer_THREE.TRANSDUCER_TYPE.SENSOR;
  const isActuator =
    transducer.transducerType === Transducer_THREE.TRANSDUCER_TYPE.ACTUATOR;

  //get the background color based on the field of effect color
  // Get the hexadecimal color value
  const hexColor = transducer.fieldOfEffect_HelperColor;

  // Extract RGB components from the hexadecimal color
  let red = (hexColor >> 16) & 0xff;
  let green = (hexColor >> 8) & 0xff;
  let blue = hexColor & 0xff;

  // Set the transparency value (0.0 to 1.0, where 0 is fully transparent and 1 is fully opaque)
  const alpha = 0.8; // Example: 80% opacity

  // Create the rgba color string
  const backgroundColor = `rgba(${red}, ${green}, ${blue}, ${alpha})`;

  // Create a UI container
  const controlContainer = document.createElement("div");
  controlContainer.style.position = "absolute";
  controlContainer.style.top = "10px";
  controlContainer.style.left = "10px";
  controlContainer.style.color = "white";
  controlContainer.style.fontFamily = "Arial, sans-serif";
  controlContainer.style.zIndex = "100";
  controlContainer.style.backgroundColor = backgroundColor;
  controlContainer.style.padding = "10px";
  controlContainer.style.borderRadius = "5px";
  controlContainer.style.display = "flex";
  controlContainer.style.flexDirection = "column";
  controlContainer.style.gap = "10px";
  controlContainer.style.width = "200px"; // Adjusted width for more space
  document.body.appendChild(controlContainer);

  // Create a title label
  const titleLabel = document.createElement("div");
  titleLabel.textContent = "Sensor Controls";
  titleLabel.style.fontWeight = "bold";
  titleLabel.style.textAlign = "center";
  controlContainer.appendChild(titleLabel);

  // Create a button to toggle the sensor visibility
  const toggleButton = document.createElement("button");
  toggleButton.textContent = sensor.visible ? "Hide Sensor" : "Show Sensor";
  toggleButton.style.width = "100%"; // Fixed width for the button
  toggleButton.onclick = () => {
    sensor.visible = !sensor.visible;
    toggleButton.textContent = sensor.visible ? "Hide Sensor" : "Show Sensor";
  };
  controlContainer.appendChild(toggleButton);

  // Create a label and slider for the sensor's field of view
  const fovLabel = document.createElement("label");
  fovLabel.textContent = "Field of View:";
  controlContainer.appendChild(fovLabel);

  const fovSliderContainer = document.createElement("div");
  fovSliderContainer.style.display = "flex";
  fovSliderContainer.style.alignItems = "center";
  const fovSlider = document.createElement("input");
  fovSlider.type = "range";
  fovSlider.min = "1";
  fovSlider.max = "180";
  fovSlider.value = (
    sensor.fieldOfEffect_AngleFull *
    (180 / Math.PI)
  ).toString();
  const fovValueDisplay = document.createElement("span");
  fovValueDisplay.style.marginLeft = "10px";
  fovValueDisplay.textContent = formatValue(fovSlider.value, 1, 3, true);

  fovSlider.oninput = (event) => {
    sensor.fieldOfEffect_AngleFull =
      (parseInt(event.target.value) * Math.PI) / 180;
    sensorCamera.fov = sensor.fieldOfEffect_AngleFull * (180 / Math.PI); // Update sensor camera FOV
    sensorCamera.updateProjectionMatrix();
    fovValueDisplay.textContent = formatValue(event.target.value, 1, 3, true);
  };

  fovSliderContainer.appendChild(fovSlider);
  fovSliderContainer.appendChild(fovValueDisplay);
  controlContainer.appendChild(fovSliderContainer);

  // Create a label and slider for the sensor's sensitivity
  const sensitivityLabel = document.createElement("label");
  sensitivityLabel.textContent = "Minimum Intesity Sense:";
  controlContainer.appendChild(sensitivityLabel);

  const sensitivitySliderContainer = document.createElement("div");
  sensitivitySliderContainer.style.display = "flex";
  sensitivitySliderContainer.style.alignItems = "center";
  const sensitivitySlider = document.createElement("input");
  sensitivitySlider.type = "range";
  sensitivitySlider.min = "0.001";
  sensitivitySlider.max = "1.000";
  sensitivitySlider.step = "0.001"; // Adding step for better precision
  sensitivitySlider.value = sensor.minIntensitySensitivity.toString();

  const sensitivityValueDisplay = document.createElement("span");
  sensitivityValueDisplay.style.marginLeft = "10px";
  sensitivityValueDisplay.textContent = formatValue(sensitivitySlider.value);

  sensitivitySlider.oninput = (event) => {
    sensor.minIntensitySensitivity = parseFloat(event.target.value);
    sensitivityValueDisplay.textContent = formatValue(event.target.value);
  };

  sensitivitySliderContainer.appendChild(sensitivitySlider);
  sensitivitySliderContainer.appendChild(sensitivityValueDisplay);
  controlContainer.appendChild(sensitivitySliderContainer);

  // Create a label and slider for the sensor's rotation rate
  const rotationRateLabel = document.createElement("label");
  rotationRateLabel.textContent = "Rotation Rate:";
  controlContainer.appendChild(rotationRateLabel);

  const rotationRateSliderContainer = document.createElement("div");
  rotationRateSliderContainer.style.display = "flex";
  rotationRateSliderContainer.style.alignItems = "center";
  const rotationRateSlider = document.createElement("input");
  rotationRateSlider.type = "range";
  rotationRateSlider.min = "-0.01";
  rotationRateSlider.max = "0.01";
  rotationRateSlider.step = "0.001";
  rotationRateSlider.value = rotationRate.toString(); // Default rotation rate
  const rotationRateValueDisplay = document.createElement("span");
  rotationRateValueDisplay.style.marginLeft = "10px";
  // Set initial value display, add a + or - to the string, use 3 digits for value
  rotationRateValueDisplay.textContent = formatValue(rotationRateSlider.value);

  rotationRateSlider.oninput = (event) => {
    rotationRate = parseFloat(event.target.value);
    rotationRateValueDisplay.textContent = formatValue(event.target.value);
  };

  rotationRateSliderContainer.appendChild(rotationRateSlider);
  rotationRateSliderContainer.appendChild(rotationRateValueDisplay);
  controlContainer.appendChild(rotationRateSliderContainer);

  // Create a label for status display
  const statusDisplayLabel = document.createElement("label");
  statusDisplayLabel.textContent = "Sensor Status:";
  controlContainer.appendChild(statusDisplayLabel);

  // Create a status display at the bottom for sensor data
  const statusDisplay = document.createElement("div");
  statusDisplay.textContent = "Sensor Status: Initializing...";
  statusDisplay.style.fontSize = "12px";
  statusDisplay.style.fontWeight = "lighter";
  statusDisplay.style.marginTop = "5px"; // Add some spacing above the status
  controlContainer.appendChild(statusDisplay);

  return { statusDisplay };
}

// Initialize UI and get references to dynamically updated elements
const { statusDisplay } = createControls(sensor);

//********************************************************************************

// Create a border overlay for the sensor camera view
const borderOverlay = document.createElement("div");
borderOverlay.style.position = "absolute";
borderOverlay.style.border = "2px solid white"; // White border
borderOverlay.style.boxSizing = "border-box"; // Include the border in the size calculations
borderOverlay.style.zIndex = "99"; // Make sure it appears above other elements
document.body.appendChild(borderOverlay);

// Function to position and resize the border overlay
function updateBorderOverlay() {
  const insetSize = Math.min(window.innerWidth, window.innerHeight) / 4; // Make the viewport a square
  borderOverlay.style.width = `${insetSize}px`;
  borderOverlay.style.height = `${insetSize}px`;
  borderOverlay.style.top = `${10}px`;
  borderOverlay.style.left = `${window.innerWidth - insetSize - 10}px`;
}

/**
 * Function to update the scene on each animation frame
 */
function animate() {
  // verify the scene is ready for animation
  if (!scene) {
    console.log("Scene not ready yet...");
    return;
  }

  requestAnimationFrame(animate);

  // Rotate the sensor around the Y-axis based on the rotation rate
  sensor.rotation.y += rotationRate;
  // Reset sensor rotation if it exceeds 2*PI
  if (sensor.rotation.y > Math.PI * 2) {
    sensor.rotation.y = 0;
  }

  // Update the sensor camera to match the sensor's position and orientation
  sensorCamera.position.copy(sensor.position);

  // Compute the direction the sensor is facing
  const sensorDirection = new THREE.Vector3();
  sensor.getWorldDirection(sensorDirection);

  // Point the camera in the same direction as the sensor
  sensorCamera.lookAt(sensor.position.clone().add(sensorDirection));

  // Check if any targets are within the sensor's field of view and update UI
  updateTargetDetectionStatus();

  // Render the main scene from the main camera's perspective
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.clear(); // Clear the previous frame
  renderer.render(scene, cameraControl.camera);

  // Render the sensor's view in a square window in the top-right corner
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
  renderer.render(scene, sensorCamera);
  renderer.setScissorTest(false); // Disable scissor test after rendering

  // Update the position and size of the border overlay for the sensor camera view
  updateBorderOverlay();
}

/**
 * Function to update the detection status of targets and update the UI.
 * This function checks if targets are in range and updates the UI accordingly.
 */
function updateTargetDetectionStatus() {
  // Variable to track if any target is detectable
  let targetIsDetectable = false;

  // Clear previous summary in the status display
  statusDisplay.innerHTML = ""; // Clear existing content

  // Create a status message header
  let statusHeader = document.createElement("div");
  statusHeader.textContent = "Target Detection Summary:";
  statusHeader.style.fontWeight = "bold";
  statusDisplay.appendChild(statusHeader);

  // Iterate over each target and check if it is detectable
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];

    //if the target does not have a power property, skip it
    if (typeof target.power !== "number") {
      // Log a message to the console that incldues the target index
      console.log(`Target ${i} does not have a power property.`);
      continue;
    }

    const result = sensor.isTargetDetectable(target);

    if (result.inRange) {
      targetIsDetectable = true;

      // Create a new row for each detectable target
      let targetRow = document.createElement("div");
      targetRow.style.marginTop = "5px"; // Add some spacing between rows

      // Add information about the target
      targetRow.innerHTML = `
        <strong>Target ${i + 1}:</strong> <br>
        Distance: ${result.distance.toFixed(2)} <br>
        Source Power: ${result.sourcePower} <br>
        Sensed Intensity: ${result.receivedIntensity.toFixed(3)}
      `;
      //        In Range: ${result.inRange} <br>

      // Append the target row to the status display
      statusDisplay.appendChild(targetRow);

      // Adjust the color of the target based on the received intensity
      // Assuming intensity ranges from 0 (min) to 1 (max)
      let intensityFactor = result.receivedIntensity; // 0 to 1 scale

      // Clamp intensityFactor between 0 and 1
      intensityFactor = Math.max(0, Math.min(intensityFactor, 1));

      // Use the intensityFactor to calculate the color:
      // 1. High intensity should be more green.
      // 2. Low intensity should fade towards red.
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
    let noTargetMessage = document.createElement("div");
    noTargetMessage.textContent = "No targets are in the field of view.";
    statusDisplay.appendChild(noTargetMessage);
  }
}

// Start the animation loop
animate();

// Handle window resizing
window.addEventListener("resize", () => {
  updateBorderOverlay();
});
